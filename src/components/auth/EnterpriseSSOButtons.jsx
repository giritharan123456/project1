import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import PropTypes from 'prop-types';

const MicrosoftLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
    <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
    <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
  </svg>
);

const OktaLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#007DC1">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
  </svg>
);

const AzureLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0078D4">
    <path d="M13.05 4.24L6.56 18.05H2.18l6.49-13.81h4.38zm5.77 13.81L13.9 6.13h3.86l4.26 11.92h-3.2zm-4.83 1.95h-4.31l4.31-8.06 4.31 8.06h-4.31z" />
  </svg>
);

const SamlLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3L5 6v5c0 4.5 2.9 8.2 7 9.5 4.1-1.3 7-5 7-9.5V6l-7-3z" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LOGO_MAP = {
  Google: FcGoogle,
  GitHub: FaGithub,
  Microsoft: MicrosoftLogo,
  Okta: OktaLogo,
  'Azure AD': AzureLogo,
  'SAML SSO': SamlLogo,
};

const CONSUMER = ['Google', 'GitHub', 'Microsoft'];
const ENTERPRISE = ['Okta', 'Azure AD', 'SAML SSO', 'PingOne', 'OneLogin', 'Auth0', 'Network SSO'];

const buttonClass = 'flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors';

export default function EnterpriseSSOButtons({ onSelect, showEnterprise = true }) {
  const renderButton = (provider) => {
    const Logo = LOGO_MAP[provider];
    const initials = provider.split(' ').map((word) => word[0]).join('').slice(0, 2);
    return (
      <button
        key={provider}
        type="button"
        onClick={() => onSelect(provider)}
        className={buttonClass}
        aria-label={`Sign in with ${provider}`}
      >
        {Logo ? (
          <Logo className="w-5 h-5" />
        ) : (
          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-white flex items-center justify-center text-[10px] font-bold">
            {initials}
          </span>
        )}
        <span className="hidden sm:inline">{provider}</span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {CONSUMER.map(renderButton)}
      </div>
      {showEnterprise && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
            <span className="text-xs text-gray-400 dark:text-slate-500">Enterprise SSO</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {ENTERPRISE.map(renderButton)}
          </div>
        </>
      )}
      <p className="text-center text-xs text-gray-400 dark:text-slate-500">Enterprise SSO requires your organization&apos;s identity provider</p>
    </div>
  );
}

EnterpriseSSOButtons.propTypes = {
  onSelect: PropTypes.func.isRequired,
  showEnterprise: PropTypes.bool,
};
