import "dotenv/config";
import http from "http";
import { connectDb } from "./config/db.js";
import { createApp } from "./app.js";
import { initSocket } from "./socket/index.js";
import { configureCloudinary } from "./utils/cloudinary.js";

const PORT = Number(process.env.PORT) || 5050;
const MONGO_URI = process.env.MONGO_URI;
const LISTEN_HOST = "0.0.0.0";

if (!MONGO_URI) {
  console.error("MONGO_URI is required");
  process.exit(1);
}

configureCloudinary();

await connectDb(MONGO_URI);

const app = createApp();
const server = http.createServer(app);
initSocket(server);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other process or set PORT in backend/.env.`,
    );
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, LISTEN_HOST, () => {
  console.log(`API listening on http://${LISTEN_HOST}:${PORT}`);
});
