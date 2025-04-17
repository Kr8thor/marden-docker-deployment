import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ExternalLink, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AuditResultsProps {
  pageAnalysis?: any;
  siteAnalysis?: any;
  url: string;
  result?: any;
}

const AuditResults: React.FC<AuditResultsProps> = ({ pageAnalysis, siteAnalysis, url, result }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Combine results from props or use default mock data
  const auditData = result || {
    url: url,
    score: 78,
    issuesFound: 12,
    opportunities: 5,
    performanceMetrics: {
      lcp: {
        value: 2.4,
        unit: 's',
        score: 85,
      },
      cls: {
        value: 0.15,
        score: 75,
      },
      fid: {
        value: 180,
        unit: 'ms',
        score: 70,
      },
    },
    topIssues: [
      {
        severity: 'critical',
        description: 'Missing meta descriptions on 3 pages',
      },
      {
        severity: 'warning',
        description: 'Images without alt text',
      },
      {
        severity: 'info',
        description: 'Consider adding structured data',
      },
    ],
    pageAnalysis: pageAnalysis || {
      title: 'Example Domain',
      metaDescription: 'Missing',
      headings: {
        h1: 1,
        h2: 0,
        h3: 0,
      },
      wordCount: 234,
      contentAnalysis: {
        keywordDensity: [
          { keyword: 'example', count: 5, density: 2.1 },
          { keyword: 'domain', count: 4, density: 1.7 },
          { keyword: 'internet', count: 3, density: 1.3 }
        ],
        readability: {
          score: 65,
          level: 'Standard',
          suggestions: ['Use shorter sentences for better readability']
        }
      },
      seoIssues: [
        { 
          type: 'critical', 
          issue: 'Missing meta description', 
          impact: 'High', 
          recommendation: 'Add a descriptive meta description between 120-158 characters.' 
        },
        { 
          type: 'warning', 
          issue: 'Images missing alt text', 
          impact: 'Medium', 
          recommendation: 'Add descriptive alt text to all images.' 
        },
        { 
          type: 'info', 
          issue: 'No structured data', 
          impact: 'Low', 
          recommendation: 'Consider adding schema markup to improve rich snippets.' 
        }
      ],
      performanceIssues: [
        { 
          type: 'warning', 
          issue: 'Large JavaScript bundles', 
          impact: 'Medium', 
          recommendation: 'Consider code splitting to reduce initial load time.' 
        },
        { 
          type: 'info', 
          issue: 'Render-blocking resources', 
          impact: 'Low', 
          recommendation: 'Consider loading non-critical CSS asynchronously.' 
        }
      ]
    }
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const severityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-green-400';
    }
  };

  const severityBg = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'info':
        return 'bg-blue-400';
      default:
        return 'bg-green-400';
    }
  };

  const severityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{auditData.url}</h3>
          <p className="text-sm text-muted-foreground">SEO Audit Results</p>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          <div className="text-sm font-semibold text-white/90">Live Report</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
          <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
          <div className="flex items-center">
            <div className="text-2xl font-bold gradient-text">{auditData.score}</div>
            <div className="text-xs ml-1 text-white/60">/100</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
          <div className="text-sm text-muted-foreground mb-1">Issues Found</div>
          <div className="text-2xl font-bold text-red-400">{auditData.issuesFound}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
          <div className="text-sm text-muted-foreground mb-1">Opportunities</div>
          <div className="text-2xl font-bold text-green-400">{auditData.opportunities}</div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between mb-3">
              <div className="text-sm font-medium">Performance Metrics</div>
              <div className="text-xs text-muted-foreground">Core Web Vitals</div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>LCP (Largest Contentful Paint)</span>
                  <span className={auditData.performanceMetrics.lcp.score >= 90 ? "text-green-400" : 
                                auditData.performanceMetrics.lcp.score >= 70 ? "text-yellow-400" : "text-red-400"}>
                    {auditData.performanceMetrics.lcp.value}{auditData.performanceMetrics.lcp.unit}
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    auditData.performanceMetrics.lcp.score >= 90 ? "bg-green-400" : 
                    auditData.performanceMetrics.lcp.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                  }`} style={{ width: `${auditData.performanceMetrics.lcp.score}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>CLS (Cumulative Layout Shift)</span>
                  <span className={auditData.performanceMetrics.cls.score >= 90 ? "text-green-400" : 
                                auditData.performanceMetrics.cls.score >= 70 ? "text-yellow-400" : "text-red-400"}>
                    {auditData.performanceMetrics.cls.value}
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    auditData.performanceMetrics.cls.score >= 90 ? "bg-green-400" : 
                    auditData.performanceMetrics.cls.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                  }`} style={{ width: `${auditData.performanceMetrics.cls.score}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>FID (First Input Delay)</span>
                  <span className={auditData.performanceMetrics.fid.score >= 90 ? "text-green-400" : 
                                auditData.performanceMetrics.fid.score >= 70 ? "text-yellow-400" : "text-red-400"}>
                    {auditData.performanceMetrics.fid.value}{auditData.performanceMetrics.fid.unit}
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    auditData.performanceMetrics.fid.score >= 90 ? "bg-green-400" : 
                    auditData.performanceMetrics.fid.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                  }`} style={{ width: `${auditData.performanceMetrics.fid.score}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between mb-3">
              <div className="text-sm font-medium">Critical Issues</div>
              <Button variant="link" className="text-xs p-0 h-auto" 
                      onClick={() => toggleSection('criticalIssues')}>
                {expandedSection === 'criticalIssues' ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            <div className="space-y-2">
              {auditData.topIssues
                .filter((issue: any) => issue.severity === 'critical')
                .slice(0, expandedSection === 'criticalIssues' ? undefined : 3)
                .map((issue: any, index: number) => (
                <div key={index} className="flex items-center text-xs p-2 bg-white/5 rounded">
                  <div className="w-2 h-2 rounded-full mr-2 bg-red-400"></div>
                  <div>{issue.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between mb-3">
              <div className="text-sm font-medium">Quick Wins</div>
              <div className="text-xs text-primary cursor-pointer">View All</div>
            </div>
            <div className="space-y-2">
              {auditData.topIssues
                .filter((issue: any) => issue.severity === 'warning' || issue.severity === 'info')
                .slice(0, 3)
                .map((issue: any, index: number) => (
                <div key={index} className="flex items-center text-xs p-2 bg-white/5 rounded">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    issue.severity === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`}></div>
                  <div>{issue.description}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="seo" className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between mb-3">
              <div className="text-sm font-medium">Page Metadata</div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Title</div>
                  <div className="text-sm p-2 bg-white/5 rounded">
                    {auditData.pageAnalysis?.title || 'Not found'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Meta Description</div>
                  <div className="text-sm p-2 bg-white/5 rounded">
                    {auditData.pageAnalysis?.metaDescription || 'Not found'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Word Count</div>
                  <div className="text-sm p-2 bg-white/5 rounded">
                    {auditData.pageAnalysis?.wordCount || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Headings Structure</div>
                  <div className="text-sm p-2 bg-white/5 rounded">
                    {auditData.pageAnalysis?.headings ? 
                      `H1: ${auditData.pageAnalysis.headings.h1 || 0}, 
                       H2: ${auditData.pageAnalysis.headings.h2 || 0}, 
                       H3: ${auditData.pageAnalysis.headings.h3 || 0}` : 
                      'Not found'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between mb-3">
              <div className="text-sm font-medium">SEO Issues</div>
            </div>
            <div className="space-y-2">
              {(auditData.pageAnalysis?.seoIssues || []).map((issue: any, index: number) => (
                <div key={index} className="p-3 bg-white/5 rounded">
                  <div className="flex items-center mb-1">
                    {severityIcon(issue.type)}
                    <span className={`text-sm font-medium ml-2 ${severityColor(issue.type)}`}>
                      {issue.issue}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Impact: {issue.impact}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 ml-6">{issue.recommendation}</p>
                </div>
              ))}
              {(auditData.pageAnalysis?.seoIssues || []).length === 0 && (
                <div className="text-sm text-center py-3 text-white/70">
                  No SEO issues found
                </div>
              )}
            </div>
          </div>
          
          {auditData.pageAnalysis?.contentAnalysis?.keywordDensity && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between mb-3">
                <div className="text-sm font-medium">Keyword Analysis</div>
              </div>
              <div className="space-y-1">
                <div className="grid grid-cols-3 text-xs text-muted-foreground pb-2">
                  <div>Keyword</div>
                  <div className="text-center">Occurrences</div>
                  <div className="text-right">Density</div>
                </div>
                {auditData.pageAnalysis.contentAnalysis.keywordDensity.map((keyword: any, index: number) => (
                  <div key={index} className="grid grid-cols-3 text-sm p-2 bg-white/5 rounded">
                    <div>{keyword.keyword}</div>
                    <div className="text-center">{keyword.count}</div>
                    <div className="text-right">{keyword.density}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between mb-3">
              <div className="text-sm font-medium">Performance Score</div>
            </div>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={
                      auditData.score >= 90 ? "#22c55e" :
                      auditData.score >= 70 ? "#eab308" :
                      "#ef4444"
                    }
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * auditData.score) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{auditData.score}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between mb-3">
              <div className="text-sm font-medium">Performance Issues</div>
            </div>
            <div className="space-y-2">
              {(auditData.pageAnalysis?.performanceIssues || []).map((issue: any, index: number) => (
                <div key={index} className="p-3 bg-white/5 rounded">
                  <div className="flex items-center mb-1">
                    {severityIcon(issue.type)}
                    <span className={`text-sm font-medium ml-2 ${severityColor(issue.type)}`}>
                      {issue.issue}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Impact: {issue.impact}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 ml-6">{issue.recommendation}</p>
                </div>
              ))}
              {(auditData.pageAnalysis?.performanceIssues || []).length === 0 && (
                <div className="text-sm text-center py-3 text-white/70">
                  No performance issues found
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium">Core Web Vitals</div>
              <a href="https://web.dev/vitals/" target="_blank" rel="noopener noreferrer" 
                 className="text-xs text-primary flex items-center">
                Learn more <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      auditData.performanceMetrics.lcp.score >= 90 ? "bg-green-400" : 
                      auditData.performanceMetrics.lcp.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                    }`}></div>
                    <span className="text-sm font-medium">Largest Contentful Paint (LCP)</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    auditData.performanceMetrics.lcp.score >= 90 ? "text-green-400" : 
                    auditData.performanceMetrics.lcp.score >= 70 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {auditData.performanceMetrics.lcp.value}{auditData.performanceMetrics.lcp.unit}
                  </span>
                </div>
                <div className="text-xs text-white/70">
                  Measures loading performance. To provide a good user experience, LCP should occur within 2.5 seconds of when the page first starts loading.
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      auditData.performanceMetrics.cls.score >= 90 ? "bg-green-400" : 
                      auditData.performanceMetrics.cls.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                    }`}></div>
                    <span className="text-sm font-medium">Cumulative Layout Shift (CLS)</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    auditData.performanceMetrics.cls.score >= 90 ? "text-green-400" : 
                    auditData.performanceMetrics.cls.score >= 70 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {auditData.performanceMetrics.cls.value}
                  </span>
                </div>
                <div className="text-xs text-white/70">
                  Measures visual stability. To provide a good user experience, pages should maintain a CLS of less than 0.1.
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      auditData.performanceMetrics.fid.score >= 90 ? "bg-green-400" : 
                      auditData.performanceMetrics.fid.score >= 70 ? "bg-yellow-400" : "bg-red-400"
                    }`}></div>
                    <span className="text-sm font-medium">First Input Delay (FID)</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    auditData.performanceMetrics.fid.score >= 90 ? "text-green-400" : 
                    auditData.performanceMetrics.fid.score >= 70 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {auditData.performanceMetrics.fid.value}{auditData.performanceMetrics.fid.unit}
                  </span>
                </div>
                <div className="text-xs text-white/70">
                  Measures interactivity. To provide a good user experience, pages should have a FID of less than 100 milliseconds.
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center">
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
          Download Full Report
        </Button>
      </div>
    </div>
  );
};

export default AuditResults;