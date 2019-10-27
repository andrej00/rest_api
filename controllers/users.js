const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');

function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charsLen = chars.length;
  let password = '';
  for (let i = 0; i < 8; i += 1) {
    password += chars.charAt(Math.floor(Math.random() * charsLen));
  }
  return password;
}

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = {
  signUp: (req, res) => {
    const {
      password,
      confirmedPassword,
      name,
      lastname,
      email,
      terms_of_service,
    } = req.body;
    if (terms_of_service.toLowerCase() !== 'yes') {
      return res.status(400).json({ success: false, message: 'You have to accept ToS by typing \'yes\'' })
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Wrong email format' });
    }
    if (!(name.match(/[a-z]/i) && lastname.match(/[a-z]/i))) {
      return res.status(401).json({ success: false, message: 'Both name and last name must be provided' });
    }
    if (password.length < 8) {
      return res.status(401).json({ success: false, message: 'Password must be at least 8 characters long' });
    }
    if (password !== confirmedPassword) {
      return res.status(401).json({ sucess: false, message: 'Your passwords don\'t match' });
    }
    const newUser = new User({
      name,
      lastname,
      password,
      email,
    });
    newUser.save((err, user) => {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          return res.status(409).send({ succes: false, message: 'User with specified email already exist!' });
        }
        return res.json({ success: false, error: err });
      }
      return res.status(200).json({ success: true, message: 'User added successfully', user });
    });
  },
  signIn: (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
        return res.json({ success: false, error: err });
      }
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        const userInfo = {
          id: user._id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
        };
        const token = jwt.sign(userInfo, req.app.get('secretKey'), { expiresIn: '24h' });
        return res.status(200).json({ status: 'success', message: 'User logged in', data: { user, token } });
      }
      return res.status(401).json({ success: false, message: 'Wrong password' });
    });
  },
  passwordReset: (req, res) => {
    sgMail.setApiKey('send grid api key here');
    const password = generatePassword();
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
        return res.json({ success: false, error: err });
      }
      if (!user) {
        return res.status(404).json({ success: false, message: 'User with specified email does not exist' });
      }
      const msg = {
        to: req.body.email,
        from: 'andrej.prskalo00.ap@gmail.com',
        subject: 'Password reset',
        text: password,
      };
      sgMail.send(msg);
      user.password = password;
      user.save();
      return res.status(200).json({ message: 'New password has been sent to your email' });
    });
  },
};
