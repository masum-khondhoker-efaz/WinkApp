

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
    
        return {
        statusCode: 200,
        status: 'Success',
        };
    } catch (error) {
        return { statusCode: 500, status: 'Failed', message: error.toString() };
    }
    };

export const getAllWishService = async (req, res) => {
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
  
    return {
      statusCode: 200,
      status: 'Success',
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
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
  
    return {
      statusCode: 200,
      status: 'Success',
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};

