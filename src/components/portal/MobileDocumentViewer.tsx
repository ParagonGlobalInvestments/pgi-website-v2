'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  FileText,
  Table,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface MobileDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  url: string; // google drive url or direct file url
  title: string; // document title to display in header
  type?: 'pdf' | 'excel' | 'auto'; // file type or auto-detect
}

interface ExcelData {
  sheets: string[]; // list of sheet names
  data: { [sheetName: string]: any[][] }; // sheet data as 2d arrays
}

/**
 * extracts the file id from various google drive url formats
 */
function extractDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([^/]+)/, // standard drive url
    /id=([^&]+)/, // query parameter format
    /\/d\/([^/]+)/, // short format
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * converts google drive url to direct access or embed url
 */
function getDriveDirectUrl(url: string, forDownload: boolean = false): string {
  const fileId = extractDriveFileId(url);

  if (!fileId) return url; // not a drive url, return as-is

  if (forDownload) {
    // force download
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  } else {
    // embed preview url (works better in iframes)
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
}

/**
 * auto-detects file type from url patterns
 */
function detectFileType(url: string): 'pdf' | 'excel' | 'unknown' {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('.pdf') || lowerUrl.includes('pdf')) {
    return 'pdf';
  }

  if (
    lowerUrl.includes('.xlsx') ||
    lowerUrl.includes('.xls') ||
    lowerUrl.includes('spreadsheet') ||
    lowerUrl.includes('excel')
  ) {
    return 'excel';
  }

  return 'unknown';
}

/**
 * mobile-optimized document viewer for google drive files
 *
 * approach:
 * - pdf: uses google drive's embedded viewer (mobile-optimized iframe)
 * - excel: parses and displays as native html table with sheet selection
 *
 * why not react-pdf?
 * - has webpack/ssr compatibility issues with next.js
 * - google's viewer is already mobile-optimized
 * - simpler, more reliable, faster to load
 */
export default function MobileDocumentViewer({
  isOpen,
  onClose,
  url,
  title,
  type = 'auto',
}: MobileDocumentViewerProps) {
  // determine file type (auto-detect or use provided type)
  const [fileType] = useState<'pdf' | 'excel' | 'unknown'>(
    type === 'auto' ? detectFileType(url) : type
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // excel viewer state
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<number>(0);

  // convert drive url to appropriate format
  const embedUrl = getDriveDirectUrl(url, false); // for iframe embedding
  const downloadUrl = getDriveDirectUrl(url, true); // for downloading

  // load excel file when dialog opens
  useEffect(() => {
    if (isOpen && fileType === 'excel') {
      loadExcelFile();
    } else if (isOpen && fileType === 'pdf') {
      // for pdfs, we just use iframe - no loading needed
      setIsLoading(false);
    }
  }, [isOpen, fileType, url]);

  /**
   * fetches and parses excel file from google drive
   */
  const loadExcelFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('failed to load excel file');

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      const sheets: string[] = workbook.SheetNames;
      const data: { [sheetName: string]: any[][] } = {};

      sheets.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        data[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      });

      setExcelData({ sheets, data });
      setSelectedSheet(0);
    } catch (err) {
      console.error('error loading excel file:', err);
      setError('failed to load excel file. you can still download it.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  const handleOpenInDrive = () => {
    // open original drive url in new tab
    window.open(url, '_blank');
  };

  /**
   * renders pdf viewer using google drive's embedded viewer
   * cleaner, simpler - just the document
   */
  const renderPDFViewer = () => (
    <div className="w-full h-full bg-gray-100">
      {/* pdf iframe - google drive handles the rendering */}
      <div className="relative w-full h-full">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          title={title}
          allow="autoplay"
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="w-[300px] h-[400px]" />
              <p className="text-sm text-gray-600">loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /**
   * renders excel viewer with sheet selector and native table
   */
  const renderExcelViewer = () => {
    if (!excelData) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">unable to display excel file.</p>
        </div>
      );
    }

    const currentSheetName = excelData.sheets[selectedSheet];
    const currentData = excelData.data[currentSheetName];

    return (
      <div className="flex flex-col h-full">
        {/* sheet selector */}
        {excelData.sheets.length > 1 && (
          <div className="p-3 bg-gray-100 border-b">
            <div className="flex items-center gap-2 flex-wrap">
              {excelData.sheets.map((sheetName, index) => (
                <Button
                  key={sheetName}
                  size="sm"
                  variant={selectedSheet === index ? 'default' : 'outline'}
                  onClick={() => setSelectedSheet(index)}
                >
                  {sheetName}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* excel table - scrollable horizontally and vertically */}
        <div className="flex-1 overflow-auto p-4 bg-white">
          <div className="inline-block min-w-full">
            <table className="border-collapse border border-gray-300 text-sm">
              <tbody>
                {currentData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50 font-semibold' : ''}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 px-3 py-2 whitespace-nowrap"
                      >
                        {cell !== null && cell !== undefined ? String(cell) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /**
   * renders error state with download fallback
   */
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        failed to load document
      </h3>
      <p className="text-gray-600 mb-4">{error}</p>
    </div>
  );

  /**
   * renders loading skeleton for excel
   */
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <Skeleton className="w-[300px] h-[400px] mb-4" />
      <p className="text-sm text-gray-600">loading document...</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-full h-screen md:max-w-4xl md:h-[90vh] p-0 gap-0 flex flex-col">
        {/* header with title and actions */}
        <DialogHeader className="p-4 border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {fileType === 'pdf' ? (
                <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
              ) : (
                <Table className="h-5 w-5 text-gray-600 flex-shrink-0" />
              )}
              <DialogTitle className="text-base md:text-lg truncate">{title}</DialogTitle>
            </div>
            {/* close button handled by dialog component */}
          </div>
        </DialogHeader>

        {/* main content area */}
        <div className="flex-1 overflow-hidden min-h-0">
          {error ? (
            renderErrorState()
          ) : isLoading && fileType === 'excel' ? (
            renderLoadingState()
          ) : fileType === 'pdf' ? (
            renderPDFViewer()
          ) : fileType === 'excel' ? (
            renderExcelViewer()
          ) : (
            // unknown file type
            <div className="flex flex-col items-center justify-center h-full p-8">
              <p className="text-gray-600">unable to preview this file type.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
