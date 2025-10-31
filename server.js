// servidor-camaras/server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// --- Configurar carpeta para grabaciones ---
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
  console.log("📁 Carpeta 'uploads' creada.");
}

// --- Configurar almacenamiento con Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName);
  },
});
const upload = multer({ storage });

// --- Endpoint para probar si el servidor está vivo ---
app.get("/", (req, res) => {
  res.send("✅ Servidor de cámaras activo y escuchando subidas en /upload");
});

// --- Endpoint de subida de archivos ---
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se recibió ningún archivo");
  }
  console.log("📸 Archivo recibido:", req.file.originalname);
  res.send("Archivo guardado correctamente en servidor Render");
});

// --- Iniciar servidor ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});

