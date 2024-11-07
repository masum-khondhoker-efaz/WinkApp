import {
  retrieveSessionByIdService,
  paymentTransactionService,
  allPaymentTransactionService,
} from '../services/PaymentService.js';

export const retrieveSessionById = async (req, res) => {
  let result = await retrieveSessionByIdService(req, res);
  return res.status(result.statusCode).json(result);
};

export const paymentTransaction = async (req, res) => {
  let result = await paymentTransactionService(req, res);
  return res.status(result.statusCode).json(result);
};


export const allPaymentTransaction = async (req, res) => {
  let result = await allPaymentTransactionService(req, res);
  return res.status(result.statusCode).json(result);
};



// export const paymentInitiate = async (req, res) => {
//   let result = await paymentInitiateService(req, res);
//   return res.status(result.statusCode).json(result);
// };

// export const paymentWebhook = async (req, res) => {
//   let result = await productDetailsService(req, res);
//   return res.status(result.statusCode).json(result);
// };

// export const getProductByCategory = async (req, res) => {
//   let result = await getProductByCategoryService(req, res);
//   return res.status(result.statusCode).json(result);
// };
