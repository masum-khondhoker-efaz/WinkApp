import UserModel from "../models/UsersModel.js";
import ReviewModel from '../models/ReviewModel.js';
import mongoose from "mongoose";

export const customerReviewService = async (req, res) => {
  try {
    if (req.headers.role !== 'individual') {
      return {
        statusCode: 403,
        status: 'Failed',
        message: 'You are not authorized to access this resource.',
      };
    }

    const userID = new mongoose.Types.ObjectId(req.headers.user_id);

    // Fetch customerID from customersModel
    const customer = await UserModel.findOne({ _id: userID });
    if (!customer) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Customer not found.',
      };
    }
    const customerID = customer._id;

    const { productID, comments, ratings } = req.body;

    if (!productID || !comments || !ratings) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'product ID, comments, and stars are required.',
      };
    }

    const review = await ReviewModel.create({
      userID: customerID,
      productID: productID,
      comments: comments,
      ratings: ratings,
    });

    return {
      statusCode: 201,
      status: 'Success',
      message: 'Review provided successfully',
      data: review,
    };
  } catch (error) {
    console.error('Error providing review:', error);
    return {
      statusCode: 500,
      status: 'Failed',
      message: 'There was an error providing the review.',
    };
  }
};

export const getCustomerReviewService = async (req, res) => {
  try {
    if (req.headers.role !== 'individual') {
      return {
        statusCode: 403,
        status: 'Failed',
        message: 'You are not authorized to access this resource.',
      };
    }
    const userID = req.headers.user_id;

    const { page = 1, limit = 10 } = req.query;

    const reviews = await ReviewModel.find({ userID })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    const totalReviews = await ReviewModel.countDocuments({ userID });

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Reviews fetched successfully',
      data: {
        reviews,
        totalPages: Math.ceil(totalReviews / limit),
        currentPage: page,
      },
    };

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return {
      statusCode: 500,
      status: 'Failed',
      message: 'There was an error fetching the reviews.',
    };
  }
};
