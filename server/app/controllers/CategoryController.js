import { categoryListService } from "../services/CategoryService.js";



export const categoryList = async (req, res) => {
  let result = await categoryListService();
  return res.status(result.statusCode).json(result);
};
