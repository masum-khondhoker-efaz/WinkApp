import {
  loginService,
  individualRegisterService,
  businessRegisterService,
  verifyOtpService
} from '../services/UsersServices.js';



export const login = async (req, res) => {
  let result = await loginService(req, res);
  return res.status(result.statusCode).json(result);
};


export const individualRegister = async (req, res) => {
  let result = await individualRegisterService(req,res);
  return res.status(result.statusCode).json(result);
};


export const businessRegister = async (req, res) => {
  let result = await businessRegisterService(req,res);
  return res.status(result.statusCode).json(result);
};

export const verifyOtp = async (req, res) => {
  let result = await verifyOtpService(req,res);
  return res.status(result.statusCode).json(result);
};

