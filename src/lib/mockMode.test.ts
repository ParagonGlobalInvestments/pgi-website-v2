import { parseStoredMock, toStoredMock } from './mockMode';

describe('toStoredMock', () => {
  it('writes both the current and legacy active flags and round-trips', () => {
    const active = {
      status: 'active' as const,
      role: 'pm' as const,
      program: 'value' as const,
    };
    const stored = toStoredMock(active);
    expect(stored).toEqual({
      status: 'active',
      isActive: true,
      role: 'pm',
      program: 'value',
    });
    expect(parseStoredMock(JSON.parse(JSON.stringify(stored)))).toEqual(active);
  });
});

describe('parseStoredMock', () => {
  it('reads the current format', () => {
    expect(
      parseStoredMock({ status: 'active', role: 'pm', program: 'quant' })
    ).toEqual({ status: 'active', role: 'pm', program: 'quant' });
  });

  it('reads the legacy isActive format', () => {
    expect(
      parseStoredMock({ isActive: true, role: 'analyst', program: null })
    ).toEqual({ status: 'active', role: 'analyst', program: null });
  });

  it('treats inactive, malformed, or unknown roles as inactive', () => {
    expect(parseStoredMock(null)).toEqual({ status: 'inactive' });
    expect(parseStoredMock({ isActive: false, role: 'pm' })).toEqual({
      status: 'inactive',
    });
    expect(parseStoredMock({ status: 'active', role: 'ceo' })).toEqual({
      status: 'inactive',
    });
  });

  it('drops an unknown program', () => {
    expect(
      parseStoredMock({ status: 'active', role: 'pm', program: 'macro' })
    ).toEqual({ status: 'active', role: 'pm', program: null });
  });
});
