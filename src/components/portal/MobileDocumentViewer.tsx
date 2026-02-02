'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  FileText,
  Table,
  AlertCircle,
  X,
} from 'lucide-react';

interface MobileDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;           // Supabase Storage URL (always absolute)
  title: string;
  type: 'pdf' | 'sheet'; // only previewable types
}

interface ExcelData {
  sheets: string[];
  data: Record<string, unknown[][]>;
}

/**
 * Mobile-optimized document viewer for Supabase Storage files.
 *
 * - PDF: renders via <object> tag (native browser PDF viewer with download fallback)
 * - Sheet: dynamically imports xlsx, parses, and renders as HTML table with sheet tabs
 *
 * Opens as a full-screen Dialog layered above DetailPanel (z-[100] > z-[95]).
 */
export default function MobileDocumentViewer({
  isOpen,
  onClose,
  url,
  title,
  type,
}: MobileDocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState(0);

  const loadExcelFile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const XLSX = await import('xlsx');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load spreadsheet');

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      const sheets = workbook.SheetNames;
      const data: Record<string, unknown[][]> = {};
      sheets.forEach((name) => {
        data[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
          header: 1,
        });
      });

      setExcelData({ sheets, data });
      setSelectedSheet(0);
    } catch (err) {
      console.error('Error loading spreadsheet:', err);
      setError('Failed to load spreadsheet. You can still download it.');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (type === 'sheet') {
      loadExcelFile();
    } else {
      // PDF — loading handled by <object> onLoad
      setIsLoading(false);
    }
  }, [isOpen, type, loadExcelFile]);

  const handleDownload = () => window.open(url, '_blank');

  // --------------- Renderers ---------------

  const renderPDFViewer = () => (
    <div className="w-full h-full bg-gray-100 flex flex-col relative">
      <div
        className="flex-1 min-h-0 overflow-y-auto relative"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
        }}
      >
        <object
          data={url}
          type="application/pdf"
          className="w-full h-full border-0"
          aria-label={title}
          onLoad={() => setIsLoading(false)}
        >
          {/* Fallback for browsers that can't render PDFs inline */}
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Your browser doesn&apos;t support PDF preview.
            </p>
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </object>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="w-[300px] h-[400px]" />
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderExcelViewer = () => {
    if (!excelData) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">Unable to display spreadsheet.</p>
        </div>
      );
    }

    const currentSheet = excelData.sheets[selectedSheet];
    const rows = excelData.data[currentSheet];

    return (
      <div className="flex flex-col h-full">
        {/* Sheet selection tabs */}
        {excelData.sheets.length > 1 && (
          <div className="p-3 bg-gray-100 border-b">
            <div className="flex items-center gap-2 flex-wrap">
              {excelData.sheets.map((name, i) => (
                <Button
                  key={name}
                  size="sm"
                  variant={selectedSheet === i ? 'default' : 'outline'}
                  onClick={() => setSelectedSheet(i)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable table */}
        <div
          className="flex-1 overflow-auto p-4 bg-white min-h-0"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-x pan-y',
          }}
        >
          <div className="inline-block min-w-full">
            <table className="border-collapse border border-gray-300 text-sm">
              <tbody>
                {rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={ri === 0 ? 'bg-gray-50 font-semibold' : ''}
                  >
                    {(row as unknown[]).map((cell, ci) => (
                      <td
                        key={ci}
                        className="border border-gray-300 px-3 py-2 whitespace-nowrap"
                      >
                        {cell != null ? String(cell) : ''}
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

  const renderError = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Failed to load document
      </h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <Button onClick={handleDownload} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Download instead
      </Button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <Skeleton className="w-[300px] h-[400px] mb-4" />
      <p className="text-sm text-gray-600">Loading document...</p>
    </div>
  );

  // --------------- Main render ---------------

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="z-[100] left-0 top-0 translate-x-0 translate-y-0 max-w-full w-full h-[100dvh] p-0 gap-0 flex flex-col rounded-none border-0 [&>button:last-child]:hidden"
      >
        {/* Header with title, type icon, and close button */}
        <DialogHeader className="p-4 border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {type === 'pdf' ? (
                <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
              ) : (
                <Table className="h-5 w-5 text-gray-600 flex-shrink-0" />
              )}
              <DialogTitle className="text-base truncate">
                {title}
              </DialogTitle>
            </div>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Document content area */}
        <div className="flex-1 overflow-hidden min-h-0">
          {error
            ? renderError()
            : isLoading && type === 'sheet'
              ? renderLoading()
              : type === 'pdf'
                ? renderPDFViewer()
                : renderExcelViewer()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
