import { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiVideoCamera, HiSparkles, HiArrowRight,
  HiShieldCheck,
  HiLightningBolt, HiCheck,
  HiMenu, HiX, HiStar,
  HiChatAlt2, HiDesktopComputer, HiChevronDown,
} from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';

const features = [
  { icon: HiVideoCamera, title: 'Crystal Clear Video', description: '4K HD video with AI-powered noise cancellation and adaptive bandwidth for seamless connections.' },
  { icon: HiDesktopComputer, title: 'Smart Screen Sharing', description: 'Share your screen with real-time annotation, collaborative cursors, and multi-monitor support.' },
  { icon: HiSparkles, title: 'AI-Powered Insights', description: 'Automatic transcription, smart summaries, and action item extraction powered by advanced AI.' },
  { icon: HiShieldCheck, title: 'Enterprise Security', description: 'End-to-end encryption, SSO integration, and SOC 2 Type II compliance for your peace of mind.' },
  { icon: HiChatAlt2, title: 'Real-time Collaboration', description: 'Integrated chat, polls, breakout rooms, and whiteboards for engaging meetings.' },
  { icon: HiLightningBolt, title: 'Lightning Fast', description: 'Sub-100ms latency with global edge servers for instant connections worldwide.' },
];

const stats = [
  { value: '500K+', label: 'Active Users' },
  { value: '10M+', label: 'Meetings Hosted' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '150+', label: 'Countries' },
];

const plans = [
  {
    name: 'Starter', price: '$0', period: 'forever', popular: false,
    features: ['Unlimited 1:1 meetings', 'Group meetings up to 40 min', 'HD video & audio', 'Screen sharing', 'Basic chat', '1 GB cloud storage'],
  },
  {
    name: 'Professional', price: '$12', period: '/month', popular: true,
    features: ['Unlimited meetings', 'Up to 100 participants', '4K video quality', 'Recording & transcription', 'AI summaries', 'Custom backgrounds', 'Priority support'],
  },
  {
    name: 'Business', price: '$25', period: '/month', popular: false,
    features: ['Up to 500 participants', 'Admin dashboard', 'SSO & SAML', 'Advanced analytics', 'Unlimited cloud storage', 'Custom branding', '24/7 support'],
  },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'CTO, TechFlow', quote: 'AdzConnect transformed our remote collaboration. The AI features alone save us 15+ hours weekly.', avatar: 'SC' },
  { name: 'Marcus Rivera', role: 'VP Engineering', quote: 'Best video conferencing platform we\'ve used. Beats Zoom and Teams on every metric.', avatar: 'MR' },
  { name: 'Emily Nakamura', role: 'Head of Operations', quote: '99.9% uptime is no joke. Our team relies on AdzConnect for critical client calls.', avatar: 'EN' },
];

const faqs = [
  { q: 'Is AdzConnect really free?', a: 'Yes! Our Starter plan is free forever with unlimited 1:1 meetings and group meetings up to 40 minutes.' },
  { q: 'How secure is my data?', a: 'We use AES-256 encryption, are SOC 2 Type II certified, and offer SSO integration. Your data is never sold or shared.' },
  { q: 'Can I record meetings?', a: 'Yes! Professional and Business plans include cloud recording with automatic transcription and AI summaries.' },
  { q: 'What devices are supported?', a: 'AdzConnect works on any device with a browser. We also have native apps for Windows, Mac, iOS, and Android.' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { scrollY } = useScroll();

  const navBackground = useTransform(scrollY, [0, 50], ['bg-transparent', 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl']);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-slate-100">
      <Helmet>
        <title>AdzConnect - Modern Video Collaboration Platform</title>
        <meta name="description" content="Next-generation video meetings with AI-powered features, crystal-clear 4K video, and seamless collaboration." />
      </Helmet>

      {/* Modern Navigation */}
      <motion.header style={{ background: navBackground }} className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-800/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 via-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-primary-500/25">
              <HiVideoCamera className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">AdzConnect</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Testimonials</a>
            <a href="#faq" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth/login" className="text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sign In</Link>
            <Link to="/auth/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-violet-600 text-white font-medium px-6 py-2.5 rounded-xl hover:shadow-xl hover:shadow-primary-500/25 transition-all text-sm">
              Get Started Free
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            {mobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="px-4 py-6 space-y-4">
                <a href="#features" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Features</a>
                <a href="#pricing" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Pricing</a>
                <a href="#testimonials" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Testimonials</a>
                <a href="#faq" className="block text-sm font-medium text-gray-700 dark:text-slate-300">FAQ</a>
                <hr className="border-gray-200 dark:border-slate-800" />
                <Link to="/auth/login" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Sign In</Link>
                <Link to="/auth/signup" className="block text-sm font-medium text-primary-600 dark:text-primary-400">Get Started Free</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent dark:from-primary-500/5" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-primary-100 dark:border-primary-800">
                <HiSparkles className="w-4 h-4" />
                <span>AI-Powered Video Collaboration</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Meet smarter with
                <span className="block bg-gradient-to-r from-primary-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">AI-powered video</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto">
                Experience crystal-clear 4K video, real-time transcription, and intelligent meeting summaries. Transform how your team collaborates.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/auth/signup" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-primary-500/30 transition-all text-base">
                  Start Free Trial
                  <HiArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/auth/login" className="inline-flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-medium px-8 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-base">
                  Sign In
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Features</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Everything you need to collaborate</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Powerful features designed for modern teams who demand the best.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-900 border border-gray-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-500/10 transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Pricing</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your team. No hidden fees, cancel anytime.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-3xl border-2 ${plan.popular ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-slate-900' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-500 dark:text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                      <HiCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/auth/signup" className={`block text-center font-medium py-3 rounded-xl transition-all ${plan.popular ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white hover:shadow-xl hover:shadow-primary-500/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Testimonials</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Loved by teams worldwide</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-900 border border-gray-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <HiStar key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">FAQ</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Frequently asked questions</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 overflow-hidden"
              >
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left">
                  <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                  <HiChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-slate-400">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 via-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to transform your meetings?</h2>
            <p className="text-xl text-white/80 mb-8">Join thousands of teams already using AdzConnect</p>
            <Link to="/auth/signup" className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-2xl hover:shadow-2xl transition-all text-base">
              Start Free Trial
              <HiArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer role="contentinfo" className="py-12 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-violet-600 rounded-lg flex items-center justify-center">
                <HiVideoCamera className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">AdzConnect</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">© 2026 AdzConnect. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Privacy</a>
              <a href="#" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Terms</a>
              <a href="#" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
