import express from 'express';
import AuthenticationMiddleware from '../app/middlewares/AuthenticationMiddleware.js';
import * as UsersControllers from '../app/controllers/UsersControllers.js';
import * as ProfileControllers from '../app/controllers/ProfileControllers.js';
import * as FileController from '../app/controllers/FileController.js';

const router = express.Router();

// user login and registration routes
router.post('/login', UsersControllers.login);
router.post('/individual-register', UsersControllers.individualRegister);
router.post('/business-register', UsersControllers.businessRegister);
router.post('/verify-otp', UsersControllers.verifyOtp);


// user profile
router.get('/profile', AuthenticationMiddleware, ProfileControllers.userProfile);
router.post('/profile-update', AuthenticationMiddleware, ProfileControllers.profileUpdate);


// File upload and download routes
router.post('/profile-image-upload', AuthenticationMiddleware, FileController.profileImageUpload);
router.delete('/delete-single-file/:fileName', FileController.deleteSingleFile);
router.get('/read-file/:fileName', FileController.getUploadFile);

router.post('/upload-multiple-file', FileController.uploadMultipleFile);
router.delete('/delete-multiple-file', FileController.deleteMultipleFile);





export default router;
