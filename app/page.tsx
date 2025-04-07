import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import FeatureCard from "@/components/feature-card"
import PricingCard from "@/components/pricing-card"
import TemplatePreview from "@/components/template-preview"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-5 w-5" />
            <span>PortfolioMaker</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium hover:underline">
              Log in
            </Link>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Create a stunning portfolio in minutes
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Showcase your work professionally with our easy-to-use portfolio builder. No coding required.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/auth/signup">
                      Create Your Portfolio <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#templates">View Templates</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <TemplatePreview
                    name="Minimal"
                    imageSrc="/placeholder.svg?height=300&width=250"
                    className="rounded-lg shadow-lg transform rotate-[-3deg]"
                  />
                  <TemplatePreview
                    name="Creative"
                    imageSrc="/placeholder.svg?height=300&width=250"
                    className="rounded-lg shadow-lg transform translate-y-4 rotate-[3deg]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Features that make you stand out
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
        <section id="how-it-works" className="py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Create your professional portfolio in just a few simple steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">1</div>
                <h3 className="text-xl font-bold">Sign Up</h3>
                <p className="text-gray-500">Create an account and choose your template</p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">2</div>
                <h3 className="text-xl font-bold">Add Your Content</h3>
                <p className="text-gray-500">Fill in your information, skills, and projects</p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">3</div>
                <h3 className="text-xl font-bold">Publish</h3>
                <p className="text-gray-500">Share your portfolio with the world</p>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Preview */}
        <section id="templates" className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Professional Templates</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose from a variety of beautiful templates designed for different industries and styles.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              <TemplatePreview
                name="Minimal"
                imageSrc="/placeholder.svg?height=400&width=300"
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
              />
              <TemplatePreview
                name="Creative"
                imageSrc="/placeholder.svg?height=400&width=300"
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
              />
              <TemplatePreview
                name="Professional"
                imageSrc="/placeholder.svg?height=400&width=300"
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
              />
              <TemplatePreview
                name="Tech"
                imageSrc="/placeholder.svg?height=400&width=300"
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
              />
              <TemplatePreview
                name="Academic"
                imageSrc="/placeholder.svg?height=400&width=300"
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
              />
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                <p className="text-lg font-medium">More templates coming soon</p>
                <p className="text-sm text-gray-500">Premium subscribers get early access</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
            <div className="mt-12 text-center">
              <h3 className="text-xl font-bold">Frequently Asked Questions</h3>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="text-left">
                  <h4 className="font-medium">Can I cancel anytime?</h4>
                  <p className="text-sm text-gray-500 mt-1">Yes, you can cancel your subscription at any time.</p>
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Do you offer refunds?</h4>
                  <p className="text-sm text-gray-500 mt-1">We offer a 14-day money-back guarantee.</p>
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Can I change templates?</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Yes, you can switch templates at any time without losing your content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to showcase your work?
                </h2>
                <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of professionals who trust PortfolioMaker to showcase their work.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" variant="secondary" asChild>
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
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5" />
            <span>PortfolioMaker</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/terms" className="text-gray-500 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="text-gray-500 hover:underline">
              Contact
            </Link>
          </div>
          <p className="text-xs text-gray-500">© 2025 PortfolioMaker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

