const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authentication.controller');

router.post('/', authenticationController.validateLogin, authenticationController.login); //UC-101

module.exports = router;