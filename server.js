//importing modules
const express = require('express');
const sequelize = require('sequelize');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require('./models');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const emailRoutes = require('./routes/emailRoutes');
const postItemRoutes = require('./routes/postItemRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const globalErrorHandler = require('./middlewares/globalErrorHandler');
// const fileupload = require('express-fileupload');

//setting up your port
const PORT = process.env.PORT || 8080;

//assigning the variable app to express
const app = express();
app.use(cors());
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(fileupload());

// ...

//synchronizing the database and forcing it to false so we dont lose data
db.sequelize.sync().then(() => {
  console.log('db has been re sync');
});
//routes for the user API
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/postItems', postItemRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/payments', paymentRoutes);

app.use(globalErrorHandler);

//listening to server connection
app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
