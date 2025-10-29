// routes/productRoutes.js
import express from 'express';
import { 
  getProducts, 
  getProduct, 
  addProduct,
  testCloudinary,
  upload 
} from '../controllers/productController.js';

const router = express.Router();

// RUTAS DE PRODUCTOS
router.get('/', getProducts);                    // GET /api/products
router.get('/:id', getProduct);                  // GET /api/products/:id  
router.post('/', upload.single('image'), addProduct); // POST /api/products
router.get('/test/cloudinary', testCloudinary);  // GET /api/products/test/cloudinary

export default router;