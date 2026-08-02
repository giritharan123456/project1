import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiMail, HiPhone, HiLocationMarker,
  HiClock, HiGlobe, HiChatAlt2,
  HiCheckCircle, HiArrowSmRight,
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

const offices = [
  { city: 'San Francisco', address: '548 Market St, San Francisco, CA 94104', phone: '+1 (415) 555-0123', hours: 'Mon-Fri 9AM - 6PM PT' },
  { city: 'London', address: '71 Queen Victoria St, London EC4V 4AY', phone: '+44 20 7946 0958', hours: 'Mon-Fri 9AM - 6PM GMT' },
  { city: 'Tokyo', address: '3-2-1 Marunouchi, Chiyoda City, Tokyo 100-0005', phone: '+81 3 6205 8000', hours: 'Mon-Fri 9AM - 6PM JST' },
];

const supportOptions = [
  { icon: HiChatAlt2, title: 'Live Chat', description: 'Chat with our support team in real-time.', availability: 'Available 24/7' },
  { icon: HiMail, title: 'Email Support', description: 'Get a response within 2 hours.', availability: 'priority@connectly.com' },
  { icon: HiPhone, title: 'Phone Support', description: 'Speak directly with an expert.', availability: 'Enterprise only' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <Helmet>
        <title>Contact Us - AdzConnect</title>
        <meta name="description" content="Get in touch with the AdzConnect team. Contact our support, sales, or visit our offices worldwide." />
      </Helmet>
      {/* Hero */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-3xl mx-auto text-center">
            <motion.span variants={fadeIn} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Contact</motion.span>
            <motion.h1 variants={fadeIn} className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              We&apos;d love to{' '}
              <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">hear from you</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="mt-6 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Have a question, need support, or interested in Enterprise? Our team is here to help.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-20 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-3">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 text-center">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiCheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message sent!</h3>
                  <p className="text-gray-600 dark:text-slate-400">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }} className="mt-6 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">Send another message</button>
                </motion.div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Full Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm placeholder-gray-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Email</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="john@company.com" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm placeholder-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Subject</label>
                      <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Sales">Sales</option>
                        <option value="Support">Support</option>
                        <option value="Enterprise">Enterprise</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Message</label>
                      <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required rows={5} placeholder="Tell us how we can help..." className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm placeholder-gray-400 resize-none" />
                    </div>
                    <button type="submit" className="inline-flex items-center gap-2 bg-primary-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-primary-700 transition-all text-sm shadow-lg shadow-primary-500/25">
                      Send Message
                      <HiArrowSmRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {[
                    { icon: HiMail, label: 'Email', value: 'hello@connectly.com', href: 'mailto:hello@connectly.com' },
                    { icon: HiPhone, label: 'Phone', value: '+1 (415) 555-0123', href: 'tel:+14155550123' },
                    { icon: HiGlobe, label: 'Website', value: 'www.connectly.com', href: 'https://www.connectly.com' },
                  ].map((item) => (
                    <a key={item.label} href={item.href} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <div className="space-y-3">
                  {supportOptions.map((opt) => (
                    <div key={opt.title} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700">
                      <opt.icon className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{opt.title}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{opt.description}</p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{opt.availability}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="text-center mb-16">
            <motion.span variants={fadeIn} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Offices</motion.span>
            <motion.h2 variants={fadeIn} className="mt-3 text-3xl sm:text-4xl font-bold">Visit our offices</motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {offices.map((office, i) => (
              <motion.div key={office.city} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.12, duration: 0.5 }} whileHover={{ y: -4 }} className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-800 transition-all">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                  <HiLocationMarker className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{office.city}</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <HiLocationMarker className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{office.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <HiPhone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{office.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <HiClock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{office.hours}</span>
                  </div>
                </div>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Want to talk to sales?</h2>
            <p className="text-primary-100 mb-8 text-lg">Our team is ready to help you find the perfect plan for your organization.</p>
            <a href="tel:+14155550123" className="inline-flex items-center gap-2 bg-white text-primary-700 font-medium px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-all shadow-xl text-base">
              <HiPhone className="w-5 h-5" />
              +1 (415) 555-0123
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
            <a href="#" className="hover:text-gray-900 dark:hover:text-slate-200">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
