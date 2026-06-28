import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import locationRoutes from './location.routes';
import businessRoutes from './business.routes';
import serviceProviderRoutes from './serviceProvider.routes';
import taxiRoutes from './taxi.routes';
import busTripRoutes from './busTrip.routes';
import homeCategoryRoutes from './homeCategory.routes';
import categoryEntryRoutes from './categoryEntry.routes';
import uploadRoutes from './upload.routes';
import emergencyRoutes from './emergency.routes';
import announcementRoutes from './announcement.routes';
import adRoutes from './ad.routes';
import appUpdateRoutes from './appUpdate.routes';
import deviceRoutes from './device.routes';
import homeRoutes from './home.routes';

const router = Router();

// Aggregated home + cross-cutting endpoints (home, search, categories)
router.use('/', homeRoutes);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/locations', locationRoutes);
router.use('/businesses', businessRoutes);
router.use('/service-providers', serviceProviderRoutes);
router.use('/taxis', taxiRoutes);
router.use('/bus-trips', busTripRoutes);
router.use('/home-categories', homeCategoryRoutes);
router.use('/category-entries', categoryEntryRoutes);
router.use('/uploads', uploadRoutes);
router.use('/emergency-contacts', emergencyRoutes);
router.use('/announcements', announcementRoutes);
router.use('/ads', adRoutes);
router.use('/app-update', appUpdateRoutes);
router.use('/devices', deviceRoutes);

export default router;
