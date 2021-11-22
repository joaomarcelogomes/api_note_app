var express = require('express');
var router = express.Router();
const Note = require('../models/note');
const withAuth = require('../middlewares/auth');

router.post('/', withAuth, async (req,res) => {
    const { title, body } = req.body;
    try {
        const note = await new Note ({ title, body, author: req.user._id});
        await note.save();
        res.status(201).json(note)
    } catch (error) {
        res.status(500).json({error: 'Note create failed.'});
    }
});

router.get('/:id', withAuth, async (req,res) => {
    try {
        const { id } = req.params;
        let note = await Note.findById(id);
        if(isOwner(req.user, note))
            res.json(note);
        else
        res.status(403).json({error: 'Unauthorized access'});
    } catch (error) {
        res.status(500).json({error: 'Failed to get a note.'});
    }
});

router.get('/', withAuth, async (req,res) =>{
    try { 
        const notes = await Note.find({author: req.user._id});
        res.json(notes);
    } catch(error) {
        res.json({error: error}).status(500)
    }
})

const isOwner = (user, note) => {
    if(JSON.stringify(user._id) === JSON.stringify(note.author._id))
        return true;
    else
        return false;
}

module.exports = router;

