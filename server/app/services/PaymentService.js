import OrderModel from '../models/OrderModel.js';
import Stripe from 'stripe';
import PaymentModel from '../models/PaymentModel.js';
import SendEmail from '../utilities/EmailUtility.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import crypto from 'crypto';
import mongoose from 'mongoose';

import { CRYPTO_SECRET_KEY } from '../config/config.js';
import ProductModel from '../models/ProductModel.js';
import BusinessPaymentModel from '../models/BusinessPaymentModel.js';


// Define the algorithm and key (store key securely, e.g., in environment variables)
const algorithm = 'aes-256-cbc';
const key = Buffer.from(CRYPTO_SECRET_KEY, 'hex'); // Store key in an env variable
// Decryption function
const decrypt = (encrypted) => {
  const iv = Buffer.from(encrypted.iv, 'hex');
  const encryptedText = Buffer.from(encrypted.encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const createPDF = async (info) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points (width, height)

  // Draw a black border around the page
  const borderWidth = 2;
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 595.28, // Width of A4 in points
    height: 841.89, // Height of A4 in points
    borderColor: rgb(0, 0, 0),
    borderWidth: borderWidth,
    opacity: 1,
  });

  const invoiceHeading = 'PAYMENT INVOICE';
  const invoiceTextSize = 24;
  const invoiceTextWidth = invoiceHeading.length * (invoiceTextSize * 0.6);
  page.drawText(invoiceHeading, {
    x: (595.28 - invoiceTextWidth) / 2,
    y: 770,
    size: invoiceTextSize,
  });

  // Add company info at the top
  const companyName = 'WinkApp Team';
  page.drawText(companyName, {
    x: 50,
    y: 730,
    size: 20,
  });

  // Draw the main heading
  page.drawText(`Payment Confirmation for "${info.productName}" Order`, {
    x: 50,
    y: 700,
    size: 15,
  });

  page.drawText(`Payment ID: ${info._id}`, {
    x: 50,
    y: 680,
    size: 13,
  });

  page.drawText(`Order ID: ${info.orderId}`, {
    x: 50,
    y: 663,
    size: 13,
  });

  const formattedDate = new Intl.DateTimeFormat('en-GB').format(new Date());

  page.drawText(`Date: ${formattedDate}`, {
    x: 50,
    y: 646,
    size: 13,
  });

  // Add User Info Heading
  const userInfoHeading = 'User Information';
  const userInfoHeadingY = 610; // Position for User Info Heading
  page.drawText(userInfoHeading, {
    x: 50,
    y: userInfoHeadingY,
    size: 16,
    font: await pdfDoc.embedFont(StandardFonts.Helvetica), // Use a bold font for the heading
  });

  // Add User Info (Name, Email, Phone)
  page.drawText(`Name: ${info.customerDetails.name}`, {
    x: 50,
    y: userInfoHeadingY - 20,
    size: 12,
  });

  page.drawText(`Email: ${info.customerDetails.email}`, {
    x: 50,
    y: userInfoHeadingY - 40,
    size: 12,
  });

  if (info.customerDetails.phone) {
    page.drawText(`Phone: ${info.customerDetails.phone}`, {
      x: 50,
      y: userInfoHeadingY - 55,
      size: 12,
    });
  }

  // Define table headers
  const headers = ['Field', 'Details'];
  const headerY = userInfoHeadingY - 80; // Adjust position for table header
  const rowHeight = 20;

  // Draw table headers
  page.drawText(headers[0], { x: 50, y: headerY, size: 16 });
  page.drawText(headers[1], { x: 300, y: headerY, size: 16 });

  // Draw horizontal line below header
  page.drawRectangle({
    x: 45,
    y: headerY - 5,
    width: 510,
    height: 2,
    color: rgb(0, 0, 0),
  });

  // Fill in the table rows with payment info
  const rows = [
    { label: 'Payment Method', value: info.paymentMethod },
    { label: 'Payment Status', value: info.paymentStatus },
    { label: 'Mode', value: info.mode },
    {
      label: 'Total Amount',
      value: `${info.totalAmount.toFixed(2)} ${info.currency.toUpperCase()}`,
    },
  ];

  let currentY = headerY - 25; // Start drawing rows below the header
  for (const row of rows) {
    page.drawText(row.label, { x: 50, y: currentY, size: 14 });
    page.drawText(row.value, { x: 300, y: currentY, size: 14 });
    currentY -= rowHeight; // Move down for the next row
  }

  // Draw a horizontal line at the end of the table
  page.drawRectangle({
    x: 45,
    y: currentY + 5,
    width: 510,
    height: 2,
    color: rgb(0, 0, 0), // Black color for the line
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};



const retrievePaymentInfoBySessionIdFromStripe = async (sessionId) => {
  // Parse product IDs from the request body
  const { productIDs } = req.body;
  if (!productIDs || !Array.isArray(productIDs) || productIDs.length === 0) {
    await session.abortTransaction();
    session.endSession();
    return {
      statusCode: 400,
      status: 'Failed',
      message: 'No products specified for the order.',
    };
  }

  // Convert productIDs to ObjectId instances
  const productObjectIDs = productIDs.map(
    (id) => new mongoose.Types.ObjectId(id)
  );
  // Fetch the secretKey from BusinessPaymentModel using userID from ProductModel
  const productOwner = await ProductModel.findById(productObjectIDs[0])
    .select('userID')
    .session(session);
  const businessPaymentDetails = await BusinessPaymentModel.findOne({
    userID: productOwner.userID,
  }).session(session);

  if (!businessPaymentDetails) {
    throw new Error('Payment details not found for the product owner.');
  }

  const decryptedSecretKey = decrypt(
    JSON.parse(businessPaymentDetails.secretKey)
  );
  const stripe = new Stripe(decryptedSecretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });

  const info = {
    paymentId: session.id,
    orderId: session.metadata.orderId,
    userId: session.metadata.userId,
    productName: session.line_items.data[0].description,
    totalAmount: session.amount_total,
    currency: session.currency,
    customerDetails: session.customer_details,
    paymentMethod: session.payment_method_types[0],
    paymentStatus: session.payment_status,
    mode: session.mode,
  };

  if (session.payment_status === 'paid') {
    // Check if the payment already exists in the database
    let paymentInfo = await PaymentModel.findOne({ paymentId: sessionId });

    // Generate the PDF and send the email only for new payments
    const pdfBuffer = await createPDF(paymentInfo);
    const emailSubject = `Payment Confirmation for ${session.line_items.data[0].description}`;
    const emailTo = session.customer_details.email;
    const emailText = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Dear ${session.customer_details.name},</p>
            <p>Your payment is complete for ${session.line_items.data[0].description}</p>
            <p>Please ignore this email or contact support if you have any concerns.</p>
            <p>Thank you,<br>The GP Clinic Team</p>
       </div>`;
    const attachments = [
      {
        filename: `Payment_Confirmation_${session.line_items.data[0].description}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: 'application/pdf',
      },
    ];

    // Send the email
    await SendEmail(emailTo, emailText, emailSubject, attachments);

    return paymentInfo;
  }

  return info; // If payment is not "paid", simply return the info without sending an email
};


