require('dotenv').config();
const secret = process.env.JWT_TOKEN;
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const WithAuth = (req,res, next) => {
    
}