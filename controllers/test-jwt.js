const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

router.get('/sign-token', (req,res)=>{
const user ={
    id:1,
    username: 'test',
    password:'test'
}
const token = jwt.sign({user},process.env.JWT_SECRET)
res.json({token})

})

router.post('verify-token',(req,res)=>{
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded= jwt.verify(token,process.env.JWT_SECRET)

        res.json({decoded})
    } catch (error) {
        res.status(403).json({error:"invalid Token"})
        
    }
})

module.exports= router