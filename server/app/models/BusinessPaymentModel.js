import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const BusinessSchema = new Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    secretKey: {
      type: String,
      required: true,
    },
    publishableKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const BusinessPaymentModel = mongoose.model(
  'shop-payment-details',
  BusinessSchema
);
export default BusinessPaymentModel;
