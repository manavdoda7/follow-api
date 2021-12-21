const express = require('express')
const db = require('../middlewares/dbconnection')
const router = express.Router()

router.get('/', async(req, res)=>{
    console.log('GET /api/users request');
    let users
    let username = req.query.username
    let email = req.query.email
    try {
        if(username===undefined && email===undefined) users = await db.promise().query(`select username as Username, email as Email, fName as "First Name", lName as "Last Name" from user`)
        else if(email===undefined) users = await db.promise().query(`select username as Username, email as Email, fName as "First Name", lName as "Last Name" from user where username = "${username}"`)
        else if(username===undefined) users = await db.promise().query(`select username as Username, email as Email, fName as "First Name", lName as "Last Name" from user where email = "${email}"`)
        else users = await db.promise().query(`select username as Username, email as Email, fName as "First Name", lName as "Last Name" from user where email = "${email}" and username = "${username}"`)
        users = users[0]
    } catch(err) {
        console.log('Error in fetching users', err);
        res.status(408).json({error: 'Couldn\'t fetch users. Please try again after sometime'})
        return
    }
    res.status(200).json({success:true, users:users})
})

module.exports = router