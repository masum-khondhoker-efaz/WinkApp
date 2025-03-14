import {
  deleteMultipleFileService,
  deleteSingleFileService,
  getUploadFileService,
  uploadMultipleFileService,
  profileImageUploadService,
} from '../services/FileService.js';

export const profileImageUpload = async (req, res) => {
  let result = await profileImageUploadService(req);
  return res.status(result.statusCode).json(result);
};



export const uploadMultipleFile = async (req, res) => {
    let result = await uploadMultipleFileService(req);
    return res.status(200).json(result);
}

export const getUploadFile = (req, res) => {
    let result = getUploadFileService(req, res);
    return res.sendFile(result);
}

export const deleteSingleFile = (req, res) => {
    let result = deleteSingleFileService(req, res);
    return res.status(200).json(result);
}

export const deleteMultipleFile = (req, res) => {
    let result = deleteMultipleFileService(req, res);
    return res.status(200).json(result);
}