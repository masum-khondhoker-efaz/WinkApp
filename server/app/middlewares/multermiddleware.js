import { v2 as cloudinary } from 'cloudinary';



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUploadImage = async (fileToUpload) => {
  try {
    //cloudinary.uploader.upload("my_image.jpg", function(error, result) {console.log(result, error)});
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: 'auto',
    });
    return data;
    //return {
    //    url: data.secure_url
    //}
  } catch (error) {
    return error;
  }
};
