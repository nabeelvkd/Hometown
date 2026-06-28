import { apiGet, apiPost } from './client';
import { prettyLabel, timeAgo } from '../lib/labels';
import {
  DEFAULT_CATEGORIES,
  type Announcement,
  type Business,
  type BusTrip,
  type CategoryEntryItem,
  type EmergencyContact,
  type HomeCategoryItem,
  type ServiceProvider,
  type Taxi,
} from '../data/mock';

export interface AdBannerItem {
  id: string;
  title: string;
  subtitle?: string;
  cta?: string;
  ctaUrl?: string;
  image?: string;
}

export interface LocationOption {
  _id: string;
  name: string;
  nameMl?: string;
}

export interface SearchResults {
  businesses: Business[];
  services: ServiceProvider[];
  taxis: Taxi[];
  emergency: EmergencyContact[];
}

export interface AppUpdateInfo {
  updateAvailable: boolean;
  mandatory?: boolean;
  latestVersion?: string;
  title?: string;
  message?: string;
  url?: string;
}

const FALLBACK_BIZ_PHOTO =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=70';
const FALLBACK_PERSON =
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=500&q=70';

/* ---------- adapters: backend doc -> mobile shape ---------- */

function toBusiness(d: any): Business {
  return {
    id: d._id,
    name: d.name,
    category: d.category,
    categoryLabel: prettyLabel(d.category),
    rating: d.ratingAverage ?? 0,
    reviews: d.ratingCount ?? 0,
    phone: d.phone,
    whatsapp: d.whatsapp,
    acceptsOrders: !!d.acceptsOrders,
    address: d.address ?? '',
    workingHours: d.workingHours ?? '',
    description: d.description ?? '',
    photos: d.photos?.length ? d.photos : [FALLBACK_BIZ_PHOTO],
    lat: d.location?.coordinates?.[1],
    lng: d.location?.coordinates?.[0],
    verified: !!d.isVerified,
  };
}

function toProvider(d: any): ServiceProvider {
  return {
    id: d._id,
    name: d.name,
    category: d.category,
    categoryLabel: prettyLabel(d.category),
    rating: d.ratingAverage ?? 0,
    reviews: d.ratingCount ?? 0,
    experienceYears: d.experienceYears ?? 0,
    phone: d.phone,
    whatsapp: d.whatsapp,
    photo: d.photo || FALLBACK_PERSON,
    about: d.description ?? '',
    verified: !!d.isVerified,
  };
}

function toEmergency(d: any): EmergencyContact {
  return {
    id: d._id,
    name: d.name,
    type: d.type,
    typeLabel: prettyLabel(d.type),
    phone: d.phone,
    alt: d.alternatePhone,
  };
}

function toAnnouncement(d: any): Announcement {
  return { id: d._id, title: d.title, body: d.body, time: timeAgo(d.createdAt), createdAt: d.createdAt };
}

function toTaxi(d: any): Taxi {
  return {
    id: d._id,
    driverName: d.driverName,
    photo: d.photo,
    phone: d.phone,
    whatsapp: d.whatsapp,
    vehicleType: d.vehicleType,
    vehicleTypeLabel: prettyLabel(d.vehicleType),
    vehicleNumber: d.vehicleNumber,
    seats: d.seats,
    available: d.available ?? true,
    rating: d.ratingAverage ?? 0,
    reviews: d.ratingCount ?? 0,
    verified: !!d.isVerified,
    description: d.description,
  };
}

/* ---------- API (each falls back to bundled sample data) ---------- */

