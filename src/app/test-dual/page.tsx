'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MobileDocumentViewer from '@/components/portal/MobileDocumentViewer';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Eye, FileText, Folder } from 'lucide-react';

/**
 * test page comparing regular pdf vs google drive pdf
 * navigate to: http://localhost:3000/test-dual
 */
export default function DualTestPage() {
  const isMobile = useIsMobile();
  // Note: Google Drive iframes may show harmless cross-origin console errors - this is expected
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerType, setViewerType] = useState<'pdf' | 'excel'>('pdf');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // test urls
  const regularPdfUrl = 'https://bitcoin.org/bitcoin.pdf'; // regular pdf
  const drivePdfUrl = 'https://drive.google.com/file/d/1VRJllP9pc7O9xxexC89yA4xQoDPiT33V/view'; // PGI Drive file

  const openRegularPdf = () => {
    setViewerUrl(regularPdfUrl);
    setViewerTitle('regular pdf (bitcoin whitepaper)');
    setViewerType('pdf');
    setShowViewer(true);
  };

  const openDrivePdf = () => {
    setViewerUrl(drivePdfUrl);
    setViewerTitle('google drive pdf');
    setViewerType('pdf');
    setShowViewer(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">test both pdf types</h1>
        <p className="text-gray-600 mb-4">
          screen width: {mounted ? window.innerWidth : '...'}px |
          mobile mode: {isMobile ? 'YES ✓' : 'NO'}
        </p>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-semibold mb-2">📋 setup instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>regular pdf:</strong> works out of the box (bitcoin whitepaper)
            </li>
            <li>
              <strong>google drive pdf:</strong> upload any pdf to your drive → share publicly →
              copy url → paste in line 21 of this file
            </li>
            <li>
              <strong>to test mobile:</strong> open chrome devtools (F12) → device toggle (Cmd+Shift+M) →
              select mobile device
            </li>
          </ol>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* regular pdf test */}
          <Card className="h-[500px]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle>regular pdf test</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)]">
              {isMobile ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-center text-gray-600 text-sm">
                    regular pdf from bitcoin.org
                  </p>
                  <Button onClick={openRegularPdf} className="gap-2">
                    <Eye className="h-4 w-4" />
                    view regular pdf
                  </Button>
                  <div className="text-xs text-gray-400 mt-2">
                    <p>✓ no google drive required</p>
                    <p>✓ public url</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 border-2 border-dashed border-gray-300 rounded">
                  <FileText className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">desktop mode</p>
                  <p className="text-sm text-gray-500">
                    resize to &lt; 768px to see mobile view
                  </p>
                  <Button onClick={openRegularPdf} variant="outline">
                    test viewer anyway
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* google drive pdf test */}
          <Card className="h-[500px]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-green-600" />
                <CardTitle>google drive pdf test</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)]">
              {isMobile ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Folder className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-center text-gray-600 text-sm">
                    google drive pdf (need to configure)
                  </p>
                  {drivePdfUrl.includes('PASTE_YOUR') ? (
                    <div className="text-center space-y-2">
                      <p className="text-sm text-amber-600 font-medium">
                        ⚠️ no drive url configured
                      </p>
                      <p className="text-xs text-gray-500">
                        edit line 21 in src/app/test-dual/page.tsx
                      </p>
                    </div>
                  ) : (
                    <Button onClick={openDrivePdf} className="gap-2">
                      <Eye className="h-4 w-4" />
                      view drive pdf
                    </Button>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    <p>✓ uses google drive embed</p>
                    <p>✓ works like pitches page</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 border-2 border-dashed border-gray-300 rounded">
                  <Folder className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">desktop mode</p>
                  <p className="text-sm text-gray-500">
                    resize to &lt; 768px to see mobile view
                  </p>
                  {!drivePdfUrl.includes('PASTE_YOUR') && (
                    <Button onClick={openDrivePdf} variant="outline">
                      test viewer anyway
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-gray-100 border border-gray-200 rounded-lg">
          <h3 className="font-bold mb-3">how google drive urls work:</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">input:</span>
              <code className="text-xs">https://drive.google.com/file/d/ABC123/view</code>
            </div>
            <div className="flex gap-3">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">extracts:</span>
              <code className="text-xs">ABC123</code>
            </div>
            <div className="flex gap-3">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">converts:</span>
              <code className="text-xs">https://drive.google.com/file/d/ABC123/preview</code>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-xs text-amber-800">
                <strong>⚠️ important:</strong> drive files must be shared as "anyone with the link"
                or the viewer won't be able to load them
              </p>
            </div>
          </div>
        </div>

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
