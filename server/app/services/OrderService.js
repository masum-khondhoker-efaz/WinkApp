import ProductModel from '../models/ProductModel.js';
import CartModel from '../models/CartModel.js';
import OrderModel from '../models/OrderModel.js';

import mongoose from 'mongoose';

export const createOrderService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userID = req.headers.user_id;

    // Check if the user is authorized to place an order
    if (req.headers.role !== 'individual') {
      await session.abortTransaction();
      session.endSession();
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    // Parse product IDs from the request body
    const {
      productIDs,
      paymentMethod,
      shippingAddress,
      billingAddress,
      notes,
    } = req.body;
    if (!productIDs || !Array.isArray(productIDs) || productIDs.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'No products specified for the order.',
      };
    }

    // Convert productIDs to ObjectId instances
    const productObjectIDs = productIDs.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Retrieve only the specified cart items for the user
    const cartItems = await CartModel.find({
      userID,
      productID: { $in: productObjectIDs },
    }).session(session);

    if (!cartItems || cartItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Selected products are not available in the cart.',
      };
    }

    // Calculate the total amount and create order items
    let totalAmount = 0;
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ProductModel.findById(item.productID).session(
          session
        );
        const finalPrice = product.discount
          ? product.discountPrice
          : product.price;

        // Check for valid finalPrice, else throw an error
        if (isNaN(finalPrice) || finalPrice == null) {
          throw new Error(`Invalid price for product ID ${item.productID}`);
        }

        // Calculate the total for each item and add it to the total amount
        const itemTotal = finalPrice * item.quantity;
        totalAmount += itemTotal;

        return {
          productID: item.productID,
          quantity: item.quantity,
          price: finalPrice,
          totalAmount: itemTotal,
        };
      })
    );
    // Create a new order
    const newOrder = new OrderModel({
      userID: userID,
      items: orderItems,
      totalAmount: totalAmount, // Use the calculated totalAmount
      paymentStatus: 'pending',
      paymentMethod: paymentMethod,
      orderStatus: 'pending',
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      notes: notes || '',
    });

    await newOrder.save({ session });

    // Remove the specified products from the user's cart
    await CartModel.deleteMany({
      userID,
      productID: { $in: productObjectIDs },
    }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      statusCode: 201,
      status: 'Success',
      message: 'Order added successfully',
      data: newOrder,
    };
  } catch (error) {
    // Roll back the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    };
  }
};


export const updateOrderService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userID = req.headers.user_id;

    // Check if the user is authorized to update an order
    if (req.headers.role !== 'individual') {
      await session.abortTransaction();
      session.endSession();
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }
    const orderID = req.params.id;
    const {
      productIDs,
      paymentMethod,
      shippingAddress,
      billingAddress,
      notes,
    } = req.body;
    if (!orderID) {
      await session.abortTransaction();
      session.endSession();
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Order ID is required.',
      };
    }

    // Find the order to update
    const order = await OrderModel.findById(orderID).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Order not found.',
      };
    }

    // Parse product IDs from the request body
    if (productIDs && (!Array.isArray(productIDs) || productIDs.length === 0)) {
      await session.abortTransaction();
      session.endSession();
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Invalid products specified for the order.',
      };
    }

    let totalAmount = 0;
    let orderItems = [];

    if (productIDs) {
      // Convert productIDs to ObjectId instances
      const productObjectIDs = productIDs.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      // Retrieve the specified products
      const products = await ProductModel.find({
        _id: { $in: productObjectIDs },
      }).session(session);

      if (!products || products.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return {
          statusCode: 400,
          status: 'Failed',
          message: 'Selected products are not available.',
        };
      }

      // Calculate the total amount and create order items
      orderItems = products.map((product) => {
        const finalPrice = product.discount
          ? product.discountPrice
          : product.price;

        // Check for valid finalPrice, else throw an error
        if (isNaN(finalPrice) || finalPrice == null) {
          throw new Error(`Invalid price for product ID ${product._id}`);
        }

        // Calculate the total for each item and add it to the total amount
        const itemTotal = finalPrice * 1; // Assuming quantity is 1 for simplicity
        totalAmount += itemTotal;

        return {
          productID: product._id,
          quantity: 1, // Assuming quantity is 1 for simplicity
          price: finalPrice,
          totalAmount: itemTotal,
        };
      });
    }

    // Update order details
    order.items = orderItems.length > 0 ? orderItems : order.items;
    order.totalAmount = totalAmount > 0 ? totalAmount : order.totalAmount;
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.shippingAddress = shippingAddress || order.shippingAddress;
    order.billingAddress = billingAddress || order.billingAddress;
    order.notes = notes || order.notes;

    await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Order updated successfully',
      data: order,
    };
  } catch (error) {
    // Roll back the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error(error);
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
    if (req.headers.role !== 'individual') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    const orderID = req.params.id;
    if (!orderID) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Order ID is required.',
      };
    }

    // Find the order by ID
    const order = await OrderModel.findOne({ _id: orderID, userID });
    if (!order) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Order not found.',
      };
    }

    // Check if the order belongs to the user
    if (order.userID.toString() !== userID) {
      return {
        statusCode: 403,
        status: 'Failed',
        message: 'Forbidden: You do not have access to this order.',
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Order details retrieved successfully',
      data: order,
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


export const getAllOrdersService = async (req, res) => {
    try {
        const userID = req.headers.user_id;
        if (req.headers.role !== 'individual') {
            return {
                statusCode: 401,
                status: 'Failed',
                message: 'Unauthorized Access',
            };
        }

        // Retrieve all orders for the specific user
        const orders = await OrderModel.find({ userID });

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


export const deleteOrderService = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userID = req.headers.user_id;
        if (req.headers.role !== 'individual') {
            await session.abortTransaction();
            session.endSession();
            return {
                statusCode: 401,
                status: 'Failed',
                message: 'Unauthorized Access',
            };
        }

        const orderID = req.params.id;
        if (!orderID) {
            await session.abortTransaction();
            session.endSession();
            return {
                statusCode: 400,
                status: 'Failed',
                message: 'Order ID is required.',
            };
        }

        // Find the order to delete
        const order = await OrderModel.findOne({ _id: orderID, userID }).session(session);
        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return {
                statusCode: 404,
                status: 'Failed',
                message: 'Order not found.',
            };
        }

        // Delete the order
        await OrderModel.deleteOne({ _id: orderID, userID }).session(session);

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return {
            statusCode: 200,
            status: 'Success',
            message: 'Order deleted successfully',
        };
    } catch (error) {
        // Roll back the transaction on error
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return {
            statusCode: 500,
            status: 'Failed',
            message: error.message || 'Internal Server Error',
        };
    }
};
