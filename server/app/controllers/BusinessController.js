import {
  getAllOrdersService,
  getOrderDetailsService,
  updateOrderStatusService,
  addPaymentDetailsService,
  updatePaymentDetailsService,
  getPaymentDetailsService,
} from '../services/BusinessService.js';


export const getAllOrders = async (req, res) => {
  let result = await getAllOrdersService(req, res);
  return res.status(result.statusCode).json(result);
};

export const getOrderDetails = async (req, res) => {
  let result = await getOrderDetailsService(req, res);
  return res.status(result.statusCode).json(result);
};

export const updateOrderStatus = async (req, res) => {
  let result = await updateOrderStatusService(req, res);
  return res.status(result.statusCode).json(result);
};



export const addPaymentDetails = async (req, res) => {
  let result = await addPaymentDetailsService(req, res);
  return res.status(result.statusCode).json(result);
};


export const updatePaymentDetails = async (req, res) => {
  let result = await updatePaymentDetailsService(req, res);
  return res.status(result.statusCode).json(result);
};



export const getPaymentDetails = async (req, res) => {
  let result = await getPaymentDetailsService(req, res);
  return res.status(result.statusCode).json(result);
};



