import { TokenDecode } from '../utilities/TokenUtility.js';

export default (req, res, next) => {
  try {
    let token = req.cookies['Token'];
    
    if (!token) {
      return res
        .status(401)
        .json({ status: 'Failed', message: 'Unauthorized, no token provided' });
    }

    let decoded = TokenDecode(token);

    if (!decoded) {
      res.clearCookie('Token');
      return res
        .status(401)
        .json({ status: 'Failed', message: 'Unauthorized, invalid token' });
    }

    let options = {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    };
    res.cookie('Token', token, options);

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
