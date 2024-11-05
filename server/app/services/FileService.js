import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import UserModel from '../models/UsersModel.js';
import {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
} from '../middlewares/multermiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const profileImageUploadService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const uploadedFile = req.files.file; // 'file' is the name attribute in the form

    
    // Fetch the current user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    // Delete the existing profile image from Cloudinary if it exists
    if (user.image) {
      const deleteResponse = await cloudinaryDeleteImage(user.image);
      if (deleteResponse.error) {
        console.error(`Error deleting previous image: ${deleteResponse.error}`);
      }
    }
    
    // Check for the correct file path
    const filePath = uploadedFile.tempFilePath || uploadedFile.path;
    
    
    if (!filePath) {
      // If `tempFilePath` and `path` are undefined, manually create a temporary file path
      const tempFilePath = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'uploads',
        `${userId}`,
        Date.now() + '-' + uploadedFile.name
      );
      console.log(user.filePath); 
      // Ensure the directory exists
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
      fs.writeFileSync(tempFilePath, uploadedFile.data);

      // Upload the new image to Cloudinary
      const uploadResponse = await cloudinaryUploadImage(tempFilePath);
      if (uploadResponse.error) {
        throw new Error(`Image upload failed: ${uploadResponse.error}`);
      }

      // Clean up local temporary file
      fs.unlinkSync(tempFilePath);

      // Update the user's profile image in the database
      user.image = uploadResponse.secure_url;
      await user.save();

      return {
        statusCode: 201,
        status: 'Success',
        message: 'File uploaded successfully!',
        fileName: uploadResponse.secure_url,
      };
    } else {
      // If a valid file path exists, upload directly
      const uploadResponse = await cloudinaryUploadImage(filePath);
      if (uploadResponse.error) {
        throw new Error(`Image upload failed: ${uploadResponse.error}`);
      }

      // Update the user's profile image in the database
      user.image = uploadResponse.secure_url;
      await user.save();

      // Clean up local temporary file if needed
      if (filePath !== uploadedFile.path) {
        fs.unlinkSync(filePath);
      }

      return {
        statusCode: 201,
        status: 'Success',
        message: 'File uploaded successfully!',
        fileName: uploadResponse.secure_url,
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      status: 'Failed',
      message: `Error: ${err.message}`,
    };
  }
};

//! upload multiple images
export const uploadMultipleFileService = async (req) => {
  console.log(req.files.file);

  try {
    let files = req.files.file;
    for (let i = 0; i < files.length; i++) {
      const uploadPath = path.join(
        __dirname,
        '../../uploads',
        Date.now() + '-' + files[i].name
      );
      files[i].mv(uploadPath, (err) => {
        if (err) {
          return {
            status: true,
            data: 'Error occurred while uploading the file.',
          };
        }
      });
    }
    return { status: true, data: 'File uploaded successfully!' };
  } catch (err) {
    return { status: false, data: err.toString() };
  }
};

// getUploadFileService
export const getUploadFileService = (req, res) => {
  try {
    const filename = req.params.fileName;
    const filePath = path.join(__dirname, '../../uploads', filename);
    return filePath;
  } catch (err) {
    return { status: false, data: err.toString() };
  }
};

// deleteSingleFileService
export const deleteSingleFileService = (req, res) => {
  try {
    const filename = req.params.fileName;
    const filePath = path.join(__dirname, '../../uploads', filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        res.status(500).send('Error Deleting File');
      }
    });
    return { status: true, data: 'File deleted successfully!' };
  } catch (err) {
    return { status: false, data: err.toString() };
  }
};

// deleteMultipleFileService
export const deleteMultipleFileService = (req, res) => {
  try {
    let files = req.body.file;
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(__dirname, '../../uploads', files[i]);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err.toString());
        }
      });
    }
    return { status: true, data: 'File deleted successfully!' };
  } catch (err) {
    return { status: false, data: err.toString() };
  }
};
