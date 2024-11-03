import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import UserModel from '../models/UsersModel.js';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);




export const profileImageUploadService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const uploadedFile = req.files.file; // 'file' is the name attribute in the form

    // Set upload path
    const userUploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', userId);

    // Check if the user's upload directory exists, if not create it
    if (!fs.existsSync(userUploadDir)) {
      fs.mkdirSync(userUploadDir, { recursive: true }); // Create directory if it doesn't exist
    }

    // Fetch the current user and their existing image
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    // Delete the existing profile image if it exists
    if (user.image) {
      const existingImagePath = path.join(
        __dirname, '..', '..', 'public', user.image
      );
      if (fs.existsSync(existingImagePath)) {
        fs.unlinkSync(existingImagePath); // Delete the old image file
      }
    }

    // Use the original filename for the uploaded file
    const sanitizedFileName = uploadedFile.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    ); // Sanitize the original filename
    const timestampedFileName = `${Date.now()}-${sanitizedFileName}`;
    const originalUrl = `/uploads/${userId}/${timestampedFileName}`;
    const uploadPath = path.join(userUploadDir, timestampedFileName); // Prepend timestamp

    // Use the mv() method to place the file on the server
    await new Promise((resolve, reject) => {
      uploadedFile.mv(uploadPath, (err) => {
        if (err) {
          reject(new Error('Error occurred while uploading the file.'));
        } else {
          resolve();
        }
      });
    });

    // Update the user's profile image in the database
    user.image = originalUrl; // Update the image URL
    await user.save(); // Save the updated user record

    return {
      statusCode: 201,
      status: true,
      data: 'File uploaded successfully!',
      fileName: timestampedFileName,
    };
  } catch (err) {
    return { status: false, data: err.toString() };
  }
};


//! upload multiple images
export const uploadMultipleFileService = async (req) => {
    console.log(req.files.file);


    try {
        let files = req.files.file
        for (let i = 0; i < files.length; i++) {
            const uploadPath = path.join(__dirname, '../../uploads', Date.now() + "-" + files[i].name);
            files[i].mv(uploadPath, (err) => {
                if (err) {
                    return { status: true, data: "Error occurred while uploading the file." };
                }
            });
        }
        return { status: true, data: "File uploaded successfully!" };
    } catch (err) {
        return { status: false, data: err.toString() };
    }

}

// getUploadFileService
export const getUploadFileService = (req, res) => {
    try {
        const filename = req.params.fileName;
        const filePath = path.join(__dirname, '../../uploads', filename);
        return filePath
    } catch (err) {
        return { status: false, data: err.toString() };
    }
}

// deleteSingleFileService
export const deleteSingleFileService = (req, res) => {
    try {
        const filename = req.params.fileName;
        const filePath = path.join(__dirname, '../../uploads', filename);
        fs.unlink(filePath, (err) => {
            if (err) {
                res.status(500).send('Error Deleting File');
            }
        })
        return { status: true, data: "File deleted successfully!" };
    } catch (err) {
        return { status: false, data: err.toString() };
    }
}

// deleteMultipleFileService
export const deleteMultipleFileService = (req, res) => {
    try {
        let files = req.body.file
        for (let i = 0; i < files.length; i++) {
            const filePath = path.join(__dirname, '../../uploads', files[i]);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(err.toString());
                }
            })
        }
        return { status: true, data: "File deleted successfully!" };
    } catch (err) {
        return { status: false, data: err.toString() };
    }
}