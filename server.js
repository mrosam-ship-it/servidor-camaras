const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 Carpeta donde se guardan los vídeos y fotos
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);

// 🌐 Permitir acceso público a la carpeta uploads
app.use("/uploads", express.static(uploadsPath));

// 🧩 Listar archivos (página web)
app.get("/uploads", (req, res) => {
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.status(500).send("Error al leer los archivos");
    }

    // Generar HTML básico
    let html = `
      <html>
      <head>
        <title>📹 Vigilancia - Archivos</title>
        <style>
          body { font-family: Arial; background: #f0f0f0; color: #333; padding: 20px; }
          h1 { text-align: center; }
          .file { margin: 10px 0; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          video, img { max-width: 100%; border-radius: 8px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <h1>📁 Archivos de Vigilancia</h1>
        ${files
          .map((f) => {
            const ext = path.extname(f).toLowerCase();
            if ([".mp4", ".mov", ".webm"].includes(ext))
              return `<div class='file'><strong>${f}</strong><br><video controls src="/uploads/${f}"></video></div>`;
            else if ([".jpg", ".jpeg", ".png"].includes(ext))
              return `<div class='file'><strong>${f}</strong><br><img src="/uploads/${f}"></div>`;
            else
              return `<div class='file'><strong><a href="/uploads/${f}" target="_blank">${f}</a></strong></div>`;
          })
          .join("")}
      </body>
      </html>
    `;
    res.send(html);
  });
});

// 🗑️ Eliminar archivo
app.delete("/uploads/delete/:filename", (req, res) => {
  const filePath = path.join(uploadsPath, req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err)
      return res
        .status(404)
        .json({ success: false, message: "Archivo no encontrado o error al eliminar." });
    res.json({ success: true, message: "Archivo eliminado correctamente." });
  });
});

// ✅ Página principal
app.get("/", (req, res) => {
  res.send("✅ Servidor Vigilancia activo y funcionando correctamente.");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

