import mongoose from 'mongoose';


const WishSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const WishModel= mongoose.model('wishes', WishSchema);

export default WishModel;