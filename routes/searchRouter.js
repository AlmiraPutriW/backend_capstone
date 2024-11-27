const express = require('express');
const Search = require('../controllers/SearchController');
const router = express.Router();

router.get('/', Search);

module.exports = router;
