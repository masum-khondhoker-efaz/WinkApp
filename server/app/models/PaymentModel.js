import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    orderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'orders',
      required: true,
    },
    customerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'individuals',
      required: true,
    },
    shopID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'businesses',
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    paymentMethod: { type: String, required: true }, 
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentDate: { type: Date, default: Date.now },
    transactionID: { type: String }, 
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PaymentModel = mongoose.model('payments', PaymentSchema);
export default PaymentModel;
