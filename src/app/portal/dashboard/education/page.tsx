'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Download, ExternalLink } from 'lucide-react';
import MobileRestrictionModal from '@/components/portal/MobileRestrictionModal';

// Define education resources from /public/portal-resources/education/
const educationResources = {
  value: [
    {
      id: 'value-week1',
      title: 'Week 1: Accounting & Financial Statements',
      path: '/portal-resources/education/value/Value Education - Week 1 - Class.pdf',
      description:
        'Introduction to accounting principles and financial statements',
    },
    {
      id: 'value-week2',
      title: 'Week 2: Valuation Fundamentals',
      path: '/portal-resources/education/value/Value Education - Week 2 - Class.pdf',
      description:
        'Learn DCF, comparable company analysis, and valuation methods',
    },
    {
      id: 'value-week3',
      title: 'Week 3: Investment Theory & Analysis',
      path: '/portal-resources/education/value/Value Education - Week 3 - Class.pdf',
      description: 'Core concepts of value investing and portfolio theory',
    },
    {
      id: 'value-week4',
      title: 'Week 4: Advanced Topics',
      path: '/portal-resources/education/value/Value Education - Week 4 - Class.pdf',
      description: 'Advanced value investing concepts and case studies',
    },
  ],
  quant: [
    {
      id: 'quant-week1',
      title: 'Week 1: Quantitative Foundations',
      path: '/portal-resources/education/quant/Quant Education - Week 1 - Class.pdf',
      description:
        'Introduction to quantitative analysis and mathematical foundations',
    },
    {
      id: 'quant-week2',
      title: 'Week 2: Statistical Methods',
      path: '/portal-resources/education/quant/Quant Education - Week 2 - Class.pdf',
      description: 'Statistical techniques for financial analysis',
    },
    {
      id: 'quant-week3',
      title: 'Week 3: Portfolio Theory',
      path: '/portal-resources/education/quant/Quant Education - Week 3 - Class.pdf',
      description: 'Modern portfolio theory and optimization',
    },
    {
      id: 'quant-week4',
      title: 'Week 4: Risk Management',
      path: '/portal-resources/education/quant/Quant Education - Week 4 - Class.pdf',
      description: 'Quantitative approaches to risk management',
    },
    {
      id: 'quant-week5',
      title: 'Week 5: Algorithmic Trading',
      path: '/portal-resources/education/quant/Quant Education - Week 5 - Class.pdf',
      description: 'Build and test algorithmic trading strategies',
    },
  ],
};

interface Resource {
  id: string;
  title: string;
  path: string;
  description: string;
}

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<'value' | 'quant'>('value');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewResource = (resource: Resource) => {
    if (isMobile) {
      setShowMobileModal(true);
    } else {
      setSelectedResource(resource);
      setIsDialogOpen(true);
    }
  };

  const handleDownload = (resource: Resource) => {
    const link = document.createElement('a');
    link.href = resource.path;
    link.download = resource.path.split('/').pop() || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderResourceCard = (resource: Resource) => (
    <Card
      key={resource.id}
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleViewResource(resource)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-[#003E6B]/10 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#003E6B]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">
              {resource.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={e => {
                  e.stopPropagation();
                  handleViewResource(resource);
                }}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={e => {
                  e.stopPropagation();
                  handleDownload(resource);
                }}
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen text-pgi-dark-blue pt-20 lg:pt-0">
      <div className="mx-auto">
        {/* Tabs */}
        <Tabs
          defaultValue="value"
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'value' | 'quant')}
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="value">VALUE</TabsTrigger>
            <TabsTrigger value="quant">QUANT</TabsTrigger>
          </TabsList>

          <TabsContent value="value" className="mt-0">
            <div className="space-y-4">
              {educationResources.value.map(renderResourceCard)}
            </div>
          </TabsContent>

          <TabsContent value="quant" className="mt-0">
            <div className="space-y-4">
              {educationResources.quant.map(renderResourceCard)}
            </div>
          </TabsContent>
        </Tabs>

        {/* PDF Viewer Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedResource?.title}</DialogTitle>
            </DialogHeader>
            {selectedResource && (
              <div className="flex-1 h-[calc(90vh-100px)]">
                <iframe
                  src={selectedResource.path}
                  className="w-full h-full border-0 rounded"
                  title={selectedResource.title}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Mobile Restriction Modal */}
        <MobileRestrictionModal
          isOpen={showMobileModal}
          onClose={() => setShowMobileModal(false)}
          message="We are still working on previewing documents on mobile. For now, please view all education resources from the website."
        />
      </div>
    </div>
  );
}
