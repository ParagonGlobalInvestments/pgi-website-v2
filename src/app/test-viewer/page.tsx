'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MobileDocumentViewer from '@/components/portal/MobileDocumentViewer';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Eye } from 'lucide-react';

/**
 * test page for mobile document viewer
 * navigate to: http://localhost:3000/test-viewer
 *
 * this page lets you test the viewer with sample google drive urls
 * without needing actual pitch data in the database
 */
export default function TestViewerPage() {
  const isMobile = useIsMobile();
  // const error = useErrorHandler(); // Disabled - Google Drive iframes cause harmless cross-origin errors
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerType, setViewerType] = useState<'pdf' | 'excel'>('pdf');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // sample document urls - using real public documents for testing
  // regular public pdf (bitcoin whitepaper)
  const samplePdfUrl =
    'https://bitcoin.org/bitcoin.pdf'; // publicly accessible pdf

  // google drive pdf - PGI lorem ipsum document
  const googleDrivePdfUrl = 
    'https://drive.google.com/file/d/1VRJllP9pc7O9xxexC89yA4xQoDPiT33V/view'; // PGI Drive PDF

  // google sheets - PGI resource (Excel/Sheets)
  const sampleExcelUrl =
    'https://docs.google.com/spreadsheets/d/1mJDFCY1_VYQ-eQc2xXojCfbd4Tf9MpflUrqsfiFuzZU/edit'; // PGI Google Sheets

  const openPdfViewer = () => {
    setViewerUrl(samplePdfUrl);
    setViewerTitle('regular pdf (bitcoin whitepaper)');
    setViewerType('pdf');
    setShowViewer(true);
  };

  const openGoogleDrivePdf = () => {
    setViewerUrl(googleDrivePdfUrl);
    setViewerTitle('lorem ipsum document (google drive)');
    setViewerType('pdf');
    setShowViewer(true);
  };

  const openExcelViewer = () => {
    setViewerUrl(sampleExcelUrl);
    setViewerTitle('test excel model');
    setViewerType('excel');
    setShowViewer(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">mobile document viewer test</h1>
        <p className="text-gray-600 mb-8">
          screen width: {mounted ? window.innerWidth : '...'}
          px | mobile mode: {isMobile ? 'YES' : 'NO'}
        </p>

        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-semibold mb-2">testing instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>desktop test:</strong> you'll see iframes below (normal
              behavior)
            </li>
            <li>
              <strong>mobile test (mobile version used for resources in portal (pitches, education, etc)):</strong> open chrome devtools (F12) → click
              device toggle (Cmd+Shift+M) → select a mobile device → refresh
            </li>
            <li>
              on mobile, you'll see buttons instead of iframes - click them to
              open the viewer
            </li>
            <li>
              <strong>important:</strong> replace the sample urls in this file
              with real google drive urls
            </li>
          </ol>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* regular pdf test card */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>regular pdf</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)]">
              {isMobile ? (
                // mobile: show button to open in viewer
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-center text-gray-600">
                    tap below to view the pdf in mobile-optimized viewer
                  </p>
                  <Button onClick={openPdfViewer} className="gap-2">
                    <Eye className="h-4 w-4" />
                    view pdf
                  </Button>
                  <p className="text-xs text-gray-400 mt-4">
                    (you're in mobile mode!)
                  </p>
                </div>
              ) : (
                // desktop: show iframe
                <div className="flex flex-col items-center justify-center h-full gap-4 border-2 border-dashed border-gray-300 rounded">
                  <p className="text-gray-600">
                    desktop mode - would show iframe here
                  </p>
                  <p className="text-sm text-gray-500">
                    (resize to &lt; 768px to see mobile view)
                  </p>
                  <Button onClick={openPdfViewer} variant="outline">
                    test viewer anyway
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* google drive pdf test card */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>google drive pdf</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)]">
              {isMobile ? (
                // mobile: show button to open in viewer
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Eye className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-center text-gray-600">
                    tap below to view google drive pdf in mobile-optimized viewer
                  </p>
                  <Button onClick={openGoogleDrivePdf} className="gap-2">
                    <Eye className="h-4 w-4" />
                    view drive pdf
                  </Button>
                  <p className="text-xs text-gray-400 mt-4">
                    (lorem ipsum document)
                  </p>
                </div>
              ) : (
                // desktop: show iframe
                <div className="flex flex-col items-center justify-center h-full gap-4 border-2 border-dashed border-gray-300 rounded">
                  <p className="text-gray-600">
                    desktop mode - would show iframe here
                  </p>
                  <p className="text-sm text-gray-500">
                    (resize to &lt; 768px to see mobile view)
                  </p>
                  <Button onClick={openGoogleDrivePdf} variant="outline">
                    test viewer anyway
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* excel test card */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>google sheets</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)]">
              {isMobile ? (
                // mobile: show button to open in viewer
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Eye className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-center text-gray-600">
                    tap below to view the excel in mobile-optimized viewer
                  </p>
                  <Button onClick={openExcelViewer} className="gap-2">
                    <Eye className="h-4 w-4" />
                    view excel
                  </Button>
                  <p className="text-xs text-gray-400 mt-4">
                    (bitcoin whitepaper document)
                  </p>
                </div>
              ) : (
                // desktop: show iframe
                <div className="flex flex-col items-center justify-center h-full gap-4 border-2 border-dashed border-gray-300 rounded">
                  <p className="text-gray-600">
                    desktop mode - would show iframe here
                  </p>
                  <p className="text-sm text-gray-500">
                    (resize to &lt; 768px to see mobile view)
                  </p>
                  <Button onClick={openExcelViewer} variant="outline">
                    test viewer anyway
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* mobile viewer dialog */}
        <MobileDocumentViewer
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
          url={viewerUrl}
          title={viewerTitle}
          type={viewerType}
        />
      </div>
    </div>
  );
}
