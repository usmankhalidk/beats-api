import { Router } from 'express';
import authRoutes from './auth/routes';
import userRoutes from './user/routes';
import beatsRoutes from './beats/routes';
import cartRoutes from './cart/routes';
import ordersRoutes from './orders/routes';
import playlistsRoutes from './playlists/routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/beats', beatsRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);
router.use('/playlists', playlistsRoutes);

export default router;
