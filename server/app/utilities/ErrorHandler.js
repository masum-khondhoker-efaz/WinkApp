import fs from 'fs';

const CreateError = (msg, status) => {
  const e = new Error(msg);
  e.status = status; //404
  return e;
};

export const NotFoundError = (req, res, next) => {
  let data = req.originalUrl;
  const error = CreateError(`Your Requested ${data} `, 404);

  next(error);
};

export const DefaultErrorHandler = (err, req, res, next) => {
  const message = err.message ? err.message : 'Server Error Occured';
  const status = err.status ? err.status : 500;

  res.status(status).json({
    message,
    stack: err.stack,
  });

  const logger = fs.createWriteStream('error.log', {
    flags: 'a',
  });

  const logMes = message + '|| ' + err.toString() + '|| ' + new Date() + '\n';

  logger.write(logMes);
};
