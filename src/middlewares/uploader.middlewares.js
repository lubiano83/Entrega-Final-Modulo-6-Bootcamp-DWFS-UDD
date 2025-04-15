import multer from "multer";
import sharp from "sharp";

// Multer en modo memoria (no guarda en disco)
const uploadProfile = multer({ storage: multer.memoryStorage() });

// Middleware para convertir imágenes a .webp en memoria
const convertToWebp = async (req, res, next) => {
  if (!req.file) return next(); // Si no hay imagen, continuar

  try {
    const convertedBuffer = await sharp(req.file.buffer)
      .webp({ quality: 80 }) // Convertir a webp
      .toBuffer();

    // Reemplaza el buffer original por el nuevo convertido
    req.file.buffer = convertedBuffer;

    // Actualiza el nombre de archivo (opcional, pero útil)
    const originalName = req.file.originalname.split(".")[0];
    req.file.originalname = `${originalName}.webp`;

    next();
  } catch (error) {
    return res.status(500).send({ message: "Error al procesar la imagen." });
  }
};

export { uploadProfile, convertToWebp };