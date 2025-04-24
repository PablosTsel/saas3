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
      // Temporarily removed initial hiding styles for debugging
      className="reveal-section transition-all duration-700 ease-out"
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white">
      {/* Navigation */}
      <AuthNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 lg:py-20 relative overflow-hidden">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white">
                  Create a stunning portfolio in minutes
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Showcase your work professionally with our easy-to-use portfolio builder.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" className="bg-black hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-8 py-6 h-auto rounded-md" asChild>
                  <Link href="/auth/signup">
                    Get started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-black hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 px-8 py-6 h-auto rounded-md text-black dark:text-white" asChild>
                  <Link href="#templates">View templates</Link>
                </Button>
              </div>
              <div className="mt-12 relative w-full max-w-4xl mx-auto">
                {/* Outer container with gradient border */}
                <div className="p-[3px] rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 shadow-2xl">
                  {/* Inner container with video */}
                  <div className="aspect-[16/9] rounded-lg overflow-hidden bg-white dark:bg-gray-800 relative">
                    <video 
                      src="/videosandpictures/template3/template3.webm"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      poster="/videosandpictures/template3/template3.png"
                      onError={(e) => {
                        console.error('Video failed to load:', e);
                        // Fallback to image if video fails to load
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                        const img = document.createElement('img');
                        img.src = '/videosandpictures/template3/template3.png';
                        img.className = 'w-full h-full object-cover';
                        img.alt = 'Portfolio Preview';
                        target.parentNode?.appendChild(img);
                      }}
                    />
                    {/* Optional overlay for better visibility of the border in all backgrounds */}
                    <div className="absolute inset-0 pointer-events-none border border-white/10 dark:border-black/10 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white">
                  Powerful features to showcase your work
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Everything you need to create a professional portfolio.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <ScrollReveal>
                <div className="flex flex-col space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-4 w-12 h-12 flex items-center justify-center rounded-lg shadow-sm">
                    <svg
                      className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-white">Beautiful Templates</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose from a variety of professionally designed templates.</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <div className="flex flex-col space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-4 w-12 h-12 flex items-center justify-center rounded-lg shadow-sm">
                    <svg
                      className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-white">Easy Customization</h3>
                  <p className="text-gray-600 dark:text-gray-400">Personalize your portfolio with our intuitive interface.</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="flex flex-col space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-4 w-12 h-12 flex items-center justify-center rounded-lg shadow-sm">
                    <svg
                      className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-white">Mobile Responsive</h3>
                  <p className="text-gray-600 dark:text-gray-400">Your portfolio looks great on all devices.</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="py-24">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white">
                  Professional Templates
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Choose from a variety of beautiful templates.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ScrollReveal>
                <div className="border border-gray-200 dark:border-gray-800 overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-800 relative">
                    <img 
                      src="/placeholder.svg?height=450&width=800" 
                      alt="Template preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-900">
                    <h3 className="font-semibold text-black dark:text-white">Minimal</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Clean and minimal design</p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <div className="border border-gray-200 dark:border-gray-800 overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-800 relative">
                    <img 
                      src="/placeholder.svg?height=450&width=800" 
                      alt="Template preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-900">
                    <h3 className="font-semibold text-black dark:text-white">Modern</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contemporary and sleek design</p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="border border-gray-200 dark:border-gray-800 overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-800 relative">
                    <img 
                      src="/placeholder.svg?height=450&width=800" 
                      alt="Template preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-900">
                    <h3 className="font-semibold text-black dark:text-white">Creative</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bold and artistic design</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white">
                  Simple, transparent pricing
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Choose the plan that's right for you.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700">
                  <div className="mb-6">
                    <h3 className="text-xl font-medium text-black dark:text-white">Free</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Perfect to get started</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-black dark:text-white">$0</span>
                      <span className="text-gray-600 dark:text-gray-400">/month</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">1 portfolio</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">Basic templates</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">Community support</span>
                    </li>
                  </ul>
                  
                  <Button size="lg" variant="outline" className="w-full border-black dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 py-6 h-auto rounded-md text-black dark:text-white" asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={200}>
                <div className="bg-black dark:bg-indigo-900 p-8 text-white">
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
                  
                  <Button size="lg" className="w-full bg-white hover:bg-gray-200 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white text-black py-6 h-auto rounded-md" asChild>
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
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white max-w-2xl">
                  Ready to showcase your work?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
                  Join thousands of professionals who trust us to showcase their work.
                </p>
                <Button size="lg" className="mt-4 bg-black hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-8 py-6 h-auto rounded-md" asChild>
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
      <footer className="py-12 border-t border-black dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="font-medium text-black dark:text-white mb-4">Product</div>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Features</Link></li>
                <li><Link href="#templates" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Templates</Link></li>
                <li><Link href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <div className="font-medium text-black dark:text-white mb-4">Company</div>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Contact</Link></li>
                <li><Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <div className="font-medium text-black dark:text-white mb-4">Legal</div>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Terms</Link></li>
                <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Privacy</Link></li>
                <li><Link href="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Cookies</Link></li>
              </ul>
            </div>
            
            <div>
              <div className="font-medium text-black dark:text-white mb-4">Connect</div>
              <ul className="space-y-2">
                <li><Link href="https://twitter.com" target="_blank" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">Twitter</Link></li>
                <li><Link href="https://github.com" target="_blank" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">GitHub</Link></li>
                <li><Link href="https://linkedin.com" target="_blank" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm">LinkedIn</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} PortfolioMaker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

