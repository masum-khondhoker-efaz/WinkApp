import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import ProductModel from '../models/ProductModel.js';
import { cloudinaryUploadImage } from '../middlewares/multermiddleware.js';
import { cloudinaryDeleteImage } from '../middlewares/multermiddleware.js';
import BusinessPaymentModel from '../models/BusinessPaymentModel.js';
import UserModel from '../models/UsersModel.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const addProductService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    const userRole = req.headers.role;
    if (userRole !== 'business') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    // Check if the user has added payment details
    const paymentDetails = await BusinessPaymentModel.find({
      userID: new mongoose.Types.ObjectId(userID),
    });
    if (!paymentDetails) {
      return {
        statusCode: 403,
        status: 'Failed',
        message: 'Forbidden: You must add payment details before adding products',
      };
    }

    const { files } = req.files;
    const { data } = req.body;

    const userDir = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'products',
      userID
    );
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    let imagePath;
    const imageData = [];
    if (Array.isArray(files)) {
      // Multiple images
      for (const file of files) {
        imagePath = path.join(userDir, Date.now() + '-' + file?.name);
        fs.writeFileSync(imagePath, file.data);
        const imageData1 = await cloudinaryUploadImage(imagePath);
        imageData.push(imageData1.url);
        fs.unlinkSync(imagePath); // Remove the image after uploading
      }
    } else {
      // Single image
      imagePath = path.join(userDir, Date.now() + '-' + files.name);
      fs.writeFileSync(imagePath, files.data);
      const imageData1 = await cloudinaryUploadImage(imagePath);
      imageData.push(imageData1.url);
      fs.unlinkSync(imagePath); // Remove the image after uploading
    }


    const productData = JSON.parse(data);
    productData.images = imageData; // Store images as an array
    if (productData.discountPrice) {
      productData.discount = true;
    }
    if (parseInt(productData.quantity) > 0) {
      productData.stock = true;
    }
    productData.userID = userID;

    const newProduct = new ProductModel(productData);
    await newProduct.save();

    return {
      statusCode: 201,
      status: 'Success',
      message: 'Product added Successfully',
      data: { imageData, productData },
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};


export const updateProductService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    const userRole = req.headers.role;
    const productID = req.params.id;

    if (userRole !== 'business') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    const { files } = req.files;
    const { data } = req.body;

    // Retrieve the current product from the database
    const existingProduct = await ProductModel.findById(productID);
    if (!existingProduct) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Product not found',
      };
    }

    const userDir = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'products',
      userID
    );
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    let newImageData = [];
    const existingImages = existingProduct.images || [];

    // Process new images
    if (Array.isArray(files)) {
      for (const file of files) {
        const imagePath = path.join(userDir, Date.now() + '-' + file.name);
        fs.writeFileSync(imagePath, file.data);

        const imageData = await cloudinaryUploadImage(imagePath);
        newImageData.push(imageData.url);
        fs.unlinkSync(imagePath); // Remove the image after uploading
      }
    } else if (files) {
      const imagePath = path.join(userDir, Date.now() + '-' + files.name);
      fs.writeFileSync(imagePath, files.data);

      const imageData = await cloudinaryUploadImage(imagePath);
      newImageData.push(imageData.url);
      fs.unlinkSync(imagePath); // Remove the image after uploading
    }

    // If new images are provided, replace all existing images
    let updatedImages;
    if (newImageData.length > 0) {
      updatedImages = newImageData;
      // Remove all existing images from the file system
      for (const img of existingImages) {
        try {
          const imageName = path.basename(img);
          const fullPath = path.join(userDir, imageName);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath); // Delete the old image from the file system
          }
          console.log(`Deleted image: ${fullPath}`);
        } catch (err) {
          console.error(`Error deleting image: ${img}`, err);
        }
      }
    } else {
      updatedImages = existingImages;
    }

    const productData = JSON.parse(data);
    productData.images = updatedImages;
    productData.discount = Boolean(productData.discountPrice);
    productData.stock = parseInt(productData.quantity) > 0;
    productData.userID = userID;

    // Update the product in the database
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productID,
      productData,
      { new: true }
    );

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Product updated successfully',
      data: { updatedProduct },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    };
  }
};


