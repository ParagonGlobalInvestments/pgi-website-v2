'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MobileDocumentViewer from '@/components/portal/MobileDocumentViewer';
import { Eye } from 'lucide-react';

/**
 * side-by-side comparison of desktop vs mobile document display
 * navigate to: http://localhost:3000/test-comparison
 */
export default function ComparisonPage() {
  const [showMobileViewer, setShowMobileViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerTitle, setViewerTitle] = useState('');

  // sample pdf url - using PGI Google Drive document
  const samplePdfUrl = 'https://drive.google.com/file/d/1VRJllP9pc7O9xxexC89yA4xQoDPiT33V/preview';

  const openMobileViewer = () => {
    setViewerUrl(samplePdfUrl);
    setViewerTitle('lorem ipsum document');
    setShowMobileViewer(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">desktop vs mobile comparison for google drive document</h1>
        <p className="text-gray-600 mb-8"> 
          this shows both versions side-by-side so you can see the difference
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* desktop version */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h2 className="text-xl font-bold mb-1">
                🖥️ desktop version (&gt;= 768px)
              </h2>
              <p className="text-sm text-gray-600">
                this is what users see on desktop/laptop - unchanged from before
              </p>
            </div>

            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>lorem ipsum document (desktop)</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                {/* desktop: shows iframe directly */}
                <iframe
                  src={samplePdfUrl}
                  className="w-full h-full border-0 rounded"
                  title="Desktop PDF Viewer"
                />
              </CardContent>
            </Card>
          </div>

          {/* mobile version */}
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h2 className="text-xl font-bold mb-1">
                📱 mobile version (&lt; 768px)
              </h2>
              <p className="text-sm text-gray-600">
                this is what users see on phones - new mobile-optimized viewer
              </p>
            </div>

            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>lorem ipsum document (mobile)</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                {/* mobile: shows button card */}
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-center text-gray-600">
                    tap below to view the investment thesis in a mobile-optimized
                    viewer
                  </p>
                  <Button onClick={openMobileViewer} className="gap-2">
                    <Eye className="h-4 w-4" />
                    view pdf
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    (click to see the mobile viewer in action)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold mb-2">key differences:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                🖥️ desktop (left side):
              </h4>
              <ul className="space-y-1 text-gray-700">
                <li>✓ iframe loads directly in page</li>
                <li>✓ google drive preview embedded</li>
                <li>✓ same as before (no changes)</li>
                <li>✓ works fine on large screens</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                📱 mobile (right side):
              </h4>
              <ul className="space-y-1 text-gray-700">
                <li>✓ button card instead of iframe</li>
                <li>✓ opens full-screen viewer dialog</li>
                <li>✓ mobile-optimized interface</li>
                <li>✓ better ux on small screens</li>
              </ul>
            </div>
          </div>
        </div>

        {/* mobile viewer dialog */}
        <MobileDocumentViewer
          isOpen={showMobileViewer}
          onClose={() => setShowMobileViewer(false)}
          url={viewerUrl}
          title={viewerTitle}
          type="pdf"
        />
      </div>
    </div>
  );
}
