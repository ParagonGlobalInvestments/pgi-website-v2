/** @jest-environment node */

import { parseCsv, parsePodSheet } from './pod-sheet';

// Layout mirrors the directory sheet export; names are fictional.
const SHEET = [
  ',,,,,,New Members - Value,Pod',
  ',Pod Number,1,2,,,Nia New,2',
  ',Sector,Tech,"Consumer, Retail",,,Moe Moved,2',
  ',ICOMM,Ada Comm,Ben Comm,,,,',
  ',PM,Cy Lead,Di Lead,,,New Members - Quant,Pod',
  ',Analysts,Eve One,Fay Two,,,Quinn Q,11',
  ',,Gus Three,Gus Three,,,,',
  ',,Moe Moved,Hal Four,,,,',
  ',,,Hal Four,,,,',
  ',,,,,,,',
  ',Pod Number,11,12,,,,',
  ',,Alt Data,,,,,',
  ',QCOMM,Ivy Q,Jon Q,,,,',
  ',Analysts,Kim Five,,,,,',
  ',,,,,,,',
  ',,Stray Person,,,,,',
].join('\r\n');

describe('parseCsv', () => {
  it('handles quoted commas and escaped quotes', () => {
    expect(parseCsv('a,"b, c","d ""e"""\n1,2,3')).toEqual([
      ['a', 'b, c', 'd "e"'],
      ['1', '2', '3'],
    ]);
  });
});

describe('parsePodSheet', () => {
  const { pods, unassigned, warnings } = parsePodSheet(SHEET);
  const pod = (n: number) => pods.find(p => p.number === n)!;
  const names = (n: number) => pod(n).members.map(m => m.name);

  it('reads pods, programs and focus', () => {
    expect(pods.map(p => [p.number, p.program, p.focus])).toEqual([
      [1, 'value', 'Tech'],
      [2, 'value', 'Consumer, Retail'],
      [11, 'quant', 'Alt Data'],
      [12, 'quant', null],
    ]);
  });

  it('assigns seats from row labels', () => {
    expect(pod(1).members.slice(0, 3)).toEqual([
      { name: 'Ada Comm', seat: 'committee' },
      { name: 'Cy Lead', seat: 'pm' },
      { name: 'Eve One', seat: 'analyst' },
    ]);
    expect(pod(12).members).toEqual([{ name: 'Jon Q', seat: 'committee' }]);
  });

  it('dedupes names within a pod', () => {
    expect(names(2).filter(n => n === 'Hal Four')).toHaveLength(1);
    expect(warnings).toContain('Pod 2: "Hal Four" listed twice, kept once');
  });

  it('lets the new-member list override the grid', () => {
    expect(names(1)).not.toContain('Moe Moved');
    expect(names(2)).toContain('Moe Moved');
    expect(warnings).toContain(
      'New member "Moe Moved": grid says pod 1, list says pod 2 — using pod 2'
    );
  });

  it('adds new members missing from the grid as analysts', () => {
    expect(pod(2).members).toContainEqual({ name: 'Nia New', seat: 'analyst' });
    expect(pod(11).members).toContainEqual({
      name: 'Quinn Q',
      seat: 'analyst',
    });
  });

  it('lists names outside any pod as unassigned', () => {
    expect(unassigned).toEqual(['Stray Person']);
    expect(warnings).toContain(
      'Row 16: "Stray Person" is not in any pod, listed as unassigned'
    );
  });
});
