import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    price: { type: String, required: true },
    discount: { type: Boolean},
    discountPrice: { type: String},
    image  : { type: [String], required: true },
    rating: { type: String, ref: 'reviews' },
    stock: { type: Boolean, required: true },
    quantity: { type: String, required: true },
    remark: { type: String },
    categoryName: { type: String, required: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ProductModel = mongoose.model('products', DataSchema);

export default ProductModel;
