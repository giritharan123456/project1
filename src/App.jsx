import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ReducedMotionProvider } from './context/ReducedMotionContext';
import SkipToContent from './components/common/SkipToContent';
import router from './routes';
import { useId } from 'react';

function Announcer() {
  const politeId = useId();
  const assertiveId = useId();
  return (
    <>
      <div id={politeId} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
      <div id={assertiveId} className="sr-only" role="alert" aria-live="assertive" aria-atomic="true" />
    </>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <ReducedMotionProvider>
                <SkipToContent />
                <Announcer />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      borderRadius: '12px',
                      background: '#fff',
                      color: '#0f172a',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                    },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                  }}
                />
                <RouterProvider router={router} />
              </ReducedMotionProvider>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </I18nextProvider>
  );
}
