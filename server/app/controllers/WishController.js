import { addToWishService, deleteToWishService, getAllWishService } from "../services/WishService.js";



export const addToWish = async (req, res) => {
  let result = await addToWishService(req, res);
  return res.status(result.statusCode).json(result);
};

export const getAllWish = async (req, res) => {
  let result = await getAllWishService(req, res);
  return res.status(result.statusCode).json(result);
};


export const deleteToWish = async (req, res) => {
  let result = await deleteToWishService(req, res);
  return res.status(result.statusCode).json(result);
};
