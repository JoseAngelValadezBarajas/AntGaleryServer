require('dotenv').config();
const mysql = require('mysql');
const host = process.env.HOST;
const user = process.env.USERNAME;  
const password = process.env.USERNAME;      
const database = process.env.DATABASE;

const dbConfig = {
    host: '',
    user: '',
    password: '',
    database: '',
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión a la base de datos establecida');
  }
});

module.exports = connection;
