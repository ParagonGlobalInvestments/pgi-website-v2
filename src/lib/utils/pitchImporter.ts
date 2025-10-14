import * as fs from 'fs';
import * as path from 'path';

export interface ParsedPitch {
  ticker: string;
  exchange: 'NASDAQ' | 'NYSE';
  pitchDate: string; // YYYY-MM-DD
  pdfPath: string;
  excelPath?: string;
  team: 'value' | 'quant';
  folderName: string;
}

/**
 * Parse folder name to extract pitch metadata
 * Format: "EXCHANGE_ TICKER - MM.DD.YYYY - xxx_"
 * Example: "NASDAQ_ CRWD - 12.30.2025 - xxx_"
 */
export function parsePitchFolderName(folderName: string): {
  exchange: 'NASDAQ' | 'NYSE';
  ticker: string;
  pitchDate: string; // YYYY-MM-DD
} | null {
  // Pattern: EXCHANGE_ TICKER - MM.DD.YYYY - xxx_
  const pattern =
    /^(NASDAQ|NYSE)_\s+([A-Z]+)\s+-\s+(\d{2})\.(\d{2})\.(\d{4})\s+-\s+.*$/;
  const match = folderName.match(pattern);

  if (!match) {
    return null;
  }

  const [, exchange, ticker, month, day, year] = match;

  // Convert MM.DD.YYYY to YYYY-MM-DD
  const pitchDate = `${year}-${month}-${day}`;

  return {
    exchange: exchange as 'NASDAQ' | 'NYSE',
    ticker,
    pitchDate,
  };
}

/**
 * Scan pitch folders and return parsed pitch data
 */
export function scanPitchFolders(
  pitchesBasePath: string,
  team: 'value' | 'quant'
): ParsedPitch[] {
  const teamPath = path.join(pitchesBasePath, team);
  const parsedPitches: ParsedPitch[] = [];

  if (!fs.existsSync(teamPath)) {
    console.warn(`Path does not exist: ${teamPath}`);
    return parsedPitches;
  }

  const folders = fs.readdirSync(teamPath, { withFileTypes: true });

  for (const folder of folders) {
    if (!folder.isDirectory() || folder.name.startsWith('.')) {
      continue;
    }

    const parsed = parsePitchFolderName(folder.name);
    if (!parsed) {
      console.warn(`Could not parse folder name: ${folder.name}`);
      continue;
    }

    const folderPath = path.join(teamPath, folder.name);
    const files = fs.readdirSync(folderPath);

    // Find PDF and Excel files
    const pdfFile = files.find(
      f =>
        f.toLowerCase().endsWith('.pdf') &&
        f.includes(parsed.ticker) &&
        (f.toLowerCase().includes('pitch') ||
          !f.toLowerCase().includes('model'))
    );

    const excelFile = files.find(
      f =>
        (f.toLowerCase().endsWith('.xlsx') ||
          f.toLowerCase().endsWith('.xls')) &&
        f.includes(parsed.ticker)
    );

    if (!pdfFile) {
      console.warn(`No PDF found in folder: ${folder.name}`);
      continue;
    }

    // Build web-accessible paths
    const pdfPath = `/portal-resources/pitches/${team}/${folder.name}/${pdfFile}`;
    const excelPath = excelFile
      ? `/portal-resources/pitches/${team}/${folder.name}/${excelFile}`
      : undefined;

    parsedPitches.push({
      ticker: parsed.ticker,
      exchange: parsed.exchange,
      pitchDate: parsed.pitchDate,
      pdfPath,
      excelPath,
      team,
      folderName: folder.name,
    });
  }

  return parsedPitches;
}

/**
 * Get all pitches from both VALUE and QUANT teams
 */
export function getAllPitches(publicPath: string = 'public'): ParsedPitch[] {
  const pitchesBasePath = path.join(
    process.cwd(),
    publicPath,
    'portal-resources',
    'pitches'
  );

  const valuePitches = scanPitchFolders(pitchesBasePath, 'value');
  const quantPitches = scanPitchFolders(pitchesBasePath, 'quant');

  return [...valuePitches, ...quantPitches];
}
