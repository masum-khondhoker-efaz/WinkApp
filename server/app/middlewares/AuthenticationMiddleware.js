import { TokenDecode } from '../utilities/TokenUtility.js';

export default (req, res, next) => {
  try {
    let token = req.headers['token'];

    
    if (!token) {
      return res
        .status(401)
        .json({ status: 'Failed', message: 'Unauthorized, no token provided' });
    }

    let decoded = TokenDecode(token);

    if (!decoded) {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized token',
      };
    }

    let { user_id, email, role } = decoded;

    req.headers.user_id = user_id;
    req.headers.email = email;
    req.headers.role = role;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'Failed', message: 'Internal Server Error' });
  }
};
