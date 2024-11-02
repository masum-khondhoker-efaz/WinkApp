import mongoose from "mongoose";
import CartModel from "../models/CartModel.js";
import ProductModel from "../models/ProductModel.js";


export const addToCartService = async (req, res) => {
    try {
        const userID = req.headers.user_id;
        if(req.headers.role !== 'individual') {
            return {
                statusCode: 401,
                status: 'Failed',
                message: 'Unauthorized Access',
            };
        }
        const productID = req.params.id;
        
        const { quantity } = req.body;
        
        // Fetch product details to calculate total price
        const product = await ProductModel.findById(productID);
        if (!product) {
            return {
                statusCode: 404,
                status: 'Failed',
                message: 'Product not found',
            };
        }

        const finalPrice = product.discount ? product.discountPrice : product.price;
        const totalPrice = finalPrice * quantity;

        let newCartItem;
        // Check if the product already exists in the cart
        const existingCartItem = await CartModel.findOne({ userID, productID });
        if (existingCartItem) {
            // Update the existing cart item
            existingCartItem.quantity = quantity;
            existingCartItem.totalPrice = totalPrice;
            await existingCartItem.save();
        } else {
            // Create a new cart item
            newCartItem = new CartModel({
                userID,
                productID,
                quantity,
                totalPrice,
            });
            await newCartItem.save();
        }

        return {
            statusCode: 201,
            status: 'Success',
            message: 'Product added to cart successfully',
            data: newCartItem? newCartItem : existingCartItem,

        };
    } catch (error) {
        console.error(error); // Log the error for debugging
        return {
            statusCode: 500,
            status: 'Failed',
            message: error.message || 'Internal Server Error',
        };
    }
};


export const getAllCartService = async (req, res) => {
    try {
        const userID = req.headers.user_id;
        if (req.headers.role !== 'individual') {
          return {
            statusCode: 401,
            status: 'Failed',
            message: 'Unauthorized Access',
          };
        }

        // Fetch all cart items for the specific user
        const cartItems = await CartModel.find({ userID });

        return {
            statusCode: 200,
            status: 'Success',
            message: 'All cart items retrieved successfully',
            data: cartItems,
        };
    } catch (error) {
        console.error(error); // Log the error for debugging
        return {
            statusCode: 500,
            status: 'Failed',
            message: error.message || 'Internal Server Error',
        };
    }
};


export const updateToCartService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    if (req.headers.role !== 'individual') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    const productID = new mongoose.Types.ObjectId(req.params.id);
    const { quantity } = req.body;

    // Fetch product details to calculate total price
    const product = await ProductModel.findOne(
      productID,
    );

    if (!product) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Product not found or does not belong to the user',
      };
    }

    const finalPrice = product.discount ? product.discountPrice : product.price;
    const totalPrice = finalPrice * quantity;

    // Check if the product exists in the cart
    const existingCartItem = await CartModel.findOne({ userID, productID });
    if (!existingCartItem) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Cart item not found',
      };
    }

    // Update the existing cart item
    existingCartItem.quantity = quantity;
    existingCartItem.totalPrice = totalPrice;
    await existingCartItem.save();

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Cart updated successfully',
      data: existingCartItem,
    };
  } catch (error) {
    console.error(error); // Log the error for debugging
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    };
  }
};



export const deleteToCartService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    if (req.headers.role !== 'individual') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }
    const productID = req.params.id;

    // Check if the product exists in the cart
    const existingCartItem = await CartModel.findOne({ userID, productID });
    if (!existingCartItem) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Cart item not found',
      };
    }

    // Delete the cart item
    await CartModel.deleteOne({ userID, productID });
    return {
      statusCode: 200,
      status: 'Success',
      message: 'Cart deleted Successfully',
    };
  } catch (error) {
    console.error(error); // Log the error for debugging
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    };
  }
};