export const retrieveSessionByIdService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userID = req.headers.user_id;
    const sessionId = req.params.sessionId; // assuming sessionId is passed in the URL as a parameter

    if (req.headers.role !== 'individual') {
      await session.abortTransaction();
      session.endSession();
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    // Fetch the product owner's secretKey for Stripe from the database
    const { productIDs } = req.body;
    if (!productIDs || !Array.isArray(productIDs) || productIDs.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return {
        statusCode: 400,
        status: 'Failed',
        message: 'No products specified for the order.',
      };
    }

    const productObjectIDs = productIDs.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const productOwner = await ProductModel.findById(productObjectIDs[0])
      .select('userID')
      .session(session);
    const businessPaymentDetails = await BusinessPaymentModel.findOne({
      userID: productOwner.userID,
    }).session(session);

    if (!businessPaymentDetails) {
      throw new Error('Payment details not found for the product owner.');
    }

    const decryptedSecretKey = decrypt(
      JSON.parse(businessPaymentDetails.secretKey)
    );
    const stripe = new Stripe(decryptedSecretKey);

    // Retrieve the Stripe session using the session ID
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    // Extract payment information from the session
    const paymentInfo = {
      paymentId: stripeSession.id,
      orderId: stripeSession.metadata.orderId,
      userId: stripeSession.metadata.userId,
      productName: stripeSession.line_items.data[0].description,
      totalAmount: stripeSession.amount_total,
      currency: stripeSession.currency,
      customerDetails: stripeSession.customer_details,
      paymentMethod: stripeSession.payment_method_types[0],
      paymentStatus: stripeSession.payment_status,
      mode: stripeSession.mode,
    };

    // If the payment is complete, perform additional actions
    if (stripeSession.payment_status === 'paid') {
      // Check if the payment record exists, or create a new one if it doesn’t
      let paymentRecord = await PaymentModel.findOne({ paymentId: sessionId });
      if (!paymentRecord) {
        paymentRecord = new PaymentModel({
          paymentId: stripeSession.id,
          productName: stripeSession.line_items.data[0].description,
          orderId: stripeSession.metadata.orderId,
          userId: stripeSession.metadata.userId,
          totalAmount: stripeSession.amount_total,
          currency: stripeSession.currency,
          customerDetails: stripeSession.customer_details,
          paymentMethod: stripeSession.payment_method_types[0],
          paymentStatus: stripeSession.payment_status,
          mode: stripeSession.mode,
        });
        await paymentRecord.save({ session });
      }

      // Generate PDF for the payment confirmation
      const pdfBuffer = await createPDF(paymentRecord);
      const emailSubject = `Payment Confirmation for ${stripeSession.line_items.data[0].description}`;
      const emailTo = stripeSession.customer_details.email;
      const emailText = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Dear ${stripeSession.customer_details.name},</p>
            <p>Your payment is complete for ${stripeSession.line_items.data[0].description}</p>
            <p>Please ignore this email or contact support if you have any concerns.</p>
            <p>Thank you,<br>The GP Clinic Team</p>
       </div>`;
      const attachments = [
        {
          filename: `Payment_Confirmation_${stripeSession.line_items.data[0].description}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf',
        },
      ];

      // Send the email
      await SendEmail(emailTo, emailText, emailSubject, attachments);

      // Update the order and payment status in the database
      await OrderModel.updateOne(
        { _id: paymentInfo.orderId },
        {
          orderStatus: 'processing',
          paymentStatus: 'paid',
        },
        { session }
      );
      await PaymentModel.updateOne(
        { paymentId: sessionId },
        { paymentStatus: 'paid' },
        { session }
      );

      await session.commitTransaction();
      session.endSession();
      return {
        statusCode: 200,
        status: 'Success',
        message: 'Payment details retrieved and processed successfully',
        data: paymentInfo,
      };
    }

    await session.commitTransaction();
    session.endSession();
    return {
      statusCode: 200,
      status: 'Success',
      message: 'Payment details retrieved successfully',
      data: paymentInfo,
    };
  } catch (error) {
    // Roll back the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    };
  }
};



