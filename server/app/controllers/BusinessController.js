import {
  getAllOrdersService,
  getOrderDetailsService,
  updateOrderStatusService,
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