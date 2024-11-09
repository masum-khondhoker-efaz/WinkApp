import dotenv from 'dotenv';
dotenv.config();

export const PORT = 3000;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const JWT_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000;

export const EMAIL_HOST = '';
export const EMAIL_PORT = 465;
export const EMAIL_SECURITY = true;
export const EMAIL_USER = 'mefaz201108@bscse.uiu.ac.bd';
export const EMAIL_PASSWORD = 'bdiw mcup ldnr epnu';
export const EMAIL_UN_AUTHORIZATION = false;

export const WEB_CACHE = false;
export const MAX_JSON_SIZE = '10mb';
export const URL_ENCODE = true;

export const REQUEST_TIME = 20 * 60 * 1000;
export const REQUEST_NUMBER = 2000;

export const STORE_ID = 'xxxx';
export const STORE_PASSWORD = 'xxxx';
export const CURRENCY = 'BDT';
export const SUCCESS_URL = '';
export const FAIL_URL = '';
export const CANCEL_URL = '';
export const INIT_URL = '';

export const STRIPE_KEY = process.env.SECRET_KEY;
export const STRIPE_PUBLIC_KEY = process.env.PUBLISHABLE_KEY;
export const CRYPTO_SECRET_KEY = process.env.ENCRYPTION_KEY;