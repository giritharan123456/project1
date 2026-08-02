import { useState } from 'react';
import PropTypes from 'prop-types';
import { HiExclamation, HiX } from 'react-icons/hi';
import { getBrowserInfo, isFullySupported, getMissingFeatures } from '../../utils/browserSupport';

const featureLabels = {
  webRTC: 'WebRTC',
  getUserMedia: 'Camera & microphone',
  displayMedia: 'Screen sharing',
  broadcastChannel: 'Broadcast channel',
  clipboard: 'Clipboard',
  speechRecognition: 'Speech recognition',
  fullscreen: 'Fullscreen',
  webAudio: 'Web Audio',
};

const BrowserSupportBanner = ({ className = '' }) => {
  const [dismissed, setDismissed] = useState(false);
  const browser = getBrowserInfo();
  const missing = getMissingFeatures();

  if (dismissed || isFullySupported()) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 ${className}`}
    >
      <HiExclamation className="w-5 h-5 mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />
      <div className="flex-1 min-w-0 text-sm">
        <p className="font-medium">Browser compatibility warning</p>
        <p className="mt-0.5 opacity-90">
          {browser.name} may not support all meeting features. Missing:{' '}
          {missing.map((f) => featureLabels[f] || f).join(', ')}. Update your browser or enable camera/microphone
          permissions.
        </p>
        {browser.name === 'Unknown' && (
          <p className="mt-1 text-xs opacity-90">For the best experience, use Chrome, Edge, Firefox, or Safari.</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss browser support warning"
        className="shrink-0 rounded-md p-1 text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50 transition-colors"
      >
        <HiX className="w-4 h-4" />
      </button>
    </div>
  );
};

BrowserSupportBanner.propTypes = {
  className: PropTypes.string,
};

export default BrowserSupportBanner;
