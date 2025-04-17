
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleRunAudit = () => {
    // Scroll to the URL input in the hero section
    document.getElementById('audit-input')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-lg shadow-md py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="https://mardenseo.com" className="flex items-center">
            <div className="relative w-8 h-8 mr-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue animate-pulse-glow"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold">M</div>
            </div>
            <span className="font-manrope text-xl font-bold text-white">MardenSEO</span>
          </a>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
            <a href="#audit-process" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors" onClick={(e) => { e.preventDefault(); document.getElementById('audit-process')?.scrollIntoView({ behavior: 'smooth' }); }}>How It Works</a>
            <a href="#why-free" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors" onClick={(e) => { e.preventDefault(); document.getElementById('why-free')?.scrollIntoView({ behavior: 'smooth' }); }}>Why Free</a>
          </nav>
          <AnimatedButton 
            variant="primary" 
            glowColor="purple" 
            className="flex items-center" 
            onClick={handleRunAudit}
          >
            Run Free Audit
            <ChevronRight className="ml-1 h-4 w-4" />
          </AnimatedButton>
        </div>
        <div className="md:hidden">
          <AnimatedButton 
            variant="primary" 
            size="sm" 
            glowColor="purple"
            onClick={handleRunAudit}
          >
            Run Free Audit
          </AnimatedButton>
        </div>
      </div>
    </header>
  );
};

export default Header;
