const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Root uploads and unified images directory
const ROOT_UPLOADS_DIR = path.join(__dirname, '../uploads');
const IMAGES_DIR = path.join(ROOT_UPLOADS_DIR, 'images');

// Ensure root uploads and images directories exist
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirExists(ROOT_UPLOADS_DIR);
ensureDirExists(IMAGES_DIR);

// Multer memory storage so raw files are compressed before writing to disk
const memoryStorage = multer.memoryStorage();

// Allowed image MIME types
const allowedMimes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/gif',
  'image/avif',
  'image/tiff',
  'image/bmp',
];

/**
 * Create a multer upload instance with memory storage
 * @param {Object} options
 * @param {number} options.maxSize - Max file size in bytes (default 15MB)
 * @param {number} options.maxFiles - Max file count (default 10)
 */
const createUploader = (options = {}) => {
  const maxSize = options.maxSize || 15 * 1024 * 1024; // 15MB default

  return multer({
    storage: memoryStorage,
    limits: {
      fileSize: maxSize,
      files: options.maxFiles || 10,
    },
    fileFilter: (req, file, cb) => {
      if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only valid image files (JPG, PNG, WEBP, GIF, AVIF, TIFF, BMP) are allowed!'));
      }
    },
  });
};

/**
 * Process a single file buffer with sharp -> convert to WebP and save directly to /uploads/images/
 * @param {Object} file - Multer file object
 * @param {Object} opts - Compression options (prefix, maxWidth, maxHeight, quality)
 */
const processFileToWebp = async (file, opts = {}) => {
  if (!file || !file.buffer) return null;

  ensureDirExists(IMAGES_DIR);

  const prefix = opts.prefix || 'img';
  const uniqueName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const outputPath = path.join(IMAGES_DIR, uniqueName);

  const maxWidth = opts.maxWidth || 1920;
  const maxHeight = opts.maxHeight || 1920;
  const quality = opts.quality || 84; // High visual fidelity (sharp & non-blurry, yet 70-85% smaller)

  let pipeline = sharp(file.buffer).rotate(); // Auto-rotate based on EXIF

  // Smart resize keeping aspect ratio without enlarging smaller images
  pipeline = pipeline.resize({
    width: maxWidth,
    height: maxHeight,
    fit: 'inside',
    withoutEnlargement: true,
  });

  // Convert to WebP with balanced effort & high quality
  pipeline = pipeline.webp({
    quality: quality,
    effort: 4,
    smartSubsample: true,
  });

  const info = await pipeline.toFile(outputPath);

  // Update file object properties to match saved WebP file
  file.filename = uniqueName;
  file.originalname = path.parse(file.originalname).name + '.webp';
  file.mimetype = 'image/webp';
  file.path = outputPath;
  file.destination = IMAGES_DIR;
  file.size = info.size;

  // Free memory buffer
  delete file.buffer;

  return file;
};

/**
 * Express middleware to compress and convert uploaded images to WebP inside /uploads/images
 * @param {Object} options - Custom resize, quality and prefix options
 */
const compressToWebp = (options = {}) => {
  return async (req, res, next) => {
    try {
      // If single file (upload.single)
      if (req.file) {
        await processFileToWebp(req.file, options);
      }

      // If array of files (upload.array)
      if (req.files && Array.isArray(req.files)) {
        await Promise.all(
          req.files.map((file) => processFileToWebp(file, options))
        );
      }

      // If fields of files (upload.fields)
      if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
        const fieldNames = Object.keys(req.files);
        for (const field of fieldNames) {
          if (Array.isArray(req.files[field])) {
            await Promise.all(
              req.files[field].map((file) => processFileToWebp(file, options))
            );
          }
        }
      }

      next();
    } catch (error) {
      console.error('[IMAGE-COMPRESSOR] Error processing image to WebP:', error);
      next(new Error(`Failed to compress and process image: ${error.message}`));
    }
  };
};

module.exports = {
  createUploader,
  compressToWebp,
  processFileToWebp,
  ROOT_UPLOADS_DIR,
  IMAGES_DIR,
};
