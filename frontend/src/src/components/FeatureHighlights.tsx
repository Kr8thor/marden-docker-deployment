
import { motion } from 'framer-motion';
import { Brain, Gauge, Cpu, Database, Lightbulb, AlertCircle, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';

const FeatureHighlights = () => {
  const features = [
    {
      id: 'ai-diagnostics',
      title: 'AI-Powered Diagnostics',
      description: 'Our advanced AI analyzes thousands of SEO signals to identify critical issues and opportunities specific to your website.',
      icon: <Brain className="w-12 h-12 text-neon-purple" />,
      items: [
        { icon: <Lightbulb size={18} />, text: 'Contextual insights based on your industry' },
        { icon: <AlertCircle size={18} />, text: 'Priority-based issue identification' },
        { icon: <CheckCircle2 size={18} />, text: 'Plain-language action recommendations' }
      ],
      image: '/placeholder.svg',
      color: 'from-neon-purple/20 to-transparent'
    },
    {
      id: 'technical-seo',
      title: 'Technical SEO Analysis',
      description: 'Identify and fix hidden technical issues that prevent search engines from properly crawling and indexing your content.',
      icon: <Cpu className="w-12 h-12 text-neon-blue" />,
      items: [
        { icon: <Database size={18} />, text: 'Site architecture optimization' },
        { icon: <Gauge size={18} />, text: 'Core Web Vitals performance metrics' },
        { icon: <RefreshCw size={18} />, text: 'Crawlability and indexation checks' }
      ],
      image: '/placeholder.svg',
      color: 'from-neon-blue/20 to-transparent'
    },
    {
      id: 'content-insights',
      title: 'Content Optimization',
      description: 'Discover how to refine your content strategy with data-driven insights that boost relevance and visibility.',
      icon: <Sparkles className="w-12 h-12 text-neon-teal" />,
      items: [
        { icon: <CheckCircle2 size={18} />, text: 'Semantic content analysis' },
        { icon: <AlertCircle size={18} />, text: 'Meta tag optimization' },
        { icon: <Lightbulb size={18} />, text: 'Keyword opportunity identification' }
      ],
      image: '/placeholder.svg',
      color: 'from-neon-teal/20 to-transparent'
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-20 md:py-32 overflow-hidden" id="audit-process">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How MardenSEO Audit Works</h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive analysis leverages cutting-edge technology to deliver actionable insights for your website.
          </p>
        </div>

        <motion.div 
          className="space-y-32"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={feature.id}
              className={`relative ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              variants={featureVariants}
            >
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="w-full md:w-1/2">
                  <div className={`p-2 rounded-full w-fit mb-6 bg-gradient-to-r ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="text-primary mt-1">{item.icon}</div>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="w-full md:w-1/2 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl opacity-20`}></div>
                  <div className={`relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 glass-card`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/50"></div>
                    
                    {/* Feature visualization would go here */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {feature.id === 'ai-diagnostics' && (
                        <div className="relative w-full h-full p-4 flex items-center justify-center">
                          <div className="radar-scan opacity-30"></div>
                          <div className="relative z-10 bg-card/30 backdrop-blur-sm rounded-lg p-4 w-3/4 border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                              <Brain className="w-5 h-5 text-primary" />
                              <div className="text-sm font-medium">AI Analysis Results</div>
                            </div>
                            <div className="space-y-3">
                              <div className="animate-pulse bg-white/5 h-3 rounded"></div>
                              <div className="animate-pulse bg-white/5 h-3 rounded w-3/4"></div>
                              <div className="animate-pulse bg-white/5 h-3 rounded w-1/2"></div>
                            </div>
                            <div className="mt-4 p-2 bg-primary/10 rounded border border-primary/20 flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-primary mt-0.5" />
                              <div className="text-xs">Recommendation: Optimize meta descriptions to improve click-through rates</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {feature.id === 'technical-seo' && (
                        <div className="w-full h-full p-4 flex items-center justify-center">
                          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 w-3/4 border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                              <Cpu className="w-5 h-5 text-neon-blue" />
                              <div className="text-sm font-medium">Technical Audit</div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-xs">
                                <span>HTML Structure</span>
                                <span className="text-green-400">Passed</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 rounded-full" style={{ width: '95%' }}></div>
                              </div>
                              
                              <div className="flex justify-between items-center text-xs">
                                <span>Mobile Responsiveness</span>
                                <span className="text-yellow-400">Issues Found</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '76%' }}></div>
                              </div>
                              
                              <div className="flex justify-between items-center text-xs">
                                <span>Page Speed</span>
                                <span className="text-red-400">Critical</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 rounded-full" style={{ width: '45%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {feature.id === 'content-insights' && (
                        <div className="w-full h-full p-4 flex items-center justify-center">
                          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 w-3/4 border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                              <Sparkles className="w-5 h-5 text-neon-teal" />
                              <div className="text-sm font-medium">Content Analysis</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="bg-white/5 p-2 rounded text-center">
                                <div className="text-xs text-muted-foreground">Word Count</div>
                                <div className="text-sm font-medium">1,250</div>
                              </div>
                              <div className="bg-white/5 p-2 rounded text-center">
                                <div className="text-xs text-muted-foreground">Readability</div>
                                <div className="text-sm font-medium text-yellow-400">Grade 10</div>
                              </div>
                            </div>
                            <div className="mb-3">
                              <div className="text-xs mb-1">Keyword Density</div>
                              <div className="flex flex-wrap gap-1">
                                <div className="text-xs bg-primary/20 px-2 py-0.5 rounded">SEO (2.3%)</div>
                                <div className="text-xs bg-primary/20 px-2 py-0.5 rounded">Audit (1.8%)</div>
                                <div className="text-xs bg-primary/10 px-2 py-0.5 rounded">Marketing (0.5%)</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
