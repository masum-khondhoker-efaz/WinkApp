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


export const cloudinaryDeleteImage = async (imageUrl) => {
  try {
    // Extract the publicId based on the assumption of folder structure and format in Cloudinary
    const segments = imageUrl.split('/');
    const publicId = segments.slice(-1).join('/').split('.')[0]; // captures the last three segments without the extension

    console.log(`Extracted publicId for deletion: ${publicId}`);

    // Call Cloudinary API to delete the image using the extracted publicId
    const data = await cloudinary.uploader.destroy(publicId);

    if (data.result !== 'ok') {
      console.warn(
        `Failed to delete image. Cloudinary response: ${JSON.stringify(data)}`
      );
    } else {
      console.log(`Successfully deleted image with publicId: ${publicId}`);
    }

    return data;
  } catch (error) {
    console.error(`Error deleting image from Cloudinary: ${error}`);
    return { error: error.message };
  }
};



