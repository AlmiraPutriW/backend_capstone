const express = require('express');
const Search = require('../controllers/searchController');
const router = express.Router();

router.get('/', Search);

module.exports = router;
