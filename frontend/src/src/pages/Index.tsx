import { useEffect } from 'react';
import Header from '../components/Header';
import BasicHero from '../components/BasicHero';
import FeatureCards from '../components/FeatureCards';
import FeatureHighlights from '../components/FeatureHighlights';
import WhyFreeSection from '../components/WhyFreeSection';
import Footer from '../components/Footer';
import ScrollToTopButton from '../components/ScrollToTopButton';

const Index = () => {
  // Update the document title
  useEffect(() => {
    document.title = "MardenSEO Audit - SEO Audit Tool Reimagined";
  }, []);

  // Animated favicon (pulse effect)
  useEffect(() => {
    // Create two favicon elements
    const favicon1 = document.createElement('link');
    favicon1.rel = 'icon';
    favicon1.type = 'image/svg+xml';
    favicon1.href = createFaviconSVG('#8b5cf6'); // Purple

    const favicon2 = document.createElement('link');
    favicon2.rel = 'icon';
    favicon2.type = 'image/svg+xml';
    favicon2.href = createFaviconSVG('#0ea5e9'); // Blue

    // Add the first favicon to head
    document.head.appendChild(favicon1);

    // Set up animation
    let isFirstFavicon = true;
    const interval = setInterval(() => {
      // Toggle between the two favicons
      if (isFirstFavicon) {
        document.head.removeChild(favicon1);
        document.head.appendChild(favicon2);
      } else {
        document.head.removeChild(favicon2);
        document.head.appendChild(favicon1);
      }
      isFirstFavicon = !isFirstFavicon;
    }, 1500);

    return () => {
      clearInterval(interval);
      if (document.head.contains(favicon1)) {
        document.head.removeChild(favicon1);
      }
      if (document.head.contains(favicon2)) {
        document.head.removeChild(favicon2);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Using the simplified BasicHero component */}
        <BasicHero />
        <FeatureCards />
        <FeatureHighlights />
        <WhyFreeSection />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

// Create SVG favicon dynamically
const createFaviconSVG = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="${color}" />
      <path d="M30 40 L50 65 L70 40" stroke="white" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
  
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml;utf8,${encodedSvg}`;
};

export default Index;