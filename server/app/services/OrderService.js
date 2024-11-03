import ProductModel from "../models/ProductModel.js";
import CartModel from "../models/CartModel.js";
import OrderModel from "../models/OrderModel.js";

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
        const { productIDs, paymentMethod, shippingAddress, billingAddress, notes } = req.body;
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
        const productObjectIDs = productIDs.map(id => new mongoose.Types.ObjectId(id));

        // Retrieve only the specified cart items for the user
        const cartItems = await CartModel.find({
            userID,
            productID: { $in: productObjectIDs }
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
        const orderItems = await Promise.all(cartItems.map(async item => {
            const product = await ProductModel.findById(item.productID).session(session);
            const finalPrice = product.discount ? product.discountPrice : product.price;

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
                totalAmount: itemTotal
            };
        }));
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
            notes: notes || ''
        });

        await newOrder.save({ session });

        // Remove the specified products from the user's cart
        await CartModel.deleteMany({
            userID,
            productID: { $in: productObjectIDs }
        }).session(session);

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return {
            statusCode: 201,
            status: 'Success',
            message: 'Order added successfully',
            data: newOrder
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
    try {
        const userID = req.headers.user_id;
        if (req.headers.role !== 'individual') {
            return {
                statusCode: 401,
                status: 'Failed',
                message: 'Unauthorized Access',
            };
        }


        return {
            statusCode: 200,
            status: 'Success',
            message: 'Order updated successfully',

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
        if (req.headers.role !== 'individual') {
            return {
                statusCode: 401,
                status: 'Failed',
                message: 'Unauthorized Access',
            };
        }

        return {
            statusCode: 201,
            status: 'Success',
            message: 'Order details successfully',

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


        return {
            statusCode: 200,
            status: 'Success',
            message: 'Orders retrieved successfully',

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
    try {
        const userID = req.headers.user_id;
        if (req.headers.role !== 'individual') {
            return {
                statusCode: 401,
                status: 'Failed',
                message: 'Unauthorized Access',
            };
        }


        return {
            statusCode: 201,
            status: 'Success',
            message: 'Order deleted successfully',

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


