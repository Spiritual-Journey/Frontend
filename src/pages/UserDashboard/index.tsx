import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Ticket,
  User,
  Phone,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingApi, journeyApi, type Passenger } from '../../api/booking.api';
import { QRCodeSVG } from 'qrcode.react';

interface Journey {
  id: string;
  title: string;
  destination: string;
  departureLocation: string;
  journeyDate: string;
  departureTime: string;
  price: number;
  availableCapacity: number;
  spiritualPurpose: string;
}

type BookingStatus = 'PENDING' | 'PAYMENT_SUBMITTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

interface Booking {
  id: string;
  bookingNumber: string;
  numberOfTickets: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  journey: {
    title: string;
    journeyDate: string;
    departureTime: string;
    destination: string;
    departureLocation: string;
  };
  passengers: { id: string; fullName: string; phone: string; email?: string }[];
  payment?: {
    screenshotUrl: string;
    paymentMethod: string;
    referenceNumber?: string;
    status: string;
    rejectionReason?: string;
  };
  tickets?: { ticketCode: string; status: string; id: string; qrCodeData?: string }[];
}

const emptyPassenger = (defaultName = '', defaultPhone = ''): Passenger => ({
  fullName: defaultName,
  phone: defaultPhone,
  email: '',
});

const UserDashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Booking Form State
  const [showBookingForm, setShowBookingForm] = useState(searchParams.get('book') === 'true');
  const [passengers, setPassengers] = useState<Passenger[]>([emptyPassenger()]);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Set initial passenger name from user profile
    if (user?.name) {
      setPassengers([emptyPassenger(user.name, '')]);
    }

    Promise.all([
      bookingApi.getMyBookings().then((res) => setBookings(res.data)).catch(() => {}),
      journeyApi.getActive().then((res) => {
        if (res.data && res.data.length > 0) {
          setJourney(res.data[0]);
        }
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [isAuthenticated, navigate, user]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(key);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addPassenger = () => {
    setPassengers((prev) => [...prev, emptyPassenger()]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journey) return;

    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].fullName.trim() || !passengers[i].phone.trim()) {
        setError(`እባክዎ የተሳፋሪ ${i + 1} ሙሉ ስም እና ስልክ ቁጥር ያስገቡ። (Please fill name and phone for passenger ${i + 1})`);
        return;
      }
    }

    setBookingLoading(true);
    setError('');

    try {
      const res = await bookingApi.create(journey.id, passengers);
      setSuccessMsg('ትኬትዎ ተመዝግቧል! አሁን ደረጃ 2ን በመከተል የክፍያ ስክሪንሾት ይላኩ። (Booking created! Please follow Step 2 to upload payment screenshot.)');
      setShowBookingForm(false);
      // Refresh bookings
      const updated = await bookingApi.getMyBookings();
      setBookings(updated.data);
      // Navigate to payment for this new booking
      navigate(`/submit-payment/${res.data.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'ቦታ ማስያዝ አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  const unitPrice = journey?.price || 250;
  const totalPrice = unitPrice * passengers.length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> User Dashboard
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
                እንኳን ደህና መጡ፣ {user?.name || 'መንገደኛ'}!
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                የመንፈሳዊ ጉዞ ትኬትዎን ያስይዙ፣ ክፍያዎን ይፈጽሙ እና የትኬት ቁጥርዎን ይቀበሉ።
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <ShieldCheck className="w-4 h-4" /> የአድሚን ገጽ (Admin)
                </Link>
              )}
              <button
                onClick={() => setShowBookingForm(!showBookingForm)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Ticket className="w-4 h-4" /> {showBookingForm ? 'ቅጹን ዝጋ (Close)' : 'አዲስ ትኬት ይቁረጡ (Book)'}
              </button>
            </div>
          </div>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl text-sm flex items-center gap-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 🌟 3-STEP INSTRUCTION GUIDE (Requested Feature)                      */}
        {/* ==================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="text-center sm:text-left mb-6">
            <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">የአሰራር ቅደም ተከተል</span>
            <h2 className="text-2xl font-serif font-black text-slate-900 mt-1">
              ትኬት ለመቀበል የሚያልፏቸው 3 ቀላል ደረጃዎች
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Follow these 3 easy steps to complete your booking and receive your official ticket number
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* STEP 1: Pay First */}
            <div className="relative rounded-2xl p-6 border-2 border-amber-200 bg-amber-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                    1
                  </span>
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">ደረጃ 1፡ ክፍያ ይፈጽሙ</h3>
                <p className="text-amber-800 text-xs font-semibold mb-3">Pay First (250 ብር per ticket)</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  በቴሌብር ወይም በንግድ ባንክ ትኬቱን ይክፈሉ። ለእያንዳንዱ ተሳፋሪ 250 ብር ነው።
                </p>

                {/* Account details */}
                <div className="space-y-2 bg-white rounded-xl p-3 border border-amber-100 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block">Telebirr:</span>
                      <span className="font-bold text-slate-900 text-sm">0942027483</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('0942027483', 'telebirr')}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                      title="Copy Telebirr"
                    >
                      {copiedAccount === 'telebirr' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block">CBE (ንግድ ባንክ):</span>
                      <span className="font-bold text-slate-900 text-sm">1000748442379</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('1000748442379', 'cbe')}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                      title="Copy CBE"
                    >
                      {copiedAccount === 'cbe' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Upload Screenshot */}
            <div className="relative rounded-2xl p-6 border-2 border-blue-200 bg-blue-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                    2
                  </span>
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">ደረጃ 2፡ ስክሪንሾት ይላኩ</h3>
                <p className="text-blue-800 text-xs font-semibold mb-3">Upload Payment Screenshot</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  ክፍያ ሲፈጽሙ የደረሰኝ ስክሪንሾት ያንሱ። ከታች ባለው የቦታ ማስያዣ ዝርዝር ውስጥ <strong>«ክፍያ ያስረክቡ (Submit Payment)»</strong> የሚለውን በመጫን ምስሉን ይላኩ።
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>ስክሪንሾቱን ከላኩ በኋላ ሁኔታው «በማረጋገጥ ላይ» ይሆናል።</span>
              </div>
            </div>

            {/* STEP 3: Admin Approval & Ticket Code */}
            <div className="relative rounded-2xl p-6 border-2 border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                    3
                  </span>
                  <Ticket className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">ደረጃ 3፡ የትኬት ቁጥር ይቀበሉ</h3>
                <p className="text-emerald-800 text-xs font-semibold mb-3">Admin Approval & Ticket Code</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  አድሚኑ የከፈሉትን ስክሪንሾት ገምግሞ ሲያረጋግጥ (Approve)፣ ትኬትዎ ይረጋገጣል! ይፋዊ <strong>የትኬት ኮድና ቁጥር (Ticket Code)</strong> በዳሽቦርድዎ ላይ ወዲያውኑ ይገለጻል።
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-emerald-100 text-xs text-emerald-900 flex items-center gap-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>ትኬቱን በስልክዎ ይዘው ለጉዞው ቀን ያቀርባሉ!</span>
              </div>
            </div>

          </div>
        </div>

        {/* ==================================================================== */}
        {/* BOOKING FORM SECTION (Can be opened / closed)                       */}
        {/* ==================================================================== */}
        {showBookingForm && journey && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-300 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-serif font-black text-slate-900">አዲስ ትኬት ይቁረጡ (Book Ticket)</h2>
                <p className="text-slate-500 text-sm">{journey.title} — {unitPrice} ብር በአንድ ሰው</p>
              </div>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Journey Highlights */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">መድረሻ (Destination)</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> {journey.destination}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">የጉዞ ቀን (Date)</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> {new Date(journey.journeyDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">የመነሻ ሰዓት (Time)</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> {journey.departureTime}
                </span>
              </div>

            </div>

            <form onSubmit={handleCreateBooking} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">የተሳፋሪዎች ዝርዝር (Passengers)</h3>
                  <button
                    type="button"
                    onClick={addPassenger}
                    className="text-amber-600 hover:text-amber-700 font-semibold text-xs flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> ተሳፋሪ ጨምር (Add Passenger)
                  </button>
                </div>

                {passengers.map((p, idx) => (
                  <div key={idx} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                        ተሳፋሪ {idx + 1}
                      </span>
                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePassenger(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">ሙሉ ስም (Full Name) *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={p.fullName}
                            onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)}
                            placeholder="የተሳፋሪው ሙሉ ስም"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">ስልክ ቁጥር (Phone) *</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            value={p.phone}
                            onChange={(e) => handlePassengerChange(idx, 'phone', e.target.value)}
                            placeholder="09xxxxxxxx"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price summary & submit */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs text-amber-800">ድምር ክፍያ ({passengers.length} ተሳፋሪ x {unitPrice} ብር)</span>
                  <p className="text-2xl font-black text-amber-950 font-mono">{totalPrice} ብር (ETB)</p>
                </div>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  {bookingLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>ቦታ ይያዙና ስክሪንሾት ይላኩ (Proceed to Step 2)</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MY BOOKINGS & TICKETS SECTION                                       */}
        {/* ==================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-black text-slate-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-600" /> የእኔ ትኬቶችና የተያዙ ቦታዎች (My Bookings & Tickets)
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {bookings.length} ተመዝግቧል
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">እስካሁን ምንም ትኬት አላስያዙም</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                ለመስከረም 10 ወደ ቤዛዊተ ማርያም ገዳም ለሚደረገው መንፈሳዊ ጉዞ አሁኑኑ ቦታዎን ያስይዙ።
              </p>
              <button
                onClick={() => setShowBookingForm(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> አሁን ትኬት ያስይዙ (Book Ticket Now)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isConfirmed = booking.status === 'CONFIRMED';
                const isPendingPayment = booking.status === 'PENDING';
                const isUnderReview = booking.status === 'PAYMENT_SUBMITTED';
                const isRejected = booking.status === 'REJECTED';

                return (
                  <div
                    key={booking.id}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-sm ${
                      isConfirmed
                        ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                        : isUnderReview
                        ? 'border-blue-200'
                        : isRejected
                        ? 'border-red-200'
                        : 'border-amber-200'
                    }`}
                  >
                    {/* Top status banner */}
                    <div
                      className={`px-4 sm:px-6 py-3 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-800'
                          : isUnderReview
                          ? 'bg-blue-50 text-blue-800'
                          : isRejected
                          ? 'bg-red-50 text-red-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isConfirmed && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isUnderReview && <Clock className="w-4 h-4 text-blue-600 shrink-0" />}
                        {isPendingPayment && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                        {isRejected && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                        <span>
                          {isConfirmed && 'ትኬቱ ተረጋግጧል (Confirmed & Ticket Issued)'}
                          {isUnderReview && 'የክፍያ ስክሪንሾት ተልኳል — በአድሚን በመረጋገጥ ላይ (Pending Admin Approval)'}
                          {isPendingPayment && 'ክፍያ በመጠባበቅ ላይ — እባክዎ ስክሪንሾት ይላኩ (Payment Proof Needed)'}
                          {isRejected && 'ክፍያው ውድቅ ተደርጓል (Payment Rejected)'}
                        </span>
                      </div>
                      <span className="font-mono text-slate-500 shrink-0 text-right">#{booking.bookingNumber}</span>
                    </div>

                    <div className="p-4 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-xl font-serif font-black text-slate-900 mb-1">
                            {booking.journey?.title || 'መንፈሳዊ ጉዞ'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-600" />
                              {booking.journey?.destination}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-600" />
                              {new Date(booking.journey?.journeyDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              {booking.journey?.departureTime}
                            </span>
                            <span className="font-bold text-slate-800 font-mono">
                              {booking.numberOfTickets} ተሳፋሪ(ዎች) — {booking.totalAmount} ብር
                            </span>
                          </div>
                        </div>

                        {/* Action buttons based on status */}
                        <div>
                          {isPendingPayment && (
                            <Link
                              to={`/submit-payment/${booking.id}`}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
                            >
                              <Upload className="w-4 h-4" /> ስክሪንሾት ያስረክቡ (Submit Payment)
                            </Link>
                          )}
                          {isRejected && (
                            <Link
                              to={`/submit-payment/${booking.id}`}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
                            >
                              <Upload className="w-4 h-4" /> እንደገና ስክሪንሾት ላክ (Re-upload)
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* TICKET CODE DISPLAY (Crucial: Shows once approved!) */}
                      {isConfirmed && booking.tickets && booking.tickets.length > 0 && (
                        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                              <Sparkles className="w-4 h-4 text-emerald-600" />
                              <span>ይፋዊ የትኬት ቁጥር / Official Ticket Codes:</span>
                            </div>
                            <span className="text-xs bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                              ተረጋግጧል ✓
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {booking.tickets.map((t, idx) => (
                              <div
                                key={t.id || idx}
                                className="bg-white p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4"
                              >
                                {t.qrCodeData && (
                                  <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm shrink-0">
                                    <QRCodeSVG value={t.qrCodeData} size={100} />
                                  </div>
                                )}
                                <div className="text-center sm:text-left flex-1">
                                  <span className="text-xs text-slate-400 block mb-1">ተሳፋሪ {idx + 1} ትኬት ቁጥር</span>
                                  <span className="font-mono text-2xl font-black text-slate-900 tracking-wider">
                                    {t.ticketCode}
                                  </span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(t.ticketCode, t.ticketCode)}
                                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center shrink-0"
                                  title="Copy Code"
                                >
                                  {copiedAccount === t.ticketCode ? (
                                    <Check className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-emerald-800 mt-3 font-medium">
                            💡 ይህንን የትኬት ቁጥር በጉዞው ቀን ለአስተባባሪዎች ያሳዩ።
                          </p>
                        </div>
                      )}

                      {/* Under Review Notice */}
                      {isUnderReview && (
                        <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
                          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold mb-1">ክፍያዎ በአድሚኑ በመገምገም ላይ ነው (Waiting for Admin Approval)</p>
                            <p className="text-blue-700 leading-relaxed">
                              የላኩት የስክሪንሾት ማስረጃ በአድሚን እንደተረጋገጠ የትኬት ቁጥርዎ እዚህ ገጽ ላይ ወዲያውኑ ይገለጻል። እባክዎ ጥቂት ጊዜ ይጠብቁ።
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Passengers List */}
                      <div className="mt-5 pt-5 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          የተሳፋሪዎች ስም (Passenger Details)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {booking.passengers?.map((p, pIdx) => (
                            <div key={p.id || pIdx} className="bg-slate-50 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold text-slate-800">{p.fullName}</span>
                              <span className="text-slate-400 font-mono">({p.phone})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
