import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { handleConnection } from './ws/wsHandler.js';
import { connectDB } from './config/db.js';
import evaluationRoutes from './routes/evaluation.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/evaluation', evaluationRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', handleConnection);

const PORT = process.env.PORT || 3000;
await connectDB();
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));