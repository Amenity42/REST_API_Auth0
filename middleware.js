//Setup cors 
/**
 * @typedef {import('express').Request} Request
 */
/**
 * @typedef {import('express').Response} Response
 */
/**
 * @typedef {import('express').NextFunction} Next
 */

const http = require('http');
const bcrypt = require('bcryptjs');
const {User} = require('./modles');
const jwt = require('jsonwebtoken');
require('dotenv').config(); //Loads env file into enviroment 


function cors(req,res,next){
      res.set('ACCESS-CONTROL-ALLOW-ORIGIN', '*');
      next();
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Next} next 
 * @returns 
 */
function auth(req,res,next){
      let  header = req.get("Authorization");
      if(!header){
            next();
            return
      }
      let [type, token] = header.split(" "); //Token
      const user = jwt.verify(token, process.env.SECRETOKEN);
      req.user = user;
      next();
}

module.exports = {cors, auth};