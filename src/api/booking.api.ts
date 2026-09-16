import api from './axios';

export interface Passenger {
  fullName: string;
  phone: string;
  email?: string;
}

export const bookingApi = {
  create: (journeyId: string, passengers: Passenger[]) =>
    api.post('/bookings', { journeyId, passengers }),
  getMyBookings: () => api.get('/bookings/mine'),
  getById: (id: string) => api.get(`/bookings/${id}`),
};

export const journeyApi = {
  getActive: () => api.get('/journeys'),
};
