import { motion } from 'framer-motion';
import { HiCalendar, HiUser, HiClock } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Helmet } from 'react-helmet-async';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const posts = [
  { id: 1, title: 'How AI is Transforming Video Meetings', excerpt: 'Discover how artificial intelligence is revolutionizing the way we collaborate in virtual meetings.', author: 'Sarah Chen', date: 'Jul 28, 2026', readTime: '5 min', category: 'AI', tags: ['AI', 'Meetings', 'Technology'] },
  { id: 2, title: '10 Tips for Better Remote Meetings', excerpt: 'Practical advice to make your remote meetings more engaging and productive for everyone involved.', author: 'Alex Moreno', date: 'Jul 25, 2026', readTime: '7 min', category: 'Productivity', tags: ['Remote Work', 'Tips', 'Productivity'] },
  { id: 3, title: 'Enterprise Security Best Practices', excerpt: 'Learn about the security measures we take to keep your meetings and data safe and private.', author: 'Lisa Chang', date: 'Jul 22, 2026', readTime: '6 min', category: 'Security', tags: ['Security', 'Enterprise', 'Privacy'] },
  { id: 4, title: 'Introducing Smart Meeting Summaries', excerpt: 'Our new AI-powered feature that automatically generates meeting summaries and action items.', author: 'Priya Kapoor', date: 'Jul 20, 2026', readTime: '4 min', category: 'Product', tags: ['Product', 'AI', 'Features'] },
  { id: 5, title: 'The Future of Hybrid Work', excerpt: 'Why hybrid work is here to stay and how Connectly is building tools to make it seamless.', author: 'Alex Moreno', date: 'Jul 18, 2026', readTime: '8 min', category: 'Culture', tags: ['Hybrid Work', 'Culture', 'Future'] },
  { id: 6, title: 'Scaling to 10 Million Meetings', excerpt: 'Engineering challenges and solutions we encountered while scaling our infrastructure.', author: 'James Wilson', date: 'Jul 15, 2026', readTime: '10 min', category: 'Engineering', tags: ['Engineering', 'Scaling', 'Infrastructure'] },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <Helmet>
        <title>Blog - AdzConnect</title>
        <meta name="description" content="Explore the AdzConnect blog for articles on video meetings, remote work tips, product updates, and team collaboration insights." />
      </Helmet>
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-3xl mx-auto text-center">
            <motion.span variants={itemVariants} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Blog</motion.span>
            <motion.h1 variants={itemVariants} className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">Insights &<br /><span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">Updates</span></motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Product updates, engineering deep-dives, remote work tips, and more from the Connectly team.</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Card hover padding={false} className="h-full flex flex-col">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="primary" size="sm">{post.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 pt-4 border-t border-gray-100 dark:border-slate-700">
                      <span className="flex items-center gap-1.5"><HiUser className="w-3.5 h-3.5" />{post.author}</span>
                      <span className="flex items-center gap-1.5"><HiCalendar className="w-3.5 h-3.5" />{post.date}</span>
                      <span className="flex items-center gap-1.5"><HiClock className="w-3.5 h-3.5" />{post.readTime}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
