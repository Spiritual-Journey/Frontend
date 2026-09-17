import React, { useEffect, useState, useRef } from 'react';
import { adminApi } from '../api/payment.api';
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Ticket,
  User,
  Phone,
  Camera,
  Calendar,
  MapPin,
  Search,
  RotateCcw,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScanResult {
  valid: boolean;
  ticketCode: string;
  passengerName: string;
  passengerPhone: string;
  bookingNumber?: string;
  buyerName?: string;
  journeyTitle?: string;
  destination?: string;
  departureDate?: string;
  departureTime?: string;
  bookingStatus: string;
  ticketStatus: string;
}

const TicketScanner: React.FC = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  const stopScanner = async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (_) {}
      isScanningRef.current = false;
      setIsScanning(false);
    }
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (_) {}
      scannerRef.current = null;
    }
  };

  const startScanner = async () => {
    try {
      setCameraError(null);
      await stopScanner();

      // Ensure element exists in DOM
      const readerElem = document.getElementById('qr-reader');
      if (!readerElem) return;

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      const qrConfig = {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
      };

      const handleSuccess = async (decodedText: string) => {
        await stopScanner();
        await verifyCode(decodedText);
      };

      try {
        // Back camera preferred for mobile devices
        await html5QrCode.start({ facingMode: 'environment' }, qrConfig, handleSuccess, () => {});
        isScanningRef.current = true;
        setIsScanning(true);
      } catch (backCamErr) {
        // Fallback to front camera or default camera
        await html5QrCode.start({ facingMode: 'user' }, qrConfig, handleSuccess, () => {});
        isScanningRef.current = true;
        setIsScanning(true);
      }
    } catch (err: any) {
      isScanningRef.current = false;
      setIsScanning(false);
      const isDenied = err?.name === 'NotAllowedError' || String(err).includes('Permission');
      setCameraError(
        isDenied
          ? 'የካሜራ ፈቃድ አልተሰጠም። እባክዎ በስልክዎ/ብሮውዘርዎ Settings ውስጥ Camera ፍቀድ ያድርጉ። (Camera permission denied. Please allow camera in settings.)'
          : 'ካሜራውን መክፈት አልተቻለም። እባክዎ ከታች የትኬት ቁጥሩን በእጅ ያስገቡ። (Could not start camera. You can enter the ticket code manually below.)'
      );
    }
  };

  const verifyCode = async (rawCode: string) => {
    setLoading(true);
    setError(null);
    try {
      let codeToVerify = rawCode.trim();
      try {
        const parsed = JSON.parse(rawCode);
        if (parsed.ticketCode) codeToVerify = String(parsed.ticketCode).trim();
      } catch (_) {}

      const res = await adminApi.verifyTicket(codeToVerify);
      setScanResult(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'ትኬቱ አልተገኘም ወይም ልክ ያልሆነ ነው። እባክዎ የትኬት ቁጥሩን ያረጋግጡ። (Ticket not found or invalid)'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await stopScanner();
    await verifyCode(manualCode.trim());
  };

  const returnToScanner = () => {
    setScanResult(null);
    setError(null);
    setManualCode('');
  };

  // Start scanner when not showing scan result
  useEffect(() => {
    if (!scanResult) {
      const timer = setTimeout(() => {
        startScanner();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [scanResult]);

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto w-full px-2 sm:px-0">
      <div className="w-full bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-black text-slate-900">
                የትኬት QR ስካነር
              </h2>
              <p className="text-xs text-slate-500 font-medium">Verify Ticket QR Code</p>
            </div>
          </div>

          {scanResult && (
            <button
              onClick={returnToScanner}
              className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> ወደ ስካነር ተመለስ
            </button>
          )}
        </div>

        {/* ==================================================================== */}
        {/* CASE 1: SCAN RESULT DETAILS (Shows when ticket is scanned)           */}
        {/* ==================================================================== */}
        {scanResult && !loading && (
          <div className="animate-in fade-in zoom-in-95 duration-200 space-y-5">
            {/* Status Banner */}
            <div
              className={`p-6 rounded-2xl border-2 text-center flex flex-col items-center ${
                scanResult.valid
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-red-50/80 border-red-300'
              }`}
            >
              {scanResult.valid ? (
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
                  <CheckCircle className="w-10 h-10" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
                  <AlertCircle className="w-10 h-10" />
                </div>
              )}

              <h3
                className={`text-xl font-black mb-1 ${
                  scanResult.valid ? 'text-emerald-900' : 'text-red-900'
                }`}
              >
                {scanResult.valid
                  ? 'ትኬቱ ተረጋግጧል! (TICKET APPROVED ✓)'
                  : 'ትኬቱ ልክ አይደለም! (INVALID TICKET ✗)'}
              </h3>
              <p
                className={`text-xs font-semibold ${
                  scanResult.valid ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {scanResult.valid
                  ? 'ይህ ተሳፋሪ ተፈቅዶለታል፤ ወደ አውቶቡስ/ጉዞ ማለፍ ይችላል።'
                  : 'ይህ ትኬት በሲስተሙ ውስጥ አልተፈቀደም ወይም ልክ ያልሆነ ነው።'}
              </p>
            </div>

            {/* Passenger & Ticket Information */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  የትኬት ቁጥር (Ticket Code)
                </span>
                <span className="font-mono text-2xl font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  {scanResult.ticketCode}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">የተሳፋሪ ስም (Passenger Name)</p>
                  <p className="font-bold text-slate-900 text-base">{scanResult.passengerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">ስልክ ቁጥር (Phone Number)</p>
                  <p className="font-mono font-bold text-slate-900 text-base">{scanResult.passengerPhone}</p>
                </div>
              </div>

              {scanResult.journeyTitle && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">የጉዞ መዳረሻ</p>
                    <p className="font-semibold text-slate-800">{scanResult.journeyTitle}</p>
                  </div>
                </div>
              )}

              {scanResult.departureDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">የጉዞ ቀንና ሰዓት</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(scanResult.departureDate).toLocaleDateString()} {scanResult.departureTime ? `— ${scanResult.departureTime}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTON: RETURN TO SCANNER (NEVER LOGS OUT) */}
            <button
              id="return-to-scanner-btn"
              onClick={returnToScanner}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all shadow-lg flex items-center justify-center gap-2.5 ${
                scanResult.valid
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>ቀጣይ ትኬት ስካን አድርግ (Scan Next Ticket)</span>
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* CASE 2: ACTIVE SCANNER VIEW (When scanning or waiting)               */}
        {/* ==================================================================== */}
        {!scanResult && (
          <div className="space-y-5">
            {/* Loading spinner */}
            {loading && (
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center gap-3 text-amber-800 font-bold">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>የትኬት መረጃ በማረጋገጥ ላይ... (Verifying...)</span>
              </div>
            )}

            {/* Error Message */}
            {error && !loading && (
              <div className="p-5 bg-red-50 border-2 border-red-200 rounded-2xl text-center space-y-3 animate-in fade-in">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <p className="text-sm font-bold text-red-900">{error}</p>
                <button
                  onClick={returnToScanner}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> እንደገና ሞክር (Try Again)
                </button>
              </div>
            )}

            {/* Camera Permission or Init Error */}
            {cameraError && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-center space-y-3">
                <Camera className="w-10 h-10 text-amber-600 mx-auto" />
                <p className="text-xs text-amber-900 font-medium leading-relaxed">{cameraError}</p>
                <button
                  onClick={startScanner}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" /> ካሜራ እንደገና ይሞክሩ (Retry Camera)
                </button>
              </div>
            )}

            {/* LIVE CAMERA VIEWPORT */}
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-square w-full max-w-[340px] mx-auto shadow-inner flex items-center justify-center">
              {/* HTML5 QR Code Mount Node */}
              <div id="qr-reader" className="w-full h-full object-cover"></div>

              {/* Viewfinder Reticle Overlay */}
              {isScanning && !loading && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-amber-400/70 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                    {/* Animated Scanning Laser */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute top-0 animate-[bounce_2s_infinite]" />
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-slate-500 font-medium">
              💡 የጉዞ ትኬት QR ኮዱን በካሜራው ፊት ያቅርቡ። ካሜራው በራሱ ያነበዋል።
            </p>

            {/* MANUAL CODE ENTRY FALLBACK */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-600 mb-2">
                ወይም የትኬት ቁጥር በእጅ ያስገቡ (Or enter ticket code manually):
              </p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. 01, 02..."
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim() || loading}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Search className="w-3.5 h-3.5" /> አረጋግጥ
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TicketScanner;
