import React, { useEffect, useState, useRef } from 'react';
import { adminApi } from '../api/payment.api';
import { CheckCircle, AlertCircle, RefreshCw, Ticket, User, Phone, Camera } from 'lucide-react';

interface TicketScannerProps {
  onScanSuccess?: (data: string) => void;
}

interface ScanResult {
  valid: boolean;
  ticketCode: string;
  passengerName: string;
  passengerPhone: string;
  bookingStatus: string;
  ticketStatus: string;
}

const TicketScanner: React.FC<TicketScannerProps> = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    initScanner();

    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch (_) {}
      }
    };
  }, []);

  const initScanner = async () => {
    // Check camera permission first before loading the library
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err: any) {
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings and try again.'
          : 'Camera is not available on this device or browser.';
      if (mountedRef.current) setCameraError(msg);
      return;
    }

    // Dynamically import to avoid crashes at module level
    try {
      const { Html5QrcodeScanner, Html5QrcodeScanType } = await import('html5-qrcode');
      if (!mountedRef.current) return;

      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        false
      );

      scannerRef.current.render(handleScanSuccess, () => {});
    } catch (_) {
      if (mountedRef.current)
        setCameraError('Failed to initialize the QR scanner. Please try refreshing the page.');
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      setScanResult(null);

      let ticketCodeToVerify = decodedText;
      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.ticketCode) ticketCodeToVerify = parsed.ticketCode;
      } catch (_) {}

      const response = await adminApi.verifyTicket(ticketCodeToVerify);
      if (mountedRef.current) setScanResult(response.data);

      if (scannerRef.current) {
        try {
          scannerRef.current.pause(true);
        } catch (_) {}
      }
    } catch (err: any) {
      if (mountedRef.current)
        setError(err.response?.data?.message || 'Invalid Ticket or Server Error');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const resumeScanning = () => {
    setScanResult(null);
    setError(null);
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (_) {}
    }
  };

  const retryCamera = () => {
    setCameraError(null);
    setTimeout(initScanner, 300);
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto w-full">
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-serif font-black text-slate-900 mb-4 flex items-center gap-2 justify-center">
          <Ticket className="w-5 h-5 text-amber-600" /> Verify Ticket QR Code
        </h2>

        {/* Camera Permission Error */}
        {cameraError && (
          <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200 text-center mb-4">
            <Camera className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-900 mb-2">Camera Access Required</h3>
            <p className="text-red-700 text-sm mb-4">{cameraError}</p>
            <button
              onClick={retryCamera}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Request Camera Permissions
            </button>
          </div>
        )}

        {/* Scanner Container - always in DOM so html5-qrcode can find it */}
        <div
          id="qr-reader"
          className={`w-full overflow-hidden rounded-xl bg-slate-50 mb-6 ${cameraError ? 'hidden' : ''}`}
        ></div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span className="font-semibold">Verifying Ticket...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200 text-center animate-in zoom-in-95">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-red-900 mb-1">Invalid Ticket</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button
              onClick={resumeScanning}
              className="bg-red-100 hover:bg-red-200 text-red-800 font-bold px-6 py-2 rounded-xl transition-colors text-sm"
            >
              Scan Another Ticket
            </button>
          </div>
        )}

        {/* Success State */}
        {scanResult && !loading && (
          <div
            className={`p-6 rounded-2xl border-2 text-center animate-in zoom-in-95 ${
              scanResult.valid ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
            }`}
          >
            {scanResult.valid ? (
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}

            <h3
              className={`text-2xl font-black mb-1 ${
                scanResult.valid ? 'text-emerald-900' : 'text-red-900'
              }`}
            >
              {scanResult.valid ? 'TICKET APPROVED ✓' : 'TICKET INVALID ✗'}
            </h3>

            <div className="bg-white rounded-xl p-4 my-4 border border-slate-100 text-left space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Ticket Code</p>
                  <p className="font-bold text-slate-900 font-mono text-lg">{scanResult.ticketCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Passenger Name</p>
                  <p className="font-bold text-slate-900">{scanResult.passengerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="font-bold text-slate-900">{scanResult.passengerPhone}</p>
                </div>
              </div>
            </div>

            <button
              onClick={resumeScanning}
              className={`font-bold px-8 py-3 rounded-xl transition-all shadow-md mt-2 w-full ${
                scanResult.valid
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Scan Next Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketScanner;
