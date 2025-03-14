import express from 'express';
import AuthenticationMiddleware from '../app/middlewares/AuthenticationMiddleware.js';
import * as UsersControllers from '../app/controllers/UsersControllers.js';
import * as ProfileControllers from '../app/controllers/ProfileControllers.js';
import * as FileController from '../app/controllers/FileController.js';
import * as ProductController from '../app/controllers/ProductController.js';
import * as CategoryController from '../app/controllers/CategoryController.js';
import * as CustomerController from '../app/controllers/CustomerController.js';
import * as CartController from '../app/controllers/CartController.js';
import * as OrderController from '../app/controllers/OrderController.js';
import * as BusinessController from '../app/controllers/BusinessController.js';
import * as WishController from '../app/controllers/WishController.js';
import * as ReviewController from '../app/controllers/ReviewController.js';
import * as PaymentController from '../app/controllers/PaymentController.js';

const router = express.Router();

// user login and registration routes
router.post(
  '/login', 
  UsersControllers.login
);
router.post(
  '/individual-register', 
  UsersControllers.individualRegister
);
router.post(
  '/business-register', 
  UsersControllers.businessRegister
);
router.post(
  '/verify-otp', 
  UsersControllers.verifyOtp
);

router.post(
  '/forget-password', 
  UsersControllers.forgotPassword
);
router.put(
  '/reset-password', 
  UsersControllers.resetPassword
);

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
// router.delete('/delete-single-file/:fileName', FileController.deleteSingleFile);
// router.get('/read-file/:fileName', FileController.getUploadFile);

// router.post('/upload-multiple-file', FileController.uploadMultipleFile);
// router.delete('/delete-multiple-file', FileController.deleteMultipleFile);

//Business Profile Routes

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


//Customer cart Routes
router.post(
  '/add-to-cart/:id',
  AuthenticationMiddleware,
  CartController.addToCart
);

router.get(
  '/get-all-cart',
   AuthenticationMiddleware, 
   CartController.getAllCart);


router.put(
  '/update-to-cart/:id',
  AuthenticationMiddleware,
  CartController.updateToCart
);

router.delete(
  '/delete-to-cart/:id',
  AuthenticationMiddleware,
  CartController.deleteToCart
);

//Customer wish list routes
router.post(
  '/add-to-wish/:id',
  AuthenticationMiddleware,
  WishController.addToWish
);
router.get(
  '/get-all-wish',
  AuthenticationMiddleware,
  WishController.getAllWish
);
router.delete(
  '/delete-to-wish/:id',
  AuthenticationMiddleware,
  WishController.deleteToWish
);


// Business order management routes
router.get(
  '/get-all-orders',
  AuthenticationMiddleware,
  BusinessController.getAllOrders
);
router.get(
  '/get-order-details/:id',
  AuthenticationMiddleware,
  BusinessController.getOrderDetails
);
router.put(
  '/update-order-status/:id',
  AuthenticationMiddleware,
  BusinessController.updateOrderStatus
);


// Customer products and shop  routes
router.get(
  '/shop-products',
  AuthenticationMiddleware,
  CustomerController.getAllShopsAndProducts
);

router.get(
  '/shop/:id',
  AuthenticationMiddleware,
  CustomerController.getShopByID
);

router.get(
  '/detail-product/:id',
  AuthenticationMiddleware,
  CustomerController.getProductDetailsByID
);

// Customer review routes
router.post(
  '/customer-review',
  AuthenticationMiddleware,
  ReviewController.customerReview
);
router.get(
  '/get-customer-review',
  AuthenticationMiddleware,
  ReviewController.getCustomerReview
);

// Featured products with category
router.get(
  '/featured-products',
  AuthenticationMiddleware,
  CustomerController.getFeaturedProducts
);

router.get(
  '/products-by-category',
  AuthenticationMiddleware,
  CustomerController.getProductsByCategory
);

// Order management routes for the customer
router.post(
  '/create-order',
  AuthenticationMiddleware,
    OrderController.createOrder
);

router.get(
  '/retrieve-payment/:sessionId',
  AuthenticationMiddleware,
  PaymentController.retrieveSessionById
);

router.get(
  '/payment-transaction/:transactionID',
  AuthenticationMiddleware,
  PaymentController.paymentTransaction
);

router.get(
  '/payment-transactions/',
  AuthenticationMiddleware,
  PaymentController.allPaymentTransaction
);




// router.put(
//   '/update-order/:id',
//   AuthenticationMiddleware,
//     OrderController.updateOrder
// );


router.get(
  '/order-details/:id',
  AuthenticationMiddleware,
    OrderController.getOrderDetails
);
router.get(
  '/orders',
  AuthenticationMiddleware,
    OrderController.getAllOrders
);

// router.delete(
//   '/delete-order/:id',
//   AuthenticationMiddleware,
//     OrderController.deleteOrder
// );

// router.post(
//   '/payment-setup',
//   AuthenticationMiddleware,
//   PaymentController.paymentSetup
// );
// router.put(
//   '/payment-initiate/:id',
//   AuthenticationMiddleware,
//   PaymentController.paymentInitiate
// );

// router.post(
//   '/payment-webhook',
//   AuthenticationMiddleware,
//   PaymentController.paymentWebhook
// );

// router.post(
//   'payment-transaction/:transactionID',
//   AuthenticationMiddleware,
//   PaymentController.paymentTransaction
//   ); 


// Business payment details routes
 router.post(
   '/add-payment-details',
    AuthenticationMiddleware,
    BusinessController.addPaymentDetails
  );

 router.put(
   '/update-payment-details',
   AuthenticationMiddleware,
   BusinessController.updatePaymentDetails
 );

router.get(
  '/payment-details',
  AuthenticationMiddleware,
  BusinessController.getPaymentDetails
);

export default router;
