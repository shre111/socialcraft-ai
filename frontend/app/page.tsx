import Link from 'next/link'
import { ArrowRight, Sparkles, Globe, Brain, Zap } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: '7 Languages',
    description: 'English, Hindi, Gujarati, Hinglish, Marathi, Punjabi & Tamil — all in one place.',
  },
  {
    icon: Sparkles,
    title: '6 Tones',
    description: 'Funny, Professional, Emotional, Motivational, Casual, or Promotional.',
  },
  {
    icon: Brain,
    title: 'Self-Learning AI',
    description: 'Personalizes to your style automatically by learning from your feedback.',
  },
  {
    icon: Zap,
    title: '6 Platforms',
    description: 'Instagram, Facebook, YouTube, LinkedIn, Threads, and Pinterest.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-600" />
          <span className="font-bold text-xl text-gray-900">SocialCraft AI</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-24 max-w-4xl mx-auto">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-violet-100 text-violet-700 rounded-full mb-6 uppercase tracking-wide">
          AI-Powered · Multilingual · Self-Learning
        </span>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Captions that speak{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">
            your language
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Generate viral social media captions in 7 languages with AI that learns your style — so
          every post sounds authentically <em>you</em>.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors text-lg shadow-lg shadow-violet-200"
        >
          Start generating free <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="mt-4 text-sm text-gray-500">No credit card · 10 captions/day free</p>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} SocialCraft AI. Built with Claude AI.
      </footer>
    </main>
  )
}
