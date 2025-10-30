// server.js
const express = require("express");
const WebSocket = require("ws");

const app = express();
const port = process.env.PORT || 10000;

// Servidor HTTP básico (Render lo usa para comprobar que está activo)
app.get("/", (req, res) => {
  res.send("Servidor de cámaras activo");
});

const server = app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});

// Servidor WebSocket
const wss = new WebSocket.Server({ server });

let cameras = {}; // idCamara → socket
let viewers = {}; // idCamara → lista de sockets

wss.on("connection", (ws) => {
  console.log("Nueva conexión WebSocket");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      // Registro de cámara
      if (data.type === "register" && data.role === "camera") {
        cameras[data.cameraId] = ws;
        console.log(`📷 Cámara registrada: ${data.cameraId}`);
      }

      // Registro de visor
      else if (data.type === "register" && data.role === "viewer") {
        if (!viewers[data.cameraId]) viewers[data.cameraId] = [];
        viewers[data.cameraId].push(ws);
        console.log(`👁️ Visor conectado a: ${data.cameraId}`);

        // Si la cámara está activa, enviarle la petición para iniciar stream
        if (cameras[data.cameraId]) {
          cameras[data.cameraId].send(
            JSON.stringify({ type: "viewer-connected", cameraId: data.cameraId })
          );
        }
      }

      // Retransmisión de mensajes WebRTC
      else if (data.type === "signal") {
        const target = data.to === "camera" ? cameras[data.cameraId] : viewers[data.cameraId]?.[0];
        if (target) target.send(JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error procesando mensaje:", err);
    }
  });

  ws.on("close", () => {
    for (const id in cameras) if (cameras[id] === ws) delete cameras[id];
    for (const id in viewers) viewers[id] = viewers[id].filter((s) => s !== ws);
  });
});
