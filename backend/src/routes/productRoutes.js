import express from 'express';
import { 
  getProducts, 
  getProduct, 
  addProduct,
  updateProduct,
  deleteProduct,
  uploadSTLFile,
  upload 
} from '../controllers/productController.js';
import authenticateToken from '../middleware/authenticateToken.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Rutas públicas
router.get('/', getProducts);
router.get('/:id', getProduct);

// Rutas solo para ADMIN
router.post('/', authenticateToken, authorize('admin'), upload.single('image'), addProduct);
router.put('/:id', authenticateToken, authorize('admin'), upload.single('image'), updateProduct);
router.delete('/:id', authenticateToken, authorize('admin'), deleteProduct);
router.post('/upload-stl', authenticateToken, authorize('admin'), upload.single('stl'), uploadSTLFile);

export default router;