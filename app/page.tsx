import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Sparkles } from "lucide-react"
import FeatureCard from "@/components/feature-card"
import PricingCard from "@/components/pricing-card"
import TemplatePreview from "@/components/template-preview"
import { AuthNav } from "@/components/auth-nav"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <AuthNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-indigo-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-indigo/[0.2] bg-[size:20px_20px] opacity-20"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-600 mb-4">
                    The Modern Portfolio Builder
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                    Create a stunning portfolio in minutes
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Showcase your work professionally with our easy-to-use portfolio builder. No coding required.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all px-8 hover:scale-105 text-white" asChild>
                    <Link href="/auth/signup">
                      Create Your Portfolio <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all" asChild>
                    <Link href="#templates">View Templates</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <TemplatePreview
                    name="Minimal"
                    imageSrc="/placeholder.svg?height=300&width=250"
                    className="rounded-xl shadow-lg transform rotate-[-3deg] border border-indigo-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  />
                  <TemplatePreview
                    name="Creative"
                    imageSrc="/placeholder.svg?height=300&width=250"
                    className="rounded-xl shadow-lg transform translate-y-4 rotate-[3deg] border border-indigo-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-600 mb-2">
                Built for creators
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  Features that make you stand out
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to create a professional portfolio that showcases your skills and projects.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-12 mt-12">
              <FeatureCard
                title="Beautiful Templates"
                description="Choose from a variety of professionally designed templates that make your work shine."
                icon="layout"
              />
              <FeatureCard
                title="Easy Customization"
                description="Customize colors, fonts, and layouts to match your personal brand with our intuitive editor."
                icon="palette"
              />
              <FeatureCard
                title="Responsive Design"
                description="Your portfolio looks great on all devices, from desktop to mobile."
                icon="smartphone"
              />
              <FeatureCard
                title="Project Showcase"
                description="Highlight your best work with beautiful project cards and detailed descriptions."
                icon="briefcase"
              />
              <FeatureCard
                title="Skills Section"
                description="Display your expertise with a customizable skills section that shows what you're capable of."
                icon="award"
              />
              <FeatureCard
                title="Contact Form"
                description="Make it easy for potential clients to reach you with an integrated contact form."
                icon="mail"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-12 md:py-24 lg:py-32 bg-gradient-to-br from-indigo-50 to-purple-50 relative">
          <div className="absolute inset-0 bg-grid-indigo/[0.2] bg-[size:20px_20px] opacity-20"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-600 mb-2">
                Simple process
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">How It Works</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Create your professional portfolio in just a few simple steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-4 text-center bg-white p-6 rounded-xl shadow-sm border border-indigo-100 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl font-bold">1</div>
                <h3 className="text-xl font-bold text-gray-800">Sign Up</h3>
                <p className="text-gray-600">Create an account and choose your template</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center bg-white p-6 rounded-xl shadow-sm border border-indigo-100 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl font-bold">2</div>
                <h3 className="text-xl font-bold text-gray-800">Add Your Content</h3>
                <p className="text-gray-600">Fill in your information, skills, and projects</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center bg-white p-6 rounded-xl shadow-sm border border-indigo-100 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl font-bold">3</div>
                <h3 className="text-xl font-bold text-gray-800">Publish</h3>
                <p className="text-gray-600">Share your portfolio with the world</p>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Preview */}
        <section id="templates" className="py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-600 mb-2">
                Templates
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Professional Templates</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose from a variety of beautiful templates designed for different industries and styles.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              <TemplatePreview
                name="Minimal"
                imageSrc="/placeholder.svg?height=400&width=300"
                className="rounded-xl shadow-sm border border-indigo-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              />
              <TemplatePreview
                name="Creative"
                imageSrc="/placeholder.svg?height=400&width=300"
                className="rounded-xl shadow-sm border border-indigo-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              />
              <TemplatePreview
                name="Professional"
                imageSrc="/placeholder.svg?height=400&width=300"
                className="rounded-xl shadow-sm border border-indigo-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              />
              <TemplatePreview
                name="Tech"
                imageSrc="/placeholder.svg?height=400&width=300"
                className="rounded-xl shadow-sm border border-indigo-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              />
              <TemplatePreview
                name="Academic"
                imageSrc="/placeholder.svg?height=400&width=300"
                className="rounded-xl shadow-sm border border-indigo-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              />
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-indigo-200 p-8 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 group hover:border-indigo-300 transition-all">
                <p className="text-lg font-medium text-gray-800">More templates coming soon</p>
                <p className="text-sm text-indigo-600 mt-2">Premium subscribers get early access</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 md:py-24 lg:py-32 bg-gradient-to-br from-indigo-50 to-purple-50 relative">
          <div className="absolute inset-0 bg-grid-indigo/[0.2] bg-[size:20px_20px] opacity-20"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-600 mb-2">
                Pricing
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that works best for you.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-12">
              <PricingCard
                title="Free"
                price="$0"
                description="Perfect for getting started"
                features={["1 portfolio site", "Basic templates", "Custom domain not included", "Community support"]}
                buttonText="Get Started"
                buttonVariant="outline"
                popular={false}
              />
              <PricingCard
                title="Pro"
                price="$12"
                period="/month"
                description="For professionals and freelancers"
                features={[
                  "5 portfolio sites",
                  "All templates",
                  "Custom domain included",
                  "Priority support",
                  "Advanced analytics",
                ]}
                buttonText="Subscribe Now"
                buttonVariant="default"
                popular={true}
              />
              <PricingCard
                title="Team"
                price="$49"
                period="/month"
                description="For agencies and teams"
                features={[
                  "Unlimited portfolio sites",
                  "All templates + exclusive ones",
                  "Multiple custom domains",
                  "Priority support",
                  "Advanced analytics",
                  "Team collaboration",
                ]}
                buttonText="Contact Sales"
                buttonVariant="outline"
                popular={false}
              />
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 bg-white p-8 rounded-xl shadow-sm border border-indigo-100">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800 flex items-center gap-2">
                      <Check className="h-5 w-5 text-indigo-500" />
                      Can I cancel anytime?
                    </h4>
                    <p className="text-sm text-gray-600">Yes, you can cancel your subscription at any time with no questions asked.</p>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="h-8"></div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800 flex items-center gap-2">
                      <Check className="h-5 w-5 text-indigo-500" />
                      Do you offer refunds?
                    </h4>
                    <p className="text-sm text-gray-600">We offer a 14-day money-back guarantee for all our paid plans.</p>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="h-8"></div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800 flex items-center gap-2">
                      <Check className="h-5 w-5 text-indigo-500" />
                      Can I change templates?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Yes, you can switch templates at any time without losing your content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white mb-2">
                Join Today
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to showcase your work?
                </h2>
                <p className="max-w-[600px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of professionals who trust PortfolioMaker to showcase their work.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-white/90 shadow-md hover:shadow-lg transition-all px-8 py-6 h-auto rounded-full hover:scale-105" asChild>
                  <Link href="/auth/signup">
                    Create Your Portfolio <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-indigo-100 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-bold mb-4">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <span className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">PortfolioMaker</span>
              </div>
              <p className="text-sm text-gray-600 max-w-xs">
                Create beautiful portfolio websites that showcase your best work and attract potential clients.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#templates" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-indigo-100 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-500">© 2025 PortfolioMaker. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                Twitter
              </Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                LinkedIn
              </Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                Instagram
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

