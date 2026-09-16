import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, User, Phone, Mail, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingApi, journeyApi, type Passenger } from '../../api/booking.api';

interface Journey {
  id: string;
  title: string;
  destination: string;
  departureLocation: string;
  journeyDate: string;
  departureTime: string;
  price: number;
  availableCapacity: number;
}

const emptyPassenger = (): Passenger => ({ fullName: '', phone: '', email: '' });

const BookTicket: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([emptyPassenger()]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    journeyApi.getActive().then((res) => {
      if (res.data.length > 0) setJourney(res.data[0]);
    }).catch(() => setError('Could not load journey info')).finally(() => setFetching(false));
  }, [isAuthenticated, navigate]);

  const updatePassenger = (idx: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[idx] = { ...updated[idx], [field]: value };
    setPassengers(updated);
  };

  const addPassenger = () => {
    if (!journey) return;
    if (passengers.length >= journey.availableCapacity) return;
    setPassengers([...passengers, emptyPassenger()]);
  };

  const removePassenger = (idx: number) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journey) return;
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.create(journey.id, passengers);
      navigate(`/my-bookings?booked=${res.data.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif font-black text-primary-900 mb-2">ትኬት ይግዙ</h1>
        <p className="text-primary-500 mb-8">Book your spot for the spiritual journey</p>

        {/* Journey Info Card */}
        {journey && (
          <div className="bg-primary-900 text-white rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent rounded-bl-full opacity-10" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-accent font-semibold text-sm mb-1">UPCOMING JOURNEY</p>
                <h2 className="text-xl font-bold font-serif mb-4">{journey.title}</h2>
                <div className="space-y-1 text-primary-200 text-sm">
                  <p>📍 {journey.departureLocation} → {journey.destination}</p>
                  <p>📅 {new Date(journey.journeyDate).toLocaleDateString('am-ET', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p>⏰ {journey.departureTime}</p>
                  <p>💺 {journey.availableCapacity} seats available</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-accent">{journey.price}</p>
                <p className="text-primary-300 text-sm">ብር / person</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">⚠ {error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {passengers.map((p, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-primary-900 flex items-center gap-2">
                  <span className="w-7 h-7 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-black">{idx + 1}</span>
                  Passenger {idx + 1}
                </h3>
                {idx > 0 && (
                  <button type="button" onClick={() => removePassenger(idx)}
                    className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                    <input required value={p.fullName} onChange={(e) => updatePassenger(idx, 'fullName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent text-primary-900"
                      placeholder="Passenger full name" id={`passenger-name-${idx}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-1.5">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                    <input required value={p.phone} onChange={(e) => updatePassenger(idx, 'phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent text-primary-900"
                      placeholder="09xxxxxxxx" id={`passenger-phone-${idx}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-1.5">Email (optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                    <input value={p.email} onChange={(e) => updatePassenger(idx, 'email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent text-primary-900"
                      placeholder="optional@email.com" id={`passenger-email-${idx}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {journey && passengers.length < journey.availableCapacity && (
            <button type="button" onClick={addPassenger}
              className="w-full border-2 border-dashed border-primary-200 hover:border-accent text-primary-500 hover:text-accent py-4 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Another Passenger
            </button>
          )}

          {/* Summary */}
          {journey && (
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-primary-700 font-medium">{passengers.length} Passenger{passengers.length > 1 ? 's' : ''}</p>
                  <p className="text-primary-500 text-sm">× {journey.price} ብር each</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary-900">{(journey.price * passengers.length).toLocaleString()} ብር</p>
                  <p className="text-primary-500 text-sm">Total amount</p>
                </div>
              </div>
            </div>
          )}

          <button id="book-submit" type="submit" disabled={loading || !journey}
            className="w-full bg-primary-800 hover:bg-primary-900 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3">
            {loading
              ? <span className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Ticket className="w-5 h-5" /> ትኬት ይያዙ (Book Now) <ChevronRight className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookTicket;
