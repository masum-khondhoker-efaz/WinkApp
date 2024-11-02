import ProductModel from '../models/ProductModel.js';

export const categoryListService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    const categories = await ProductModel.distinct('categoryName', { userID: userID });
    if (!categories.length) {
      return {
      statusCode: 403,
      status: 'Failed',
      message: 'Forbidden: You do not have permission to view these categories',
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Categories Retrieved Successfully',
      data: categories,
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
