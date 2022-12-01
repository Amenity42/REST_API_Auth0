const {Sequelize, DataTypes, ValidationError} = require('sequelize');

//Setup database
const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: 'messages.db'
  })
  

  //Create a model for the database
const Message = sequelize.define('Message', {
      // Model attributes are defined here
      message: {
          type: DataTypes.STRING,
          allowNull: false
      },
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
      }
  });
  
  //Create a user model for the database
  const User = sequelize.define('User', {
      // Model attributes are defined here
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
      },
      userName: {
          type: DataTypes.STRING,
          allowNull: false
      },
  
      password: {
          type: DataTypes.STRING,
          allowNull: false
      }
  });
  
  module.exports = {sequelize, Message, User, ValidationError}