import { Outlet } from 'react-router-dom';
import SkipToContent from '../components/common/SkipToContent';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <SkipToContent />
      <main id="main-content" className="flex-1">
        <header role="banner">
          <Outlet />
        </header>
      </main>
    </div>
  );
}
