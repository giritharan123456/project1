import { motion } from 'framer-motion';
import {
  HiGlobe, HiLightningBolt, HiShieldCheck,
  HiHeart, HiUserGroup, HiStar,
  HiArrowSmRight, HiCheck,
} from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const values = [
  { icon: HiShieldCheck, title: 'Trust & Security', description: 'Every line of code we write puts your privacy and data security first.' },
  { icon: HiUserGroup, title: 'Team First', description: 'We build for teams because we believe great things happen when people collaborate.' },
  { icon: HiStar, title: 'Excellence', description: 'We obsess over quality, from pixel-perfect UI to 99.9% uptime infrastructure.' },
  { icon: HiHeart, title: 'Inclusivity', description: 'Our platform is designed for everyone, everywhere — regardless of device or ability.' },
  { icon: HiLightningBolt, title: 'Innovation', description: 'We push boundaries with AI, real-time tech, and cutting-edge video processing.' },
  { icon: HiGlobe, title: 'Global Reach', description: 'Serving 150+ countries with low-latency infrastructure and local data residency.' },
];

const team = [
  { name: 'Alex Moreno', role: 'CEO & Co-Founder', bio: 'Former VP Engineering at Zoom with 15+ years in video tech.' },
  { name: 'Priya Kapoor', role: 'CTO & Co-Founder', bio: 'Built real-time systems at Google Meet and WebRTC standards contributor.' },
  { name: 'James Wilson', role: 'CPO', bio: 'Product design leader who shaped experiences used by 100M+ people.' },
  { name: 'Lisa Chang', role: 'Head of Engineering', bio: 'Distributed systems expert who scaled platforms to billions of minutes.' },
];

const milestones = [
  { year: '2019', title: 'The Idea', description: 'Founded in San Francisco with a mission to make video calls feel as natural as in-person meetings.' },
  { year: '2020', title: 'Public Launch', description: 'Launched to the public, onboarding 50,000 users in the first month during the remote work boom.' },
  { year: '2021', title: 'AI Integration', description: 'Introduced AI-powered transcription, noise suppression, and smart background replacement.' },
  { year: '2022', title: '1M Users', description: 'Crossed 1 million active users and raised Series B to accelerate product development.' },
  { year: '2023', title: 'Enterprise Grade', description: 'Launched SSO, advanced admin controls, and achieved SOC 2 Type II certification.' },
  { year: '2024', title: 'Global Expansion', description: 'Opened offices in London, Tokyo, and Sydney. Surpassed 500K paid customers worldwide.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <Helmet>
        <title>About Us - AdzConnect</title>
        <meta name="description" content="Learn about AdzConnect's mission to transform team collaboration through innovative video meeting and communication technology." />
      </Helmet>
      {/* Hero */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-3xl mx-auto text-center">
            <motion.span variants={fadeIn} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">About Us</motion.span>
            <motion.h1 variants={fadeIn} className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              We&apos;re on a mission to{' '}
              <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">connect the world</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="mt-6 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Connectly was born from a simple belief: great video calls should be effortless, secure, and available to everyone. What started as a small team in San Francisco now serves millions of users worldwide.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Our Story</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold">From garage to global</h2>
              <div className="mt-6 space-y-4 text-gray-600 dark:text-slate-400 leading-relaxed">
                <p>In early 2019, our founders Alex and Priya noticed a problem: every video conferencing tool was either enterprise-bloated or consumer-toys. There was nothing built for modern teams that just worked.</p>
                <p>They started Connectly in Priya&apos;s garage in San Francisco, writing the first WebRTC prototype over a weekend. Within weeks, beta users were raving about the crisp video quality and intuitive interface.</p>
                <p>Fast forward to today — Connectly powers over 10 million meetings every month for teams in 150+ countries. We&apos;ve grown to 200+ employees across four global offices, all united by the same mission: make remote collaboration feel human again.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-700">
                <div className="h-full flex items-center justify-center">
                  <HiUserGroup className="w-20 h-20 text-gray-400 dark:text-slate-500" />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 border border-gray-100 dark:border-slate-700 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <HiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">200+ Employees</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">4 offices worldwide</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
            <motion.span variants={fadeIn} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Our Mission</motion.span>
            <motion.h2 variants={fadeIn} className="mt-3 text-3xl sm:text-4xl font-bold max-w-3xl mx-auto">Make every conversation feel like you&apos;re in the same room</motion.h2>
            <motion.p variants={fadeIn} className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              We believe distance should never be a barrier to great collaboration. Every feature we build, every pixel we design, brings people closer together.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="text-center mb-16">
            <motion.span variants={fadeIn} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Values</motion.span>
            <motion.h2 variants={fadeIn} className="mt-3 text-3xl sm:text-4xl font-bold">What drives us</motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.08, duration: 0.5 }} whileHover={{ y: -4 }} className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl transition-all">
                <v.icon className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="py-24 bg-gray-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="text-center mb-16">
            <motion.span variants={fadeIn} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Timeline</motion.span>
            <motion.h2 variants={fadeIn} className="mt-3 text-3xl sm:text-4xl font-bold">Our journey</motion.h2>
          </motion.div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block" />
            <div className="space-y-12">
              {milestones.map((m, i) => (
                <motion.div key={m.year} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.1, duration: 0.5 }} className="relative pl-0 sm:pl-20">
                  <div className="hidden sm:flex absolute left-4 top-1 w-8 h-8 bg-primary-600 rounded-full items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="sm:hidden w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <HiCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{m.year}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">{m.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{m.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="text-center mb-16">
            <motion.span variants={fadeIn} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Leadership</motion.span>
            <motion.h2 variants={fadeIn} className="mt-3 text-3xl sm:text-4xl font-bold">Meet the team behind Connectly</motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.1, duration: 0.5 }} className="text-center group">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-400 to-violet-400 flex items-center justify-center text-white text-2xl font-bold mb-4 group-hover:scale-105 transition-transform shadow-lg">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{member.role}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-violet-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to transform your meetings?</h2>
            <p className="text-primary-100 mb-8 text-lg">Join 500,000+ teams already using Connectly.</p>
            <a href="/auth/signup" className="inline-flex items-center gap-2 bg-white text-primary-700 font-medium px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-all shadow-xl text-base">
              Start Free Trial
              <HiArrowSmRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} Connectly. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 dark:hover:text-slate-200">Privacy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-slate-200">Terms</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-slate-200">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
