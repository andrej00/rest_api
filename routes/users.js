const express = require('express');
const userController = require('../controllers/users');

const router = express.Router();

router.post('/signup', userController.signUp);
router.post('/signin', userController.signIn);
router.post('/passwordreset', userController.passwordReset);

module.exports = router;
