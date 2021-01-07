const express = require('express')
const app = express()
const path = require('path')

const cors = require('cors');
const connectDB = require('./config/db');
connectDB();

const port = process.env.PORT || 3000



const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(',')
  // ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3300']
}

app.use(cors(corsOptions))

app.set('views', path.join(__dirname,'/views'))
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
// Routes
app.use('/api/files',require('./routes/file'));
app.use('/files',require('./routes/show'))
app.use('/files/download',require('./routes/download'))



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})