const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { db } = require('./supports/database');
const bearerToken = require("express-bearer-token");
dotenv.config();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(bearerToken()); // untuk mengambil data token dari req.header client

app.get("/", (req,res) => {
    res.status(200).send("<h2>FINAL PROJECT API</h2>")
})
// DB Check Connection
db.getConnection((err, connection) => {
    if (err) {
        console.log(`Error MySQL Connection: `, err.message)
    }
    console.log(`Connected to MySQL Server: ${connection.threadId}`)
})

// Routes API Setup

const { usersRoute } = require('./routers');
app.use('/users', usersRoute);

app.listen(PORT, () => console.log("Your API RUNNING :", PORT));