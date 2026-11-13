import { getGraduatedClassYear } from './graduation';

describe('getGraduatedClassYear', () => {
  it('uses the previous year before June 15', () => {
    expect(getGraduatedClassYear(new Date('2026-01-01T00:00:00Z'))).toBe(2025);
    expect(getGraduatedClassYear(new Date('2026-06-14T23:59:59Z'))).toBe(2025);
  });

  it('uses the current year from June 15 on', () => {
    expect(getGraduatedClassYear(new Date('2026-06-15T00:00:00Z'))).toBe(2026);
    expect(getGraduatedClassYear(new Date('2026-11-07T12:00:00Z'))).toBe(2026);
    expect(getGraduatedClassYear(new Date('2026-12-31T23:59:59Z'))).toBe(2026);
  });
});
