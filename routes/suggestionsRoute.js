const express = require('express')
const checkAuth = require('../middlewares/checkAuth')
const db = require('../middlewares/dbconnection')
const router = express.Router()

router.get('/', checkAuth, async(req, res)=>{
    let following, followers
    try{
        following = await db.promise().query(`select followed from follow where followedBy = "${req.userData.username}";`)
        following = following[0]
    } catch(err) {
        console.log('Error in fetching following', err);
        following = []
    }
    try {
        followers = await db.promise().query(`select followedBy from follow where followed = "${req.userData.username}";`)
        followers = followers[0]
    } catch(err) {
        console.log('Error in fetching followers.', err);
        following=[]
    }
    const suggestionsMap = new Map()
    for(i=0;i<following.length;i++) {
        let friendFollowing
        try{
            friendFollowing = await db.promise().query(`select followed from follow where followedBy = "${following[i].followed}";`)
            friendFollowing = friendFollowing[0]
        } catch(err) {
            console.log(`Couldn't fetch following for ${following[i].followed}`);
            friendFollowing = []
        }
        for(j=0;j<friendFollowing.length;j++) {
            if(suggestionsMap.has(friendFollowing[j].followed)) suggestionsMap.set(friendFollowing[j].followed, suggestionsMap.get(friendFollowing[j].followed)+2)
            else suggestionsMap.set(friendFollowing[j].followed, 2)
        } 
    }
    for(i=0;i<followers.length;i++) {
        if(suggestionsMap.has(followers[i].followedBy)) suggestionsMap.set(followers[i].followedBy, suggestionsMap.get(followers[i].followedBy)+5)
        else suggestionsMap.set(followers[i].followedBy, 5) 
        let friendFollowers
        try{
            friendFollowers = await db.promise().query(`select followed from follow where followedBy = "${followers[i].followedBy}";`)
            friendFollowers = friendFollowers[0]
        } catch(err) {
            console.log(`Couldn't fetch following for ${followers[i].followedBy}`);
            friendFollowers = []
        }
        for(j=0;j<friendFollowers.length;j++) {
            if(suggestionsMap.has(friendFollowers[j].followed)) suggestionsMap.set(friendFollowers[j].followed, suggestionsMap.get(friendFollowers[j].followed)+1)
            else suggestionsMap.set(friendFollowers[j].followed, 1)
        } 
    }
    for(i=0;i<following.length;i++) {
        suggestionsMap.delete(following[i].followed)
    }
    suggestionsMap.delete(req.userData.username)
    const mapSort = new Map([...suggestionsMap.entries()].sort((a, b) => b[1] - a[1]));
    suggArr = []
    for(const[key, value] of mapSort.entries()) {
        let data 
        try {
            data = await db.promise().query(`select username as Username, fName as "First Name", lName as "Last Name" from user where username = "${key}"`)
            data = data[0]
        } catch(err) {
            console.log('Can\'t fetch user data', err);
        }
        if(data!=undefined) suggArr.push(data)
    }
    res.status(200).json({success:true, suggestions:suggArr})
})

module.exports = router