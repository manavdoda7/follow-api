require('dotenv').config()
const mysql = require('mysql2')
const { createFollowTable, createUserTable } = require('../controllers/sqlQueries')



const db_config = {
    host: process.env.DB,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
}

let db = mysql.createConnection(db_config)

db.promise().query(createUserTable + createFollowTable)
// db.promise().query(`drop table follow;`)
.then(result=>{
    console.log('Tables created,', result);
})
.catch(err=>{
    console.log('Error in creating tables:',err);
})

setInterval(function () {
    db.query("select 1;");
}, 5000);

module.exports = db;