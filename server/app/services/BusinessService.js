import OrderModel from "../models/OrderModel.js";
import ProductModel from "../models/ProductModel.js";
import UserModel from "../models/UsersModel.js";



export const getAllOrdersService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    if (req.headers.role !== 'business') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    // Retrieve products belonging to this business user
    const products = await ProductModel.find({ userID });
    const productIDs = products.map((product) => product._id);

    // Retrieve all orders that contain items with those product IDs
    const orders = await OrderModel.find({
      'items.productID': { $in: productIDs },
    });

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Orders retrieved successfully',
      data: orders,
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


export const getOrderDetailsService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    if (req.headers.role !== 'business') {
      return res.status(401).json({
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      });
    }

    const orderID = req.params.id;
    // Retrieve the order details
    const order = await OrderModel.findOne({ _id: orderID });

    if (!order) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Order not found',
      };
    }

    // Retrieve the product details for each item in the order
    const products = await Promise.all(
      order.items.map(async (item) => {
        const product = await ProductModel.findOne({ _id: item.productID });
        if (!product) {
          throw new Error(`Product with ID ${item.productID} not found`);
        }
        return product;
      })
    );

    // Retrieve the business user details
    const businessUser = await UserModel.findOne({ _id: products[0].userID });

    if (!businessUser || businessUser._id.toString() !== userID) {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Business order details retrieved successfully',
      data: order,
    };
  } catch (error) {
    console.error(error); // Log the error for debugging
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    } ;
  }
};


export const updateOrderStatusService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    if (req.headers.role !== 'business') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    const { orderStatus } = req.body;
    const orderID = req.params.id;

    // Retrieve the order by ID
    const order = await OrderModel.findOne({ _id: orderID });

    if (!order) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Order not found',
      };
    }

    // Check if all products in the order belong to this business user
    const products = await ProductModel.find({
      _id: { $in: order.items.map((item) => item.productID) },
    });

    // Ensure that all products in the order belong to the business user
    const allProductsBelongToUser = products.length > 0 && products.every(
      (product) => product.userID.toString() === userID
    );

    if (!allProductsBelongToUser) {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access to update this order',
      };
    }

    // Update the order status
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { _id: orderID },
      { orderStatus: orderStatus },
      { new: true }
    );

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Order status updated successfully',
      data: updatedOrder,
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
