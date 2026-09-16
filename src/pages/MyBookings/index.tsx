import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Ticket, CheckCircle, Clock, XCircle, AlertCircle, Upload, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../api/booking.api';

type BookingStatus = 'PENDING' | 'PAYMENT_SUBMITTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

interface Booking {
  id: string;
  bookingNumber: string;
  numberOfTickets: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  journey: { title: string; journeyDate: string; destination: string; departureLocation: string };
  passengers: { id: string; fullName: string; phone: string }[];
  payment?: { screenshotUrl: string; paymentMethod: string; status: string; rejectionReason?: string };
  tickets?: { ticketCode: string; status: string }[];
}

const statusConfig: Record<BookingStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  PENDING: { icon: <Clock className="w-4 h-4" />, label: 'Pending Payment', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  PAYMENT_SUBMITTED: { icon: <AlertCircle className="w-4 h-4" />, label: 'Payment Under Review', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  CONFIRMED: { icon: <CheckCircle className="w-4 h-4" />, label: 'Confirmed ✓', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  REJECTED: { icon: <XCircle className="w-4 h-4" />, label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  CANCELLED: { icon: <XCircle className="w-4 h-4" />, label: 'Cancelled', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
};

const MyBookings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(searchParams.get('booked'));

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    bookingApi.getMyBookings()
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-black text-primary-900">የእኔ ቦቺቦ</h1>
            <p className="text-primary-500 mt-1">My Bookings</p>
          </div>
          <Link to="/book-ticket"
            className="bg-primary-800 hover:bg-primary-900 text-white px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all shadow-md">
            <Ticket className="w-4 h-4" /> New Booking
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-primary-100">
            <Ticket className="w-16 h-16 text-primary-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary-700 mb-2">No bookings yet</h2>
            <p className="text-primary-400 mb-6">Book your spot for the spiritual journey</p>
            <Link to="/book-ticket" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full font-semibold transition-all">
              Book a Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const sc = statusConfig[b.status];
              const isExpanded = expanded === b.id;
              return (
                <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden">
                  {/* Header */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-primary-400">{b.bookingNumber}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sc.bg} ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-primary-900">{b.journey.title}</h3>
                      <p className="text-primary-500 text-sm mt-0.5">
                        📅 {new Date(b.journey.journeyDate).toLocaleDateString()} · {b.numberOfTickets} ticket{b.numberOfTickets > 1 ? 's' : ''} · <strong className="text-primary-800">{b.totalAmount} ብር</strong>
                      </p>
                    </div>
                    <button onClick={() => setExpanded(isExpanded ? null : b.id)}
                      className="text-primary-500 hover:text-primary-800 text-sm font-medium flex items-center gap-1 transition-colors">
                      <Eye className="w-4 h-4" /> {isExpanded ? 'Hide' : 'View'} Details
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-primary-100 p-5 space-y-5">
                      {/* Rejection notice */}
                      {b.status === 'REJECTED' && b.payment?.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                          <p className="font-semibold mb-1">Rejection Reason:</p>
                          <p>{b.payment.rejectionReason}</p>
                        </div>
                      )}

                      {/* Passengers */}
                      <div>
                        <h4 className="font-semibold text-primary-800 mb-3">Passengers</h4>
                        <div className="space-y-2">
                          {b.passengers.map((p, idx) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                              <span className="w-7 h-7 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-black">{idx + 1}</span>
                              <div>
                                <p className="font-medium text-primary-900 text-sm">{p.fullName}</p>
                                <p className="text-primary-400 text-xs">{p.phone}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tickets (if confirmed) */}
                      {b.status === 'CONFIRMED' && b.tickets && b.tickets.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-primary-800 mb-3">Your Tickets 🎟️</h4>
                          <div className="space-y-2">
                            {b.tickets.map((t) => (
                              <div key={t.ticketCode} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                                <span className="font-mono text-sm font-bold text-green-800">{t.ticketCode}</span>
                                <span className="text-xs text-green-600 font-semibold">{t.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment Screenshot */}
                      {b.payment && (
                        <div>
                          <h4 className="font-semibold text-primary-800 mb-3">Payment Screenshot</h4>
                          <img src={`http://localhost:5000${b.payment.screenshotUrl}`} alt="Payment" className="rounded-xl border border-primary-200 max-h-48 object-contain" />
                        </div>
                      )}

                      {/* Submit Payment CTA */}
                      {b.status === 'PENDING' && (
                        <Link to={`/submit-payment/${b.id}`}
                          className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md">
                          <Upload className="w-4 h-4" /> Submit Payment Screenshot
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
