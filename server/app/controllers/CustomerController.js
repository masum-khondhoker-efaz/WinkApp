import {
  getAllShopsAndProductsService,
  getShopByIDService,
  getProductDetailsByIDService,
  getFeaturedProductsService,
  getProductsByCategoryService,
} from '../services/CustomerService.js';


export const getAllShopsAndProducts = async (req, res) => {
  let result = await getAllShopsAndProductsService(req, res);
  return res.status(result.statusCode).json(result);
};

export const getShopByID = async (req, res) => {
  let result = await getShopByIDService(req, res);
  return res.status(result.statusCode).json(result);
};

export const getProductDetailsByID = async (req, res) => { 
  let result = await getProductDetailsByIDService(req, res);
  return res.status(result.statusCode).json(result);
};


export const getFeaturedProducts = async (req, res) => {
  let result = await getFeaturedProductsService(req, res);
  return res.status(result.statusCode).json(result);
};



export const getProductsByCategory = async (req, res) => {
  let result = await getProductsByCategoryService(req, res);
  return res.status(result.statusCode).json(result);
};







