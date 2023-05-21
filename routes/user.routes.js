const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/', userController.createUser); //UC-201
router.get('/', userController.getAllUsers); //UC-202
router.get('/profile', userController.getProfile); //UC-203
router.get('/:userId', userController.getUser); //UC-204
router.put('/:userId', userController.updateUser); //UC-205
router.delete('/:userId', userController.deleteUser); //UC-206
    
module.exports = router