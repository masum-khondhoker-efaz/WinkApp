import {
  customerReviewService,
  getCustomerReviewService,
} from '../services/ReviewService.js';

export const customerReview = async (req, res) => {
  let result = await customerReviewService(req);
  return res.status(result.statusCode).json(result);
};

export const getCustomerReview = async (req, res) => {
  let result = await getCustomerReviewService(req);
  return res.status(result.statusCode).json(result);
};
