import express from 'express';
import AuthenticationMiddleware from '../app/middlewares/AuthenticationMiddleware.js';
import * as UsersControllers from '../app/controllers/UsersControllers.js';
import * as ProfileControllers from '../app/controllers/ProfileControllers.js';
import * as FileController from '../app/controllers/FileController.js';
import * as ProductController from '../app/controllers/ProductController.js';
import * as CategoryController from '../app/controllers/CategoryController.js';


const router = express.Router();

// user login and registration routes
router.post('/login', UsersControllers.login);
router.post('/individual-register', UsersControllers.individualRegister);
router.post('/business-register', UsersControllers.businessRegister);
router.post('/verify-otp', UsersControllers.verifyOtp);

// user profile
router.get(
  '/profile',
  AuthenticationMiddleware,
  ProfileControllers.userProfile
);
router.post(
  '/profile-update',
  AuthenticationMiddleware,
  ProfileControllers.profileUpdate
);

// File upload and download routes
router.post(
  '/profile-image-upload',
  AuthenticationMiddleware,
  FileController.profileImageUpload
);
router.delete('/delete-single-file/:fileName', FileController.deleteSingleFile);
router.get('/read-file/:fileName', FileController.getUploadFile);

router.post('/upload-multiple-file', FileController.uploadMultipleFile);
router.delete('/delete-multiple-file', FileController.deleteMultipleFile);

//Business Profile Routes
// router.post('/add-products', AuthenticationMiddleware, upload.uploadMultipleFile('product-images'), ProductController.addProduct);
router.post(
  '/add-products',
  AuthenticationMiddleware,
  ProductController.addProduct
);
router.put(
  '/update-product/:id',
  AuthenticationMiddleware,
  ProductController.updateProduct
);
router.get(
  '/product-details/:id',
  AuthenticationMiddleware,
  ProductController.productDetails
);
router.get(
  '/products-by-category/:category',
  AuthenticationMiddleware,
  ProductController.getProductByCategory
);
router.get(
  '/product/:id',
  AuthenticationMiddleware,
  ProductController.getProductByID
);
router.get(
  '/products',
  AuthenticationMiddleware,
  ProductController.getProducts
);
router.delete(
  '/delete-product/:id',
  AuthenticationMiddleware,
  ProductController.deleteProductByID
);
router.delete(
  '/delete-products',
  AuthenticationMiddleware,
  ProductController.deleteProducts
);
router.get(
  '/category-list',
  AuthenticationMiddleware,
  CategoryController.categoryList
);

export default router;
