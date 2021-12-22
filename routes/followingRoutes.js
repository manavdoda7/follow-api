const express = require('express')
const checkAuth = require('../middlewares/checkAuth')
const router = express.Router()
const db = require('../middlewares/dbconnection')

router.get('/', checkAuth, async(req, res)=>{
    console.log('GET /api/following request');
    const username = req.userData.username
    let following
    try{
        following = await db.promise().query(`select username as Username, email as Email, fName as "First Name", lName as "Last Name" from user where username in(select followed from follow where followedBy = "${username}"); `)
        following = following[0]
    } catch(err) {
        console.log('Error in fetching following', err);
        return res.status(408).json({success: false, error:'Error in frtching following. Please try again after sometime.'})
    }
    // console.log(following);
    return res.status(200).json({success:true, following:following})

})



module.exports=router