

export const categoryListService = async (req, res) => {
  try {
    // Logic to get products by category
    return {
      statusCode: 200,
      status: 'Success',
      message: 'Products Retrieved Successfully by Category',
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};