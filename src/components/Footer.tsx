import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border text-foreground pt-12 pb-8 mt-16 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4 tracking-tight">SentinelAI Solutions Pvt Ltd</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Shop quality electronic components online in India for DIY, embedded, and robotics projects.
          </p>
          <p className="tech-label text-muted-foreground mt-4">
            Support: <a href="tel:+917356386390" className="hover:text-primary transition-colors">+91 73563 86390</a> / <a href="tel:+919292615463" className="hover:text-primary transition-colors">+91 92926 15463</a>
          </p>
          <p className="tech-label text-muted-foreground mt-1">
            Email: <a href="mailto:sentinelaicore@gmail.com" className="hover:text-primary transition-colors">sentinelaicore@gmail.com</a>
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4 tracking-tight">Information</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 tracking-tight">Customer Service</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Support Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 tracking-tight">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-4">Subscribe to get special offers and updates.</p>
          <div className="flex rounded-[6px] overflow-hidden border border-border focus-within:border-primary transition-colors">
            <input type="email" placeholder="Email Address" className="px-4 py-2.5 w-full bg-background text-foreground font-mono text-sm focus:outline-none" />
            <button className="bg-primary text-primary-foreground font-bold px-4 py-2.5 hover:bg-primary/90 transition tech-label border-l border-border m-0 !border-l-0">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="tech-label text-muted-foreground">&copy; {new Date().getFullYear()} SentinelAI Solutions Pvt Ltd. All Rights Reserved.</p>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider">
          v1.0.0 • Production Release
        </span>
      </div>
    </footer>
  );
}
