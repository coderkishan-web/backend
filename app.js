const express = require('express');
const app = express();
const userModel = require("./models/user"); 
const postModel = require("./models/post");  
const cookieParser = require('cookie-parser');
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app
app.get('/',(req,res)=>{
    res.render("index")
});
app.get('/login',(req,res)=>{
    res.render("login")
});
app.get('/profile', isLoggedIn ,(req,res)=>{
    console.log(req.user);
    
    res.render("profile")
});


// neWusercreate
app.post('/register',async(req,res)=>{
let {email,password,username,name,age}=req.body;
let user = await userModel.findOne({email})
if(user) return res.status(500).send("User is there");
// if user is not there create a new user
bcrypt.genSalt(10, (err,salt)=>{
    
    
    bcrypt.hash(password,salt,async(err,hash)=>{
let user = await userModel.create({
    email,
    password:hash,
    username,
    name,
    age
})
let token = jwt.sign({email: email,userid:user._id},"kishan");
res.cookie("token",token)
res.send("registered");
    })
    
})
})
// login
app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    
    if (!user) return res.status(400).send("User not found");

    bcrypt.compare(password, user.password, (err, result) => {
        if (err) return res.status(500).send("Error in password comparison");
        if (!result) return res.status(400).send("Incorrect password");

        let token = jwt.sign({ email: email, userid: user._id }, "kishan");
        res.cookie("token", token, { httpOnly: true });
        res.status(200).send("Login successful");
    });
});

// logout 
app.get('/logout',(req,res)=>{
        res.cookie("token","");
        res.redirect("/login")
});
 // middleware 
function isLoggedIn(req, res, next) {
        if (!req.cookies.token) return res.status(401).send("You are not logged in");
    
        try {
            let data = jwt.verify(req.cookies.token, "kishan");
            req.user = data;
            next();
        } catch (err) {
            return res.status(401).send("Invalid token, please log in again");
        }
}
    
app.listen(3000);