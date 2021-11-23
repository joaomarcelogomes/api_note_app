var express = require('express');
var router = express.Router();
const Note = require('../models/note');
const withAuth = require('../middlewares/auth');

router.post('/', withAuth, async (req, res) => {
    const { title, body } = req.body;
    try {
        const note = await new Note({ title, body, author: req.user._id });
        await note.save();
        res.status(201).json(note)
    } catch (error) {
        res.status(500).json({ error: 'Note create failed.' });
    }
});

router.get('/search', withAuth, async(req,res) =>{
    const { query } = req.query;
    try {
        let notes = await Note
            .find({ author: req.user._id })
            .find({ $text: {$search:query} });
        res.json(notes);
    } catch (error) {
        res.status(500).json({error: error})
    }
})

router.get('/:id', withAuth, async (req, res) => {
    try {
        const { id } = req.params;
        let note = await Note.findById(id);
        if (isOwner(req.user, note))
            res.json(note);
        else
            res.status(403).json({ error: 'Unauthorized access' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get a note.' });
    }
});

router.get('/', withAuth, async (req, res) => {
    try {
        const notes = await Note.find({ author: req.user._id });
        res.json(notes);
    } catch (error) {
        res.json({ error: error }).status(500)
    }
});

router.put('/:id', withAuth, async (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;

    try {
        let note = await Note.findById(id);
        if (isOwner(req.user, note)) {
            let noteUpdate = await Note.findOneAndUpdate(id,
                { $set: { title: title, body: body } },
                { upsert: true, 'new': true }
            );

            res.json(noteUpdate);
        } else {
            res.status(403).json({ error: 'Permission denied' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update' })
    }
});

router.delete('/:id', withAuth, async (req, res) => {
    const { id } = req.params;
    try {
        let note = await Note.findById(id);
        if (isOwner(req.user, note)) {
            await note.delete();
            res.status(200).json({ message: 'Deleted successfully'})
        } else {
            res.status(403).json({ error: 'Permission denied' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

const isOwner = (user, note) => {
    if (JSON.stringify(user._id) === JSON.stringify(note.author._id))
        return true;
    else
        return false;
}

module.exports = router;

