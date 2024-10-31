import ProductModel from '../models/ProductModel.js';

export const categoryListService = async (req, res) => {
  try {
    const categories = await ProductModel.distinct('categoryName');

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
