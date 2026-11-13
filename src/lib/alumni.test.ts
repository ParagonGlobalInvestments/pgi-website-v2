import { pickCurrentCompanies, presentParts } from './alumni';

describe('pickCurrentCompanies', () => {
  it('prefers the first ongoing entry in the user order', () => {
    const result = pickCurrentCompanies([
      { user_id: 'a', company: 'Old Co', end_year: 2022, sort_order: 0 },
      { user_id: 'a', company: 'Second Now', end_year: null, sort_order: 2 },
      { user_id: 'a', company: 'First Now', end_year: null, sort_order: 1 },
    ]);
    expect(result.get('a')).toBe('First Now');
  });

  it('falls back to the most recently ended entry', () => {
    const result = pickCurrentCompanies([
      { user_id: 'a', company: 'Earlier', end_year: 2021, sort_order: 0 },
      { user_id: 'a', company: 'Latest', end_year: 2024, sort_order: 1 },
    ]);
    expect(result.get('a')).toBe('Latest');
  });

  it('falls back to the newest CMS listing when there is no experience', () => {
    const result = pickCurrentCompanies(
      [
        {
          user_id: 'a',
          company: 'Experience Co',
          end_year: null,
          sort_order: 0,
        },
      ],
      [
        { user_id: 'a', company: 'Ignored', updated_at: '2026-01-01' },
        { user_id: 'b', company: 'Older', updated_at: '2025-01-01' },
        { user_id: 'b', company: 'Newer', updated_at: '2026-01-01' },
        { user_id: 'c', company: '  ', updated_at: '2026-01-01' },
      ]
    );
    expect(result.get('a')).toBe('Experience Co');
    expect(result.get('b')).toBe('Newer');
    expect(result.has('c')).toBe(false);
  });

  it('ignores blank companies and trims names', () => {
    const result = pickCurrentCompanies([
      { user_id: 'a', company: '', end_year: null, sort_order: 0 },
      { user_id: 'a', company: ' Real Co ', end_year: 2020, sort_order: 1 },
    ]);
    expect(result.get('a')).toBe('Real Co');
  });
});

describe('presentParts', () => {
  it('omits missing parts', () => {
    expect(presentParts(['Acme', null, 'Class of 2024'])).toEqual([
      'Acme',
      'Class of 2024',
    ]);
    expect(presentParts([undefined, ' ', null])).toEqual([]);
  });
});
