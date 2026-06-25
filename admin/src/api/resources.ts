import { api } from './client';
import type {
  Ad,
  AdminUser,
  Announcement,
  AuthUser,
  Block,
  Business,
  BusTrip,
  District,
  EmergencyContact,
  ServiceProvider,
  Taxi,
  Village,
} from '../types';

type Query = Record<string, string | number | boolean | undefined>;

/* ---------- Auth ---------- */
export const authApi = {
  login: (phone: string, password: string) =>
    api<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: { phone, password },
    }),
  me: () => api<AuthUser>('/auth/me'),
};

/* ---------- Users / Local admins (super admin) ---------- */
export const userApi = {
  listAdmins: (village?: string) =>
    api<AdminUser[]>('/users', { query: { village } }),
  createLocalAdmin: (body: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    village: string;
  }) => api<AdminUser>('/users/local-admins', { method: 'POST', body }),
  updateLocalAdmin: (
    id: string,
    body: { name?: string; password?: string; isActive?: boolean }
  ) => api<AdminUser>(`/users/local-admins/${id}`, { method: 'PUT', body }),
};

/* ---------- Locations ---------- */
export const locationApi = {
  listDistricts: () => api<District[]>('/locations/districts'),
  createDistrict: (body: Partial<District>) =>
    api<District>('/locations/districts', { method: 'POST', body }),
  listBlocks: (district?: string) =>
    api<Block[]>('/locations/blocks', { query: { district } }),
  createBlock: (body: Partial<Block>) =>
    api<Block>('/locations/blocks', { method: 'POST', body }),
  listVillages: (block?: string) =>
    api<Village[]>('/locations/villages', { query: { block } }),
  createVillage: (body: { name: string; nameMl?: string; block: string }) =>
    api<Village>('/locations/villages', { method: 'POST', body }),
  getVillage: (id: string) => api<Village & { heroImage?: string }>(`/locations/villages/${id}`),
  updateVillage: (id: string, body: { heroImage?: string; name?: string; nameMl?: string }) =>
    api<Village>(`/locations/villages/${id}`, { method: 'PUT', body }),
};

/* ---------- Taxis ---------- */
export const taxiApi = {
  list: (query: Query) => api<Taxi[]>('/taxis', { query }),
  create: (body: Partial<Taxi>) => api<Taxi>('/taxis', { method: 'POST', body }),
  update: (id: string, body: Partial<Taxi>) =>
    api<Taxi>(`/taxis/${id}`, { method: 'PUT', body }),
  remove: (id: string) => api<{ id: string }>(`/taxis/${id}`, { method: 'DELETE' }),
};

/* ---------- Bus trips ---------- */
export const busTripApi = {
  list: (query: Query) => api<BusTrip[]>('/bus-trips', { query }),
  create: (body: Partial<BusTrip>) => api<BusTrip>('/bus-trips', { method: 'POST', body }),
  update: (id: string, body: Partial<BusTrip>) =>
    api<BusTrip>(`/bus-trips/${id}`, { method: 'PUT', body }),
  remove: (id: string) => api<{ id: string }>(`/bus-trips/${id}`, { method: 'DELETE' }),
};

/* ---------- Ads ---------- */
export const adApi = {
  list: (status?: string) => api<Ad[]>('/ads', { query: { status } }),
  create: (body: Partial<Ad> & { village?: string }) =>
    api<Ad>('/ads', { method: 'POST', body }),
  review: (id: string, body: { status?: string; isActive?: boolean }) =>
    api<Ad>(`/ads/${id}/review`, { method: 'PUT', body }),
  remove: (id: string) => api<{ id: string }>(`/ads/${id}`, { method: 'DELETE' }),
};

/* ---------- Businesses ---------- */
export const businessApi = {
  list: (query: Query) => api<Business[]>('/businesses', { query }),
  create: (body: Partial<Business>) =>
    api<Business>('/businesses', { method: 'POST', body }),
  update: (id: string, body: Partial<Business>) =>
    api<Business>(`/businesses/${id}`, { method: 'PUT', body }),
  remove: (id: string) =>
    api<{ id: string }>(`/businesses/${id}`, { method: 'DELETE' }),
};

/* ---------- Service providers ---------- */
export const providerApi = {
  list: (query: Query) => api<ServiceProvider[]>('/service-providers', { query }),
  create: (body: Partial<ServiceProvider>) =>
    api<ServiceProvider>('/service-providers', { method: 'POST', body }),
  update: (id: string, body: Partial<ServiceProvider>) =>
    api<ServiceProvider>(`/service-providers/${id}`, { method: 'PUT', body }),
  remove: (id: string) =>
    api<{ id: string }>(`/service-providers/${id}`, { method: 'DELETE' }),
};

/* ---------- Emergency contacts ---------- */
export const emergencyApi = {
  list: (query: Query) => api<EmergencyContact[]>('/emergency-contacts', { query }),
  create: (body: Partial<EmergencyContact>) =>
    api<EmergencyContact>('/emergency-contacts', { method: 'POST', body }),
  update: (id: string, body: Partial<EmergencyContact>) =>
    api<EmergencyContact>(`/emergency-contacts/${id}`, { method: 'PUT', body }),
  remove: (id: string) =>
    api<{ id: string }>(`/emergency-contacts/${id}`, { method: 'DELETE' }),
};

/* ---------- Announcements ---------- */
export const announcementApi = {
  list: (query: Query) => api<Announcement[]>('/announcements', { query }),
  create: (body: Partial<Announcement>) =>
    api<Announcement>('/announcements', { method: 'POST', body }),
  update: (id: string, body: Partial<Announcement>) =>
    api<Announcement>(`/announcements/${id}`, { method: 'PUT', body }),
  remove: (id: string) =>
    api<{ id: string }>(`/announcements/${id}`, { method: 'DELETE' }),
};
