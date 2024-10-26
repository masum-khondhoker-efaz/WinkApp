import BusinessModel from '../models/BusinessesModel.js';
import IndividualModel from '../models/IndividualsModel.js';
import UsersModel from '../models/UsersModel.js';
import { TokenEncode } from '../utilities/TokenUtility.js';
import  SendEmail  from '../utilities/EmailUtility.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import mongoose from 'mongoose';
import {JWT_SECRET_KEY} from "../config/config.js";



const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|int|info|bd|co|io|ai)$/;
let otpStore = {}; // Temporary in-memory store for OTPs, should use Redis or similar in production



export const loginService = async (req,res) => {
  try {
    
    let { email, phone, password, rememberMe } = req.body;

    let data = await UsersModel.aggregate([
      { $match: { email, phone } },
      { $project: { _id: 1, phone: 1, password: 1, email: 1, role: 1 } },
    ]);
    

    if (data.length === 0) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'User not found',
      };
    }

    let passwordCompared = await bcrypt.compare(password, data[0]['password']);
    if (!passwordCompared) {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized',
      };
    }
    let token = TokenEncode(data[0]['email'], data[0]['role'], data[0]['_id']);

    if(rememberMe){
      let options = {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      };
      res.cookie('Token', token, options);
    }else{
      let options = {
        httpOnly: true, 
        sameSite: 'none', 
        secure: true,
      };
      res.cookie('Token', token, options); 
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'User Login Successfully',
      data: { token: token, role: data[0]['role'] },
    };
  } catch (error) {
    return { statusCode: 500, status: 'Failed', message: error.toString() };
  }
};


export const individualRegisterService = async (req, res) => {
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction();
  try {
    const { email, phone, password, confirmPassword, role, name } = req.body;

    // Basic validation
    if (password !== confirmPassword) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Passwords do not match.',
      };
    }

    // Check email format
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Invalid email format.',
      };
    }

    // Check for existing email and phone
    const existingUser = await UsersModel.findOne({ email }).session(session);
    if (existingUser) {
      return {
        statusCode: 409,
        status: 'Failed',
        message: 'Email already exists.',
      };
    }
    const existPhone = await UsersModel.findOne({ phone }).session(session);
    if (existPhone) {
      return res.status(409).json({
        status: 'Failed',
        message: 'Phone number already exists.',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const EmailText = `Your OTP code is ${otp}`;
    const EmailSubject = `OTP for registration from WinkApp`;
    const emailSent = await SendEmail(email, EmailText, EmailSubject );
    if (!emailSent) {
      return {
        statusCode: 500,
        status: 'Failed',
        message: 'Failed to send OTP.',
      };
    }

    // Insert the data into UsersModel and IndividualModel with verifiedOtp as false
    const user = await UsersModel.create(
        [
          {
            email: email,
            phone: phone,
            password: hashedPassword,
            role: role,
            otp: hashedOtp,
            validOtp: false,
            otpExpiration: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          },
        ],
        { session }
    );

    await IndividualModel.create(
        [
          {
            userID: user[0]._id,
            name: name,
          },
        ],
        { session }
    );

    // Generate JWT token
    const token = jwt.sign(
        { email: user[0]['email'], role: user[0]['role'], user_id: user[0]['_id'] },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '2h' }
    );

    await session.commitTransaction();


    return {
      statusCode: 201,
      status: 'Success',
      message: 'Registration successful. Please verify your OTP.',
      data: { token: token },
    };

  } catch (error) {
    await session.abortTransaction(); // Rollback on error
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.toString() };
  } finally {
    session.endSession(); // End session
  }
};




export const businessRegisterService = async (req, res) => {
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction();
  try {
    const { businessName, email, phone, password, confirmPassword, role, tradeLicenseNumber, location } = req.body;

    // Basic validation
    if (password !== confirmPassword) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Passwords do not match.',
      };
    }

    // Check email format
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Invalid email format.',
      };
    }

    // Check for existing email and phone
    const existingUser = await UsersModel.findOne({ email }).session(session);
    if (existingUser) {
      return {
        statusCode: 409,
        status: 'Failed',
        message: 'Email already exists.',
      };
    }
    const existPhone = await UsersModel.findOne({ phone }).session(session);
    if (existPhone) {
      return {
        statusCode: 409,
        status: 'Failed',
        message: 'Phone number already exists.',
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const EmailText = `Your OTP code is ${otp}`;
    const EmailSubject = `OTP for registration from WinkApp`;
    const emailSent = await SendEmail(email, EmailText, EmailSubject);
    if (!emailSent) {
      return {
        statusCode: 500,
        status: 'Failed',
        message: 'Failed to send OTP.',
      };
    }

    // Insert the data into UsersModel and BusinessModel with verifiedOtp as false
    const user = await UsersModel.create(
        [
          {
            email: email,
            phone: phone,
            password: hashedPassword,
            role: role,
            otp: hashedOtp,
            validOtp: false,
            otpExpiration: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          },
        ],
        { session }
    );

    await BusinessModel.create(
        [
          {
            userID: user[0]._id,
            businessName: businessName,
            tradeLicenseNumber: tradeLicenseNumber,
            location: location,
          },
        ],
        { session }
    );

    // Generate JWT token
    const token = jwt.sign(
        { email: user[0]['email'], role: user[0]['role'], user_id: user[0]['_id'] },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '2h' }
    );

    await session.commitTransaction();


    return {
      statusCode: 201,
      status: 'Success',
      message: 'Registration successful. Please verify your OTP.',
        data: { token: token },
    };

  } catch (error) {
    await session.abortTransaction(); // Rollback on error
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.toString(),
    };
  } finally {
    session.endSession(); // End session
  }
};




export const verifyOtpService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { otp } = req.body;
    const token = req.headers.token;
    if (!token) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Invalid token: Token not found.',
      };
    }
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    const email = decodedToken.email;

      if (!email) {
        return {
          statusCode: 400,
          status: 'Failed',
          message: 'Invalid token: Email not found.',
        };
      }
    // Find the user by email
    const user = await UsersModel.findOne({ email }).session(session);
    if (!user) {
      return{
        statusCode: 404,
        status: 'Failed',
        message: 'User not found.',
      };
    }

    // Check if OTP is already verified
    if (user.verifiedOtp) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'OTP already verified.',
      };
    }

    // Check if OTP has expired
    if (user.otpExpiration < Date.now()) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'OTP expired.',
      };
    }

    // Compare the provided OTP with the stored (hashed) OTP
    const otpValid = await bcrypt.compare(otp, user.otp);
    if (!otpValid) {
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'Invalid OTP.',
      };
    }

    // Mark OTP as verified
    user.verifiedOtp = true;
    user.otp = null;
    user.otpExpiration = null;
    await user.save({ session });

    await session.commitTransaction();
    return {
      statusCode: 200,
      status: 'Success',
      message: 'OTP verified successfully.',
    };
  } catch (error) {
    await session.abortTransaction(); // Rollback on error
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.toString()
    };
  } finally {
    session.endSession(); // End the session
  }
};












