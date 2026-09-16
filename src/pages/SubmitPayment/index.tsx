import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Image, CheckCircle, CreditCard } from 'lucide-react';
import { paymentApi } from '../../api/payment.api';

const PAYMENT_METHODS = [
  { id: 'telebirr', label: 'Telebirr', number: '0942027483', name: 'Rahel Brhane' },
  { id: 'cbe', label: 'CBE (ንግድ ባንክ)', number: '1000748442379', name: 'Rahel Brhane' },
];

const SubmitPayment: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !bookingId) return;
    setLoading(true);
    setError('');
    try {
      await paymentApi.submit(bookingId, method, reference, file);
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-serif font-black text-primary-900 mb-2">Payment Submitted!</h1>
        <p className="text-primary-500 mb-2">Your payment screenshot has been submitted for review.</p>
        <p className="text-primary-400 text-sm">Redirecting to My Bookings…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-serif font-black text-primary-900 mb-2">ክፍያ ያስረክቡ</h1>
        <p className="text-primary-500 mb-8">Submit your payment proof</p>

        {/* Payment instructions */}
        <div className="bg-primary-900 text-white rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-bl-full opacity-10" />
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent" /> Pay to one of these accounts
          </h2>
          <div className="space-y-4">
            {PAYMENT_METHODS.map((m) => (
              <div key={m.id} className="bg-white/10 rounded-xl p-4">
                <p className="text-accent font-semibold text-sm mb-1">{m.label}</p>
                <p className="font-mono text-xl font-bold">{m.number}</p>
                <p className="text-primary-300 text-sm">Account: {m.name}</p>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">⚠ {error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100">
            <label className="block font-semibold text-primary-800 mb-3">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                  className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${method === m.id ? 'border-accent bg-accent/10 text-accent-hover' : 'border-primary-200 text-primary-500 hover:border-primary-400'}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Number */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100">
            <label className="block font-semibold text-primary-800 mb-3">Transaction Reference (optional)</label>
            <input
              id="payment-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3 border border-primary-200 rounded-xl bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent text-primary-900"
              placeholder="e.g. TXN123456789"
            />
          </div>

          {/* Screenshot Upload */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100">
            <label className="block font-semibold text-primary-800 mb-3">Payment Screenshot *</label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-primary-200 hover:border-accent rounded-xl p-8 text-center cursor-pointer transition-colors group"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-accent/10 transition-colors">
                    <Image className="w-7 h-7 text-primary-400 group-hover:text-accent" />
                  </div>
                  <p className="text-primary-600 font-medium">Click or drag & drop your screenshot</p>
                  <p className="text-primary-400 text-sm">PNG, JPG, WEBP — max 5MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} id="payment-screenshot" />
            {file && <p className="text-primary-500 text-sm mt-2 text-center">📎 {file.name}</p>}
          </div>

          <button id="payment-submit" type="submit" disabled={!file || loading}
            className="w-full bg-primary-800 hover:bg-primary-900 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3">
            {loading
              ? <span className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Upload className="w-5 h-5" /> ስሌይድ (Submit Payment)</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitPayment;
