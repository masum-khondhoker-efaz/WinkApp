import mongoose from "mongoose";
import WishModel from "../models/WishModel.js";


export const addToWishService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    const userRole = req.headers.role;
    if (userRole !== 'individual') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }
    const productID = req.params.id;
    if (!productID) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Product ID is required',
      };
    }

    const existingWish = await WishModel.findOne({ userID: userID, productID: productID });
    if (existingWish) {
      return {
        statusCode: 409,
        status: 'Failed',
        message: 'Product is already in the wishlist',
      };
    }

    const newWish = await WishModel.create({
      userID: userID,
      productID: productID,
    });
    console.log(newWish);
    return {
      statusCode: 201,
      status: 'Success',
      message: 'Wish item added successfully',
      data: newWish,
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};



export const getAllWishService = async (req) => {
  try {
    let userID = req.headers.user_id;
    const userRole = req.headers.role;

    if (userRole !== 'individual') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }
    userID = new mongoose.Types.ObjectId(userID);
    

    const wishes = await WishModel.aggregate([
      { $match: { userID: userID } }, 
      {
        $lookup: {
          from: 'products', 
          localField: 'productID', 
          foreignField: '_id', 
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' }, 
    ]);    

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Wish items retrieved successfully',
      data: wishes,
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.toString(),
    };
  }
};



export const deleteToWishService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    const userRole = req.headers.role;
    if (userRole !== 'individual') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }
    const productID = req.params.id;
    if (!productID) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Product ID is required',
      };
    }

    const wish = await WishModel.findOneAndDelete({
      userID: userID,
      productID: productID,
    });
    if (!wish) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Wish item not found',
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Wish item deleted successfully',
      data: wish,
    };

  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};

