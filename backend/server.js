import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
import { connect } from './database/connect.js';
import authRoutes from './routes/auth.routes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`A szerver fut a ${PORT} porton`)
    connect();
})