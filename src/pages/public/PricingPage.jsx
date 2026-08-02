import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiCheck, HiCreditCard, HiDocumentText, HiCash, HiAcademicCap, HiBriefcase, HiUserGroup, HiGlobe, HiSupport, HiPhone, HiMail, HiClock, HiDownload, HiEye, HiPrinter, HiArrowRight } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Helmet } from 'react-helmet-async';

const plans = [
  { name: 'Free', price: 0, yearlyPrice: 0, period: 'forever', popular: false, color: 'gray', icon: HiAcademicCap, features: ['40-min meeting limit', 'Up to 100 participants', 'HD video & screen share', 'Basic chat', '1 GB cloud recording', 'Basic meeting stats'] },
  { name: 'Professional', price: 15, yearlyPrice: 144, period: '/month', popular: true, color: 'primary', icon: HiBriefcase, features: ['Unlimited meeting duration', 'Up to 300 participants', 'HD video & screen share', 'Advanced chat & polls', '5 GB cloud recording', 'AI summaries (10/mo)', 'Custom backgrounds', 'Priority support'] },
  { name: 'Business', price: 29, yearlyPrice: 288, period: '/month', popular: false, color: 'violet', icon: HiUserGroup, features: ['Unlimited meetings', 'Up to 500 participants', '4K video & screen share', 'Advanced admin controls', '20 GB cloud recording', 'Unlimited AI summaries', 'SSO & SCIM', 'Custom branding', '99.9% uptime SLA', 'Dedicated support'] },
  { name: 'Enterprise', price: 59, yearlyPrice: 588, period: '/month', popular: false, color: 'amber', icon: HiGlobe, features: ['Everything in Business', 'Unlimited participants', 'On-premise deployment', 'Unlimited cloud recording', 'Advanced compliance (HIPAA, GDPR)', 'Custom integrations', 'White-label branding', 'Dedicated account manager', '24/7 phone & email support', 'Custom contract terms'] },
];

const allFeatures = [
  { name: 'Meeting duration', free: '40 min', pro: 'Unlimited', biz: 'Unlimited', ent: 'Unlimited' },
  { name: 'Max participants', free: '100', pro: '300', biz: '500', ent: 'Unlimited' },
  { name: 'Video quality', free: 'HD', pro: 'HD', biz: '4K', ent: '4K' },
  { name: 'Cloud recording', free: '1 GB', pro: '5 GB', biz: '20 GB', ent: 'Unlimited' },
  { name: 'AI summaries', free: '—', pro: '10/mo', biz: 'Unlimited', ent: 'Unlimited' },
  { name: 'Chat & polls', free: 'Basic', pro: 'Advanced', biz: 'Advanced', ent: 'Advanced' },
  { name: 'Custom branding', free: '—', pro: '—', biz: '✓', ent: '✓' },
  { name: 'SSO / SCIM', free: '—', pro: '—', biz: '✓', ent: '✓' },
  { name: 'On-premise deploy', free: '—', pro: '—', biz: '—', ent: '✓' },
  { name: 'Compliance (HIPAA/GDPR)', free: '—', pro: '—', biz: '—', ent: '✓' },
  { name: 'Uptime SLA', free: '—', pro: '—', biz: '99.9%', ent: '99.99%' },
  { name: 'Support', free: 'Community', pro: 'Priority', biz: 'Dedicated', ent: '24/7 Concierge' },
];

const billingHistory = [
  { id: 'INV-2026-001', date: 'Jul 01, 2026', plan: 'Professional', amount: '$15.00', status: 'paid', method: 'Visa ••4242' },
  { id: 'INV-2026-002', date: 'Jun 01, 2026', plan: 'Professional', amount: '$15.00', status: 'paid', method: 'Visa ••4242' },
  { id: 'INV-2026-003', date: 'May 01, 2026', plan: 'Professional', amount: '$15.00', status: 'paid', method: 'PayPal' },
  { id: 'INV-2026-004', date: 'Apr 01, 2026', plan: 'Free', amount: '$0.00', status: 'paid', method: '—' },
];

const invoices = [
  { id: 'INV-2026-001', date: 'Jul 01, 2026', amount: '$15.00', status: 'paid', pdf: '#' },
  { id: 'INV-2026-002', date: 'Jun 01, 2026', amount: '$15.00', status: 'paid', pdf: '#' },
  { id: 'INV-2026-003', date: 'May 01, 2026', amount: '$15.00', status: 'paid', pdf: '#' },
];

