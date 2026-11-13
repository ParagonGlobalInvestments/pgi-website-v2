import { matchOfficerSeat } from './org-chart';

describe('matchOfficerSeat', () => {
  it.each([
    ['CEO', 'ceo'],
    ['Chief Executive Officer', 'ceo'],
    ['President', 'ceo'],
    ['Co-President', 'ceo'],
    ['Chief Investment Officer', 'cio'],
    ['CIO', 'cio'],
    ['Chief Technology Officer', 'cto'],
    ['VP of Education', 'vp-education'],
    ['Vice President, Education', 'vp-education'],
    ['COO (Value)', 'coo-value'],
    ['Chief Operating Officer – Quant', 'coo-quant'],
  ])('maps %s → %s', (title, slug) => {
    expect(matchOfficerSeat(title)).toBe(slug);
  });

  it.each([null, '', 'Vice President', 'VP of Finance', 'COO'])(
    'leaves %p unmatched',
    title => {
      expect(matchOfficerSeat(title)).toBeNull();
    }
  );
});