export const paymentTransactionService = async (req, res) => {
  try {
    const userID = req.headers.user_id;
    const transactionID = req.params.transactionID;

    if (req.headers.role !== 'individual') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    // Fetch payment details for the specific user
    const payment = await PaymentModel.find({
      userId: userID,
      paymentId: transactionID,
    });

    if (!payment) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Payment information not found',
      };
    }

    // Send the successful response with payment details
    return {
      statusCode: 200,
      status: 'Success',
      message: 'Payment transaction completed successfully',
      data: payment,
    };
  } catch (error) {
    console.error(error); // Log the error for debugging
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    };
  }
};


export const allPaymentTransactionService = async (req, res) => {
  try {
    const userID = req.headers.user_id;

    if (req.headers.role !== 'individual') {
      return {
        statusCode: 401,
        status: 'Failed',
        message: 'Unauthorized Access',
      };
    }

    // Fetch all payment details for the specific user
    const payments = await PaymentModel.find({ userId: userID });

    if (!payments) {
      return {
        statusCode: 404,
        status: 'Failed',
        message: 'Payment information not found',
      };
    }

    // Send the successful response with payment details
    return {
      statusCode: 200,
      status: 'Success',
      message: 'All payment transactions retrieved successfully',
      data: payments,
    };
  } catch (error) {
    console.error(error); // Log the error for debugging
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    };
  }
};