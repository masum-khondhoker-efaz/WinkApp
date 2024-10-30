import { 
  addProductService,
  deleteProductByIDService, 
  deleteProductsService, 
  getProductByCategoryService, 
  getProductByIDService, 
  getProductsService, 
  productDetailsService, 
  updateProductService } 
  from "../services/ProductService.js";



export const addProduct = async (req, res) => {
  let result = await addProductService(req, res);
  return res.status(result.statusCode).json(result);
};

export const updateProduct = async (req, res) => {
  let result = await updateProductService(req, res);
  return res.status(result.statusCode).json(result);
};

export const productDetails = async (req, res) => {
  let result = await productDetailsService(req, res);
  return res.status(result.statusCode).json(result);
};

export const getProductByCategory = async (req, res) => {
  let result = await getProductByCategoryService(req, res);
  return res.status(result.statusCode).json(result);
};

export const getProductByID = async (req, res) => {
  let result = await getProductByIDService(req, res);
  return res.status(result.statusCode).json(result);
};

export const getProducts = async (req, res) => {
  let result = await getProductsService(req, res);
  return res.status(result.statusCode).json(result);
};

export const deleteProductByID = async (req, res) => {
  let result = await deleteProductByIDService(req, res);
  return res.status(result.statusCode).json(result);
};

export const deleteProducts = async (req, res) => {
  let result = await deleteProductsService(req, res);
  return res.status(result.statusCode).json(result);
};


