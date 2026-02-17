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
  isSyntheticLinkedin,
  parseExternalPersonId,
  toExternalPersonId,
  trimNullable,
  trimRequired,
} from '../_lib';

export const dynamic = 'force-dynamic';
const MEMBERSHIP_MIGRATION_ERROR =
  'People membership tables are unavailable. Apply migration 010_alumni_public_memberships.sql first.';

type RouteContext = { params: Promise<{ id: string }> };

function hasOwn(obj: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function coerceSortOrder(value: unknown): number | null {
  if (value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id: externalId } = await context.params;
    const parsed = parseExternalPersonId(externalId);

    if (!parsed) {
      return NextResponse.json(
        {
          error: 'Invalid person id format. Expected user:<id> or alumni:<id>',
        },
        { status: 400 }
      );
    }

    const body = (await req.json()) as Record<string, unknown>;
    const supabase = requireSupabaseAdminClient();

    if (parsed.type === 'user') {
      const { data: membership, error: membershipError } = await supabase
        .from('user_public_group_memberships')
        .select('id, user_id, group_slug, sort_order, source_cms_person_id')
        .eq('id', parsed.membershipId)
        .maybeSingle();

      if (membershipError) {
        if (isMembershipSchemaError(membershipError)) {
          return NextResponse.json(
            { error: MEMBERSHIP_MIGRATION_ERROR },
            { status: 503 }
          );
        }
        return NextResponse.json(
          { error: membershipError.message },
          { status: 500 }
        );
      }

      if (!membership) {
        return NextResponse.json(
          { error: 'Person not found' },
          { status: 404 }
        );
      }

      const hasGroupSlugInput = hasOwn(body, 'group_slug');
      const groupSlugInput = hasGroupSlugInput
        ? trimRequired(body.group_slug)
        : null;

      if (hasGroupSlugInput) {
        if (!groupSlugInput || !isPeopleGroupSlug(groupSlugInput)) {
          return NextResponse.json(
            { error: `Invalid group_slug: ${groupSlugInput}` },
            { status: 400 }
          );
        }
      }

      const sortOrderInput = hasOwn(body, 'sort_order')
        ? coerceSortOrder(body.sort_order)
        : null;

      if (hasOwn(body, 'sort_order') && sortOrderInput === null) {
        return NextResponse.json(
          { error: 'sort_order must be a number' },
          { status: 400 }
        );
      }

      const userUpdates: Record<string, unknown> = {};
      if (hasOwn(body, 'name')) userUpdates.name = trimRequired(body.name);
      if (hasOwn(body, 'school')) {
        const school = trimRequired(body.school);
        if (!school) {
          return NextResponse.json(
            { error: 'school cannot be empty for active users' },
            { status: 400 }
          );
        }
        userUpdates.school = school;
      }
      if (hasOwn(body, 'linkedin')) {
        userUpdates.linkedin_url = trimNullable(body.linkedin);
      }

      const sourceFieldUpdates: Record<string, unknown> = {};
      if (hasOwn(body, 'title'))
        sourceFieldUpdates.title = trimNullable(body.title);
      if (hasOwn(body, 'company'))
        sourceFieldUpdates.company = trimNullable(body.company);
      if (hasOwn(body, 'headshot_url')) {
        sourceFieldUpdates.headshot_url = trimNullable(body.headshot_url);
      }
      if (hasOwn(body, 'banner_url')) {
        sourceFieldUpdates.banner_url = trimNullable(body.banner_url);
      }

      const hasMembershipChange = hasGroupSlugInput || sortOrderInput !== null;
      const hasUserChange = Object.keys(userUpdates).length > 0;
      const hasSourceFieldChange = Object.keys(sourceFieldUpdates).length > 0;

      if (!hasMembershipChange && !hasUserChange && !hasSourceFieldChange) {
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        );
      }

      if (hasOwn(userUpdates, 'name') && !userUpdates.name) {
        return NextResponse.json(
          { error: 'name cannot be empty' },
          { status: 400 }
        );
      }

      const nextGroupSlug =
        (groupSlugInput as PeopleGroupSlug | null) ??
        (membership.group_slug as PeopleGroupSlug);
      const nextSortOrder = sortOrderInput ?? membership.sort_order ?? 0;

      let resolvedUser = {
        name: '',
        school: null as string | null,
        linkedin_url: null as string | null,
      };

      if (hasUserChange) {
        const { data: updatedUser, error: userUpdateError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', membership.user_id)
          .select('name, school, linkedin_url')
          .single();

        if (userUpdateError) {
          return NextResponse.json(
            { error: userUpdateError.message },
            { status: 500 }
          );
        }

        resolvedUser = updatedUser;
      } else {
        const { data: currentUser, error: userLookupError } = await supabase
          .from('users')
          .select('name, school, linkedin_url')
          .eq('id', membership.user_id)
          .single();

        if (userLookupError) {
          return NextResponse.json(
            { error: userLookupError.message },
            { status: 500 }
          );
        }

        resolvedUser = currentUser;
      }

      if (hasMembershipChange) {
        const membershipUpdates: Record<string, unknown> = {
          group_slug: nextGroupSlug,
          sort_order: nextSortOrder,
        };

        const { error: membershipUpdateError } = await supabase
          .from('user_public_group_memberships')
          .update(membershipUpdates)
          .eq('id', membership.id);

        if (membershipUpdateError) {
          return NextResponse.json(
            { error: membershipUpdateError.message },
            { status: 500 }
          );
        }
      }

      const shouldSyncSource =
        Boolean(membership.source_cms_person_id) ||
        hasSourceFieldChange ||
        hasMembershipChange ||
        hasUserChange;

      if (shouldSyncSource) {
        const sourceBase = {
          group_slug: nextGroupSlug,
          sort_order: nextSortOrder,
          name: resolvedUser.name,
          school: resolvedUser.school,
          linkedin: resolvedUser.linkedin_url,
        };

        if (membership.source_cms_person_id) {
          const { error: sourceUpdateError } = await supabase
            .from('cms_people')
            .update({
              ...sourceBase,
              ...sourceFieldUpdates,
            })
            .eq('id', membership.source_cms_person_id);

          if (sourceUpdateError) {
            return NextResponse.json(
              { error: sourceUpdateError.message },
              { status: 500 }
            );
          }
        } else {
          const { data: insertedSource, error: sourceInsertError } =
            await supabase
              .from('cms_people')
              .insert({
                ...sourceBase,
                title: hasOwn(sourceFieldUpdates, 'title')
                  ? sourceFieldUpdates.title
                  : null,
                company: hasOwn(sourceFieldUpdates, 'company')
                  ? sourceFieldUpdates.company
                  : null,
                headshot_url: hasOwn(sourceFieldUpdates, 'headshot_url')
                  ? sourceFieldUpdates.headshot_url
                  : null,
                banner_url: hasOwn(sourceFieldUpdates, 'banner_url')
                  ? sourceFieldUpdates.banner_url
                  : null,
              })
              .select('id')
              .single();

          if (sourceInsertError) {
            return NextResponse.json(
              { error: sourceInsertError.message },
              { status: 500 }
            );
          }

          const { error: membershipLinkError } = await supabase
            .from('user_public_group_memberships')
            .update({ source_cms_person_id: insertedSource.id })
            .eq('id', membership.id);

          if (membershipLinkError) {
            return NextResponse.json(
              { error: membershipLinkError.message },
              { status: 500 }
            );
          }
        }
      }

      const person = await getAdminPersonByExternalId(
        supabase,
        toExternalPersonId('user', membership.id)
      );

      revalidatePeople(nextGroupSlug);
      return NextResponse.json({ success: true, data: person });
    }

    const { data: membership, error: membershipError } = await supabase
      .from('alumni_public_group_memberships')
      .select(
        'id, alumni_person_id, group_slug, sort_order, source_cms_person_id'
      )
      .eq('id', parsed.membershipId)
      .maybeSingle();

    if (membershipError) {
      if (isMembershipSchemaError(membershipError)) {
        return NextResponse.json(
          { error: MEMBERSHIP_MIGRATION_ERROR },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: membershipError.message },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const { data: currentAlumni, error: alumniLookupError } = await supabase
      .from('alumni_people')
      .select('id, linkedin')
      .eq('id', membership.alumni_person_id)
      .maybeSingle();

    if (alumniLookupError) {
      return NextResponse.json(
        { error: alumniLookupError.message },
        { status: 500 }
      );
    }

    if (!currentAlumni) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const hasGroupSlugInput = hasOwn(body, 'group_slug');
    const groupSlugInput = hasGroupSlugInput
      ? trimRequired(body.group_slug)
      : null;

    if (hasGroupSlugInput) {
      if (!groupSlugInput || !isPeopleGroupSlug(groupSlugInput)) {
        return NextResponse.json(
          { error: `Invalid group_slug: ${groupSlugInput}` },
          { status: 400 }
        );
      }
    }

    const sortOrderInput = hasOwn(body, 'sort_order')
      ? coerceSortOrder(body.sort_order)
      : null;

    if (hasOwn(body, 'sort_order') && sortOrderInput === null) {
      return NextResponse.json(
        { error: 'sort_order must be a number' },
        { status: 400 }
      );
    }

    const alumniUpdates: Record<string, unknown> = {};
    if (hasOwn(body, 'name')) alumniUpdates.name = trimRequired(body.name);
    if (hasOwn(body, 'title')) alumniUpdates.title = trimNullable(body.title);
    if (hasOwn(body, 'school'))
      alumniUpdates.school = trimNullable(body.school);
    if (hasOwn(body, 'company'))
      alumniUpdates.company = trimNullable(body.company);
    if (hasOwn(body, 'linkedin')) {
      const nextLinkedin = trimNullable(body.linkedin);
      alumniUpdates.linkedin =
        nextLinkedin ??
        (isSyntheticLinkedin(currentAlumni.linkedin)
          ? currentAlumni.linkedin
          : createSyntheticLinkedinToken());
    }
    if (hasOwn(body, 'headshot_url')) {
      alumniUpdates.headshot_url = trimNullable(body.headshot_url);
    }
    if (hasOwn(body, 'banner_url')) {
      alumniUpdates.banner_url = trimNullable(body.banner_url);
    }

    if (hasOwn(alumniUpdates, 'name') && !alumniUpdates.name) {
      return NextResponse.json(
        { error: 'name cannot be empty' },
        { status: 400 }
      );
    }

    const hasMembershipChange = hasGroupSlugInput || sortOrderInput !== null;
    const hasAlumniChange = Object.keys(alumniUpdates).length > 0;

    if (!hasMembershipChange && !hasAlumniChange) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const nextGroupSlug =
      (groupSlugInput as PeopleGroupSlug | null) ??
      (membership.group_slug as PeopleGroupSlug);
    const nextSortOrder = sortOrderInput ?? membership.sort_order ?? 0;

    if (hasAlumniChange) {
      const { error: alumniUpdateError } = await supabase
        .from('alumni_people')
        .update(alumniUpdates)
        .eq('id', membership.alumni_person_id);

      if (alumniUpdateError) {
        return NextResponse.json(
          { error: alumniUpdateError.message },
          { status: 500 }
        );
      }
    }

    if (hasMembershipChange) {
      const { error: membershipUpdateError } = await supabase
        .from('alumni_public_group_memberships')
        .update({
          group_slug: nextGroupSlug,
          sort_order: nextSortOrder,
        })
        .eq('id', membership.id);

      if (membershipUpdateError) {
        return NextResponse.json(
          { error: membershipUpdateError.message },
          { status: 500 }
        );
      }
    }

    if (
      membership.source_cms_person_id &&
      (hasMembershipChange || hasAlumniChange)
    ) {
      const { data: alumniRow, error: alumniLookupError } = await supabase
        .from('alumni_people')
        .select(
          'name, school, title, company, linkedin, headshot_url, banner_url'
        )
        .eq('id', membership.alumni_person_id)
        .single();

      if (alumniLookupError) {
        return NextResponse.json(
          { error: alumniLookupError.message },
          { status: 500 }
        );
      }

      const { error: sourceUpdateError } = await supabase
        .from('cms_people')
        .update({
          group_slug: nextGroupSlug,
          sort_order: nextSortOrder,
          name: alumniRow.name,
          school: alumniRow.school,
          title: alumniRow.title,
          company: alumniRow.company,
          linkedin: isSyntheticLinkedin(alumniRow.linkedin)
            ? null
            : alumniRow.linkedin || null,
          headshot_url: alumniRow.headshot_url,
          banner_url: alumniRow.banner_url,
        })
        .eq('id', membership.source_cms_person_id);

      if (sourceUpdateError) {
        return NextResponse.json(
          { error: sourceUpdateError.message },
          { status: 500 }
        );
      }
    }

    const person = await getAdminPersonByExternalId(
      supabase,
      toExternalPersonId('alumni', membership.id)
    );

    revalidatePeople(nextGroupSlug);
    return NextResponse.json({ success: true, data: person });
  } catch (err) {
    if (isMembershipSchemaError(err)) {
      return NextResponse.json(
        { error: MEMBERSHIP_MIGRATION_ERROR },
        { status: 503 }
      );
    }
    const msg = err instanceof Error ? err.message : 'Failed to update person';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id: externalId } = await context.params;
    const parsed = parseExternalPersonId(externalId);

    if (!parsed) {
      return NextResponse.json(
        {
          error: 'Invalid person id format. Expected user:<id> or alumni:<id>',
        },
        { status: 400 }
      );
    }

    const supabase = requireSupabaseAdminClient();

    if (parsed.type === 'user') {
      const { data: membership, error: lookupError } = await supabase
        .from('user_public_group_memberships')
        .select('id, user_id, group_slug, sort_order, source_cms_person_id')
        .eq('id', parsed.membershipId)
        .maybeSingle();

      if (lookupError) {
        if (isMembershipSchemaError(lookupError)) {
          return NextResponse.json(
            { error: MEMBERSHIP_MIGRATION_ERROR },
            { status: 503 }
          );
        }
        return NextResponse.json(
          { error: lookupError.message },
          { status: 500 }
        );
      }

      if (!membership) {
        return NextResponse.json(
          { error: 'Person not found' },
          { status: 404 }
        );
      }

      const { error: membershipDeleteError } = await supabase
        .from('user_public_group_memberships')
        .delete()
        .eq('id', membership.id);

      if (membershipDeleteError) {
        return NextResponse.json(
          { error: membershipDeleteError.message },
          { status: 500 }
        );
      }

      if (membership.source_cms_person_id) {
        const { error: sourceDeleteError } = await supabase
          .from('cms_people')
          .delete()
          .eq('id', membership.source_cms_person_id);

        if (sourceDeleteError) {
          const { error: restoreError } = await supabase
            .from('user_public_group_memberships')
            .insert({
              id: membership.id,
              user_id: membership.user_id,
              group_slug: membership.group_slug,
              sort_order: membership.sort_order,
              source_cms_person_id: membership.source_cms_person_id,
            });

          if (restoreError) {
            return NextResponse.json(
              {
                error: `${sourceDeleteError.message}. Rollback failed: ${restoreError.message}`,
              },
              { status: 500 }
            );
          }

          return NextResponse.json(
            { error: sourceDeleteError.message },
            { status: 500 }
          );
        }
      }

      revalidatePeople(membership.group_slug as PeopleGroupSlug);
      return NextResponse.json({ success: true, data: { id: externalId } });
    }

    const { data: membership, error: lookupError } = await supabase
      .from('alumni_public_group_memberships')
      .select(
        'id, group_slug, alumni_person_id, sort_order, source_cms_person_id'
      )
      .eq('id', parsed.membershipId)
      .maybeSingle();

    if (lookupError) {
      if (isMembershipSchemaError(lookupError)) {
        return NextResponse.json(
          { error: MEMBERSHIP_MIGRATION_ERROR },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }

    if (!membership) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const { error: membershipDeleteError } = await supabase
      .from('alumni_public_group_memberships')
      .delete()
      .eq('id', membership.id);

    if (membershipDeleteError) {
      return NextResponse.json(
        { error: membershipDeleteError.message },
        { status: 500 }
      );
    }

    if (membership.source_cms_person_id) {
      const { error: sourceDeleteError } = await supabase
        .from('cms_people')
        .delete()
        .eq('id', membership.source_cms_person_id);

      if (sourceDeleteError) {
        const { error: restoreError } = await supabase
          .from('alumni_public_group_memberships')
          .insert({
            id: membership.id,
            alumni_person_id: membership.alumni_person_id,
            group_slug: membership.group_slug,
            sort_order: membership.sort_order,
            source_cms_person_id: membership.source_cms_person_id,
          });

        if (restoreError) {
          return NextResponse.json(
            {
              error: `${sourceDeleteError.message}. Rollback failed: ${restoreError.message}`,
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { error: sourceDeleteError.message },
          { status: 500 }
        );
      }
    }

    const { count, error: countError } = await supabase
      .from('alumni_public_group_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('alumni_person_id', membership.alumni_person_id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (!count || count === 0) {
      const { error: alumniDeleteError } = await supabase
        .from('alumni_people')
        .delete()
        .eq('id', membership.alumni_person_id);

      if (alumniDeleteError) {
        return NextResponse.json(
          { error: alumniDeleteError.message },
          { status: 500 }
        );
      }
    }

    revalidatePeople(membership.group_slug as PeopleGroupSlug);
    return NextResponse.json({ success: true, data: { id: externalId } });
  } catch (err) {
    if (isMembershipSchemaError(err)) {
      return NextResponse.json(
        { error: MEMBERSHIP_MIGRATION_ERROR },
        { status: 503 }
      );
    }
    const msg = err instanceof Error ? err.message : 'Failed to delete person';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
