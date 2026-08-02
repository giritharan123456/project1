import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      <a href="#auth-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-xl focus:text-sm focus:font-medium focus:outline-none" aria-label="Skip to main content">
        Skip to main content
      </a>
      <main id="auth-content" className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-2xl text-gray-900 dark:text-white">Connectly</span>
          </Link>
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Outlet />
        </div>
      </main>
      <aside className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 items-center justify-center relative overflow-hidden" aria-label="Brand information">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-lg px-8">
          <div className="w-24 h-24 mx-auto mb-8 bg-white/10 rounded-3xl backdrop-blur-lg flex items-center justify-center border border-white/20">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect with your team</h2>
          <p className="text-indigo-200 text-lg">HD video meetings, instant messaging, screen sharing, and more — all in one place.</p>
          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="text-center"><p className="text-3xl font-bold text-white">500K+</p><p className="text-indigo-200 text-sm">Active Users</p></div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center"><p className="text-3xl font-bold text-white">10M+</p><p className="text-indigo-200 text-sm">Meetings</p></div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center"><p className="text-3xl font-bold text-white">99.9%</p><p className="text-indigo-200 text-sm">Uptime</p></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
