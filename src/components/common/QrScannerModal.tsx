'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { useTrades } from '../../context/TradeContext';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'scan' | 'show-qr';
}

export function QrScannerModal({ isOpen, onClose, initialMode }: QrScannerModalProps) {
  const { user } = useTrades();
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'show-qr'>('scan');

  // Scanner state
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);

  // PC QR display state
  const [qrToken, setQrToken] = useState<string>('');
  const [qrPin, setQrPin] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrStatus, setQrStatus] = useState<'PENDING' | 'AUTHORIZED' | 'EXPIRED'>('PENDING');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect whether current client is on phone or PC
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileDevice(isMobile);
      if (initialMode) {
        setActiveTab(initialMode);
      } else {
        setActiveTab(isMobile ? 'scan' : 'show-qr');
      }
    }
  }, [isOpen, initialMode]);

  // Stop camera stream & frame loop
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setError('');
      setSuccess(false);
      setPinInput('');
      setCameraPermissionError(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }
  }, [isOpen, stopCamera]);

  // Authorize session API call
  const handleAuthorize = async (pinOrToken: string) => {
    const clean = pinOrToken.trim();
    if (!clean) {
      setError('Please enter the 6-character PIN shown on the computer screen.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isPin = clean.toUpperCase().startsWith('TD-') || clean.length <= 8;
      const res = await fetch('/api/auth/qr-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: isPin ? clean.toUpperCase() : undefined,
          token: !isPin ? clean : undefined,
          user: {
            fullName: user.fullName || 'TradeDairy Trader',
            email: user.email || 'trader@tradedairy.online',
            uid: user.uid,
            avatar: user.avatar || user.profilePhoto,
            device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Mobile App',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authorize PC login');
      }

      setSuccess(true);
      stopCamera();
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch {}

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Could not authorize PC login. Check PIN and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Process decoded QR text
  const handleQrDecoded = (decodedText: string) => {
    try {
      if (decodedText.includes('token=') || decodedText.includes('pin=')) {
        const urlObj = new URL(decodedText.startsWith('http') ? decodedText : `https://td.app${decodedText}`);
        const tokenParam = urlObj.searchParams.get('token');
        const pinParam = urlObj.searchParams.get('pin');
        if (tokenParam) {
          handleAuthorize(tokenParam);
          return;
        }
        if (pinParam) {
          handleAuthorize(pinParam);
          return;
        }
      }
      handleAuthorize(decodedText);
    } catch {
      handleAuthorize(decodedText);
    }
  };

  // Continuous frame analysis with jsQR
  const scanVideoFrame = () => {
    const video = videoRef.current;
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        stopCamera();
        handleQrDecoded(code.data);
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  // Start mobile camera stream
  const startCamera = async () => {
    setError('');
    setCameraPermissionError(false);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Live camera access is restricted in this browser context (requires HTTPS or secure origin). Use photo upload or enter the PIN below.');
      setCameraPermissionError(true);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Preferred: Back-facing environment camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        // Fallback: Any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.playsInline = true;
        video.muted = true;
        await video.play();
        setCameraActive(true);
        animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraPermissionError(true);
      setError('Camera permission was not granted or no camera is available. Please enter the 6-character PC PIN below or take a photo.');
      setCameraActive(false);
    }
  };

  // Fallback: Scan photo / image upload with jsQR
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleQrDecoded(code.data);
          } else {
            setError('Could not detect a QR code in the selected photo. Please try entering the PIN manually.');
            setLoading(false);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Initialize PC QR Pairing Session (Desktop Mode)
  const initPcQrSession = useCallback(async () => {
    setQrLoading(true);
    setQrStatus('PENDING');

    try {
      const res = await fetch('/api/auth/qr-session', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create QR session');

      setQrToken(data.token);
      setQrPin(data.pin);

      if (canvasRef.current) {
        const qrUrl = `${window.location.origin}/auth/qr?token=${encodeURIComponent(
          data.token
        )}&pin=${encodeURIComponent(data.pin)}`;
        await QRCode.toCanvas(canvasRef.current, qrUrl, {
          width: 200,
          margin: 1,
          color: { dark: '#006948', light: '#ffffff' },
        });
      }
      setQrLoading(false);
    } catch {
      setQrLoading(false);
    }
  }, []);

  // Poll PC QR session status
  useEffect(() => {
    if (activeTab !== 'show-qr' || !qrToken || qrStatus !== 'PENDING') return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-session?token=${encodeURIComponent(qrToken)}`);
        const data = await res.json();
        if (data.status === 'AUTHORIZED' && data.user) {
          setQrStatus('AUTHORIZED');
          clearInterval(pollIntervalRef.current!);
          setSuccess(true);
          setTimeout(() => {
            onClose();
          }, 2000);
        } else if (data.status === 'EXPIRED') {
          setQrStatus('EXPIRED');
          clearInterval(pollIntervalRef.current!);
        }
      } catch {}
    }, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeTab, qrToken, qrStatus, onClose]);

  useEffect(() => {
    if (isOpen && activeTab === 'show-qr' && !qrToken) {
      initPcQrSession();
    }
  }, [isOpen, activeTab, qrToken, initPcQrSession]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        // Never close while loading
        if (e.target === e.currentTarget && !loading) {
          stopCamera();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-surface-container overflow-hidden scale-100 animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-surface-container/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <span className="material-symbols-outlined text-[18px]">
                {activeTab === 'scan' ? 'qr_code_scanner' : 'devices'}
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-on-surface">
                {activeTab === 'scan' ? 'Scan & Authorize PC' : 'Link Mobile Device'}
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                {activeTab === 'scan'
                  ? 'Sign in or sync this desktop screen'
                  : 'Scan from your phone to sync with this PC'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-xl border border-surface-container text-outline hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher (Scan with Phone vs Display QR for Phone) */}
        <div className="px-4 pt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('scan');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'scan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
            <span>Phone Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('show-qr');
              setError('');
              if (!qrToken) initPcQrSession();
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'show-qr'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
            <span>Show PC QR Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {success ? (
            <div className="py-6 text-center space-y-2.5 animate-in zoom-in-90 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h4 className="text-sm font-bold text-on-surface">PC Session Approved!</h4>
              <p className="text-xs text-on-surface-variant">
                Your device has authorized the session. Both screens are now connected in real time.
              </p>
            </div>
          ) : activeTab === 'scan' ? (
            /* PHONE SCANNER TAB */
            <div className="space-y-3.5">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Camera Video View */}
              {cameraActive ? (
                <div className="space-y-2">
                  <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                      autoPlay
                    />
                    {/* Scanner Target Frame */}
                    <div className="absolute inset-10 border-2 border-emerald-400 rounded-2xl pointer-events-none animate-pulse flex items-center justify-center">
                      <div className="w-full h-0.5 bg-emerald-400/80 shadow-glow-emerald"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      Close Camera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Point phone camera at the PC screen, or take a picture of the QR code.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[17px]">photo_camera</span>
                        <span>Open Live Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[17px]">upload_file</span>
                        <span>Photo / File</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center my-1">
                    <div className="border-t border-slate-200 w-full"></div>
                    <span className="bg-white px-2.5 text-[10px] uppercase font-bold text-slate-400">
                      Or Enter Direct PIN
                    </span>
                  </div>

                  {/* Manual 6-character PIN Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAuthorize(pinInput);
                    }}
                    className="space-y-2.5"
                  >
                    <div>
                      <input
                        type="text"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                        placeholder="e.g. TD-8429"
                        maxLength={10}
                        className="w-full h-11 px-3 text-center text-base font-mono font-black tracking-widest uppercase rounded-xl border border-slate-300 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus={!cameraActive}
                      />
                      <span className="text-[10px] text-slate-400 block text-center mt-1">
                        Enter the 6-character code shown on the PC screen
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !pinInput.trim()}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {loading && (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      )}
                      <span>Approve PC Login</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* SHOW PC QR CODE TAB */
            <div className="space-y-3 text-center animate-in fade-in duration-200">
              <p className="text-xs text-slate-600">
                Scan this QR code with your mobile camera or TradeDairy app to connect:
              </p>
              <div className="flex flex-col items-center justify-center py-2">
                <canvas
                  ref={canvasRef}
                  className="rounded-2xl shadow-xs bg-white p-2 border border-slate-200"
                />
                {qrLoading && <p className="text-xs text-slate-400 mt-2">Generating QR code…</p>}
                {qrPin && (
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400 block mb-1">Direct Pairing PIN:</span>
                    <span className="font-mono text-xl font-black tracking-widest text-emerald-800 bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-200 shadow-xs inline-block">
                      {qrPin}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Once scanned or approved, this browser will log in and sync automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
