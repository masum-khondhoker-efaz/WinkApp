import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
      otp: {
          type: String,
      },
      verifiedOtp: {
          type: Boolean,
          required: true,
          default: false,
      },
      otpExpiration: {
          type: Date,
          default: null,
      },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['individual', 'business'],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = mongoose.model('users', UserSchema);
export default UserModel;
