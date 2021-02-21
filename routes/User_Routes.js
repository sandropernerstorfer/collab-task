const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const formidable = require('formidable');
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const User = require('../models/User');

router.get('/username', (req, res) => {
    if(!req.session.currentUser){
        res.end(JSON.stringify(false));
    }
    else{
        res.end(JSON.stringify(req.session.currentUser.name));
    }
});

router.post('/signup', async (req, res) => {

    const userExists = await User.findOne({email: req.body.email}, (err, found) => {
        if(err){
            res.redirect('/login');
        }
    });

    if(userExists != null){
        res.end('user exists');
    }
    else{
        try{
            const sessionID = uuidv4();
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                sessionid: sessionID
            });
            const savedUser = await user.save();
            req.session.currentUser = savedUser;
            req.session.currentUser.password = 'hidden';
            res.cookie('_taskID', sessionID, {httpOnly: false, maxAge: 1000*1000*1000*1000});
            res.end();
        }
        catch(err){
            res.json(err);
        };
    }
});

router.post('/signin', async (req, res) => {
    const userExists = await User.findOne({email: req.body.email}, (err, found) => {
        if(err){
            res.redirect('/login');
        }
    });

    if(userExists == null){
        res.end('no user');
    }
    else{
        try{
            if(await bcrypt.compare(req.body.password, userExists.password)){
                const sessionID = uuidv4();
                const updatedUser = await User.findOneAndUpdate({ email: req.body.email }, { $set: {sessionid: sessionID}}, {new: true}).select('-password');
                res.cookie('_taskID', sessionID, {httpOnly: false, maxAge: 1000*1000*1000*1000});
                req.session.currentUser = updatedUser;
                res.end();
            }
            else{
                res.end('wrong password');
            }
        }
        catch(err){
            res.json(err);
        }
    }
});

router.patch('/username', async (req, res) => {
    const updatedUser = await User.findOneAndUpdate({ _id: req.session.currentUser._id }, { $set: {name: req.body.username}}, {new: true}).select('-password');
    req.session.currentUser = updatedUser;
    res.end(JSON.stringify(req.session.currentUser.name));
});

router.patch('/image', (req, res) => {
    const form = formidable();
    form.parse(req, (err, fields, files) => {
        cloudinary.v2.uploader.upload(files.image.path, {folder: 'taskapp'}, async (error,result) => {
            if(error){
                res.end(JSON.stringify(false));
            }
            else{
                try{
                    await cloudinary.v2.uploader.destroy(req.session.currentUser.image, async(error, result) => {});
                }
                catch(err){
                    // if there is no image to delete just skip the error ( happens with new users )
                }
                const updatedUser = await User.findOneAndUpdate({ _id: req.session.currentUser._id }, { $set: {image: result.public_id}}, {new: true}).select('-password');
                req.session.currentUser = updatedUser;
                res.end(JSON.stringify(req.session.currentUser.image));
            };
        });
    });
});

module.exports = router;