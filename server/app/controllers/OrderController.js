import { createOrderService, updateOrderService, getOrderDetailsService, getAllOrdersService, deleteOrderService } from "../services/OrderService.js";



export const createOrder = async (req, res) => {
    let result = await createOrderService(req, res);
    return res.status(result.statusCode).json(result);
};

export const updateOrder = async (req, res) => {
    let result = await updateOrderService(req, res);
    return res.status(result.statusCode).json(result);
};


export const getOrderDetails = async (req, res) => {
    let result = await getOrderDetailsService(req, res);
    return res.status(result.statusCode).json(result);
};



export const getAllOrders = async (req, res) => {
    let result = await getAllOrdersService(req, res);
    return res.status(result.statusCode).json(result);
};


export const deleteOrder = async (req, res) => {
    let result = await deleteOrderService(req, res);
    return res.status(result.statusCode).json(result);
};


