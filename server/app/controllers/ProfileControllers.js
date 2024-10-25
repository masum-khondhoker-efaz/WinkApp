import {
  userProfileService,
  profileUpdateService,
} from '../services/ProfileService.js';



export const userProfile = async (req, res) => {
  let result = await userProfileService(req, res);
  return res.status(result.statusCode).json(result);
};


export const profileUpdate = async (req, res) => {
  let result = await profileUpdateService(req, res);
  return res.status(result.statusCode).json(result);
};


