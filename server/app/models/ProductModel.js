import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Boolean },
    discountPrice: { type: Number },
    images: { type: [String], required: true },
    stock: { type: Boolean, required: true },
    quantity: { type: String, required: true },
    categoryName: { type: String, required: true },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ProductModel = mongoose.model('products', DataSchema);

export default ProductModel;
