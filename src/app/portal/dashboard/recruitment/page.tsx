'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileTypeIcon } from '@/components/portal/FileTypeIcon';
import { Download, ExternalLink } from 'lucide-react';
import { downloadFile, getOfficeOnlineUrl } from '@/lib/utils/fileHelpers';
import MobileDocumentViewer from '@/components/portal/MobileDocumentViewer';
import { useIsMobile } from '@/hooks/useIsMobile';

// Define recruitment resources from /public/portal-resources/recruitment/
interface Resource {
  id: string;
  title: string;
  path: string;
  type: 'pdf' | 'excel' | 'word';
  description?: string;
  category?: string;
}

const recruitmentResources = {
  investmentBanking: {
    networking: [
      {
        id: 'networking-guide',
        title: 'Networking Questions and Guide',
        path: '/portal-resources/recruitment/investment-banking/1. Networking/Networking Questions and Guide.docx',
        type: 'word' as const,
        description:
          'Comprehensive guide to networking in finance with sample questions',
      },
      {
        id: 'networking-emails',
        title: 'Networking Emails Template',
        path: '/portal-resources/recruitment/investment-banking/1. Networking/Networking Emails.docx',
        type: 'word' as const,
        description:
          'Professional email templates for reaching out to finance professionals',
      },
      {
        id: 'email-list',
        title: 'Email List & Tracker',
        path: '/portal-resources/recruitment/investment-banking/1. Networking/Email List.xlsx',
        type: 'excel' as const,
        description: 'Track your networking outreach and responses',
      },
    ],
    resumes: [
      {
        id: 'sample-resume',
        title: 'Sample Resume - Jay Sivadas',
        path: '/portal-resources/recruitment/investment-banking/2. Resume Example/Sample Resume - Jay Sivadas.docx',
        type: 'word' as const,
        description: 'Example finance resume with best practices',
      },
    ],
    technicals: [
      // Core Accounting
      {
        id: 'accounting-3-statements',
        title: 'Accounting - 3 Statements',
        path: '/portal-resources/recruitment/investment-banking/3. Technicals/Accounting - 3 Statements.pdf',
        type: 'pdf' as const,
        description:
          'Understanding the income statement, balance sheet, and cash flow statement',
        category: 'Core Accounting',
      },
      {
        id: 'advanced-accounting',
        title: 'Advanced Accounting and Projecting 3 Statements',
        path: '/portal-resources/recruitment/investment-banking/3. Technicals/Advanced Accounting and Projecting 3 statements.pdf',
        type: 'pdf' as const,
        description: 'Advanced concepts in financial modeling and projections',
        category: 'Core Accounting',
      },
      // Valuation
      {
        id: 'dcf',
        title: 'DCF Valuation',
        path: '/portal-resources/recruitment/investment-banking/3. Technicals/DCF.pdf',
        type: 'pdf' as const,
        description: 'Discounted cash flow analysis and valuation methodology',
        category: 'Valuation',
      },
      {
        id: 'equity-ev-multiples',
        title: 'Equity, EV, and Valuation Multiples',
        path: '/portal-resources/recruitment/investment-banking/3. Technicals/Equity, EV, and Valuation Multiples.pdf',
        type: 'pdf' as const,
        description: 'Understanding enterprise value and valuation multiples',
        category: 'Valuation',
      },
      {
        id: 'private-companies',
        title: 'Private Companies Valuation',
        path: '/portal-resources/recruitment/investment-banking/3. Technicals/Private Companies.pdf',
        type: 'pdf' as const,
        description: 'Valuation approaches for private company analysis',
        category: 'Valuation',
      },
      // Transactions
      {
        id: 'lbo',
        title: 'Leveraged Buyout (LBO)',
        path: '/portal-resources/recruitment/investment-banking/3. Technicals/LBO.pdf',
        type: 'pdf' as const,
        description: 'LBO modeling and private equity transaction analysis',
        category: 'Transactions',
      },
      {
        id: 'merger',
        title: 'Merger & Acquisition Analysis',
        path: '/portal-resources/recruitment/investment-banking/3. Technicals/Merger.pdf',
        type: 'pdf' as const,
        description: 'M&A analysis, accretion/dilution, and deal structures',
        category: 'Transactions',
      },
      {
        id: 'dcm-ecm',
        title: 'DCM, ECM, Leveraged Finance',
        path: '/portal-resources/recruitment/investment-banking/3. Technicals/DCM, ECM, Lev Fin.pdf',
        type: 'pdf' as const,
        description: 'Debt and equity capital markets overview',
        category: 'Transactions',
      },
      // Special Topics
      {
        id: 'core-concepts',
        title: 'Core Concepts Overview',
        path: '/portal-resources/recruitment/investment-banking/3. Technicals/Core Concepts.pdf',
        type: 'pdf' as const,
        description: 'Essential IB concepts and terminology',
        category: 'Special Topics',
      },
    ],
    interviewQuestions: [
      {
        id: 'interview-example-1',
        title: 'Past True Interview Questions - Example 1',
        path: '/portal-resources/recruitment/investment-banking/4. Interview Questions/Past True Interview Questions - Example 1.pdf',
        type: 'pdf' as const,
        description: 'Real interview questions from IB interviews',
      },
      {
        id: 'interview-example-2',
        title: 'Past True Interview Questions - Example 2',
        path: '/portal-resources/recruitment/investment-banking/4. Interview Questions/Past True Interview Questions - Example 2.pdf',
        type: 'pdf' as const,
        description: 'Additional real interview questions and answers',
      },
    ],
  },
  quant: [
    {
      id: 'mark-joshi',
      title: 'Quant Job Interview Questions And Answers',
      path: '/portal-resources/recruitment/quant/[Mark Joshi]Quant Job Interview Questions And Answers.pdf',
      type: 'pdf' as const,
      description:
        'Comprehensive guide by Mark Joshi covering probability, statistics, and financial mathematics',
    },
    {
      id: 'xinfeng-zhou',
      title: 'A Practical Guide to Quantitative Finance Interviews',
      path: '/portal-resources/recruitment/quant/[Xinfeng Zhou]A practical Guide to quantitative finance interviews.pdf',
      type: 'pdf' as const,
      description:
        'Essential quant interview preparation with detailed solutions',
    },
    {
      id: 'jane-street',
      title: 'Jane Street Interview Guide',
      path: '/portal-resources/recruitment/quant/janestreet_guide.pdf',
      type: 'pdf' as const,
      description: 'Jane Street specific interview preparation and insights',
    },
  ],
  financialModeling: [
    {
      id: 'modeling-notes',
      title: 'Modeling Notes (LBO and General)',
      path: '/portal-resources/recruitment/financial-modeling/Modeling Notes (LBO and General).pdf',
      type: 'pdf' as const,
      description: 'Comprehensive notes on financial modeling best practices',
    },
    {
      id: 'excel-shortcuts',
      title: 'Excel Shortcuts Guide',
      path: '/portal-resources/recruitment/financial-modeling/Exceljet_Excel_Shortcuts_221220.pdf',
      type: 'pdf' as const,
      description:
        'Master Excel shortcuts to model faster and more efficiently',
    },
    {
      id: '3-statement-model',
      title: '3 Statement Model Guide',
      path: '/portal-resources/recruitment/financial-modeling/3 Statement Model Guide.pdf',
      type: 'pdf' as const,
      description:
        'Step-by-step guide to building integrated 3-statement models',
    },
  ],
};

