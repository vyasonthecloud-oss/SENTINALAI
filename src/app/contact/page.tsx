import { Metadata } from 'next';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Sentinel AI Store',
  description: 'Get in touch with the Sentinel AI team for support or inquiries.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-12 pb-24">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Have a question about a product, bulk order, or technical support? We&apos;re here to help.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Info */}
          <div className="lg:w-1/3 space-y-6">
            <div className="glass p-8 rounded-3xl border border-border/50 card-glow flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary mt-1">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Phone Support</h3>
                <p className="text-muted-foreground text-sm mb-2">Mon-Fri, 9am to 6pm IST</p>
                <div className="space-y-1">
                  <a href="tel:+917356386390" className="block font-bold text-foreground hover:text-primary transition-colors">+91 73563 86390</a>
                  <a href="tel:+919292615463" className="block font-bold text-foreground hover:text-primary transition-colors">+91 92926 15463</a>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl border border-border/50 card-glow flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary mt-1">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email Us</h3>
                <p className="text-muted-foreground text-sm mb-2">We typically reply within 24 hours.</p>
                <a href="mailto:sentinelaicore@gmail.com" className="font-bold text-foreground hover:text-primary transition-colors">
                  sentinelaicore@gmail.com
                </a>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl border border-border/50 card-glow flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary mt-1">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Headquarters</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  <span className="font-semibold text-foreground">SENTINEL AI</span><br />
                  Unniyamthara, Pallathuruthi<br />
                  Pazhavedu PO, Pazhavedu<br />
                  Alappuzha - 688009, Kerala<br />
                  India
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3 glass p-10 rounded-3xl border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-cyan-400"></div>
            <h2 className="text-2xl font-bold mb-8">Send us a message</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Subject</label>
                <input 
                  type="text" 
                  className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="How can we help you?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Message</label>
                <textarea 
                  rows={6}
                  className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              <button 
                type="button"
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
