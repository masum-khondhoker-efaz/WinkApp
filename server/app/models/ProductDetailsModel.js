import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
  {
    img1: { type: String, required: true },
    img2: { type: String, },
    img3: { type: String, },
    img4: { type: String, },
    img5: { type: String },
    img6: { type: String },
    img7: { type: String },
    img8: { type: String },
    description: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    productID: { type: mongoose.Schema.Types.ObjectId, ref:'products', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ProductDetailModel = mongoose.model('product-details', DataSchema);

export default ProductDetailModel;
