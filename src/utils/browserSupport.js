export function getBrowserInfo() {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = '';

  if (/Edg\//.test(ua)) {
    name = 'Edge';
    version = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
  } else if (/OPR\/|Opera/.test(ua)) {
    name = 'Opera';
    version = ua.match(/OPR\/([\d.]+)/)?.[1] || ua.match(/Version\/([\d.]+)/)?.[1] || '';
  } else if (/Chrome\//.test(ua)) {
    name = 'Chrome';
    version = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
  } else if (/Firefox\//.test(ua)) {
    name = 'Firefox';
    version = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
  } else if (/Safari\//.test(ua)) {
    name = 'Safari';
    version = ua.match(/Version\/([\d.]+)/)?.[1] || '';
  }

  const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);

  return { name, version, mobile };
}

export function getFeatureSupport() {
  return {
    webRTC: typeof window.RTCPeerConnection !== 'undefined' || typeof window.webkitRTCPeerConnection !== 'undefined',
    getUserMedia: !!navigator.mediaDevices?.getUserMedia,
    displayMedia: !!navigator.mediaDevices?.getDisplayMedia,
    broadcastChannel: 'BroadcastChannel' in window,
    clipboard: !!navigator.clipboard?.writeText,
    speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    fullscreen: !!document.fullscreenEnabled,
    webAudio: !!(window.AudioContext || window.webkitAudioContext),
  };
}

export function isFullySupported() {
  const support = getFeatureSupport();
  return support.webRTC && support.getUserMedia && support.displayMedia && support.broadcastChannel;
}

export function getMissingFeatures() {
  const support = getFeatureSupport();
  return Object.keys(support).filter((key) => !support[key]);
}
