const express = require('express')
const app = express()
require('dotenv').config()


// Database Intergration
require('./middlewares/dbconnection')


// For post and put requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/following', require('./routes/followingRoutes'))
app.use('/api/followers', require('./routes/followerRoutes'))
app.use('/api/suggestions', require('./routes/suggestionsRoute'))

app.use((req, res)=>{
    res.status(404).json({success:true, message: 'Route not found'})
})

// For starting the server
app.listen(process.env.PORT, ()=>{
    console.log(`Server started at port ${process.env.PORT}`);
})