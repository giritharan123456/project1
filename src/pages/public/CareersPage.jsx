import { motion } from 'framer-motion';
import { HiLocationMarker, HiBriefcase, HiClock, HiArrowRight, HiStar, HiHeart, HiUsers, HiGlobe } from 'react-icons/hi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const perks = [
  { icon: HiStar, title: 'Competitive Salary', desc: 'Top-tier compensation with equity packages' },
  { icon: HiHeart, title: 'Health & Wellness', desc: 'Full medical, dental, vision, and mental health support' },
  { icon: HiUsers, title: 'Great Team', desc: 'Work with talented and passionate colleagues' },
  { icon: HiGlobe, title: 'Remote First', desc: 'Work from anywhere with flexible hours' },
];

const openings = [
  { id: 1, title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'Remote / SF', type: 'Full-time', posted: '2d ago' },
  { id: 2, title: 'Backend Engineer - WebRTC', dept: 'Engineering', location: 'Remote / SF', type: 'Full-time', posted: '1w ago' },
  { id: 3, title: 'Product Designer', dept: 'Design', location: 'Remote / NY', type: 'Full-time', posted: '3d ago' },
  { id: 4, title: 'Developer Advocate', dept: 'Marketing', location: 'Remote', type: 'Full-time', posted: '1w ago' },
  { id: 5, title: 'Customer Success Manager', dept: 'Sales', location: 'London, UK', type: 'Full-time', posted: '2w ago' },
  { id: 6, title: 'Data Scientist - AI/ML', dept: 'Engineering', location: 'Remote / SF', type: 'Full-time', posted: '5d ago' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <Helmet>
        <title>Careers - AdzConnect</title>
        <meta name="description" content="Join the AdzConnect team. Explore open positions and build the future of team collaboration with us." />
      </Helmet>
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-3xl mx-auto text-center">
            <motion.span variants={itemVariants} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Careers</motion.span>
            <motion.h1 variants={itemVariants} className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">Join us in<br /><span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">connecting the world</span></motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">We're building the future of communication. Come help us make every conversation feel like you're in the same room.</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="text-center mb-16">
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold">Why join Connectly?</motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, i) => (
              <motion.div key={perk.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.1, duration: 0.5 }} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-center">
                <perk.icon className="w-10 h-10 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{perk.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="text-center mb-16">
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold">Open positions</motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-gray-600 dark:text-slate-400">{openings.length} positions available</motion.p>
          </motion.div>
          <div className="space-y-4">
            {openings.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.05, duration: 0.4 }} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><HiBriefcase className="w-4 h-4" />{job.dept}</span>
                    <span className="flex items-center gap-1.5"><HiLocationMarker className="w-4 h-4" />{job.location}</span>
                    <span className="flex items-center gap-1.5"><HiClock className="w-4 h-4" />{job.posted}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="primary" size="sm">{job.type}</Badge>
                  <Button size="sm" icon={HiArrowRight}>Apply</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
