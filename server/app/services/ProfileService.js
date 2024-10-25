import BusinessModel from '../models/BusinessesModel.js';
import IndividualModel from '../models/IndividualsModel.js';
import UsersModel from '../models/UsersModel.js';
import { TokenEncode } from '../utilities/TokenUtility.js';
import mongoose from 'mongoose';

export const userProfileService = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    let userProfile;

    if (req.headers.role === 'individual') {
      userProfile = await IndividualModel.aggregate([
        {
          $match: { userID: new mongoose.Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userID',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            phone: 1,
            'userDetails.image': 1,
            'userDetails.email': 1,
            'userDetails.role': 1,
          },
        },
      ]);
    } else if (req.headers.role === 'business') {
      userProfile = await BusinessModel.aggregate([
        {
          $match: { userID: new mongoose.Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userID',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true }, // Unwind the userDetails array
        },
        {
          $project: {
            _id: 1,
            businessName: 1,
            tradeLicenseNumber: 1,
            location: 1,
            'userDetails.image': 1,
            'userDetails.email': 1,
            'userDetails.role': 1,
          },
        },
      ]);
    }

    if (!userProfile || userProfile.length === 0) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'User Profile Not Found',
      };
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'User Profile Successfully Retrieved',
      data: userProfile[0], // Since aggregate returns an array
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};

export const profileUpdateService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, businessName, tradeLicenseNumber, location, phone } = req.body;
    const userId = req.headers.user_id;
    const role = req.headers.role;
    if (role === 'individual') {
      await IndividualModel.updateOne(
        { userID: new mongoose.Types.ObjectId(userId) },
        { $set: { name } },
        { session }
      );
    } else if (role === 'business') {
      await BusinessModel.updateOne(
        { userID: new mongoose.Types.ObjectId(userId) },
        { $set: { businessName, tradeLicenseNumber, location } },
        { session }
      );
    }
    const existPhone = await UsersModel.findOne({ phone }).session(session);
    if (existPhone && existPhone._id.toString() !== userId) {
      return {
        statusCode: 409,
        status: 'Failed',
        message: 'Phone number already exists.',
      };
    }

    await UsersModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { phone } },
      { session }
    );

    await session.commitTransaction();
    return {
      statusCode: 200,
      status: 'Success',
      message: 'User Profile Updated Successfully',
    };
  } catch (error) {
    await session.abortTransaction();
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  } finally {
    session.endSession();
  }
};
