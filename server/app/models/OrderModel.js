import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        items: [
            {
                productID: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        paymentMethod: {
            type: String,
            enum: ['Credit Card', 'PayPal', 'Google Pay', 'Stripe', 'Cash on Delivery'],
            required: true
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        shippingAddress: {
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String
        },
        billingAddress: {
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String
        },
        trackingNumber: {
            type: String,
            default: null
        },
        notes: {
            type: String,
            default: ''
        },

    },
    {
        timestamps: true,
        versionKey: false
    });

const OrderModel  = mongoose.model('orders', orderSchema);

export default OrderModel;