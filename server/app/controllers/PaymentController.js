export const paymentSetup = async (req, res) => {
  let result = await paymentSetupService(req, res);
  return res.status(result.statusCode).json(result);
};

export const paymentInitiate = async (req, res) => {
  let result = await paymentInitiateService(req, res);
  return res.status(result.statusCode).json(result);
};

export const paymentWebhook = async (req, res) => {
  let result = await productDetailsService(req, res);
  return res.status(result.statusCode).json(result);
};

export const getProductByCategory = async (req, res) => {
  let result = await getProductByCategoryService(req, res);
  return res.status(result.statusCode).json(result);
};
