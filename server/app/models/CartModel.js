import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const CartModel = mongoose.model('carts', CartSchema);

export default CartModel;