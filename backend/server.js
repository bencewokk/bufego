import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json('Backend működik!')
});

app.listen(PORT, () => {
    console.log(`A szerver fut a ${PORT} porton`)
})