import api from './axios';

export const paymentApi = {
  submit: (bookingId: string, paymentMethod: string, referenceNumber: string, screenshot: File) => {
    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('paymentMethod', paymentMethod);
    formData.append('referenceNumber', referenceNumber);
    formData.append('screenshot', screenshot);
    return api.post('/payments/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getBookings: (status?: string, page?: number, limit: number = 500) =>
    api.get('/admin/bookings', { params: { status, page, limit } }),
  getUsers: () => api.get('/admin/users'),
  verifyPayment: (paymentId: string, action: 'APPROVE' | 'REJECT', rejectionReason?: string) =>
    api.patch(`/admin/payments/${paymentId}/verify`, { action, rejectionReason }),
  createJourney: (data: Record<string, string | number>) =>
    api.post('/admin/journeys', data),
  verifyTicket: (ticketCode: string) =>
    api.get(`/admin/tickets/verify/${ticketCode}`),
};
