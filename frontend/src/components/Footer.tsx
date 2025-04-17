
const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <a href="https://mardenseo.com" className="flex items-center">
              <div className="relative w-8 h-8 mr-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">M</div>
              </div>
              <span className="font-manrope text-xl font-bold text-white">MardenSEO</span>
            </a>
          </div>
          
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-2 mb-6 md:mb-0">
            <a href="https://mardenseo.com" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Home</a>
            <a href="https://mardenseo.com/about" className="text-sm text-foreground/80 hover:text-foreground transition-colors">About</a>
            <a href="https://mardenseo.com/contact" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Contact</a>
          </nav>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} MardenSEO. All rights reserved.
          </div>
          <div className="text-sm text-muted-foreground">
            <a href="https://mardenseo.com" className="hover:text-foreground transition-colors">mardenseo.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
