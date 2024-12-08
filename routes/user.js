const router = require("express").Router();
const User =require("../models/user");
const bcrypt=require("bcryptjs");
const jwt =require("jsonwebtoken")
const {authenticateToken}=require("./userAuth")
//sign up 
router.post("/sign-up",async(req,res)=>{
    try{
        const{username,email,password,address}=req.body;
        
        //username not less than 4
        if(username.length<4){
            return res.status(400).json({message: "Username should be at least 4 characters long"});
        }
        //username not more than 16
        if(username.length>16){
            return res.status(400).json({message: "Username should not be more than 16 characters long"});
        }
        //check username already exist
        const existingUsername=await User.findOne({username:username});
        if(existingUsername){
            return res.status(400).json({message: "Username already exists"});
        }
        const existingemail=await User.findOne({email:email});
        if(existingemail){
            return res.status(400).json({message: "Email already exists"});
        }
        const hashPass=await bcrypt.hash(password,10);

        //check password length
        if(password.length<8){
            return res.status(400).json({message: "Password should be at least 8 characters long"});
        }
        
        const newUser =new User({
            username:username,
            email:email,
            password:hashPass,
            address:address
        });
        await newUser.save();
        console.log("hi");
        return res.status(200).json({message:"Signup Successfull"})
    }catch(error){
        res.status(500).json({message: "Internal server error"});
    }
})

//login
router.post("/sign-in",async(req,res)=>{
    try{
        const {username,password}=req.body;

       const existingUser=await User.findOne({username});
       if (!existingUser){
        return res.status(404).json({message:"invalid credentials"});
       } 
       await bcrypt.compare(password, existingUser.password,(err,data)=>{
        if(!data){
            return res.status(401).json({message:"Invalid credentials"});
        }
        else{
            const authClaims=[
                {name:existingUser.username},
                {role:existingUser.role},
        ]
            const token =jwt.sign({authClaims},"books123",{ 
                expiresIn:"30d",
            })
            return res.status(200).json({
                id: existingUser.id,
                role:existingUser.role,
                token:token,
            });
        }
       })
    }catch(error){
        res.status(500).json({message: "Internal server error"});
    }
})

//get user info
router.get("/get-user-information",authenticateToken,async(req,res)=>{
    try{
        const {id}=req.headers;
        const data=await User.findById(id).select('-password');
        return res.status(200).json(data);
    }catch(error){
        res.status(500).json({message: "Internal server error"});
    }
})

//update Address
router.put("/update-address",authenticateToken,async(req,res)=>{
   try{
    const {id}=req.headers;
    const {address}=req.body;
    await User.findByIdAndUpdate(id,{address:address});
    return res.status(200).json({message: "Address updated successfully"});
   }catch(error){
    res.status(500).json({message: "Internal server error"});
   } 
})

module.exports=router;