const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Las imagenes subidas se guardan en la carpeta que Express sirve como /uploads.
const DEFAULT_EVENT_IMAGES_DIR = path.resolve(__dirname, '../../uploads/events');
const EVENT_IMAGES_DIR = process.env.EVENT_IMAGES_DIR
  ? path.resolve(process.env.EVENT_IMAGES_DIR)
  : DEFAULT_EVENT_IMAGES_DIR;
const EVENT_IMAGES_PUBLIC_BASE_URL = (process.env.EVENT_IMAGES_PUBLIC_BASE_URL || '').replace(/\/$/, '');
const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

fs.mkdirSync(EVENT_IMAGES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, EVENT_IMAGES_DIR);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const safeExtension = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extension) ? extension : '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `event-${uniqueSuffix}${safeExtension}`);
  }
});

const eventImageUpload = multer({
  storage,
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

function getUploadedEventImageUrl(file) {
  if (!file) {
    return null;
  }

  const relativeUrl = `/uploads/events/${file.filename}`;
  return EVENT_IMAGES_PUBLIC_BASE_URL
    ? `${EVENT_IMAGES_PUBLIC_BASE_URL}${relativeUrl}`
    : relativeUrl;
}

function deleteEventImageFile(imageUrl) {
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

  if (!imagePath.startsWith('/uploads/events/')) {
    return;
  }

  const filename = path.basename(imagePath);
  const targetPath = path.join(EVENT_IMAGES_DIR, filename);

  if (!targetPath.startsWith(EVENT_IMAGES_DIR)) {
    return;
  }

  fs.promises.unlink(targetPath).catch((error) => {
    if (error.code !== 'ENOENT') {
      console.error('Error deleting event image:', error);
    }
  });
}

module.exports = {
  eventImageUpload,
  getUploadedEventImageUrl,
  deleteEventImageFile
};
