import { notFound } from 'next/navigation';
import { PersonName } from '@/components/org-chart/PersonName';
import { PodBoard } from '@/components/org-chart/PodBoard';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { checkMembership } from '@/lib/auth/checkMembership';
import { getOrgChart } from '@/lib/org-chart';
import { isAdminMembership } from '@/lib/org-chart-rules';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { cn } from '@/utils';
import type {
  OrgChart,
  OrgChartViewer,
  OrgOfficer,
  OrgPerson,
  OrgSeat,
  OrgSeatSlug,
  UserProgram,
} from '@/types';

// Reads the signed-in user's session; never prerender.
export const dynamic = 'force-dynamic';

// Everyone reporting to the CEO, left to right. The COOs sit at the ends,
// above their program's pods.
const DIRECT_REPORTS: OrgSeatSlug[] = [
  'coo-value',
  'cio',
  'vp-education',
  'cto',
  'coo-quant',
];

// ============================================================================
// Building blocks
// ============================================================================

function Connector() {
  return <div aria-hidden className="mx-auto h-6 w-px bg-gray-300" />;
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

// ============================================================================
// Page
// ============================================================================

const EMPTY_CHART: OrgChart = {
  seats: [],
  otherOfficers: [],
  pods: [],
  unassigned: [],
};

const NO_VIEWER: OrgChartViewer = { userId: null, isAdmin: false };

/**
 * A session is not membership (see requireMember), and pods/users are
 * service-role only, so check membership and then read with the admin client.
 */
async function loadChart(): Promise<{
  chart: OrgChart;
  viewer: OrgChartViewer;
}> {
  const empty = { chart: EMPTY_CHART, viewer: NO_VIEWER };
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  if (!supabase || !admin) return empty;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty; // portal layout redirects to login
  const membership = await checkMembership(user.email, user.id);
  if (!membership.isMember) notFound();

  return {
    chart: await getOrgChart(admin),
    viewer: {
      userId: membership.user?.id ?? null,
      isAdmin: isAdminMembership(membership),
    },
  };
}

function cooDetail(coo: OrgSeat | undefined): string {
  const names = coo?.people.map(p => p.name).join(', ');
  return `${coo?.title ?? 'COO'}: ${names || 'Vacant'}`;
}

export default async function OrgChartPage() {
  const { chart, viewer } = await loadChart();

  const bySlug = new Map(chart.seats.map(s => [s.slug, s]));
  const ceo = bySlug.get('ceo');
  const directReports = DIRECT_REPORTS.map(s => bySlug.get(s)).filter(
    (s): s is OrgSeat => !!s
  );
  const programDetails: Record<UserProgram, string> = {
    value: cooDetail(bySlug.get('coo-value')),
    quant: cooDetail(bySlug.get('coo-quant')),
  };

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

      <PodBoard
        initialRoster={{ pods: chart.pods, unassigned: chart.unassigned }}
        viewer={viewer}
        programDetails={programDetails}
      />
    </div>
  );
}
