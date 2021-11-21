var express = require('express');
var router = express.Router();
const User = require('../models/user');

router.post('/register', async (req,res) => {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });

    try{
      await user.save();
      res.status(201).json(user);
    } catch(error) {
      res.status(500).json({ error: 'Registering error'})
    }
})

module.exports = router;
