const express = require("express");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require('cors')
const path = require('path');
dotenv.config()

const app = express()
const port = process.env.PORT || 3001;

app.use(cors())
// app.use(bodyParser.json())
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser())

routes(app);


mongoose.connect('mongodb+srv://duongdat667:3rxpSuUkVA9St5Cs@cluster.z1r1o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster')
    .then(() =>{
        console.log('Connect Db success')
    })
    .catch((err) => {
        console.log(err)
    })



app.use(express.static(path.join(__dirname, '../../my-frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../my-frontend/build', 'index.html'));
});

app.listen(port , () => {
    console.log('Server is running in port: ', + port)
})