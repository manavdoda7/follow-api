const express = require('express')
const db = require('../middlewares/dbconnection')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const checkAuth = require('../middlewares/checkAuth')

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
    console.log('POST /api/users/register request');
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
            await db.promise().query(`insert into user values("${username}", "${email}", "${fName}", "${lName}", "${hashedPassword}")`)
        } catch(err) {
            console.log('Error in saving to DB.', err);
            res.status(408).json({success:false, error:'Couldn\'t register user. Please try again after sometime'})
            return
        }
        return res.status(201).json({success:true, message:'User created'})
    } else return res.status(406).json({success:'false', error:'Registration failed. One or more of the required items missing.'})
})

router.post('/login', async(req, res)=>{
    console.log('POST /api/users/login request');
    const{username, password} = req.body
    if(username===undefined || password===undefined) return res.status(406).json({success:false, error:'Authenication failed. Please provide both username and password while logging in.'})
    let user
    try {
        user = await db.promise().query(`select * from user where username = "${username}"`)
        user = user[0]
    } catch(err) {
        console.log('User fetch error.', err);
        return res.status(408).json({success:false, error:'Please try again after sometime.'})
    }
    if(user.length==0) return res.status(400).json({success:true, message:'Login failed'})
    user = user[0]
    bcrypt.compare(password, user.password, (bcryptErr, result)=>{
        if(bcryptErr) {
            console.log('Bcrypt Error', bcryptErr);
            return res.status(408).json({success:false, error:'Please try again after sometime.'})
        }
        if(result) {
            const token = jwt.sign({
                username: user.username,
                email: user.email,
                fName: user.fName,
                lName: user.lName
            }, process.env.JWT_SECRET, {
                expiresIn: '2h'
            })
            console.log('Auth successfull', user, token);
            return res.status(202).json({success:true, message:'Authenication successfull.', token:token})
        }
        console.log('Password mismatch');
        return res.status(400).json({success:true, message:'Login failed'})
    })
})

router.patch('/:username', checkAuth, async(req, res)=>{
    console.log('PATCH /api/users/username request.');
    const {fName, lName, email, password} = req.body
    if(req.params.username!=req.userData.username) return res.status(403).json({success:true, error:'Please login using correct credentials.'})
    if(email!=undefined && email!='') {
        let checkDupli
        try{
            checkDupli = await db.promise().query(`select email from user where email = "${email}"`)
            checkDupli = checkDupli[0]
        } catch(err) {
            console.log('Error in fetching email from DB', err);
            return res.status(408).json({success:false, error: 'Error while updating. Please try again after sometime.'})
        }
        if(checkDupli.length) return res.status(403).json({success:true, error:"The email you are trying to set already exists in DB. Please try again using diffrent email."})
        try {
            await db.promise().query(`update user set email="${email}" where username ="${req.params.username}";`)
        } catch(err) {
            console.log('Error in updating email in DB', err);
            return res.status(408).json({success:false, error: 'Error while updating. Please try again after sometime.'})
        }
    }
    if(fName!=undefined && fName!='') {
        try{
            await db.promise().query(`update user set fname = "${fName}" where username="${req.params.username}";`)
        } catch(err) {
            console.log('Error in updating fName in db', err);
            return res.status(408).json({success:false, error: 'Error while updating. Please try again after sometime.'})
        }
    }
    if(lName!=undefined && lName!='') {
        try {
            await db.promise().query(`update user set lName = "${lName}" where username="${req.params.username}";`)
        } catch(err) {
            console.log('Error in updating lName in DB', err);
            return res.status(408).json({success:false, error: 'Error while updating. Please try again after sometime.'})
        }
    }
    if(password!=undefined && password!='') {
        let hashedPassword
        try {
            hashedPassword = await bcrypt.hash(password, 11)
        } catch(err) {
            console.log('bcrypt error', err);
            return res.status(408).json({success:false, error: 'Error while updating. Please try again after sometime.'})
        }
        try{
            await db.promise().query(`update user set password = "${hashedPassword}" where username = "${req.params.username}";`)
        } catch(err) {
            console.log('Error in updating password in DB', err);
            return res.status(408).json({success:false, error: 'Error while updating. Please try again after sometime.'})
        }
    }
    res.status(201).json({success:true, message:"All valid entries updated."})
})


router.delete('/:username', checkAuth, async(req, res)=>{
    console.log('DELETE /api/users/username request.');
    if(req.params.username!=req.userData.username) return res.status(403).json({success:true, error:'Please login using correct credentials.'})
    try {
        await db.promise().query(`delete from user where username = "${req.params.username}";`)
    } catch(err) {
        console.log('Error in deleting user from db.', err);
        return res.status(408).json({success:false, error:'Error in deleting user. Please try again after sometime.'})
    }
    return res.status(202).json({success:true, message: 'User deleted successfully.'})
})
module.exports = router