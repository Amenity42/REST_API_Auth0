//Create Rest API for the application
const express = require('express');
const {cors, auth} = require('./middleware');
const {sequelize, Message, User} = require('./modles')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config(); //Loads env file into enviroment 

//Test you have connected to the database

//Setup the express server
let app = express();
let port = process.env.PORT || 3000;

//Check the server status and listen to the port
app.set("json spaces", 2);
app.use(cors, auth, express.json()); //!Tells express we are expecting JSON data & to use cors "This is middleware" 
app.listen(port, async function() {
    try{
         await sequelize.sync();
         console.log('Server is running on port: ' + port);
    }
    catch (err){
        console.error('Failed to start server ', err);
    }
});

//?Log user in 

app.post('/register', async function(req, res){
    const {username, password} = req.body;
    try {
        //1. Check username against db
        const user = await User.findOne({
            where: {
                userName: username
            }
        });
        
        //If user exists do something
        if(user){
            res.status(401).send('User already exists');
            return
        }
        
        //Set up new user
        const hashedPW = await bcrypt.hash(password, Number.parseInt(process.env.SALT_COUNT)); //Hash PW
        const {id, username: createdUserName} = await User.create({password: hashedPW, userName: username});
        //Create token by parsing in the user obj as well as the secret to generate the token => send to user client
        const token = jwt.sign({id, createdUserName}, process.env.SECRETOKEN);
        res.send({message: 'Token has been sent, Dont lose it!', token});
    } 
        catch (error) {
            res.status(401).send({Message: 'There was an error',  error});
            console.log(error);
        }
});

app.post('/login', async (req, res, next) =>{
    const {username, password} = req.body;
    try {
        //1. Check username against db
        const user = await User.findOne({
            where: {
                userName: username
            }
        });
        
        //If user exists check password hash and log them in
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log(passwordMatch);
        const token = jwt.sign({id : user.id, username : user.userName}, process.env.SECRETOKEN);
        if(passwordMatch){
            res.status(201).send({token}); //Send token to user if the password hash matches - Keeps user logged in
        }
        else{
            res.status(401).send('No match GTFO!');
        }

    } 
        catch (error) {
            res.status(401).send({Message: 'There was an error',  error});
            console.log(error);
        }

});

//?Send 403 if user is not authed 
const authCheck = (req, res, next) =>{
    if(!req.user){
        res.status(403).send();
        return 
    }
    next();
}
//?Get all request
app.get('/messages', authCheck, async function(req, res) {
    
    try {
        let message = await  Message.findAll({where: {id: req.user.id}});
        res.status(201).send(message);
    } catch (error) {
        if(error instanceof ValidationError){
            res.status(400).send();
        }
        else{
            res.status(500).send();
        }
        next(error);
    }
});

//Get specific request
app.get('/messages/:id', authCheck, async function(req, res) {
    try {
        let message = await  Message.findOne({
            where: { id: req.params.id }
        });

        //Check if message exists else send 404 err
        if(message){
            res.status(200).send(message);
        }
        else{
            res.status(404).send();
        }
    } catch (error) {
        res.status(500).send();
        next(error);
    }
});

//Post requests
app.post(/messages/, async function(req, res, next) {
    try {
        let message = await  Message.create({ message : req.body.message });
        res.status(201).send(message);
    } catch (error) {
        if(error instanceof ValidationError){
            res.status(400).send();
        }
        else{
            res.status(500).send();
        }
        next(error);
    }
});

//Put requests

app.put('/messages/:id', authCheck, async function(req, res, next) {
try{
    let message = await  Message.findOne({
        where: { id: req.params.id }
    });

    //Check if message exists else send 404 err
    if(message){
        res.status(200).send('Updated message');
        message = await  Message.update({ message : req.body.message },{
        where: { id: req.params.id }
        });
    }
    else{
        let message = await  Message.create({ message : req.body.message });
        res.status(201).send('Message was not found - creating message');
    }
} catch (error) {
    if(error instanceof ValidationError){
        res.status(400).send();
    }
    else{
        res.status(500).send();
    }
    next(error);
}
});

//Delete requests

app.delete(/messages/, authCheck, function(req, res) {
    res.send('Hello World');
});


