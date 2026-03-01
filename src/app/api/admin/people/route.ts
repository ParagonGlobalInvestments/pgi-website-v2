import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import type { PeopleGroupSlug } from '@/lib/cms/types';
import { revalidatePeople } from '@/lib/cms/revalidate';
import {
  createSyntheticLinkedinToken,
  getAdminPersonByExternalId,
  isMembershipSchemaError,
  isPeopleGroupSlug,
  listAdminPeople,
  toExternalPersonId,
  trimNullable,
  trimRequired,
} from './_lib';

export const dynamic = 'force-dynamic';

const DEFAULT_SORT_ORDER = 0;
const MEMBERSHIP_MIGRATION_ERROR =
  'People membership tables are unavailable. Apply migration 010_alumni_public_memberships.sql first.';

function toNumberOrDefault(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

async function findUserByName(name: string) {
  const supabase = requireSupabaseAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('name', name);

  if (error) throw error;

  if (!data || data.length !== 1) return null;
  return data[0].id as string;
}

async function createOrUpdateUserMembership(params: {
  userId: string;
  groupSlug: PeopleGroupSlug;
  sortOrder: number;
  input: {
    name: string;
    title: string | null;
    school: string | null;
    company: string | null;
    linkedin: string | null;
    headshot_url: string | null;
    banner_url: string | null;
  };
}) {
  const supabase = requireSupabaseAdminClient();

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('name, school, linkedin_url')
    .eq('id', params.userId)
    .maybeSingle();

  if (userError) throw userError;
  if (!userRow) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { data: existingMembership, error: membershipLookupError } =
    await supabase
      .from('user_public_group_memberships')
      .select('id, source_cms_person_id')
      .eq('user_id', params.userId)
      .eq('group_slug', params.groupSlug)
      .maybeSingle();

  if (membershipLookupError) throw membershipLookupError;

  const sourceRow = {
    group_slug: params.groupSlug,
    name: userRow.name,
    title: params.input.title,
    school: params.input.school ?? userRow.school ?? null,
    company: params.input.company,
    linkedin: params.input.linkedin ?? userRow.linkedin_url ?? null,
    headshot_url: params.input.headshot_url,
    banner_url: params.input.banner_url,
    sort_order: params.sortOrder,
  };

  let sourceCmsPersonId = existingMembership?.source_cms_person_id ?? null;
  let createdSourceCmsPersonId: string | null = null;

  try {
    if (sourceCmsPersonId) {
      const { error: sourceUpdateError } = await supabase
        .from('cms_people')
        .update(sourceRow)
        .eq('id', sourceCmsPersonId);

      if (sourceUpdateError) throw sourceUpdateError;
    } else {
      const { data: insertedSource, error: sourceInsertError } = await supabase
        .from('cms_people')
        .insert(sourceRow)
        .select('id')
        .single();

      if (sourceInsertError) throw sourceInsertError;
      sourceCmsPersonId = insertedSource.id;
      createdSourceCmsPersonId = insertedSource.id;
    }

    let membershipId = existingMembership?.id ?? null;

    if (existingMembership) {
      const { error: membershipUpdateError } = await supabase
        .from('user_public_group_memberships')
        .update({
          group_slug: params.groupSlug,
          sort_order: params.sortOrder,
          source_cms_person_id: sourceCmsPersonId,
        })
        .eq('id', existingMembership.id);

      if (membershipUpdateError) throw membershipUpdateError;
      membershipId = existingMembership.id;
    } else {
      const { data: createdMembership, error: membershipInsertError } =
        await supabase
          .from('user_public_group_memberships')
          .insert({
            user_id: params.userId,
            group_slug: params.groupSlug,
            sort_order: params.sortOrder,
            source_cms_person_id: sourceCmsPersonId,
          })
          .select('id')
          .single();

      if (membershipInsertError) throw membershipInsertError;
      membershipId = createdMembership.id;
    }

    if (!membershipId) throw new Error('Failed to create user membership');

    return membershipId;
  } catch (error) {
    if (createdSourceCmsPersonId) {
      await supabase
        .from('cms_people')
        .delete()
        .eq('id', createdSourceCmsPersonId);
    }
    throw error;
  }
}

async function createOrUpdateAlumniMembership(params: {
  groupSlug: PeopleGroupSlug;
  sortOrder: number;
  input: {
    name: string;
    title: string | null;
    school: string | null;
    company: string | null;
    linkedin: string | null;
    headshot_url: string | null;
    banner_url: string | null;
  };
}) {
  const supabase = requireSupabaseAdminClient();
  const normalizedLinkedin = trimNullable(params.input.linkedin);
  let alumniPersonId: string | null = null;
  let createdAlumniPersonId: string | null = null;

  try {
    if (normalizedLinkedin) {
      const { data: existingAlumni, error: existingLookupError } =
        await supabase
          .from('alumni_people')
          .select('id, school, title, company, headshot_url, banner_url')
          .eq('name', params.input.name)
          .eq('linkedin', normalizedLinkedin)
          .maybeSingle();

      if (existingLookupError) throw existingLookupError;

      if (existingAlumni) {
        const merged = {
          school: params.input.school ?? existingAlumni.school,
          title: params.input.title ?? existingAlumni.title,
          company: params.input.company ?? existingAlumni.company,
          headshot_url:
            params.input.headshot_url ?? existingAlumni.headshot_url,
          banner_url: params.input.banner_url ?? existingAlumni.banner_url,
        };

        const shouldUpdate =
          merged.school !== existingAlumni.school ||
          merged.title !== existingAlumni.title ||
          merged.company !== existingAlumni.company ||
          merged.headshot_url !== existingAlumni.headshot_url ||
          merged.banner_url !== existingAlumni.banner_url;

        if (shouldUpdate) {
          const { error: alumniUpdateError } = await supabase
            .from('alumni_people')
            .update(merged)
            .eq('id', existingAlumni.id);

          if (alumniUpdateError) throw alumniUpdateError;
        }

        alumniPersonId = existingAlumni.id;
      } else {
        const { data: alumniPerson, error: alumniInsertError } = await supabase
          .from('alumni_people')
          .insert({
            name: params.input.name,
            school: params.input.school,
            title: params.input.title,
            company: params.input.company,
            linkedin: normalizedLinkedin,
            headshot_url: params.input.headshot_url,
            banner_url: params.input.banner_url,
          })
          .select('id')
          .single();

        if (alumniInsertError) throw alumniInsertError;
        alumniPersonId = alumniPerson.id;
        createdAlumniPersonId = alumniPerson.id;
      }
    } else {
      const { data: alumniPerson, error: alumniInsertError } = await supabase
        .from('alumni_people')
        .insert({
          name: params.input.name,
          school: params.input.school,
          title: params.input.title,
          company: params.input.company,
          linkedin: createSyntheticLinkedinToken(),
          headshot_url: params.input.headshot_url,
          banner_url: params.input.banner_url,
        })
        .select('id')
        .single();

      if (alumniInsertError) throw alumniInsertError;
      alumniPersonId = alumniPerson.id;
      createdAlumniPersonId = alumniPerson.id;
    }

    if (!alumniPersonId) throw new Error('Failed to create alumni person');

    const { data: existingMembership, error: membershipLookupError } =
      await supabase
        .from('alumni_public_group_memberships')
        .select('id')
        .eq('alumni_person_id', alumniPersonId)
        .eq('group_slug', params.groupSlug)
        .maybeSingle();

    if (membershipLookupError) throw membershipLookupError;

    if (existingMembership) {
      const { error: membershipUpdateError } = await supabase
        .from('alumni_public_group_memberships')
        .update({ sort_order: params.sortOrder })
        .eq('id', existingMembership.id);

      if (membershipUpdateError) throw membershipUpdateError;
      return existingMembership.id;
    }

    const { data: createdMembership, error: membershipInsertError } =
      await supabase
        .from('alumni_public_group_memberships')
        .insert({
          alumni_person_id: alumniPersonId,
          group_slug: params.groupSlug,
          sort_order: params.sortOrder,
        })
        .select('id')
        .single();

    if (membershipInsertError) throw membershipInsertError;

    return createdMembership.id;
  } catch (error) {
    if (createdAlumniPersonId) {
      await supabase
        .from('alumni_people')
        .delete()
        .eq('id', createdAlumniPersonId);
    }
    throw error;
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const groupParam = req.nextUrl.searchParams.get('group');
    let group: PeopleGroupSlug | undefined;

    if (groupParam) {
      if (!isPeopleGroupSlug(groupParam)) {
        return NextResponse.json(
          { error: `Invalid group: ${groupParam}` },
          { status: 400 }
        );
      }
      group = groupParam;
    }

    const people = await listAdminPeople(requireSupabaseAdminClient(), group);
    return NextResponse.json(people);
  } catch (err) {
    if (isMembershipSchemaError(err)) {
      return NextResponse.json(
        { error: MEMBERSHIP_MIGRATION_ERROR },
        { status: 503 }
      );
    }
    const msg = err instanceof Error ? err.message : 'Failed to fetch people';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();

    const groupSlug = trimRequired(body.group_slug);
    const name = trimRequired(body.name);

    if (!groupSlug || !name) {
      return NextResponse.json(
        { error: 'group_slug and name are required' },
        { status: 400 }
      );
    }

    if (!isPeopleGroupSlug(groupSlug)) {
      return NextResponse.json(
        { error: `Invalid group_slug: ${groupSlug}` },
        { status: 400 }
      );
    }

    const input = {
      name,
      title: trimNullable(body.title),
      school: trimNullable(body.school),
      company: trimNullable(body.company),
      linkedin: trimNullable(body.linkedin),
      headshot_url: trimNullable(body.headshot_url),
      banner_url: trimNullable(body.banner_url),
    };

    const sortOrder = toNumberOrDefault(body.sort_order, DEFAULT_SORT_ORDER);

    let membershipType: 'user' | 'alumni' | null =
      body.person_type === 'user' || body.person_type === 'alumni'
        ? body.person_type
        : null;

    let userId = trimNullable(body.user_id);

    if (!membershipType && userId) {
      membershipType = 'user';
    }

    if (!membershipType) {
      userId = await findUserByName(name);
      membershipType = userId ? 'user' : 'alumni';
    }

    let externalId: string;

    if (membershipType === 'user') {
      if (!userId) {
        return NextResponse.json(
          { error: 'user_id is required for person_type "user"' },
          { status: 400 }
        );
      }

      const membershipId = await createOrUpdateUserMembership({
        userId,
        groupSlug,
        sortOrder,
        input,
      });

      if (membershipId instanceof NextResponse) return membershipId;

      externalId = toExternalPersonId('user', membershipId);
    } else {
      const membershipId = await createOrUpdateAlumniMembership({
        groupSlug,
        sortOrder,
        input,
      });

      externalId = toExternalPersonId('alumni', membershipId);
    }

    const person = await getAdminPersonByExternalId(
      requireSupabaseAdminClient(),
      externalId
    );

    revalidatePeople(groupSlug);
    return NextResponse.json({ success: true, data: person }, { status: 201 });
  } catch (err) {
    if (isMembershipSchemaError(err)) {
      return NextResponse.json(
        { error: MEMBERSHIP_MIGRATION_ERROR },
        { status: 503 }
      );
    }
    const msg = err instanceof Error ? err.message : 'Failed to create person';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