export default function RecruitmentPage() {
  const isMobile = useIsMobile();
  const [ibSubTab, setIbSubTab] = useState<
    'networking' | 'resumes' | 'technicals' | 'interviewQuestions'
  >('networking');
  const [searchQuery, setSearchQuery] = useState('');
  const [showViewer, setShowViewer] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const handleDownload = (resource: Resource) => {
    downloadFile(resource.path, resource.path.split('/').pop());
  };

  const handleOpenInBrowser = (resource: Resource) => {
    setSelectedResource(resource);
    setShowViewer(true);
  };

  const renderResourceCard = (resource: Resource) => (
    <Card key={resource.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileTypeIcon filePath={resource.path} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-sm text-gray-600 mb-3">
                {resource.description}
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(resource)}
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              {resource.type === 'excel' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenInBrowser(resource)}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open in Browser
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Group technicals by category
  const groupedTechnicals =
    recruitmentResources.investmentBanking.technicals.reduce(
      (acc, resource) => {
        const category = resource.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(resource);
        return acc;
      },
      {} as Record<string, Resource[]>
    );

  return (
    <div className="min-h-screen text-pgi-dark-blue pt-20 lg:pt-0">
      <div className=" mx-auto">
        {/* Main Tabs */}
        <Tabs defaultValue="investmentBanking">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
            <TabsTrigger value="investmentBanking">
              <span className="hidden sm:inline">Investment Banking</span>
              <span className="sm:hidden">IB</span>
            </TabsTrigger>
            <TabsTrigger value="quant">Quant</TabsTrigger>
            <TabsTrigger value="financialModeling">
              <span className="hidden sm:inline">Financial Modeling</span>
              <span className="sm:hidden">Finance</span>
            </TabsTrigger>
          </TabsList>

          {/* Investment Banking Tab with Sub-tabs */}
          <TabsContent value="investmentBanking" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="hidden sm:inline">
                  Investment Banking Resources
                </CardTitle>
                <CardTitle className="sm:hidden text-center">
                  IB Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={ibSubTab}
                  onValueChange={v => setIbSubTab(v as any)}
                >
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="networking">
                      {' '}
                      <span className="text-xs sm:text-base">Networking</span>
                    </TabsTrigger>
                    <TabsTrigger value="resumes">
                      <span className="text-xs sm:text-base">Resumes</span>
                    </TabsTrigger>
                    <TabsTrigger value="technicals">
                      <span className="text-xs sm:text-base">Technicals</span>
                    </TabsTrigger>
                    <TabsTrigger value="interviewQuestions">
                      <span className="text-xs sm:text-base">
                        <span className="hidden sm:inline">Interview Q&A</span>
                        <span className="inline sm:hidden">Q&A</span>
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="networking" className="mt-0">
                    <div className="space-y-4">
                      {recruitmentResources.investmentBanking.networking.map(
                        renderResourceCard
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="resumes" className="mt-0">
                    <div className="space-y-4">
                      {recruitmentResources.investmentBanking.resumes.map(
                        renderResourceCard
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="technicals" className="mt-0">
                    <div className="space-y-8">
                      {Object.entries(groupedTechnicals).map(
                        ([category, resources]) => (
                          <div key={category}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <span className="inline-block w-1 h-6 bg-[#003E6B] mr-3 rounded" />
                              {category}
                            </h3>
                            <div className="space-y-4 ml-4">
                              {resources.map(renderResourceCard)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="interviewQuestions" className="mt-0">
                    <div className="space-y-4">
                      {recruitmentResources.investmentBanking.interviewQuestions.map(
                        renderResourceCard
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quant Tab */}
          <TabsContent value="quant" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="hidden sm:inline">
                  Quantitative Finance Resources
                </CardTitle>
                <CardTitle className="sm:hidden text-center">
                  Quant Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recruitmentResources.quant.map(renderResourceCard)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Modeling Tab */}
          <TabsContent value="financialModeling" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="hidden sm:inline">
                  Financial Modeling Resources
                </CardTitle>
                <CardTitle className="sm:hidden text-center">
                  Finance Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recruitmentResources.financialModeling.map(
                    renderResourceCard
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Viewer */}
        <MobileDocumentViewer
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
          url={selectedResource?.path || ''}
          title={selectedResource?.title || ''}
          type={selectedResource?.type === 'pdf' ? 'pdf' : 'excel'}
        />
      </div>
    </div>
  );
}
