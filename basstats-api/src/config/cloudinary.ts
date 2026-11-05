import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Sube un buffer de imagen directamente a Cloudinary.
 * Si falla o no está configurado, lanza un error (sin almacenamiento local).
 */
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = "basstats"
): Promise<string> => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary no está configurado en las variables de entorno del servidor.");
  }

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Error al subir archivo a Cloudinary"));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
};

export { cloudinary };