const paymentMethods = [
  { id: 1, type: 'Visa', last4: '4242', exp: '08/28', default: true },
  { id: 2, type: 'Mastercard', last4: '8888', exp: '03/27', default: false },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly');
  const [showContactSales, setShowContactSales] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [, setSelectedPlan] = useState(null);
  const [currentPlan] = useState('Free');
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', size: '', message: '' });

  const getPrice = (plan) => billing === 'monthly' ? `$${plan.price}` : `$${plan.yearlyPrice}`;
  const getPeriod = (plan) => billing === 'monthly' ? plan.period : '/year';

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowSubscriptions(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <Helmet>
        <title>Pricing - AdzConnect</title>
        <meta name="description" content="View AdzConnect pricing plans. Choose from Free, Professional, Business, or Enterprise plans for your team." />
      </Helmet>
      {/* Hero */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-white to-transparent dark:from-primary-900/10 dark:via-slate-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-primary-500/10 to-violet-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-3xl mx-auto text-center">
            <motion.span variants={itemVariants} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Pricing</motion.span>
            <motion.h1 variants={itemVariants} className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">Simple, transparent<br /><span className="bg-gradient-to-r from-primary-600 via-violet-600 to-amber-500 bg-clip-text text-transparent">pricing for every team</span></motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your needs. Upgrade, downgrade, or cancel anytime.</motion.p>
            {/* Billing Toggle */}
            <motion.div variants={itemVariants} className="mt-10 inline-flex items-center gap-4 p-1.5 bg-gray-100 dark:bg-slate-800 rounded-2xl">
              <button onClick={() => setBilling('monthly')} className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${billing === 'monthly' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}>Monthly</button>
              <button onClick={() => setBilling('yearly')} className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all inline-flex items-center gap-2 ${billing === 'yearly' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}>Yearly <Badge variant="success" size="sm">Save 20%</Badge></button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.08, duration: 0.5 }} className={`relative p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl ${plan.popular ? 'border-primary-500 bg-gradient-to-b from-primary-50 to-white dark:from-primary-900/20 dark:to-slate-900 shadow-xl shadow-primary-500/10 scale-[1.02]' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-primary-300 dark:hover:border-primary-700'}`}>
                {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-violet-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-primary-500/25">Most Popular</div>}
                {currentPlan === plan.name && <div className="absolute top-3 right-3"><Badge variant="success" size="sm" dot>Current</Badge></div>}
                <plan.icon className={`w-10 h-10 mb-4 ${plan.color === 'primary' ? 'text-primary-600 dark:text-primary-400' : plan.color === 'violet' ? 'text-violet-600 dark:text-violet-400' : plan.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`} />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{getPrice(plan)}</span>
                  <span className="text-gray-500 dark:text-slate-400 text-sm">{getPeriod(plan)}</span>
                </div>
                {billing === 'yearly' && plan.price > 0 && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">${plan.price}/mo billed annually</p>}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm"><HiCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 dark:text-slate-400">{f}</span></li>
                  ))}
                </ul>
                <button onClick={() => handleSubscribe(plan)} className={`mt-8 w-full text-center font-semibold py-3 rounded-xl transition-all text-sm ${plan.popular ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5' : currentPlan === plan.name ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 cursor-default' : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-600'} ${currentPlan !== plan.name ? 'active:scale-[0.98]' : ''}`}>
                  {currentPlan === plan.name ? 'Current Plan' : plan.name === 'Free' ? 'Get Started' : 'Subscribe'}
                </button>
              </motion.div>
            ))}
          </div>
          {/* Contact Sales */}
          <motion.div variants={itemVariants} className="mt-12 text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-800 dark:to-slate-800/50 border border-gray-200 dark:border-slate-700">
            <HiGlobe className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Need a custom plan?</h2>
            <p className="text-gray-600 dark:text-slate-400 max-w-lg mx-auto mb-6">Get a tailored solution for your organization with custom pricing, dedicated support, and enterprise-grade security.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" icon={HiPhone} onClick={() => setShowContactSales(true)}>Contact Sales</Button>
              <Button size="lg" variant="outline" icon={HiSupport}>Chat with us</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800/30 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="text-center mb-12">
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold">Compare plans</motion.h2>
            <motion.p variants={itemVariants} className="mt-3 text-gray-600 dark:text-slate-400">Find the perfect plan for your team</motion.p>
          </motion.div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Feature</th>
                  {plans.map((p) => <th key={p.name} className={`py-4 px-4 font-semibold text-center ${p.popular ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((f) => (
                  <tr key={f.name} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-white/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-gray-700 dark:text-slate-300 font-medium">{f.name}</td>
                    <td className={`py-3.5 px-4 text-center ${f.free === '—' ? 'text-gray-300 dark:text-slate-600' : 'text-gray-600 dark:text-slate-400'}`}>{f.free}</td>
                    <td className={`py-3.5 px-4 text-center font-medium ${f.pro === '—' ? 'text-gray-300 dark:text-slate-600' : 'text-gray-600 dark:text-slate-400'}`}>{f.pro}</td>
                    <td className={`py-3.5 px-4 text-center font-medium ${f.biz === '—' ? 'text-gray-300 dark:text-slate-600' : 'text-gray-600 dark:text-slate-400'}`}>{f.biz}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-gray-600 dark:text-slate-400">{f.ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Billing & Subscription Management */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="text-center mb-12">
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold">Billing & Subscriptions</motion.h2>
            <motion.p variants={itemVariants} className="mt-3 text-gray-600 dark:text-slate-400">Manage your subscription, payment methods, and billing history</motion.p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Card hover onClick={() => setShowSubscriptions(true)}>
                <HiCreditCard className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Subscription</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Current plan, upgrades, downgrades, cancellations</p>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card hover onClick={() => setShowPaymentMethods(true)}>
                <HiCash className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage credit cards, PayPal, and more</p>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card hover onClick={() => setShowBillingHistory(true)}>
                <HiClock className="w-8 h-8 text-violet-600 dark:text-violet-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Billing History</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">View past charges and payment receipts</p>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card hover onClick={() => setShowInvoices(true)}>
                <HiDocumentText className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Invoices</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Download invoices and tax documents</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Sales Modal */}
      <Modal isOpen={showContactSales} onClose={() => setShowContactSales(false)} title="Contact Sales" size="lg">
        <div className="space-y-5">
          <p className="text-sm text-gray-600 dark:text-slate-300">Fill out the form below and our sales team will get back to you within 24 hours.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Name</label><input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm" placeholder="John Doe" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Email</label><input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm" placeholder="john@company.com" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Company</label><input value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm" placeholder="Acme Inc." /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Team Size</label><select value={contactForm.size} onChange={(e) => setContactForm({ ...contactForm, size: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm"><option value="">Select...</option><option>1-10</option><option>11-50</option><option>51-200</option><option>201-1000</option><option>1000+</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Message</label><textarea rows={4} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm resize-none" placeholder="Tell us about your requirements..." /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
          <Button variant="ghost" onClick={() => setShowContactSales(false)}>Cancel</Button>
          <Button icon={HiMail}>Send Inquiry</Button>
        </div>
      </Modal>

      {/* Subscription Management Modal */}
      <Modal isOpen={showSubscriptions} onClose={() => setShowSubscriptions(false)} title="Subscription Management" size="lg">
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/20 dark:to-violet-900/20 border border-primary-100 dark:border-primary-900/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">Current Plan</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{currentPlan}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">${billing === 'monthly' ? plans.find(p => p.name === currentPlan)?.price : plans.find(p => p.name === currentPlan)?.yearlyPrice}/{billing === 'monthly' ? 'month' : 'year'}</p>
              </div>
              <Badge variant="success" size="md" dot>Active</Badge>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Available payment methods</h4>
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">{pm.type === 'Visa' ? 'VISA' : 'MC'}</div>
                    <div><p className="text-sm font-medium text-gray-900 dark:text-white">{pm.type} ••{pm.last4}</p><p className="text-xs text-gray-500 dark:text-slate-400">Expires {pm.exp}</p></div>
                  </div>
                  {pm.default && <Badge variant="primary" size="sm">Default</Badge>}
                </div>
              ))}
              <button className="w-full text-left p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-sm text-primary-600 dark:text-primary-400 hover:border-primary-400 transition-colors font-medium">+ Add payment method</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
            <Button variant="primary" icon={HiArrowRight}>Upgrade Plan</Button>
            <Button variant="outline">Downgrade</Button>
            <Button variant="ghost" className="text-red-500">Cancel Subscription</Button>
          </div>
        </div>
      </Modal>

      {/* Payment Methods Modal */}
      <Modal isOpen={showPaymentMethods} onClose={() => setShowPaymentMethods(false)} title="Payment Methods" size="md">
        <div className="space-y-5">
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your payment methods. Your default method will be charged automatically.</p>
          <div className="space-y-3">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">{pm.type === 'Visa' ? 'VISA' : 'MC'}</div>
                  <div><p className="text-sm font-medium text-gray-900 dark:text-white">{pm.type} ••{pm.last4}</p><p className="text-xs text-gray-500 dark:text-slate-400">Expires {pm.exp}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  {pm.default && <Badge variant="primary" size="sm">Default</Badge>}
                  <button className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
          {/* Stripe / PayPal / Razorpay Mock */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Add payment method</p>
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-white dark:bg-slate-800/50">
                <svg className="w-8 h-8" viewBox="0 0 24 24"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 7.682 0 4.403 2.449 4.403 6.203c0 4.082 5.198 5.229 6.998 5.886 1.975.719 2.849 1.305 2.849 2.338 0 1.079-.982 1.724-2.321 1.724-2.101 0-4.963-1.163-6.396-1.969l-.93 5.479c1.819.789 4.339 1.339 6.677 1.339 5.039 0 8.497-2.439 8.497-6.409 0-4.354-5.134-5.473-7.827-6.41z" fill="#635BFF"/></svg>
                <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Stripe</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-white dark:bg-slate-800/50">
                <svg className="w-8 h-8" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.64.64 0 0 1-.633-.64V2.305c0-.349.28-.634.633-.634h4.607c.323 0 .557.23.557.514v18.645c0 .285-.234.507-.557.507zM22.225 9.492c-.9-3.004-3.271-4.507-6.59-4.507-4.04 0-7.296 2.048-7.296 5.233 0 2.74 2.298 4.313 5.325 5.048 2.834.714 3.88 1.437 3.88 2.433 0 1.155-1.196 1.97-3.227 1.97-2.519 0-4.325-.993-5.826-2.166l-.013-.009-.942 4.168c1.332.832 3.528 1.603 6.508 1.603 4.643 0 8.218-2.07 8.218-5.774 0-2.535-1.646-4.013-5.16-5.006-2.558-.733-3.97-1.286-3.97-2.361 0-.973.896-1.74 2.486-1.74 1.805 0 3.603.64 4.865 1.492l.025.014.817-3.68c-.872-.472-3.064-1.367-5.947-1.367-4.963 0-8.333 2.503-8.333 5.932 0 2.525 1.762 4.508 5.12 5.458 2.51.717 3.773 1.361 3.773 2.416 0 1.148-1.253 1.836-3.283 1.836-2.213 0-4.121-.712-5.687-1.99l-.027-.019-.945 4.257c1.52 1.107 3.96 1.832 6.64 1.832 5.647 0 9.067-2.356 9.067-6.107-.003-2.605-1.398-4.086-4.544-5.115z" fill="#0070BA"/></svg>
                <span className="text-xs font-medium text-gray-700 dark:text-slate-300">PayPal</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-white dark:bg-slate-800/50">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0065FF"><path d="M4.5 3.5v17h15v-17h-15zM6 6h13v12H6V6zm3 2v2h7V8H9zm0 4v2h7v-2H9z"/></svg>
                <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Razorpay</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Billing History Modal */}
      <Modal isOpen={showBillingHistory} onClose={() => setShowBillingHistory(false)} title="Billing History" size="lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-slate-700"><th className="text-left py-3 px-3 font-semibold text-gray-900 dark:text-white">Invoice</th><th className="text-left py-3 px-3 font-semibold text-gray-900 dark:text-white">Date</th><th className="text-left py-3 px-3 font-semibold text-gray-900 dark:text-white">Plan</th><th className="text-right py-3 px-3 font-semibold text-gray-900 dark:text-white">Amount</th><th className="text-center py-3 px-3 font-semibold text-gray-900 dark:text-white">Status</th><th className="text-center py-3 px-3 font-semibold text-gray-900 dark:text-white">Method</th></tr></thead>
            <tbody>
              {billingHistory.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/30"><td className="py-3 px-3 text-gray-900 dark:text-white font-medium">{b.id}</td><td className="py-3 px-3 text-gray-600 dark:text-slate-400">{b.date}</td><td className="py-3 px-3 text-gray-600 dark:text-slate-400">{b.plan}</td><td className="py-3 px-3 text-right text-gray-900 dark:text-white font-medium">{b.amount}</td><td className="py-3 px-3 text-center"><Badge variant={b.status === 'paid' ? 'success' : 'warning'} size="sm" dot>{b.status}</Badge></td><td className="py-3 px-3 text-center text-gray-500 dark:text-slate-400 text-xs">{b.method}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Invoices Modal */}
      <Modal isOpen={showInvoices} onClose={() => setShowInvoices(false)} title="Invoice History" size="lg">
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <HiDocumentText className="w-8 h-8 text-gray-400" />
                <div><p className="font-medium text-gray-900 dark:text-white text-sm">{inv.id}</p><p className="text-xs text-gray-500 dark:text-slate-400">{inv.date} · {inv.amount}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={inv.status === 'paid' ? 'success' : 'warning'} size="sm" dot>{inv.status}</Badge>
                <button aria-label="Download invoice" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><HiDownload className="w-4 h-4 text-gray-500" /></button>
                <button aria-label="View invoice" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><HiEye className="w-4 h-4 text-gray-500" /></button>
                <button aria-label="Print invoice" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><HiPrinter className="w-4 h-4 text-gray-500" /></button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
