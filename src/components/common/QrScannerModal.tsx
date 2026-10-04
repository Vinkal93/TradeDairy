'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTrades } from '../../context/TradeContext';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
  const { user } = useTrades();
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when closed
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setError('');
      setSuccess(false);
      setPinInput('');
    }
  }, [isOpen]);

  const startCamera = async () => {
    setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported on this browser. Please use the PC PIN below.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setError('Camera permission denied or camera not available. Enter the 6-digit PC PIN below.');
      setCameraActive(false);
    }
  };

  const handleAuthorize = async (pinOrToken: string) => {
    const clean = pinOrToken.trim();
    if (!clean) {
      setError('Please enter the 6-digit PIN shown on your PC screen.');
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
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Could not authorize PC login. Check PIN and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          stopCamera();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-surface-container overflow-hidden scale-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-surface-container/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">qr_code_scanner</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-on-surface">Scan to Log In PC</h3>
              <p className="text-[11px] text-on-surface-variant">Authorize your desktop session</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-outline hover:bg-surface-container transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {success ? (
            <div className="py-6 text-center space-y-2 animate-in zoom-in-90 duration-200">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h4 className="text-sm font-bold text-on-surface">PC Session Approved!</h4>
              <p className="text-xs text-on-surface-variant">
                Your PC is now instantly logged in as <strong>{user.fullName}</strong>.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-2.5 rounded-lg bg-error-container/30 border border-error/30 text-xs text-error font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Camera view if active */}
              {cameraActive ? (
                <div className="space-y-2">
                  <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden border border-surface-container">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    {/* Scanner target frame */}
                    <div className="absolute inset-8 border-2 border-primary/80 rounded-xl pointer-events-none animate-pulse"></div>
                  </div>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="w-full py-1.5 text-xs text-on-surface-variant hover:underline"
                  >
                    Switch to Manual PIN Input
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center p-3 rounded-xl bg-surface-container-low/70 border border-surface-container space-y-2">
                    <p className="text-xs text-on-surface-variant">
                      Point camera at the QR code on your PC, or enter the 6-character PIN shown on your PC screen.
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="btn-secondary text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      <span>Scan with Camera</span>
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-surface-container w-full"></div>
                    <span className="bg-white px-2 text-[10px] uppercase font-bold text-outline">
                      Or Quick PIN
                    </span>
                  </div>

                  {/* Manual PIN Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAuthorize(pinInput);
                    }}
                    className="space-y-2.5"
                  >
                    <label className="field-label text-left">
                      PC Auth PIN
                      <input
                        type="text"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                        placeholder="e.g. TD-8429"
                        maxLength={10}
                        className="w-full h-10 px-3 text-center text-sm font-mono font-bold tracking-widest uppercase rounded-lg border border-surface-container bg-surface-container-low focus:bg-white outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={loading || !pinInput.trim()}
                      className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
                    >
                      {loading && (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      )}
                      <span>Approve PC Login</span>
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
