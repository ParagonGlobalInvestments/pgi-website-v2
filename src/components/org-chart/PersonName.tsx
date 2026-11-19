import type { OrgPerson } from '@/types';

export function PersonName({ person }: { person: OrgPerson }) {
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
