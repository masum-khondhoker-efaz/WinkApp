import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref:'users', required: true },
    productID: { type: mongoose.Schema.Types.ObjectId, ref:'products', required: true },
    comments: { type: String, required: true },
    rating: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ReviewModel = mongoose.model('reviews', DataSchema);

export default ReviewModel;
