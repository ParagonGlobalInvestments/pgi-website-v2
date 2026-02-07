'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import PersonForm from './PersonForm';
import { CmsTabLayout, type CmsColumn } from './CmsTabLayout';
import { useCmsData } from '@/hooks/useCmsData';
import type { CmsPerson, PeopleGroupSlug } from '@/lib/cms/types';
import { PEOPLE_GROUPS } from '@/lib/cms/types';

const IMAGE_FIELDS = ['headshot_url', 'banner_url'];

export default function PeopleTab() {
  const [groupSlug, setGroupSlug] = useState<PeopleGroupSlug>('officers');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<CmsPerson | undefined>(
    undefined
  );

  const groupConfig = PEOPLE_GROUPS.find(g => g.slug === groupSlug);

  const { items, loading, refetch, handleDragEnd, handleDelete, sensors } =
    useCmsData<CmsPerson>({
      endpoint: '/api/cms/people',
      sortBy: 'sort_order',
      query: `group=${groupSlug}`,
    });

  const getDetailValue = (person: CmsPerson): string => {
    if (!groupConfig) return '';
    const fields = groupConfig.fields.filter(
      f => f !== 'linkedin' && !IMAGE_FIELDS.includes(f)
    );
    const parts: string[] = [];
    for (const f of fields) {
      const val = person[f];
      if (val) parts.push(val);
    }
    return parts.join(' / ') || '--';
  };

  const getDetailHeader = (): string => {
    if (!groupConfig) return 'Details';
    const fields = groupConfig.fields.filter(
      f => f !== 'linkedin' && !IMAGE_FIELDS.includes(f)
    );
    if (fields.length === 0) return 'Details';
    const labels: Record<string, string> = {
      title: 'Title',
      school: 'School',
      company: 'Company',
    };
    return fields.map(f => labels[f] || f).join(' / ');
  };

  const columns: CmsColumn<CmsPerson>[] = useMemo(
    () => [
      {
        header: 'Name',
        render: person => (
          <div className="flex items-center gap-3">
            {person.headshot_url ? (
              <Image
                src={person.headshot_url}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xs font-medium flex items-center justify-center flex-shrink-0">
                {person.name
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <span className="font-medium">{person.name}</span>
              <span className="block sm:hidden text-xs text-gray-500 mt-0.5">
                {getDetailValue(person)}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: getDetailHeader(),
        className: 'hidden sm:table-cell',
        render: person => (
          <span className="text-gray-600">{getDetailValue(person)}</span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupConfig]
  );

  const groupSelector = (
    <Select
      value={groupSlug}
      onValueChange={v => setGroupSlug(v as PeopleGroupSlug)}
    >
      <SelectTrigger className="w-56 h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PEOPLE_GROUPS.map(g => (
          <SelectItem key={g.slug} value={g.slug}>
            {g.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="mt-4">
      <CmsTabLayout
        items={items}
        loading={loading}
        count={items.length}
        noun={['member', 'members']}
        columns={columns}
        headerLeft={groupSelector}
        onAdd={() => {
          setEditingPerson(undefined);
          setFormOpen(true);
        }}
        onEdit={person => {
          setEditingPerson(person);
          setFormOpen(true);
        }}
        onDelete={person => handleDelete(person, person.name)}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        emptyMessage="No people in this group yet."
        itemLabel={person => person.name}
      />

      <PersonForm
        key={editingPerson?.id ?? 'new'}
        open={formOpen}
        onOpenChange={setFormOpen}
        groupSlug={groupSlug}
        person={editingPerson}
        onSaved={() => {
          setFormOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
