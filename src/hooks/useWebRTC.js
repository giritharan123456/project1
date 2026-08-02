import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

let channelId = 0;

export default function useWebRTC({ meetingId, userId, onRemoteStream, onRemoteLeave } = {}) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('idle');
  const [error, setError] = useState(null);
  const [peers, setPeers] = useState([]);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const bcRef = useRef(null);
  const myId = useRef(`peer_${userId || 'anon'}_${Date.now()}_${++channelId}`);

  const updatePeers = useCallback(() => {
    setPeers(Object.keys(peersRef.current));
  }, []);

  const handleRemoteLeave = useCallback((targetId) => {
    const pc = peersRef.current[targetId];
    if (pc) {
      pc.close();
      delete peersRef.current[targetId];
    }
    setRemoteStreams(prev => prev.filter(s => s.id !== targetId));
    onRemoteLeave?.();
    updatePeers();
  }, [onRemoteLeave, updatePeers]);

  const createPC = useCallback((targetId) => {
    if (peersRef.current[targetId]) return peersRef.current[targetId];
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peersRef.current[targetId] = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        bcRef.current?.postMessage({ type: 'ice', from: myId.current, to: targetId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        setRemoteStreams(prev => {
          if (prev.find(s => s.id === stream.id)) return prev;
          return [...prev, stream];
        });
        onRemoteStream?.(stream);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        handleRemoteLeave(targetId);
      }
    };

    updatePeers();
    return pc;
  }, [onRemoteStream, updatePeers, handleRemoteLeave]);

  const handleRemoteJoin = useCallback(async (targetId) => {
    if (peersRef.current[targetId]) return;
    const pc = createPC(targetId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      bcRef.current?.postMessage({ type: 'offer', from: myId.current, to: targetId, offer });
    } catch {}
  }, [createPC]);

  const handleOffer = useCallback(async (targetId, offer) => {
    const pc = createPC(targetId);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      bcRef.current?.postMessage({ type: 'answer', from: myId.current, to: targetId, answer });
    } catch {}
  }, [createPC]);

  const handleAnswer = useCallback(async (targetId, answer) => {
    try {
      await peersRef.current[targetId]?.setRemoteDescription(new RTCSessionDescription(answer));
      setIsConnected(true);
      setConnectionState('connected');
    } catch {}
  }, []);

  const handleIce = useCallback(async (targetId, candidate) => {
    try {
      await peersRef.current[targetId]?.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {}
  }, []);

  const startLocalStream = useCallback(async (video = true, audio = true) => {
    try {
      setConnectionState('requesting-media');
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setConnectionState('media-acquired');

      const bc = new BroadcastChannel(`meeting:${meetingId || 'default'}`);
      bcRef.current = bc;

      bc.onmessage = (event) => {
        const data = event.data;
        if (!data || data.from === myId.current) return;

        switch (data.type) {
          case 'join':
            handleRemoteJoin(data.from);
            break;
          case 'offer':
            handleOffer(data.from, data.offer);
            break;
          case 'answer':
            handleAnswer(data.from, data.answer);
            break;
          case 'ice':
            handleIce(data.from, data.candidate);
            break;
          case 'leave':
            handleRemoteLeave(data.from);
            break;
        }
      };

      bc.postMessage({ type: 'join', from: myId.current });
      setConnectionState('signaling');
      return stream;
    } catch (err) {
      const msg = err.name === 'NotAllowedError' ? 'Camera/mic permission denied' : 'Failed to access camera/microphone';
      setError(msg);
      setConnectionState('error');
      toast.error(msg);
      return null;
    }
  }, [meetingId, handleRemoteJoin, handleOffer, handleAnswer, handleIce, handleRemoteLeave]);

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  const toggleAudio = useCallback((enabled) => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = enabled; });
  }, []);

  const toggleVideo = useCallback((enabled) => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = enabled; });
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });
      screenTrack.onended = () => {
        const originalTrack = localStreamRef.current?.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (originalTrack && sender) sender.replaceTrack(originalTrack);
        });
      };
      return screenStream;
    } catch (err) {
      if (err.name !== 'NotAllowedError') toast.error('Failed to share screen');
      return null;
    }
  }, []);

  const disconnect = useCallback(() => {
    bcRef.current?.postMessage({ type: 'leave', from: myId.current });
    bcRef.current?.close();
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
    pcRef.current = null;
    stopLocalStream();
    setRemoteStreams([]);
    setIsConnected(false);
    setConnectionState('idle');
    setPeers([]);
  }, [stopLocalStream]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return {
    localStream,
    remoteStreams,
    isConnected,
    connectionState,
    error,
    peers,
    startLocalStream,
    stopLocalStream,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    disconnect,
  };
}
