const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile('404.html', {root:'static'});
});

module.exports = router;