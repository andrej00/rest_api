const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./config/database');

const app = express();
const port = 3000;

app.set('secretKey', 'andrejprskalo32');
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect();

const userRoutes = require('./routes/users');
const topicRoutes = require('./routes/topics');
const commentRoutes = require('./routes/comments');

app.use('/users', userRoutes);
app.use('/topics', topicRoutes);
app.use('/topics/:id/comments', commentRoutes);

app.listen(port, () => console.log(`Server running on port ${port}...`));
