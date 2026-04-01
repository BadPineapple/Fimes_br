const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de arquivo inválido. Use apenas JPG, PNG, WebP ou GIF.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter: fileFilter
});

const uploadMiddleware = (req, res, next) => {
    const singleUpload = upload.single('imagem'); 

    singleUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ erro: "A imagem é muito grande! O limite é de 5MB." });
            }
            return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ erro: err.message });
        }
        
        next();
    });
};

module.exports = uploadMiddleware;