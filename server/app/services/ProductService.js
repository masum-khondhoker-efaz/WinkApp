import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import ProductModel from '../models/ProductModel.js';


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

    const { files } = req.files; 
    const { data } = req.body; 
    const imagePaths = [];

    const userDir = path.join(__dirname, '..', '..', 'public', 'products', userID);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    if (Array.isArray(files)) {
      // Multiple images
      for (const file of files) {
        const imagePath = path.join(userDir, Date.now() + "-" + file.name);
        fs.writeFileSync(imagePath, file.data);
        imagePaths.push(`/products/${userID}/${Date.now()}-${file.name}`);
      }
    } else {
      // Single image
      const imagePath = path.join(userDir, Date.now() + "-" + files.name);
      fs.writeFileSync(imagePath, files.data);
      imagePaths.push(`/products/${userID}/${Date.now()}-${files.name}`);
    }

    const productData = JSON.parse(data);
    productData.image = imagePaths.join(','); // Convert array to comma-separated string
    if(productData.discountPrice){
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
      data: { imagePaths, productData }, 
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};




export const updateProductService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    const userRole = req.headers.role;
    const productID = req.params.id; // Extract productID from params

    if (userRole !== 'business') {
      return {
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    const { files } = req.files; // Assuming images are sent as files
    const formData = req.body; // Extract other fields from the form-data
    const imagePaths = [];

    // Retrieve the current product from the database using productID
    const existingProduct = await ProductModel.findById(productID).lean();
    if (!existingProduct) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Product not found',
      };
    }

    // Prepare the directory to store images
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

    // Handle file uploads and old image deletion
    if (files) {
      // Retrieve image names from the database, ensuring it's a string
      const oldImageNames =
        typeof existingProduct.image === 'string'
          ? existingProduct.image.split(',')
          : [];

      // Delete old images from the file system
      for (const imgName of oldImageNames) {
        const fullPath = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'products',
          userID,
          imgName
        );
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath); // Delete the old image
            console.log(`Deleted old image: ${fullPath}`);
          } catch (err) {
            console.error(`Error deleting old image: ${fullPath}`, err);
          }
        } else {
          console.log(`Image not found for deletion: ${fullPath}`);
        }
      }

      // Upload new images
      if (Array.isArray(files)) {
        // Multiple images
        for (const file of files) {
          const imagePath = path.join(userDir, `${Date.now()}-${file.name}`);
          fs.writeFileSync(imagePath, file.data);
          console.log(`New image saved at: ${imagePath}`);
          imagePaths.push(`products/${userID}/${Date.now()}-${file.name}`);
        }
      } else {
        // Single image
        const imagePath = path.join(userDir, `${Date.now()}-${files.name}`);
        fs.writeFileSync(imagePath, files.data);
        console.log(`New image saved at: ${imagePath}`);
        imagePaths.push(`products/${userID}/${Date.now()}-${files.name}`);
      }

      // Update productData with the new image paths
      formData.image = imagePaths.join(','); // Convert array to comma-separated string
    } else {
      // If no new images are uploaded, retain the old ones
      formData.image = existingProduct.image;
    }

    // Update other product fields using form data
    if (formData.discountPrice) {
      formData.discount = true;
    }
    if (parseInt(formData.quantity) > 0) {
      formData.stock = true;
    }

    formData.userID = userID;

    // Update the product in the database using productID
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productID,
      formData, // Update with the formData directly
      { new: true }
    ).lean(); // Use lean to avoid Mongoose object issues

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Product updated successfully',
      data: { updatedProduct: updatedProduct },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.toString(),
    };
  }
};




export const productDetailsService = async (req, res) => {
  try {
    if (req.headers.role !== 'business') {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    const productID = req.params.id; // Extract productID from params

    const product = await ProductModel.findById(productID).lean();
    if (!product) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Product not found',
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
    if (req.headers.role !== 'business') {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }
    const category = req.params.category; // Extract category from params

    // Retrieve products by category from the database
    const products = await ProductModel.find({ categoryName: category}).lean();
    if (!products || products.length === 0) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'No products found in this category',
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
    // Logic to get product by ID
    return {
      statusCode: 200,
      status: 'Success',
      message: 'Product Retrieved Successfully by ID',
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};

export const getProductsService = async (req, res) => {
  try {
    // Logic to get all products
    return {
      statusCode: 200,
      status: 'Success',
      message: 'Products Retrieved Successfully',
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};

export const deleteProductByIDService = async (req, res) => {
  try {
    // Logic to delete product by ID
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
    // Logic to delete all products
    return {
      statusCode: 200,
      status: 'Success',
      message: 'All Products Deleted Successfully',
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};
