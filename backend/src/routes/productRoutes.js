// routes/productRoutes.js
import express from 'express';
import { 
  getProducts, 
  getProduct, 
  addProduct,
  updateProduct,
  deleteProduct,
  upload 
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', upload.single('image'), addProduct);
router.put('/:id', upload.single('image'), updateProduct); // ← NUEVO
router.delete('/:id', deleteProduct); // ← NUEVO

export default router;