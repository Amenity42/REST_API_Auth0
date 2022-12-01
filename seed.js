//Used to read in the contents of the env file
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./modles');

async function createUser(userName, passwd) {
      await sequelize.sync();
	console.log(userName, passwd);
	//Create user in DB with hashed password
	let hashedPass = hashPass(passwd);

      //Create user
      User.create({ userName: userName, password: hashedPass } );
	console.log(`Password: ${hashedPass}`);
}

function hashPass(passwd) {
      let hash = bcrypt.hashSync(passwd, 10);
      return(hash);
}

//User.sync();
createUser(process.env.USERNAME, process.env.PASSWORD);
