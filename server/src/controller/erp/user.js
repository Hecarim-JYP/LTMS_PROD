import express from 'express';
import axios from 'axios'

const router = express.Router();

const API_SERVER = process.env.API_SERVER;

router.get('/', async (req, res) => {
    const response = await axios.get(`${API_SERVER}/erp/users`);
    res.json(response.data);
})

export default router;