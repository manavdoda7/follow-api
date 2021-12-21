const express = require('express')
const db = require('../middlewares/dbconnection')
const router = express.Router()
const bcrypt = require('bcrypt')

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
        res.status(408).json({success:false, error: 'Couldn\'t fetch users. Please try again after sometime'})
        return
    }
    res.status(200).json({success:true, users:users})
})

router.post('/register', async(req, res)=>{
    console.log('POST /api/users/request');
    const {username, email, fName, lName, password} = req.body
    if( username!=undefined && email!=undefined && fName!=undefined && lName!=undefined && password!=undefined) {
        let check
        try {
            check = await db.promise().query(`select username from user where email="${email}";`)
            check = check[0]
            if(check.length) return res.status(403).json({success:true, error:'Email already exists.'})
        } catch(err) {
            console.log('Error in checking email validity', err);
            res.status(408).json({success:false, error:'Couldn\'t register user. Please try again after sometime'})
            return
        }
        try {
            check = await db.promise().query(`select username from user where username="${username}";`)
            check = check[0]
            if(check.length) return res.status(403).json({success:true, error:'Username already exists. Please try again with a diffrent username'})
        } catch(err) {
            console.log('Error in checking username validity');
            res.status(408).json({success:false, error:'Couldn\'t register user. Please try again after sometime'})
            return
        }
        let hashedPassword
        try {
            hashedPassword = await bcrypt.hash(password, 11)
        } catch(err) {
            console.log('bcrypt error', err);
            res.status(408).json({success:false, error:'Couldn\'t register user. Please try again after sometime'})
            return
        }
        try {
            await db.promise().query(`insert into user values("${username}", "${email}", "${fName}", "${lName}", "${password}")`)
        } catch(err) {
            console.log('Error in saving to DB.', err);
            res.status(408).json({success:false, error:'Couldn\'t register user. Please try again after sometime'})
            return
        }
        return res.status(201).json({success:true, message:'User created'})
    } else return res.status(406).json({success:'false', error:'One or more of the required items missing.'})
})

module.exports = router