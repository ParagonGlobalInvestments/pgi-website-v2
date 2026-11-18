/**
 * Parser for the "National Directory – Pods" sheet export (CSV).
 *
 * Expected layout (column B holds row labels):
 *
 *   ,Pod Number,1,2,...             ← starts a block; one column per pod
 *   ,Sector,Tech,Consumer,...       ← focus row (label may be blank)
 *   ,ICOMM,Name,Name,...            ← ICOMM → value block, QCOMM → quant block
 *   ,PM,Name,Name,...               ← optional (value only)
 *   ,Analysts,Name,Name,...         ← analysts; following rows with a blank
 *   ,,Name,Name,...                    label are more analysts
 *   (blank row ends the block)
 *
 * Off to the side, "New Members - Value/Quant | Pod" lists give each new
 * member's pod. That list wins over the grid: a new member is moved to the
 * pod it names (added as an analyst if the grid doesn't list them).
 *
 * Names anywhere else on the sheet (e.g. below the grids) are returned as
 * `unassigned`: on the roster, not in a pod yet.
 */

export type Program = 'value' | 'quant';
export type Seat = 'committee' | 'pm' | 'analyst';

export interface SheetMember {
  name: string;
  seat: Seat;
}

export interface SheetPod {
  number: number;
  program: Program;
  focus: string | null;
  members: SheetMember[];
}

export interface SheetParseResult {
  pods: SheetPod[];
  /** Names outside any pod block or new-member list, in sheet order. */
  unassigned: string[];
  /** Human-readable notes about conflicts and skipped cells. */
  warnings: string[];
}

/** Minimal RFC 4180 parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Collapse whitespace; straighten curly apostrophes. */
export function cleanName(value: string | undefined): string {
  return (value ?? '').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
}

/** Key for comparing names (case-insensitive). */
export function nameKey(value: string): string {
  return cleanName(value).toLowerCase();
}

const LABEL_COL = 1;

function seatForLabel(label: string): Seat | null {
  const l = label.trim().toUpperCase();
  if (l === 'ICOMM' || l === 'QCOMM') return 'committee';
  if (l === 'PM') return 'pm';
  if (l === 'ANALYSTS' || l === 'ANALYST' || l === '') return 'analyst';
  return null;
}

