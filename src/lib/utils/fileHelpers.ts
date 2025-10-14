/**
 * Format bytes to human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension from path
 */
export function getFileExtension(filePath: string): string {
  const parts = filePath.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Get file type from extension
 */
export function getFileType(
  filePath: string
): 'pdf' | 'excel' | 'word' | 'other' {
  const ext = getFileExtension(filePath);

  if (ext === 'pdf') return 'pdf';
  if (ext === 'xlsx' || ext === 'xls') return 'excel';
  if (ext === 'docx' || ext === 'doc') return 'word';
  return 'other';
}

/**
 * Trigger file download
 */
export function downloadFile(url: string, filename?: string) {
  const link = document.createElement('a');
  link.href = url;
  if (filename) {
    link.download = filename;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download multiple files as ZIP (requires JSZip library)
 */
export async function downloadMultipleFiles(
  files: { url: string; filename: string }[]
) {
  for (const file of files) {
    // Simple sequential download
    await new Promise(resolve => setTimeout(resolve, 500)); // Delay between downloads
    downloadFile(file.url, file.filename);
  }
}

/**
 * Get Office Online embed URL for Excel files
 */
export function getOfficeOnlineUrl(fileUrl: string): string {
  const fullUrl = window.location.origin + fileUrl;
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
}
