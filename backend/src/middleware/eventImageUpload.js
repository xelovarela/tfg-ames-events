/**
 * Configura la subida de imagenes de eventos.
 * Valida extensiones, tamano y destino fisico antes de que los controladores
 * guarden la ruta publica asociada al evento.
 */
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

// Las imagenes subidas se optimizan y se guardan en la carpeta que Express sirve como /uploads.
const DEFAULT_EVENT_IMAGES_DIR = path.resolve(__dirname, '../../uploads/events');
const DEFAULT_CATEGORY_IMAGES_DIR = path.resolve(__dirname, '../../uploads/categories');
const EVENT_IMAGES_DIR = process.env.EVENT_IMAGES_DIR
  ? path.resolve(process.env.EVENT_IMAGES_DIR)
  : DEFAULT_EVENT_IMAGES_DIR;
const CATEGORY_IMAGES_DIR = process.env.CATEGORY_IMAGES_DIR
  ? path.resolve(process.env.CATEGORY_IMAGES_DIR)
  : DEFAULT_CATEGORY_IMAGES_DIR;
const EVENT_IMAGES_PUBLIC_BASE_URL = (process.env.EVENT_IMAGES_PUBLIC_BASE_URL || '').replace(/\/$/, '');
const CATEGORY_IMAGES_PUBLIC_BASE_URL = (process.env.CATEGORY_IMAGES_PUBLIC_BASE_URL || '').replace(/\/$/, '');
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const EVENT_IMAGE_WIDTH = 900;
const EVENT_IMAGE_HEIGHT = 506;
const EVENT_IMAGE_QUALITY = 82;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

fs.mkdirSync(EVENT_IMAGES_DIR, { recursive: true });
fs.mkdirSync(CATEGORY_IMAGES_DIR, { recursive: true });

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES
  },
  fileFilter(req, file, callback) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return callback(new Error('Solo se permiten imagenes JPG, PNG, WEBP o GIF.'));
    }

    return callback(null, true);
  }
});

function getUploadedImagePublicUrl(uploadType, filename, publicBaseUrl) {
  const relativeUrl = `/uploads/${uploadType}/${filename}`;
  return publicBaseUrl
    ? `${publicBaseUrl}${relativeUrl}`
    : relativeUrl;
}

async function saveUploadedImage(file, { directory, uploadType, filenamePrefix, publicBaseUrl }) {
  if (!file) {
    return null;
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${filenamePrefix}-${uniqueSuffix}.webp`;
  const outputPath = path.join(directory, filename);

  await sharp(file.buffer)
    .rotate()
    .resize(EVENT_IMAGE_WIDTH, EVENT_IMAGE_HEIGHT, {
      fit: 'cover',
      position: 'centre'
    })
    .webp({ quality: EVENT_IMAGE_QUALITY })
    .toFile(outputPath);

  return getUploadedImagePublicUrl(uploadType, filename, publicBaseUrl);
}

async function saveUploadedEventImage(file) {
  return saveUploadedImage(file, {
    directory: EVENT_IMAGES_DIR,
    uploadType: 'events',
    filenamePrefix: 'event',
    publicBaseUrl: EVENT_IMAGES_PUBLIC_BASE_URL
  });
}

async function saveUploadedCategoryImage(file) {
  return saveUploadedImage(file, {
    directory: CATEGORY_IMAGES_DIR,
    uploadType: 'categories',
    filenamePrefix: 'category',
    publicBaseUrl: CATEGORY_IMAGES_PUBLIC_BASE_URL
  });
}

function deleteUploadedImageFile(imageUrl, { directory, uploadType }) {
  if (!imageUrl) {
    return;
  }

  let imagePath = imageUrl;
  if (/^https?:\/\//i.test(imageUrl)) {
    try {
      imagePath = new URL(imageUrl).pathname;
    } catch (error) {
      return;
    }
  }

  if (!imagePath.startsWith(`/uploads/${uploadType}/`)) {
    return;
  }

  const filename = path.basename(imagePath);
  const targetPath = path.join(directory, filename);
  const relativeTargetPath = path.relative(directory, targetPath);

  if (relativeTargetPath.startsWith('..') || path.isAbsolute(relativeTargetPath)) {
    return;
  }

  fs.promises.unlink(targetPath).catch((error) => {
    if (error.code !== 'ENOENT') {
      console.error(`Error deleting ${uploadType} image:`, error);
    }
  });
}

function deleteEventImageFile(imageUrl) {
  deleteUploadedImageFile(imageUrl, {
    directory: EVENT_IMAGES_DIR,
    uploadType: 'events'
  });
}

function deleteCategoryImageFile(imageUrl) {
  deleteUploadedImageFile(imageUrl, {
    directory: CATEGORY_IMAGES_DIR,
    uploadType: 'categories'
  });
}

module.exports = {
  eventImageUpload: imageUpload,
  categoryImageUpload: imageUpload,
  saveUploadedEventImage,
  saveUploadedCategoryImage,
  deleteCategoryImageFile,
  deleteEventImageFile
};