export function parsePodSheet(csv: string): SheetParseResult {
  const rows = parseCsv(csv);
  const warnings: string[] = [];
  const pods = new Map<number, SheetPod>();
  const claimed = new Set<string>(); // "row:col" cells consumed by a pod block

  // ---- Pod blocks --------------------------------------------------------
  for (let r = 0; r < rows.length; r++) {
    if (cleanName(rows[r][LABEL_COL]) !== 'Pod Number') continue;

    // Pod columns: consecutive integer cells to the right of the label
    const cols: { col: number; number: number }[] = [];
    for (let c = LABEL_COL + 1; c < rows[r].length; c++) {
      const n = Number(cleanName(rows[r][c]));
      if (!Number.isInteger(n) || cleanName(rows[r][c]) === '') break;
      cols.push({ col: c, number: n });
    }
    if (cols.length === 0) continue;
    cols.forEach(({ col }) => claimed.add(`${r}:${col}`));

    const block: SheetPod[] = cols.map(({ number }) => ({
      number,
      program: 'value',
      focus: null,
      members: [],
    }));

    // Focus row
    const focusRow = rows[r + 1] ?? [];
    cols.forEach(({ col }, i) => {
      block[i].focus = cleanName(focusRow[col]) || null;
      claimed.add(`${r + 1}:${col}`);
    });

    // Member rows until a fully blank row (across pod columns)
    let program: Program | null = null;
    let seat: Seat = 'analyst';
    let rr = r + 2;
    for (; rr < rows.length; rr++) {
      const row = rows[rr];
      const label = cleanName(row[LABEL_COL]);
      if (label === 'Pod Number') break;
      const names = cols.map(({ col }) => cleanName(row[col]));
      if (names.every(n => n === '')) break;

      const labelSeat = seatForLabel(label);
      if (labelSeat === null) {
        warnings.push(`Row ${rr + 1}: unknown label "${label}", skipped`);
        continue;
      }
      if (label !== '') seat = labelSeat;
      if (label.toUpperCase() === 'QCOMM') program = 'quant';
      if (label.toUpperCase() === 'ICOMM') program = 'value';

      names.forEach((name, i) => {
        claimed.add(`${rr}:${cols[i].col}`);
        if (!name) return;
        const pod = block[i];
        if (pod.members.some(m => nameKey(m.name) === nameKey(name))) {
          warnings.push(`Pod ${pod.number}: "${name}" listed twice, kept once`);
          return;
        }
        pod.members.push({ name, seat });
      });
    }

    if (!program) {
      warnings.push(
        `Pods ${cols.map(c => c.number).join(', ')}: no ICOMM/QCOMM row, assumed value`
      );
    }
    for (const pod of block) {
      pod.program = program ?? 'value';
      if (pods.has(pod.number)) {
        warnings.push(
          `Pod ${pod.number} appears in two blocks; kept the first`
        );
      } else {
        pods.set(pod.number, pod);
      }
    }
    r = rr - 1;
  }

  // ---- New-member lists --------------------------------------------------
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (!cleanName(rows[r][c]).startsWith('New Members')) continue;
      for (let rr = r + 1; rr < rows.length; rr++) {
        const name = cleanName(rows[rr][c]);
        if (name.startsWith('New Members')) break;
        const podCell = cleanName(rows[rr][c + 1]);
        claimed.add(`${rr}:${c}`);
        claimed.add(`${rr}:${c + 1}`);
        if (!name) continue;
        const number = Number(podCell);
        const target = pods.get(number);
        if (!podCell || !Number.isInteger(number) || !target) {
          warnings.push(
            `New member "${name}": pod "${podCell}" not found, skipped`
          );
          continue;
        }

        // Remove from any other pod's analyst list; add to the target pod
        for (const pod of Array.from(pods.values())) {
          const idx = pod.members.findIndex(
            m => m.seat === 'analyst' && nameKey(m.name) === nameKey(name)
          );
          if (idx === -1 || pod === target) continue;
          pod.members.splice(idx, 1);
          warnings.push(
            `New member "${name}": grid says pod ${pod.number}, list says pod ${number} — using pod ${number}`
          );
        }
        if (!target.members.some(m => nameKey(m.name) === nameKey(name))) {
          target.members.push({ name, seat: 'analyst' });
        }
      }
    }
  }

  // ---- Anything left over ------------------------------------------------
  const inPod = new Set(
    Array.from(pods.values()).flatMap(p => p.members.map(m => nameKey(m.name)))
  );
  const unassigned: string[] = [];
  for (let r = 0; r < rows.length; r++) {
    for (let c = LABEL_COL; c < rows[r].length; c++) {
      const value = cleanName(rows[r][c]);
      if (!value || claimed.has(`${r}:${c}`)) continue;
      if (c === LABEL_COL && seatForLabel(value) !== null) continue;
      if (/^(Pod Number|Pod|Sector)$/.test(value)) continue;
      if (value.startsWith('New Members')) continue;
      if (c === LABEL_COL) {
        warnings.push(`Row ${r + 1}: unknown label "${value}", ignored`);
        continue;
      }
      const key = nameKey(value);
      if (inPod.has(key) || unassigned.some(n => nameKey(n) === key)) continue;
      unassigned.push(value);
      warnings.push(
        `Row ${r + 1}: "${value}" is not in any pod, listed as unassigned`
      );
    }
  }

  return {
    pods: Array.from(pods.values()).sort((a, b) => a.number - b.number),
    unassigned,
    warnings,
  };
}
