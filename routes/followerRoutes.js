const express = require('express')
const checkAuth = require('../middlewares/checkAuth')
const router = express.Router()
const db = require('../middlewares/dbconnection')

router.get('/', checkAuth, async(req, res)=>{
    console.log('GET /api/followers request');
    const username = req.userData.username
    let followers
    try{
        followers = await db.promise().query(`select username as Username, email as Email, fName as "First Name", lName as "Last Name" from user where username in(select followedBy from follow where followed = "${username}"); `)
        followers = followers[0]
    } catch(err) {
        console.log('Error in fetching followers', err);
        return res.status(408).json({success: false, error:'Error in fetching followers. Please try again after sometime.'})
    }
    // console.log(followers);
    return res.status(200).json({success:true, followers:followers})

})

router.delete('/:username', checkAuth, async(req, res)=>{
    console.log('DELETE /api/followers request');
    const followed = req.userData.username
    const followedBy = req.params.username

    try{
        let checkExis = await db.promise().query(`select * from follow where followed ="${followed}" and followedBy = "${followedBy}"`)
        checkExis=checkExis[0]
        if(checkExis.length===0) return res.status(400).json({success:false, error:'This user is not following you.'})
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