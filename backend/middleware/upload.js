const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const profilePicsDir = path.join(uploadsDir, 'profile-pics');
  const postImagesDir = path.join(uploadsDir, 'post-images');
  const blogImagesDir = path.join(uploadsDir, 'blog-images');
  const roomFilesDir = path.join(uploadsDir, 'room-files');

  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(profilePicsDir, { recursive: true });
    await fs.mkdir(postImagesDir, { recursive: true });
    await fs.mkdir(blogImagesDir, { recursive: true });
    await fs.mkdir(roomFilesDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
};

// Initialize upload directories
ensureUploadsDir();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'profilePicture') {
      uploadPath += 'profile-pics/';
    } else if (file.fieldname === 'postImages') {
      uploadPath += 'post-images/';
    } else if (file.fieldname === 'blogImages') {
      uploadPath += 'blog-images/';
    } else if (file.fieldname === 'roomFiles') {
      uploadPath += 'room-files/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else if (file.mimetype.includes('text/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, PDFs, and text files are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  try {
    const files = req.files || [req.file];
    const processedFiles = [];

    for (const file of files) {
      if (file.mimetype.startsWith('image/')) {
        const inputPath = file.path;
        const outputPath = inputPath.replace(path.extname(inputPath), '_processed' + path.extname(inputPath));

        // Process image with Sharp
        await sharp(inputPath)
          .resize(1200, 1200, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toFile(outputPath);

        // Replace original with processed image
        await fs.unlink(inputPath);
        await fs.rename(outputPath, inputPath);

        // Update file info
        const stats = await fs.stat(inputPath);
        file.size = stats.size;
      }

      processedFiles.push(file);
    }

    if (req.files) {
      req.files = processedFiles;
    } else {
      req.file = processedFiles[0];
    }

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(error);
  }
};

// Profile picture upload (single file)
const uploadProfilePicture = upload.single('profilePicture');

// Post images upload (multiple files)
const uploadPostImages = upload.array('postImages', 5);

// Blog images upload (multiple files)
const uploadBlogImages = upload.array('blogImages', 10);

// Room files upload (multiple files)
const uploadRoomFiles = upload.array('roomFiles', 10);

// Generic file upload
const uploadFile = upload.single('file');

module.exports = {
  uploadProfilePicture,
  uploadPostImages,
  uploadBlogImages,
  uploadRoomFiles,
  uploadFile,
  processImage,
  upload
};

