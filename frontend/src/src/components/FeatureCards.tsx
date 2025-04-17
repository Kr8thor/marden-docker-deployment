
import { useState } from 'react';
import { Search, Zap, BarChart, Smartphone, Server, FileSearch } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const FeatureCard = ({ icon, title, description, color }: FeatureCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div 
      className={`feature-card glass-card h-56 cursor-pointer transition-all duration-500 ${color}`}
      style={{ 
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-6 backface-hidden"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${color}`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
        <p className="text-sm text-muted-foreground text-center">Click to learn more</p>
      </div>
      
      <div 
        className="absolute inset-0 flex flex-col items-start justify-center p-6 backface-hidden"
        style={{ 
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)'
        }}
      >
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const FeatureCards = () => {
  const features = [
    {
      icon: <Search className="h-7 w-7 text-white" />,
      title: "Technical SEO",
      description: "Comprehensive analysis of crawlability, indexing, site architecture, and Core Web Vitals to ensure search engines can properly access your content.",
      color: "neon-glow-purple"
    },
    {
      icon: <FileSearch className="h-7 w-7 text-white" />,
      title: "On-Page Content",
      description: "Detailed evaluation of meta tags, content quality, keyword usage, and semantic relevance to optimize your pages for maximum visibility.",
      color: "neon-glow-blue"
    },
    {
      icon: <Smartphone className="h-7 w-7 text-white" />,
      title: "Mobile UX",
      description: "In-depth testing of your site's mobile experience, responsive design implementation, and touch-friendly interface elements.",
      color: "neon-glow-teal"
    },
    {
      icon: <Zap className="h-7 w-7 text-white" />,
      title: "Site Speed",
      description: "Performance analysis to identify bottlenecks and provide actionable recommendations to improve loading times across all devices.",
      color: "neon-glow-purple"
    },
  ];
  
  return (
    <section className="py-16 md:py-24" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Interactive Audit Breakdown</h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive audit examines every aspect of your site's SEO performance.
            Click each card to learn more.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
