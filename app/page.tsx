"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"
import { AuthNav } from "@/components/auth-nav"
import { useEffect } from "react"
import React from "react"

// Component for the scroll reveal effect
const ScrollReveal: React.FC<{ 
  children: React.ReactNode; 
  delay?: number 
}> = ({ children, delay = 0 }) => {
  return (
    <div 
      className="reveal-section opacity-0 blur-sm translate-y-10 transition-all duration-700 ease-out"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function Home() {
  // Add scroll reveal effect
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-section');
    revealElements.forEach(element => observer.observe(element));

    return () => {
      revealElements.forEach(element => observer.unobserve(element));
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <AuthNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 lg:py-40 relative overflow-hidden">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black">
                  Create a stunning portfolio in minutes
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Showcase your work professionally with our easy-to-use portfolio builder.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-6 h-auto rounded-md" asChild>
                  <Link href="/auth/signup">
                    Get started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-black hover:bg-gray-50 px-8 py-6 h-auto rounded-md text-black" asChild>
                  <Link href="#templates">View templates</Link>
                </Button>
              </div>
              <div className="mt-16 relative w-full max-w-4xl aspect-[16/9] rounded-none overflow-hidden shadow-xl">
                <img 
                  src="/placeholder.svg?height=720&width=1280" 
                  alt="Portfolio preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 border-t border-black">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-black">
                  Everything you need, nothing you don't
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Simple tools that help you build a professional portfolio that stands out.
                </p>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <ScrollReveal delay={100}>
                <div className="flex flex-col space-y-3">
                  <div className="w-10 h-10 rounded-none bg-black flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-black">Clean Templates</h3>
                  <p className="text-gray-600">
                    Professionally designed templates that keep the focus on your work.
                  </p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={200}>
                <div className="flex flex-col space-y-3">
                  <div className="w-10 h-10 rounded-none bg-black flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-black">Simple Editor</h3>
                  <p className="text-gray-600">
                    Add your content with our intuitive editor. No technical skills required.
                  </p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={300}>
                <div className="flex flex-col space-y-3">
                  <div className="w-10 h-10 rounded-none bg-black flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-black">Responsive Design</h3>
                  <p className="text-gray-600">
                    Your portfolio looks perfect on any device, automatically.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-gray-50">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-black">How It Works</h2>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Create your professional portfolio in three simple steps.
                </p>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ScrollReveal delay={100}>
                <div className="bg-white p-8 border border-black">
                  <div className="w-12 h-12 flex items-center justify-center bg-black mb-6 text-xl font-medium text-white">1</div>
                  <h3 className="text-xl font-medium text-black mb-2">Sign Up</h3>
                  <p className="text-gray-600">Create an account and choose your template</p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={200}>
                <div className="bg-white p-8 border border-black">
                  <div className="w-12 h-12 flex items-center justify-center bg-black mb-6 text-xl font-medium text-white">2</div>
                  <h3 className="text-xl font-medium text-black mb-2">Add Your Content</h3>
                  <p className="text-gray-600">Fill in your information, skills, and projects</p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={300}>
                <div className="bg-white p-8 border border-black">
                  <div className="w-12 h-12 flex items-center justify-center bg-black mb-6 text-xl font-medium text-white">3</div>
                  <h3 className="text-xl font-medium text-black mb-2">Publish</h3>
                  <p className="text-gray-600">Share your portfolio with the world</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Templates Preview */}
        <section id="templates" className="py-24">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-black">Templates</h2>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Thoughtfully designed templates for different styles and needs.
                </p>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ScrollReveal delay={100}>
                <div className="group cursor-pointer">
                  <div className="overflow-hidden border border-black">
                    <img 
                      src="/templates/template1/thumbnail_dash.svg" 
                      alt="Minimal template" 
                      className="w-full h-auto object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-black">Minimal</h3>
                  <p className="text-sm text-gray-600">Clean, simple, and elegant</p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={200}>
                <div className="group cursor-pointer">
                  <div className="overflow-hidden border border-black">
                    <img 
                      src="/templates/template4/thumbnail_dash.svg" 
                      alt="Minimal Portfolio template" 
                      className="w-full h-auto object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-black">Minimal Portfolio</h3>
                  <p className="text-sm text-gray-600">Modern and focused</p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={300}>
                <div className="group cursor-pointer">
                  <div className="overflow-hidden border border-black">
                    <img 
                      src="/templates/template3/thumbnail_dash.svg" 
                      alt="Card Portfolio template" 
                      className="w-full h-auto object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-black">Card Portfolio</h3>
                  <p className="text-sm text-gray-600">Interactive card-based design</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-gray-50">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-black">Simple Pricing</h2>
                <p className="text-xl text-gray-600 max-w-2xl">
                  No hidden fees, no complicated tiers.
                </p>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <ScrollReveal delay={100}>
                <div className="bg-white p-8 border border-black">
                  <div className="mb-6">
                    <h3 className="text-xl font-medium text-black">Free</h3>
                    <p className="text-sm text-gray-600 mt-1">Get started with the basics</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-black">$0</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-black mr-2 mt-0.5" />
                      <span className="text-gray-600">1 portfolio</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-black mr-2 mt-0.5" />
                      <span className="text-gray-600">Basic templates</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-black mr-2 mt-0.5" />
                      <span className="text-gray-600">Custom domain</span>
                    </li>
                  </ul>
                  
                  <Button size="lg" variant="outline" className="w-full border-black hover:bg-gray-50 py-6 h-auto rounded-md text-black" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={200}>
                <div className="bg-black p-8 text-white">
                  <div className="mb-6">
                    <h3 className="text-xl font-medium">Pro</h3>
                    <p className="text-sm text-gray-300 mt-1">For serious professionals</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">$9</span>
                      <span className="text-gray-300">/month</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                      <span className="text-gray-300">Unlimited portfolios</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                      <span className="text-gray-300">Premium templates</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                      <span className="text-gray-300">Custom domain</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                      <span className="text-gray-300">Analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                      <span className="text-gray-300">Priority support</span>
                    </li>
                  </ul>
                  
                  <Button size="lg" className="w-full bg-white hover:bg-gray-200 text-black py-6 h-auto rounded-md" asChild>
                    <Link href="/auth/signup">Get Pro</Link>
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col items-center text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black max-w-2xl">
                  Ready to showcase your work?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Join thousands of professionals who trust us to showcase their work.
                </p>
                <Button size="lg" className="mt-4 bg-black hover:bg-gray-800 text-white px-8 py-6 h-auto rounded-md" asChild>
                  <Link href="/auth/signup">
                    Create your portfolio <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-black">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="font-medium text-black mb-4">Product</div>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-black text-sm">Features</Link></li>
                <li><Link href="#templates" className="text-gray-600 hover:text-black text-sm">Templates</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-black text-sm">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <div className="font-medium text-black mb-4">Company</div>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-black text-sm">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-black text-sm">Contact</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-black text-sm">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <div className="font-medium text-black mb-4">Legal</div>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-600 hover:text-black text-sm">Terms</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:text-black text-sm">Privacy</Link></li>
                <li><Link href="/cookies" className="text-gray-600 hover:text-black text-sm">Cookies</Link></li>
              </ul>
            </div>
            
            <div>
              <div className="font-medium text-black mb-4">Connect</div>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-black text-sm">Twitter</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-black text-sm">LinkedIn</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-black text-sm">Instagram</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm">© 2025 PortfolioMaker. All rights reserved.</div>
            
            <div className="flex items-center mt-4 md:mt-0">
              <Link href="/" className="font-medium text-black">
                PortfolioMaker
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Global styles for the scroll reveal animation */}
      <style jsx global>{`
        .reveal-section {
          opacity: 0;
          filter: blur(4px);
          transform: translateY(10px);
          transition: opacity 0.7s ease-out, filter 0.7s ease-out, transform 0.7s ease-out;
        }
        
        .reveal-section.revealed {
          opacity: 1;
          filter: blur(0);
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}

