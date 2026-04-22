const fs = require('fs');
const path = require('path');
const multer = require('multer');

const EVENT_IMAGES_DIR = path.join(__dirname, '../../uploads/events');
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
  return file ? `/uploads/events/${file.filename}` : null;
}

function deleteEventImageFile(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/events/')) {
    return;
  }

  const filename = path.basename(imageUrl);
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
