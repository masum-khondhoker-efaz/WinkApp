import ProductModel from '../models/ProductModel.js';
import CartModel from '../models/CartModel.js';
import OrderModel from '../models/OrderModel.js';

import mongoose from 'mongoose';
import PaymentModel from '../models/PaymentModel.js';
import Stripe from 'stripe';
import { STRIPE_KEY } from '../config/config.js';
import IndividualModel from '../models/IndividualsModel.js';
import UserModel from '../models/UsersModel.js';
import BusinessPaymentModel from '../models/BusinessPaymentModel.js';



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

    // Fetch the secretKey from BusinessPaymentModel using userID from ProductModel
    const productOwner = await ProductModel.findById(productObjectIDs[0]).select('userID').session(session);
    const businessPaymentDetails = await BusinessPaymentModel.findOne({ userID: productOwner.userID }).session(session);

    if (!businessPaymentDetails) {
      throw new Error('Payment details not found for the product owner.');
    }

    const stripe = new Stripe(businessPaymentDetails.secretKey);

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({

      payment_method_types: ['card'],
      line_items: await Promise.all(orderItems.map(async (item) => {
        const product = await ProductModel.findById(item.productID).session(session);
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Product name: ${product.title}`,
            },
            unit_amount: item.price * 100, // Stripe expects amount in cents
          },
          quantity: item.quantity,
        };
      })),
      mode: 'payment',
      success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'http://localhost:3000/payment-cancel',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Specify the actual country codes you want to allow
      },
      billing_address_collection: 'required',
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userID,
        customer_shipping_address: JSON.stringify(shippingAddress),
        customer_billing_address: JSON.stringify(billingAddress),
        customer_notes: notes || '',
      },
    });

    // Store payment information in PaymentModel with status based on Stripe session
    
      const payment = new PaymentModel({
        paymentId: stripeSession.id,
        productName: await Promise.all(orderItems.map(async item => {
          const product = await ProductModel.findById(item.productID).session(session);
          return product.title; // Fetch product name from ProductModel
        })).then(names => names.join(', ')), // Concatenate product names
        orderId: newOrder._id,
        userId: userID,
        totalAmount: totalAmount,
        currency: 'USD',
        customerDetails: {
          name: (await IndividualModel.findOne({ userID })).name, // Fetch customer name from IndividualModel
          email: (await UserModel.findById(userID)).email, // Fetch customer email from UserModel
          phone: (await UserModel.findById(userID)).phone, // Fetch customer phone from UserModel
        },
        paymentMethod: paymentMethod,
        paymentStatus: 'unpaid', // Set status based on Stripe session payment status
        mode: 'payment',
      });

      await payment.save({ session });
    

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      statusCode: 201,
      status: 'Success',
      message: 'Order added successfully',
      data: {
        order: newOrder,
        stripeSessionId: stripeSession.id, // Include Stripe session ID
        stripeSession: stripeSession,
      },
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

export const createOrderService1 = async (req, res) => {
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
    const order = await OrderModel.findOne({ _id: orderID, userID }).session(
      session
    );
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