export const nattileApi = {
  async listDistricts(): Promise<LocationOption[]> {
    return apiGet<LocationOption[]>('/locations/districts');
  },

  /** Anonymous device ping so the super admin can count unique users per village. */
  async pingDevice(deviceId: string, villageId?: string): Promise<void> {
    try {
      if (!villageId) return;
      await apiPost('/devices/ping', { deviceId, village: villageId });
    } catch {
      // best-effort — never block the app on analytics
    }
  },

  /** Unified search across the village's businesses, services and taxis. */
  async search(villageId: string | undefined, q: string): Promise<SearchResults> {
    const empty: SearchResults = { businesses: [], services: [], taxis: [], emergency: [] };
    try {
      if (!villageId || q.trim().length < 2) return empty;
      const data = await apiGet<{
        businesses: any[];
        serviceProviders: any[];
        taxis: any[];
        emergencyContacts: any[];
      }>('/search', { village: villageId, q: q.trim() });
      return {
        businesses: (data.businesses ?? []).map(toBusiness),
        services: (data.serviceProviders ?? []).map(toProvider),
        taxis: (data.taxis ?? []).map(toTaxi),
        emergency: (data.emergencyContacts ?? []).map(toEmergency),
      };
    } catch {
      return empty;
    }
  },

  /** Checks whether a newer app version is available (drives the update popup). */
  async checkAppUpdate(platform: string, version?: string): Promise<AppUpdateInfo | null> {
    try {
      return await apiGet<AppUpdateInfo>('/app-update/check', { platform, version });
    } catch {
      return null;
    }
  },
  async listAreas(district: string): Promise<LocationOption[]> {
    return apiGet<LocationOption[]>('/locations/blocks', { district });
  },
  async listVillages(block: string): Promise<LocationOption[]> {
    return apiGet<LocationOption[]>('/locations/villages', { block });
  },

  async listBusinesses(villageId?: string, category?: string): Promise<Business[]> {
    try {
      if (!villageId) return [];
      const data = await apiGet<any[]>('/businesses', { village: villageId, category });
      return data.map(toBusiness);
    } catch {
      return [];
    }
  },

  async listServices(villageId?: string, category?: string): Promise<ServiceProvider[]> {
    try {
      if (!villageId) return [];
      const data = await apiGet<any[]>('/service-providers', { village: villageId, category });
      return data.map(toProvider);
    } catch {
      return [];
    }
  },

  async listEmergency(villageId?: string): Promise<EmergencyContact[]> {
    try {
      if (!villageId) return [];
      const data = await apiGet<any[]>('/emergency-contacts', { village: villageId });
      return data.map(toEmergency);
    } catch {
      return [];
    }
  },

  async listAnnouncements(villageId?: string): Promise<Announcement[]> {
    try {
      if (!villageId) return [];
      const data = await apiGet<any[]>('/announcements', { village: villageId });
      return data.map(toAnnouncement);
    } catch {
      return [];
    }
  },

  /** Bus departures for the village. */
  async listBusTrips(villageId?: string): Promise<BusTrip[]> {
    try {
      if (!villageId) return [];
      const data = await apiGet<any[]>('/bus-trips', { village: villageId });
      return data.map((d) => ({
        id: d._id,
        time: d.time,
        operator: d.operator,
        number: d.number,
        tags: d.tags ?? [],
        destination: d.destination,
      }));
    } catch {
      return [];
    }
  },

  async listTaxis(villageId?: string): Promise<Taxi[]> {
    try {
      if (!villageId) return [];
      const data = await apiGet<any[]>('/taxis', { village: villageId });
      return data.map(toTaxi);
    } catch {
      return [];
    }
  },

  /** Home category tiles for the village (falls back to built-in defaults). */
  async listHomeCategories(villageId?: string): Promise<HomeCategoryItem[]> {
    try {
      if (!villageId) return DEFAULT_CATEGORIES;
      const data = await apiGet<any[]>('/home-categories', { village: villageId });
      if (!data.length) return DEFAULT_CATEGORIES;
      return data.map((c) => ({
        id: c._id,
        key: c.key,
        label: c.label,
        sub: c.sub,
        icon: c.icon,
        color: c.color,
        link: c.link,
        template: c.template,
      }));
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  /** Items under a custom (directory/places) category. */
  async listCategoryEntries(categoryId?: string): Promise<CategoryEntryItem[]> {
    try {
      if (!categoryId) return [];
      const data = await apiGet<any[]>('/category-entries', { category: categoryId });
      return data.map((e) => ({
        id: e._id,
        title: e.title,
        subtitle: e.subtitle,
        photo: e.photo,
        phone: e.phone,
        whatsapp: e.whatsapp,
        description: e.description,
        link: e.link,
      }));
    } catch {
      return [];
    }
  },

  /** Hero/cover image for the village home screen (undefined => use default). */
  async getVillageHero(villageId?: string): Promise<string | undefined> {
    try {
      if (!villageId) return undefined;
      const v = await apiGet<{ heroImage?: string }>(`/locations/villages/${villageId}`);
      return v.heroImage;
    } catch {
      return undefined;
    }
  },

  /** Live, approved ads for the village banner. Empty array => caller's default. */
  async listAds(villageId?: string): Promise<AdBannerItem[]> {
    try {
      if (!villageId) return [];
      const data = await apiGet<any[]>('/ads/public', { village: villageId });
      return data.map((d) => ({
        id: d._id,
        title: d.title,
        subtitle: d.subtitle,
        cta: d.cta,
        ctaUrl: d.ctaUrl,
        image: d.image,
      }));
    } catch {
      return [];
    }
  },
};
