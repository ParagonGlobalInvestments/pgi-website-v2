import { notFound } from 'next/navigation';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { PROGRAM_LABELS } from '@/components/portal/constants';
import { checkMembership } from '@/lib/auth/checkMembership';
import { getOrgChart } from '@/lib/org-chart';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { cn } from '@/utils';
import type {
  OrgChart,
  OrgOfficer,
  OrgPerson,
  OrgSeat,
  OrgSeatSlug,
  Pod,
  PodSeat,
  UserProgram,
} from '@/types';

// Reads the signed-in user's session; never prerender.
export const dynamic = 'force-dynamic';

const PROGRAMS: UserProgram[] = ['value', 'quant'];
// Everyone reporting to the CEO, left to right. The COOs sit at the ends,
// above their program's pods.
const DIRECT_REPORTS: OrgSeatSlug[] = [
  'coo-value',
  'cio',
  'vp-education',
  'cto',
  'coo-quant',
];

function seatLabel(seat: PodSeat, program: UserProgram): string {
  if (seat === 'committee') return program === 'value' ? 'ICOMM' : 'QCOMM';
  if (seat === 'pm') return 'Pod Leader';
  return 'Analyst';
}

// ============================================================================
// Building blocks
// ============================================================================

function Connector() {
  return <div aria-hidden className="mx-auto h-6 w-px bg-gray-300" />;
}

function PersonName({ person }: { person: OrgPerson }) {
  return (
    <p className="text-sm font-medium text-gray-900">
      {person.name}
      {person.school && (
        <span className="ml-1.5 text-xs font-normal text-gray-500">
          {person.school}
        </span>
      )}
    </p>
  );
}

function LeaderCard({
  title,
  people,
  className,
}: {
  title: string | null;
  people: OrgPerson[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-w-[11rem] rounded-xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm',
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-accent">
        {title ?? 'Officer'}
      </p>
      <div className="mt-1 space-y-0.5">
        {people.length === 0 ? (
          <p className="text-sm italic text-gray-400">Vacant</p>
        ) : (
          people.map(p => <PersonName key={p.id} person={p} />)
        )}
      </div>
    </div>
  );
}

function SeatCard({ seat, className }: { seat: OrgSeat; className?: string }) {
  return (
    <LeaderCard title={seat.title} people={seat.people} className={className} />
  );
}

function PodCard({ pod }: { pod: Pod }) {
  const leads = pod.members.filter(m => m.seat !== 'analyst');
  const analysts = pod.members.filter(m => m.seat === 'analyst');

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-bold text-gray-900">Pod {pod.number}</p>
        {pod.focus && <p className="text-xs text-gray-500">{pod.focus}</p>}
      </div>

      {leads.length > 0 && (
        <dl className="space-y-1.5 border-b border-gray-100 px-4 py-3">
          {leads.map(m => (
            <div
              key={m.id}
              className="flex items-baseline justify-between gap-3"
            >
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {seatLabel(m.seat, pod.program)}
              </dt>
              <dd className="text-right">
                <PersonName person={m.person} />
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="px-4 py-3">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Analysts · {analysts.length}
        </p>
        {analysts.length === 0 ? (
          <p className="text-sm italic text-gray-400">None assigned</p>
        ) : (
          <ul className="space-y-1">
            {analysts.map(m => (
              <li key={m.id} className="flex items-center gap-2">
                <PersonName person={m.person} />
                {m.isNew && (
                  <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-700">
                    New
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** CMS officers whose title doesn't map to a chart slot. */
function OtherOfficers({ officers }: { officers: OrgOfficer[] }) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
        Other officers
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {officers.map(o => (
          <LeaderCard key={o.id} title={o.title} people={[o]} />
        ))}
      </div>
    </div>
  );
}

/**
 * The CEO's direct reports on one bracket. On narrow screens the cards
 * wrap and the bracket lines are hidden.
 */
function DirectReports({ seats }: { seats: OrgSeat[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-4 xl:flex-nowrap xl:gap-0">
      {seats.map(seat => (
        <li
          key={seat.slug}
          className="relative flex justify-center xl:flex-1 xl:px-2 xl:pt-6 xl:before:absolute xl:before:inset-x-0 xl:before:top-0 xl:before:border-t xl:before:border-gray-300 xl:after:absolute xl:after:left-1/2 xl:after:top-0 xl:after:h-6 xl:after:border-l xl:after:border-gray-300 xl:first:before:left-1/2 xl:last:before:right-1/2"
        >
          <SeatCard
            seat={seat}
            className="xl:w-full xl:min-w-0 xl:max-w-[14rem]"
          />
        </li>
      ))}
    </ul>
  );
}

function ProgramColumn({
  program,
  coo,
  pods,
}: {
  program: UserProgram;
  coo: OrgSeat | undefined;
  pods: Pod[];
}) {
  const cooNames = coo?.people.map(p => p.name).join(', ');
  return (
    <section aria-label={`${PROGRAM_LABELS[program]} pods`}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 border-b border-gray-200 pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
          {PROGRAM_LABELS[program]} pods
        </h2>
        <p className="text-xs text-gray-500">
          {coo?.title ?? 'COO'}: {cooNames || 'Vacant'}
        </p>
      </div>
      {pods.length === 0 ? (
        <p className="text-center text-sm text-gray-400">No pods yet</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pods.map(pod => (
            <PodCard key={pod.id} pod={pod} />
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================================
// Page
// ============================================================================

const EMPTY_CHART: OrgChart = { seats: [], otherOfficers: [], pods: [] };

/**
 * A session is not membership (see requireMember), and pods/users are
 * service-role only, so check membership and then read with the admin client.
 */
async function loadChart(): Promise<OrgChart> {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  if (!supabase || !admin) return EMPTY_CHART;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY_CHART; // portal layout redirects to login
  const { isMember } = await checkMembership(user.email, user.id);
  if (!isMember) notFound();

  return getOrgChart(admin);
}

export default async function OrgChartPage() {
  const chart = await loadChart();

  const bySlug = new Map(chart.seats.map(s => [s.slug, s]));
  const ceo = bySlug.get('ceo');
  const directReports = DIRECT_REPORTS.map(s => bySlug.get(s)).filter(
    (s): s is OrgSeat => !!s
  );

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Org Chart"
        description="Leadership and pod structure"
      />

      {/* Leadership */}
      <section aria-label="Leadership">
        {ceo && (
          <>
            <div className="flex justify-center">
              <SeatCard seat={ceo} />
            </div>
            {directReports.length > 0 && <Connector />}
          </>
        )}
        {directReports.length > 0 && <DirectReports seats={directReports} />}
        {chart.otherOfficers.length > 0 && (
          <OtherOfficers officers={chart.otherOfficers} />
        )}
      </section>

      {/* Programs */}
      <div className="grid grid-cols-1 gap-10 pt-6 xl:grid-cols-2 xl:gap-8">
        {PROGRAMS.map(program => (
          <ProgramColumn
            key={program}
            program={program}
            coo={bySlug.get(`coo-${program}`)}
            pods={chart.pods.filter(p => p.program === program)}
          />
        ))}
      </div>
    </div>
  );
}
