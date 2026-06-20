import { Router } from 'express';
import authRoutes from './auth/routes';
import userRoutes from './user/routes';
import beatsRoutes from './beats/routes';
import categoriesRoutes from './categories/routes';
import cartRoutes from './cart/routes';
import ordersRoutes from './orders/routes';
import checkoutRoutes from './payments/routes';
import downloadsRoutes from './downloads/routes';
import dashboardRoutes from './dashboard/routes';
import playlistsRoutes from './playlists/routes';
import favoritesRoutes from './favorites/routes';
import purchasesRoutes from './purchases/routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/beats', beatsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', ordersRoutes);
router.use('/downloads', downloadsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/playlists', playlistsRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/purchases', purchasesRoutes);

export default router;
