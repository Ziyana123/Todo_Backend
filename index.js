const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Succesfully!'))
    .catch((err) => console.error('MongoDB connection error', err));


app.use('/api/auth', authRoutes);
app.use("/api", authRoutes);
app.use('/api/todos', todoRoutes)


const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`server is running on port:${PORT}`);
})