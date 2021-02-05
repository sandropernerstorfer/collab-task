const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv/config');

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
    process.env.DB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
        console.log('DB Connected');
    }
);