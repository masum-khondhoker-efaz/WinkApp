import BusinessModel from '../models/BusinessesModel.js';
import ProductModel from '../models/ProductModel.js';




export const getAllShopsAndProductsService = async (req, res) => {
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

    const { search, page = 1, limit = 10, searchType } = req.query;
    let data = [];
    let total = 0;

    // Case 1: If no search query is provided, retrieve all businesses and their products
    if (!search) {
      const businesses = await BusinessModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userID',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            businessName: 1,
            tradeLicenseNumber: 1,
            location: 1,
            'user.image': 1,
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
      ]);

      const products = await ProductModel.find()
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const totalBusinesses = await BusinessModel.countDocuments();
      const totalProducts = await ProductModel.countDocuments();

      return {
        statusCode: 200,
        status: 'Success',
        data: {
          businesses,
          products,
        },
        totalBusinesses,
        totalProducts,
        page: parseInt(page),
        limit: parseInt(limit),
      };
    }

    // Case 2: Search by Business Name
    if (!searchType || searchType === 'business') {
      if (!search) {
        return {
          statusCode: 400,
          status: 'Failed',
          message: 'Search term is required for business search',
        };
      }

      const businessQuery = { businessName: { $regex: search, $options: 'i' } };

      data = await BusinessModel.aggregate([
        { $match: businessQuery },
        {
          $lookup: {
            from: 'users',
            localField: 'userID',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            businessName: 1,
            userID: 1,
            'user.image': 1,
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
      ]);

      total = await BusinessModel.countDocuments(businessQuery);

      if (data.length === 0) {
        return {
          statusCode: 404,
          status: 'Failed',
          message: 'Business not found',
        };
      }

      return {
        statusCode: 200,
        status: 'Success',
        data,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      };
    }

    // Case 3: Search by Product Name
    else if (searchType === 'product') {
      if (!search) {
        return {
          statusCode: 400,
          status: 'Failed',
          message: 'Search term is required for product search',
        };
      }

      const productQuery = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } },
        ],
      };

      data = await ProductModel.aggregate([
        { $match: productQuery },
        {
          $lookup: {
            from: 'businesses',
            localField: 'userID',
            foreignField: 'userID',
            as: 'business',
          },
        },
        { $unwind: '$business' },
        {
          $lookup: {
            from: 'users',
            localField: 'business.userID',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            title: 1,
            shortDescription: 1,
            price: 1,
            'business.businessName': 1,
            'user.image': 1,
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
      ]).exec();

      total = await ProductModel.countDocuments(productQuery);

      if (data.length === 0) {
        return {
          statusCode: 404,
          status: 'Failed',
          message: 'Product not found',
        };
      }

      const safeData = data.map((product) => ({
        title: product.title,
        shortDescription: product.shortDescription,
        price: product.price,
        businessName: product.business.businessName,
        image: product.user.image,
      }));

      return {
        statusCode: 200,
        status: 'Success',
        data: safeData,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.toString(),
    };
  }
};


export const getShopByIDService = async (req, res) => {
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
    const businessID = req.params.id;
    const business = await BusinessModel.findOne({ userID: businessID });
    return {
      statusCode: 200,
      status: 'Success',
      data: business,
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};



export const getProductDetailsByIDService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    const userRole = req.headers.role;
    console.log('User Role:', userRole);
    
    // Optionally, you might want to check the user role here
    if (userRole !== 'individual') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    const productID = req.params.id;

    // Find the product by ID
    const product = await ProductModel.findById({_id:productID});

    if (!product) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Product not found',
      };
    }

    // Send the found product details in response
    return {
      statusCode: 200,
      status: 'Success',
      data: product,
    };
  } catch (error) {
    console.error(error); // Log the error for debugging
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.toString(),
    };
  }
};






