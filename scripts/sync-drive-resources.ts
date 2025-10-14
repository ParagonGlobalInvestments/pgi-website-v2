/**
 * One-time Google Drive Sync Script
 *
 * This script downloads resources from PGI's Google Drive and organizes them
 * into the /public/resources/ directory structure.
 *
 * Usage:
 * 1. Set up Google Cloud credentials (credentials.json)
 * 2. Run: npx tsx scripts/sync-drive-resources.ts
 * 3. Follow OAuth prompts if needed
 */

import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

// Configuration
const DRIVE_FOLDER_ID = '1G88uYGlQqps00CZYiBztgu6Bo_Hj_R98';
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'resources');
const MANIFEST_PATH = path.join(PUBLIC_DIR, 'manifest.json');

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.xlsx', '.xls', '.docx', '.doc'];

interface FileManifest {
  driveId: string;
  localPath: string;
  name: string;
  mimeType: string;
  downloadedAt: string;
}

interface FolderMapping {
  name: string;
  targetPath: string;
}

// Folder name to local path mapping
const FOLDER_MAPPINGS: { [key: string]: FolderMapping } = {
  '1. Pitches': { name: 'Pitches', targetPath: 'pitches' },
  '2. Education': { name: 'Education', targetPath: 'education' },
  '3. Recruitment Guides': { name: 'Recruitment', targetPath: 'recruitment' },
};

/**
 * Authenticate with Google Drive API
 */
async function authenticateGoogleDrive() {
  try {
    const auth = await authenticate({
      keyfilePath: path.join(process.cwd(), 'credentials.json'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Authentication failed:', error);
    throw new Error(
      'Please ensure credentials.json exists in the project root. Get it from Google Cloud Console.'
    );
  }
}

/**
 * Check if file extension is allowed
 */
function isAllowedFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Download a file from Google Drive
 */
async function downloadFile(
  drive: any,
  fileId: string,
  fileName: string,
  destPath: string
): Promise<void> {
  try {
    const dest = fs.createWriteStream(destPath);
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return new Promise((resolve, reject) => {
      response.data
        .on('end', () => {
          console.log(`✓ Downloaded: ${fileName}`);
          resolve();
        })
        .on('error', (err: Error) => {
          console.error(`✗ Error downloading ${fileName}:`, err);
          reject(err);
        })
        .pipe(dest);
    });
  } catch (error) {
    console.error(`Failed to download ${fileName}:`, error);
    throw error;
  }
}

/**
 * Process folder recursively
 */
async function processFolder(
  drive: any,
  folderId: string,
  localBasePath: string,
  manifest: FileManifest[]
): Promise<void> {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100,
    });

    const files = response.data.files || [];

    for (const file of files) {
      // Handle folders recursively
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        const subFolderPath = path.join(localBasePath, file.name);
        ensureDir(subFolderPath);
        await processFolder(drive, file.id, subFolderPath, manifest);
      }
      // Handle files
      else if (isAllowedFile(file.name)) {
        const filePath = path.join(localBasePath, file.name);
        await downloadFile(drive, file.id, file.name, filePath);

        manifest.push({
          driveId: file.id,
          localPath: path.relative(PUBLIC_DIR, filePath),
          name: file.name,
          mimeType: file.mimeType,
          downloadedAt: new Date().toISOString(),
        });
      } else {
        console.log(`Skipped (not allowed): ${file.name}`);
      }
    }
  } catch (error) {
    console.error('Error processing folder:', error);
    throw error;
  }
}

/**
 * Main sync function
 */
async function syncDriveResources() {
  console.log('🚀 Starting Google Drive sync...\n');

  // Ensure public/resources directory exists
  ensureDir(PUBLIC_DIR);

  const manifest: FileManifest[] = [];

  try {
    // Authenticate
    console.log('Authenticating with Google Drive...');
    const drive = await authenticateGoogleDrive();
    console.log('✓ Authentication successful\n');

    // Get main folder contents
    const mainFolder = await drive.files.list({
      q: `'${DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100,
    });

    const folders = mainFolder.data.files || [];
    console.log(`Found ${folders.length} main folders\n`);

    // Process each main folder
    for (const folder of folders) {
      if (folder.mimeType === 'application/vnd.google-apps.folder') {
        const mapping = FOLDER_MAPPINGS[folder.name];

        if (mapping) {
          console.log(`\n📁 Processing: ${folder.name}`);
          const targetPath = path.join(PUBLIC_DIR, mapping.targetPath);
          ensureDir(targetPath);
          await processFolder(drive, folder.id, targetPath, manifest);
        } else {
          console.log(`Skipping unknown folder: ${folder.name}`);
        }
      }
    }

    // Save manifest
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`\n✓ Manifest saved to ${MANIFEST_PATH}`);
    console.log(`\n✅ Sync complete! Downloaded ${manifest.length} files.`);
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncDriveResources();
