import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Eye, X, Users, TrendingUp, Ticket, AlertCircle, UserX, Phone, Mail, Calendar } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/payment.api';
import TicketScanner from '../../components/TicketScanner';

interface Stats {
  totalUsers: number;
  totalBookings: number;
  pendingPayments: number;
  confirmedBookings: number;
  totalRevenue: number;
  ticketsIssued: number;
}

interface TicketData {
  id: string;
  ticketCode: string;
  status: string;
  qrCodeData: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  totalAmount: number;
  numberOfTickets: number;
  createdAt: string;
  user: { name: string; email: string; phone: string };
  journey: { title: string; journeyDate: string };
  passengers: { fullName: string; phone: string }[];
  payment?: { id: string; screenshotUrl: string; paymentMethod: string; referenceNumber?: string; status: string; rejectionReason?: string; amount: number };
  tickets?: TicketData[];
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  bookings: { id: string; status: string }[];
}

type Tab = 'overview' | 'pending' | 'approved' | 'users' | 'rejected' | 'scanner';

const AdminDashboard: React.FC = () => {
  const { isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/'); return; }
    loadData();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getBookings(),
        adminApi.getUsers(),
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data.bookings);
      setUsers(usersRes.data);
    } catch {}
    setLoading(false);
  };

  const handleVerify = async (paymentId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    try {
      await adminApi.verifyPayment(paymentId, action, action === 'REJECT' ? rejectReason : undefined);
      setActionMsg(action === 'APPROVE' ? '✓ Payment approved! Tickets generated.' : '✗ Payment rejected.');
      setSelectedBooking(null);
      setRejectReason('');
      await loadData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setActionMsg(e.response?.data?.message || 'Action failed');
    }
    setActionLoading(false);
    setTimeout(() => setActionMsg(''), 4000);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
    </div>
  );

  const pendingBookings = bookings.filter(b => b.status === 'PAYMENT_SUBMITTED');
  const approvedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const rejectedBookings = bookings.filter(b => b.status === 'REJECTED');
  const recentPending = pendingBookings.slice(0, 5);
  const regularUsers = users.filter(u => u.role !== 'ADMIN');
  const filteredUsers = regularUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const switchTab = (t: typeof tab) => { setTab(t); setSidebarOpen(false); };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white min-h-screen shadow-xl flex flex-col transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-black text-amber-500 tracking-wider">ADMIN</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white text-xl">✕</button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button onClick={() => switchTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === 'overview' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="text-xl">📊</span> Overview
          </button>
          <button onClick={() => switchTab('pending')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === 'pending' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="text-xl">⏳</span> Pending
            {pendingBookings.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingBookings.length}</span>}
          </button>
          <button onClick={() => switchTab('approved')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === 'approved' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="text-xl">✅</span> Approved
          </button>
          <button onClick={() => switchTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === 'users' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="text-xl">👥</span> All Users
            <span className="ml-auto bg-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">{regularUsers.length}</span>
          </button>
          <button onClick={() => switchTab('rejected')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === 'rejected' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="text-xl">❌</span> Rejected
            {rejectedBookings.length > 0 && <span className="ml-auto bg-slate-600 text-slate-200 text-xs font-bold px-2 py-0.5 rounded-full">{rejectedBookings.length}</span>}
          </button>
          <button onClick={() => switchTab('scanner')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === 'scanner' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="text-xl">📷</span> QR Scanner
          </button>
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all font-bold">
            <span className="text-xl">🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 bg-slate-900 text-white px-4 py-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-2xl font-bold text-amber-500 leading-none">☰</button>
          <span className="font-serif font-black text-amber-500 text-lg">ADMIN</span>
          <span className="ml-auto text-slate-400 text-sm font-semibold capitalize">{tab}</span>
        </div>
        <div className="p-4 sm:p-8">
        {actionMsg && (
          <div className={`mb-6 px-5 py-4 rounded-xl shadow-sm font-medium text-sm flex items-center gap-3 ${actionMsg.startsWith('✓') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {actionMsg.startsWith('✓') ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
            {actionMsg}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && stats && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <h2 className="text-3xl font-black text-slate-900 font-serif mb-6">Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-xs font-bold tracking-wider uppercase">Total Users</p>
                  <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
                <p className="text-4xl font-black text-slate-900">{stats.totalUsers ?? 0}</p>
                <p className="text-xs text-slate-400 font-medium">Registered customers</p>
              </div>
              <div className="bg-amber-50 p-5 sm:p-6 rounded-2xl shadow-sm border border-amber-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-amber-800 text-xs font-bold tracking-wider uppercase">Pending</p>
                  <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-4xl font-black text-amber-900">{stats.pendingPayments}</p>
                <p className="text-xs text-amber-600 font-medium">Awaiting review</p>
              </div>
              <div className="bg-emerald-50 p-5 sm:p-6 rounded-2xl shadow-sm border border-emerald-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-emerald-800 text-xs font-bold tracking-wider uppercase">Approved</p>
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <p className="text-4xl font-black text-emerald-900">{stats.confirmedBookings}</p>
                <p className="text-xs text-emerald-600 font-medium">Confirmed bookings</p>
              </div>
              <div className="bg-blue-50 p-5 sm:p-6 rounded-2xl shadow-sm border border-blue-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-blue-800 text-xs font-bold tracking-wider uppercase">Tickets</p>
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-4xl font-black text-blue-900">{stats.ticketsIssued || 0}</p>
                <p className="text-xs text-blue-600 font-medium">Issued tickets</p>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-500 p-6 sm:p-8 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-bold tracking-wider uppercase mb-2">Total Revenue</p>
                  <p className="text-4xl sm:text-5xl font-black">{(stats.totalRevenue || 0).toLocaleString()} <span className="text-2xl font-bold text-amber-200">ETB</span></p>
                  <p className="text-amber-200 text-sm mt-2 font-medium">From {stats.confirmedBookings} approved bookings</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" /> Recent Pending Payments
              </h3>
              {recentPending.length > 0 ? (
                <div className="space-y-3">
                  {recentPending.map(b => (
                    <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{b.user.name}</p>
                        <p className="text-slate-500 text-sm">{b.numberOfTickets} Ticket(s) - <span className="font-bold text-slate-700">{b.totalAmount} ETB</span></p>
                      </div>
                      <button onClick={() => { setTab('pending'); setSelectedBooking(b); }} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                        Review Now
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">No pending payments.</p>
              )}
            </div>
          </div>
        )}

        {/* SCANNER TAB */}
        {tab === 'scanner' && (
          <div className="animate-in fade-in duration-300">
            <TicketScanner />
          </div>
        )}

        {/* PENDING TAB */}
        {tab === 'pending' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-3xl font-black text-slate-900 font-serif mb-6 flex items-center gap-3">
              <span className="text-amber-500">⏳</span> Pending Payments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingBookings.map(b => (
                <div key={b.id} className="bg-white rounded-3xl shadow-sm border-2 border-amber-200 p-6 flex flex-col">
                  <div className="mb-4">
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">NEEDS REVIEW</span>
                    <h3 className="font-bold text-slate-900 text-xl">{b.user.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">{b.user.email}</p>
                    <p className="text-slate-500 text-sm">{b.user.phone}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl mb-6 text-sm border border-slate-100">
                    <p className="text-slate-500 mb-2 font-semibold uppercase tracking-wider text-xs">Payment Information</p>
                    <p className="text-slate-600 mb-1 flex justify-between">Method: <span className="font-bold text-slate-900">{b.payment?.paymentMethod || 'N/A'}</span></p>
                    <p className="text-slate-600 mb-1 flex justify-between">Amount: <span className="font-bold text-slate-900">{b.totalAmount} ETB</span></p>
                    <p className="text-slate-600 flex justify-between">Tickets: <span className="font-bold text-slate-900">{b.numberOfTickets}</span></p>
                  </div>
                  <div className="mt-auto">
                    <button onClick={() => setSelectedBooking(b)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md">
                      <Eye className="w-4 h-4" /> Review Screenshot
                    </button>
                  </div>
                </div>
              ))}
              {pendingBookings.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 border-dashed">
                  <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">All caught up! No pending payments.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* APPROVED TAB */}
        {tab === 'approved' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-3xl font-black text-slate-900 font-serif mb-6 flex items-center gap-3">
              <span className="text-emerald-500">✅</span> Approved Users
            </h2>
            <div className="space-y-6">
              {approvedBookings.map(b => (
                <div key={b.id} className="bg-white rounded-3xl shadow-sm border border-emerald-200 overflow-hidden">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-8">
                    
                    {/* User Info & Payment Info */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-2 tracking-wider uppercase">User Information</p>
                        <h3 className="font-black text-slate-900 text-2xl mb-2">{b.user.name}</h3>
                        <div className="flex flex-col gap-1 text-slate-600 font-medium text-sm">
                          <span className="flex items-center gap-2">📧 {b.user.email}</span>
                          <span className="flex items-center gap-2">📞 {b.user.phone}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 max-w-sm">
                        <p className="text-xs font-bold text-slate-400 mb-3 tracking-wider uppercase">Payment Information</p>
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 flex justify-between">Method: <span className="font-bold text-slate-900">{b.payment?.paymentMethod}</span></p>
                          <p className="text-sm text-slate-600 flex justify-between">Amount Paid: <span className="font-bold text-emerald-600">{b.totalAmount} ETB</span></p>
                          <p className="text-sm text-slate-600 flex justify-between">Tickets: <span className="font-bold text-slate-900">{b.numberOfTickets}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Tickets List (QR Codes & Numbers) */}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 mb-3 tracking-wider uppercase">Issued Tickets</p>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {b.tickets?.map((t, idx) => (
                          <div key={t.id} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl flex flex-col items-center text-center">
                            <p className="text-xs font-bold text-emerald-800 mb-2 tracking-wider">TICKET NUMBER</p>
                            <p className="text-3xl font-black font-mono text-slate-900 tracking-widest mb-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100">
                              {t.ticketCode}
                            </p>
                            
                            <div className="bg-white p-3 rounded-xl shadow-sm mb-4">
                              {t.qrCodeData ? (
                                <QRCodeSVG value={t.qrCodeData} size={80} />
                              ) : (
                                <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">No QR</div>
                              )}
                            </div>

                            <div className="w-full flex items-center justify-between mt-auto">
                              <div className="text-left">
                                <p className="text-xs text-slate-500">Passenger</p>
                                <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{b.passengers[idx]?.fullName}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-500 mb-1">Status</p>
                                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">{t.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {approvedBookings.length === 0 && (
                <div className="text-center bg-white rounded-3xl border border-slate-200 border-dashed text-slate-500 py-16">
                   <p className="text-lg font-medium">No approved users yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ALL USERS TAB */}
        {tab === 'users' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-3xl font-black text-slate-900 font-serif flex items-center gap-3">
                <span className="text-blue-500">👥</span> Registered Users
                <span className="text-lg bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">{regularUsers.length}</span>
              </h2>
              <div className="relative">
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name, email or phone..."
                  className="w-full sm:w-72 pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white shadow-sm"
                />
                {userSearch && (
                  <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-slate-900">{regularUsers.length}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Total Registered</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-emerald-800">
                  {regularUsers.filter(u => u.bookings.some(b => b.status === 'CONFIRMED')).length}
                </p>
                <p className="text-xs text-emerald-700 font-medium mt-1">With Approved Booking</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-slate-700">
                  {regularUsers.filter(u => u.bookings.length === 0).length}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">No Bookings Yet</p>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">#</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Name</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Email</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Phone</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Bookings</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Joined</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u, idx) => {
                      const hasApproved = u.bookings.some(b => b.status === 'CONFIRMED');
                      const hasPending = u.bookings.some(b => b.status === 'PAYMENT_SUBMITTED');
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-400 font-mono text-sm">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-900 text-sm">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">{u.email}</td>
                          <td className="px-6 py-4 text-slate-600 text-sm font-mono">{u.phone}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                              {u.bookings.length} booking{u.bookings.length !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm">{formatDate(u.createdAt)}</td>
                          <td className="px-6 py-4">
                            {hasApproved ? (
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">✓ Confirmed</span>
                            ) : hasPending ? (
                              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">⏳ Pending</span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full">No booking</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="py-16 text-center text-slate-500">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium">{userSearch ? 'No users match your search.' : 'No registered users yet.'}</p>
                  </div>
                )}
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-slate-100">
                {filteredUsers.map((u, idx) => {
                  const hasApproved = u.bookings.some(b => b.status === 'CONFIRMED');
                  const hasPending = u.bookings.some(b => b.status === 'PAYMENT_SUBMITTED');
                  return (
                    <div key={u.id} className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-slate-900 text-sm truncate">{idx + 1}. {u.name}</p>
                          {hasApproved ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">✓ Active</span>
                          ) : hasPending ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">Pending</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">No booking</span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-slate-400 text-xs flex items-center gap-1"><Ticket className="w-3 h-3" />{u.bookings.length} booking{u.bookings.length !== 1 ? 's' : ''}</span>
                          <span className="text-slate-400 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(u.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className="py-16 text-center text-slate-500">
                    <p className="font-medium">{userSearch ? 'No users match your search.' : 'No registered users yet.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REJECTED TAB */}
        {tab === 'rejected' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <h2 className="text-3xl font-black text-slate-900 font-serif flex items-center gap-3">
              <span className="text-red-500">❌</span> Rejected Bookings
              <span className="text-lg bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold">{rejectedBookings.length}</span>
            </h2>

            {rejectedBookings.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
                <UserX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-500">No rejected bookings.</p>
                <p className="text-sm text-slate-400 mt-1">All reviewed bookings have been approved.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rejectedBookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border-2 border-red-100 overflow-hidden shadow-sm">
                    <div className="bg-red-50 px-6 py-3 flex items-center justify-between border-b border-red-100">
                      <span className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> Payment Rejected
                      </span>
                      <span className="text-xs text-red-400 font-medium">{formatDate(b.createdAt)}</span>
                    </div>
                    <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {/* User info */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">User</p>
                        <p className="font-black text-slate-900 text-lg">{b.user.name}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" />{b.user.email}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5"><Phone className="w-3.5 h-3.5" />{b.user.phone}</p>
                      </div>

                      {/* Booking info */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Booking Details</p>
                        <p className="text-sm text-slate-700 mb-1"><span className="text-slate-400">Journey:</span> <span className="font-semibold">{b.journey?.title || 'N/A'}</span></p>
                        <p className="text-sm text-slate-700 mb-1"><span className="text-slate-400">Tickets:</span> <span className="font-semibold">{b.numberOfTickets}</span></p>
                        <p className="text-sm text-slate-700 mb-1"><span className="text-slate-400">Amount:</span> <span className="font-semibold text-red-600">{b.totalAmount} ETB</span></p>
                        <p className="text-sm text-slate-700"><span className="text-slate-400">Method:</span> <span className="font-semibold">{b.payment?.paymentMethod || 'N/A'}</span></p>
                      </div>

                      {/* Rejection reason */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rejection Reason</p>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <p className="text-sm text-red-800 font-medium leading-relaxed">
                            {b.payment?.rejectionReason || 'No reason provided'}
                          </p>
                        </div>
                        {b.passengers.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Passengers</p>
                            {b.passengers.map((p, i) => (
                              <p key={i} className="text-xs text-slate-600 font-medium">• {p.fullName}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* REVIEW MODAL FOR PENDING */}
      {selectedBooking && tab === 'pending' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between z-10 rounded-t-3xl">
              <h2 className="text-2xl font-black text-slate-900 font-serif">Review Payment</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">User Information</p>
                  <p className="font-black text-slate-900 text-lg mb-1">{selectedBooking.user.name}</p>
                  <p className="text-sm text-slate-600 font-medium">{selectedBooking.user.phone}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Payment Information</p>
                  <p className="font-black text-emerald-600 text-xl mb-1">{selectedBooking.totalAmount} ETB</p>
                  <p className="text-sm text-slate-600 font-medium">Method: {selectedBooking.payment?.paymentMethod}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Payment Screenshot</p>
                <div className="bg-slate-100 rounded-3xl border-4 border-slate-50 overflow-hidden flex items-center justify-center relative min-h-[250px] sm:min-h-[350px]">
                  {selectedBooking.payment?.screenshotUrl ? (
                    <img 
                      src={selectedBooking.payment.screenshotUrl}
                      alt="Proof of payment" 
                      className="max-w-full max-h-[60vh] object-contain rounded-2xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<p class="text-slate-500 font-medium p-8 text-center">Screenshot could not be loaded</p>';
                      }}
                    />
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-slate-400 text-4xl mb-3">🖼️</p>
                      <p className="text-slate-500 font-medium">No screenshot provided</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  onClick={() => handleVerify(selectedBooking.payment!.id, 'APPROVE')}
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-lg transition-all"
                >
                  {actionLoading ? <span className="w-6 h-6 border-4 border-white/40 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="w-6 h-6" /> Approve & Generate Ticket(s)</>}
                </button>
                
                <div className="bg-red-50 p-5 rounded-2xl border-2 border-red-100">
                  <p className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wider">Reject Payment</p>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (e.g. Screenshot blurry, Amount incorrect)"
                    className="w-full px-5 py-3.5 rounded-xl border border-red-200 mb-4 text-sm focus:ring-4 focus:ring-red-100 focus:border-red-400 font-medium focus:outline-none"
                  />
                  <button
                    onClick={() => { if (!rejectReason.trim()) return; handleVerify(selectedBooking.payment!.id, 'REJECT'); }}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="w-full bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border-2 border-red-200 disabled:opacity-50 font-black py-3.5 rounded-xl text-sm transition-all shadow-sm"
                  >
                    Reject Payment
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default AdminDashboard;
