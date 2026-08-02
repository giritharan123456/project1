import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiCamera, HiMicrophone, HiSpeakerphone, HiWifi, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getFeatureSupport } from '../../utils/browserSupport';

const featureLabels = {
  webRTC: 'WebRTC (real-time video)',
  getUserMedia: 'Camera & microphone access',
  displayMedia: 'Screen sharing',
  broadcastChannel: 'Broadcast channel',
  clipboard: 'Clipboard access',
  speechRecognition: 'Speech recognition',
  fullscreen: 'Fullscreen mode',
  webAudio: 'Web Audio',
};

const deviceTests = [
  { id: 'camera', label: 'Camera', desc: 'Verify your webcam is working', icon: HiCamera, color: 'primary' },
  { id: 'microphone', label: 'Microphone', desc: 'Check your mic picks up audio', icon: HiMicrophone, color: 'emerald' },
  { id: 'speaker', label: 'Speaker', desc: 'Check your speakers or headphones', icon: HiSpeakerphone, color: 'violet' },
  { id: 'internet', label: 'Internet', desc: 'Verify stable network connection', icon: HiWifi, color: 'amber' },
];

export default function DeviceTestPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState({});
  const videoRef = useRef(null);
  const camStreamRef = useRef(null);

  const runTest = async (id) => {
    setTesting((p) => ({ ...p, [id]: true }));
    if (id === 'camera') {
      if (camStreamRef.current) { camStreamRef.current.getTracks().forEach(t => t.stop()); camStreamRef.current = null; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        camStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        await new Promise((r) => setTimeout(r, 1000));
        setResults((p) => ({ ...p, [id]: true }));
        toast.success('Camera test passed');
      } catch {
        setResults((p) => ({ ...p, [id]: false }));
        toast.error('Camera not available');
      }
    } else if (id === 'microphone') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        await new Promise((r) => setTimeout(r, 1000));
        stream.getTracks().forEach(t => t.stop());
        setResults((p) => ({ ...p, [id]: true }));
        toast.success('Microphone test passed');
      } catch {
        setResults((p) => ({ ...p, [id]: false }));
        toast.error('Microphone not available');
      }
    } else if (id === 'speaker') {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.1;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        await new Promise((r) => setTimeout(r, 800));
        osc.stop();
        ctx.close();
        setResults((p) => ({ ...p, [id]: true }));
        toast.success('Speaker test passed');
      } catch {
        setResults((p) => ({ ...p, [id]: false }));
        toast.error('Speaker test failed');
      }
    } else if (id === 'internet') {
      try {
        await fetch('https://clients3.google.com/generate_204', { mode: 'no-cors' });
        await new Promise((r) => setTimeout(r, 1000));
        setResults((p) => ({ ...p, [id]: true }));
        toast.success('Internet test passed');
      } catch {
        setResults((p) => ({ ...p, [id]: false }));
        toast.error('Internet connection issue');
      }
    }
    setTesting((p) => ({ ...p, [id]: false }));
  };

  const allPassed = deviceTests.every((d) => results[d.id] === true);
  const allTested = deviceTests.every((d) => results[d.id] !== undefined);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto p-6 space-y-6">
      <Helmet><title>Device Test - AdzConnect</title></Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Check</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Verify your devices before joining meetings</p>
        </div>
        {allTested && allPassed && (
          <Button variant="primary" onClick={() => navigate('/app/home')}>All Ready — Go to Dashboard</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deviceTests.map((d) => (
          <Card key={d.id} className={`p-6 ${results[d.id] === true ? 'border-emerald-200 dark:border-emerald-800' : results[d.id] === false ? 'border-red-200 dark:border-red-800' : ''}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-${d.color}-100 dark:bg-${d.color}-900/30 flex items-center justify-center shrink-0`}>
                <d.icon className={`w-6 h-6 text-${d.color}-600 dark:text-${d.color}-400`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{d.label}</h3>
                  {results[d.id] === true && <HiCheckCircle className="w-5 h-5 text-emerald-500" />}
                  {results[d.id] === false && <HiXCircle className="w-5 h-5 text-red-500" />}
                  {!results[d.id] && <Badge variant="warning" size="sm">Not tested</Badge>}
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{d.desc}</p>
                {results[d.id] === true && <Badge variant="success" size="sm" className="mt-2">Ready</Badge>}
                {results[d.id] === false && <Badge variant="danger" size="sm" className="mt-2">Needs attention</Badge>}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              {d.id === 'camera' && results.camera === true && (
                <video ref={videoRef} className="w-full max-w-xs rounded-xl border border-gray-200 dark:border-slate-700" autoPlay muted />
              )}
              <Button variant={results[d.id] === true ? 'outline' : 'primary'} size="sm" onClick={() => runTest(d.id)} loading={testing[d.id]}>
                {testing[d.id] ? 'Testing...' : results[d.id] === true ? 'Retest' : 'Test Now'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {allTested && (
        <Card className={`p-4 text-center ${allPassed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
          <p className={`font-medium ${allPassed ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
            {allPassed ? 'All devices are ready!' : 'Some devices need attention. Please test the failed devices.'}
          </p>
          {allPassed && <Button variant="primary" className="mt-3" onClick={() => navigate('/app/home')}>Continue to Dashboard</Button>}
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <HiCheckCircle className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Compatibility</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(getFeatureSupport()).map(([key, supported]) => (
            <div key={key} className="flex items-center justify-between py-1 text-sm">
              <span className="text-gray-600 dark:text-slate-300">{featureLabels[key] || key}</span>
              {supported ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <HiCheckCircle className="w-4 h-4" />
                  Supported
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500 dark:text-red-400">
                  <HiXCircle className="w-4 h-4" />
                  Unsupported
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}