import express from 'express';
import { 
  getProducts, 
  getProduct, 
  addProduct,
  updateProduct,
  deleteProduct,
  uploadSTLFile, // ← NUEVO
  upload 
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', upload.single('image'), addProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);
router.post('/upload-stl', upload.single('stl'), uploadSTLFile); // ← NUEVO

export default router;