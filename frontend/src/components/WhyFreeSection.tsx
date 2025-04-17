
import { Gift } from 'lucide-react';

const WhyFreeSection = () => {
  return (
    <section className="py-16 md:py-24" id="why-free">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Is This Tool Free?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            We're building the best SEO platform—starting with free tools. 
            No sign-up, no credit card, just instant audits that deliver real value.
          </p>
          <div className="p-6 glass-card rounded-xl border border-white/10">
            <p className="italic text-foreground/80">
              "We believe in demonstrating value first. MardenSEO Audit showcases our 
              expertise and technology while helping website owners improve their 
              SEO performance without barriers."
            </p>
            <div className="mt-4 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                <span className="text-primary font-bold">M</span>
              </div>
              <div className="text-left">
                <div className="font-medium">The MardenSEO Team</div>
                <div className="text-sm text-muted-foreground">Powering better SEO decisions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyFreeSection;
