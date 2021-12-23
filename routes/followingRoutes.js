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

router.post('/', checkAuth, async(req, res)=>{
    console.log('POST /api/following request');
    const followedBy = req.userData.username
    const followed = req.body.username

    try{
        let user = await db.promise().query(`select username from user where username = "${followed}";`)
        user = user[0]
        if(user.length===0) return res.status(404).json({success:false, error:'Username not found.'})
    } catch(err) {
        console.log('Error in fetchiing username exists', err);
        return res.status(408).json({success:false, error:'Error in creating relationship. Please try again after sometime.'})
    }
    try{
        let checkDupli = await db.promise().query(`select * from follow where followed ="${followed}" and followedBy = "${followedBy}"`)
        checkDupli=checkDupli[0]
        if(checkDupli.length) return res.status(400).json({success:false, error:'You\'re already following this user.'})
    } catch(err) {
        console.log('Error in checking for duplicates', err);
        return res.status(408).json({success:false, error:'Error in creating relationship. Please try again after sometime.'})
    }

    try{
        await db.promise().query(`insert into follow values( "${followed}", "${followedBy}");`)
    } catch(err) {
        console.log('Error in creating relationship.', err);
        res.status(408).json({success:false, error:'Error in creating relationship. Please try again after sometime.'})
    }
    return res.status(201).json({success:true, message:'Task successfull.'})
})

router.delete('/:username', checkAuth, async(req, res)=>{
    console.log('DELETE /api/following request');
    const followedBy = req.userData.username
    const followed = req.params.username

    try{
        let checkExis = await db.promise().query(`select * from follow where followed ="${followed}" and followedBy = "${followedBy}"`)
        checkExis=checkExis[0]
        if(checkExis.length===0) return res.status(400).json({success:false, error:'You\'re not following this user.'})
    } catch(err) {
        console.log('Error in checking for relationship', err);
        return res.status(408).json({success:false, error:'Error in deleting relationship. Please try again after sometime.'})
    }
    try{
        await db.promise().query(`delete from follow where followed="${followed}" and followedBy="${followedBy}";`)
    } catch(err) {
        console.log('Error in deleting relationship', err);
        return res.status(408).json({success:false, error:'Error in deleting relationship. Please try again after sometime.'})
    }
    return res.status(200).json({success: true, message:'Relationship deleted.'})
})



module.exports=router