const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'rey_prelim',
});

db.connect((err) => {
    if(err) {
        console.err('Error connecting to MySQL:',err);
    }else{
        console.log('Connected to MySQL');
    }
});

module.exports = db;