export const productDetailsService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    if (req.headers.role !== 'business') {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    const productID = req.params.id; // Extract productID from params

    const product = await ProductModel.findById(productID);
    if (!product) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Product not found',
      };
    }
    if (product.userID.toString() !== userID) {
      return {
        statusCode: 403,
        status: 'Failed',
        message: 'Forbidden: You do not have permission to view this product',
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Product Details Retrieved Successfully',
      data: product,
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};


export const getProductByCategoryService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    console.log(userID);
    
    if (req.headers.role !== 'business') {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }
    const category = req.params.category.toLowerCase(); // Extract and convert category to lowercase

    // Retrieve products by category from the database
    const products = await ProductModel.find({
      userID: userID,
      categoryName: { $regex: new RegExp('^' + category + '$', 'i') },
    });
    if (!products || products.length === 0) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'No products found in this category',
      };
    }
    // Filter products by userID
    const filteredProducts = products.filter(product => product.userID.toString() === userID);

    if (filteredProducts.length === 0) {
      return {
      statusCode: 404,
      status: 'Failed',
      message: 'No products found in this category for this user',
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Products Retrieved Successfully by Category',
      data: products,
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};


export const getProductByIDService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    if (req.headers.role !== 'business') {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }
    const productID = req.params.id; // Get product ID from request parameters

    // Logic to get product by ID
    const product = await ProductModel.findById(productID); 
    if (product.userID.toString() !== userID) {
      return {
      statusCode: 403,
      status: 'Failed',
      message: 'Forbidden: You do not have permission to view this product',
      };
    }

    if (!product || product.length === 0) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Product not found',
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Product Retrieved Successfully by ID',
      data: product,
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};


export const getProductsService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    if (req.headers.role !== 'business') {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    // Logic to get all products for the specific user_id
    const products = await ProductModel.find({ userID : userID });
    if (!products || products.length === 0) {
      return {
        statusCode: 200,
        status: 'Success',
        message: 'No products found for this user',
        data:  products ,
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Products Retrieved Successfully',
      data: products,
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};


export const deleteProductByIDService = async (req) => {
  try {
    const userID = req.headers.user_id;
    const userRole = req.headers.role;
    const productID = req.params.id; // Extract productID from params

    if (userRole !== 'business') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    // Retrieve the current product from the database using productID
    const existingProduct = await ProductModel.findById(productID);
    if (!existingProduct) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Product not found',
      };
    }

    // Check if the product belongs to the user
    if (existingProduct.userID.toString() !== userID) {
      return {
        statusCode: 403,
        status: 'Failed',
        message: 'Forbidden: You do not have permission to delete this product',
      };
    }

    // Delete associated images from Cloudinary
    if (Array.isArray(existingProduct.images)) {
      for (const imageUrl of existingProduct.images) {
        try {
          const result = await cloudinaryDeleteImage(imageUrl);
          console.log(`Deleted image result for URL ${imageUrl}: ${JSON.stringify(result)}`);
        } catch (error) {
          console.error(`Error deleting image with URL ${imageUrl}: ${error.message}`);
        }
      }
    }

    // Delete the product from the database
    await ProductModel.findByIdAndDelete(productID);

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Product Deleted Successfully by ID',
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};


export const deleteProductsService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    const { productIds } = req.body; // Assuming productIds is an array of IDs

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Invalid input, productIds should be a non-empty array.',
      };
    }

    // Retrieve the products to get their image URLs
    const products = await ProductModel.find({
      _id: { $in: productIds },
      userID: userID,
    });

    // Delete images from Cloudinary
    for (const product of products) {
      if (Array.isArray(product.images)) {
        for (const imageUrl of product.images) {
          try {
            const result = await cloudinaryDeleteImage(imageUrl);
            console.log(
              `Deleted image result for URL ${imageUrl}: ${JSON.stringify(
                result
              )}`
            );
          } catch (error) {
            console.error(
              `Error deleting image with URL ${imageUrl}: ${error.message}`
            );
          }
        }
      } else {
        console.warn(`No images found for product ID ${product._id}`);
      }
    }

    // Use Mongoose to delete the specified products
    const result = await ProductModel.deleteMany({
      _id: { $in: productIds },
      userID: userID,
    });

    if (result.deletedCount === 0) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'No products found with the provided IDs for this user.',
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Products Deleted Successfully',
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    console.error('Error deleting products:', error);
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    };
  }
};



