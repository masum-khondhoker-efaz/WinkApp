import mongoose from 'mongoose';


const BusinessSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    tradeLicenseNumber: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const BusinessModel = mongoose.model('businesses', BusinessSchema);
export default BusinessModel;
