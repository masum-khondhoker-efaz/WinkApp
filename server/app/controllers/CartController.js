import { addToCartService, deleteToCartService, getAllCartService, updateToCartService } from "../services/CartService.js";



export const addToCart = async (req, res) => {
  let result = await addToCartService(req, res);
  return res.status(result.statusCode).json(result);
};

export const getAllCart = async (req, res) => {
  let result = await getAllCartService(req, res);
  return res.status(result.statusCode).json(result);
};


export const updateToCart = async (req, res) => {
  let result = await updateToCartService(req, res);
  return res.status(result.statusCode).json(result);
};



export const deleteToCart = async (req, res) => {
  let result = await deleteToCartService(req, res);
  return res.status(result.statusCode).json(result);
};
