const express=require("express");
const jwt=require("jsonwebtoken");
const{Hospital,Doctor,Patient,User}=require("./connec.js");
const cokie=require("cookie-parser");
const hbs=require("hbs");
const cookieParser = require("cookie-parser");
const app=express();
app.use(cookieParser());
app.listen(8000,()=>{
    console.log("connected");
})
app.use(express.static('public'));
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.get('/favicon.ico', (req, res) => {
    res.send("hello");
});



app.post("/home",async(req,res)=>{
  const patients=await Hospital.find({city:req.body.city});
  console.log(req.cookies.userd);
  if(req.cookies.userd==undefined||req.cookies.userd==""){

  res.render("index",{patients,datausr:null});}
else{
    const data=jwt.verify(req.cookies.userd,"shhh");
    const datausr=await User.findOne({_id:data});
    console.log(datausr);
    res.render("index",{patients,datausr});



}})



app.get("/opdqueue.ejs",async(req,res)=>{
    const token= jwt.verify(req.cookies.token,"shhh");
    console.log(token);
    const user=await Hospital.findOne({_id:token});
res.render("opdqueue");
});

app.get("/bed.ejs",async(req,res)=>{
    const token= jwt.verify(req.cookies.token,"shhh");
    const user=await Hospital.findOne({_id:token});
    res.render("bed",{bed:user.beds});
    });

app.get("/book.ejs",async(req,res)=>{
        res.render("book");
        });

app.post("/bed.ejs",async(req,res)=>{
    const token= jwt.verify(req.cookies.token,"shhh");
    const user=new Patient({
        name:req.body.name,
        age:req.body.age,
        doctor:req.body.dpt,
        hospital:token
    })
   await user.save();
const dtr= await  Doctor.findOne({name:user.doctor});

dtr.appointment.push(user._id);
await dtr.save();
res.send("Your appointment is booked");


})



app.post("/book.ejs",async(req,res)=>{
    const token= jwt.verify(req.cookies.token,"shhh");
   const user=await Hospital.findOne({_id:token});
   console.log(user);
   if(req.body.bed=="general"){
user.beds[0]=user.beds[0]-1;
   }
  await  user.save();
   
res.send("Your bed is booked");


})
app.get("/register",(req,res)=>{

res.render("register");



}
)
app.get("/report",(req,res)=>{
    res.render("labr");
})

app.get("/pet",(req,res)=>{
    res.render("padetail");
})
app.post("/register",async(req,res)=>{

    const {username,password}=req.body;
    const data=await new User({name:username,password:password});
    data.save();
    console.alert("you are registered ");
    res.render("login");
      





})
app.get("/login",(req,res)=>{
     

    res.render("login");
})



app.post("/login",async(req,res)=>{
   const{name,password}=req.body;
   try{
   const user=await User.findOne({name:name});
   if(password==user.password){
    const userd=jwt.sign({_id:user._id},"shhh");
    res.cookie("userd",userd);
    res.redirect("/");
   }
   else{
    res.send("invalid login");
   }
   }
   catch{
    res.send("invalid login");
   }






})


                          
                                          

app.get("/:name",islogged,async(req,res)=>{
    const id=req.params.name;
    console.log(id);
 const token= jwt.sign({_id:id},"shhh");
 res.cookie("token",token);
 
 const user=await Hospital.findOne({_id:id}).populate("doctors").exec();

 console.log(user);
 res.render("hs",{user

 });
 
 
 
 
 })
 function islogged(req,res,next){
    try{
     const data=jwt.verify(req.cookies.userd,"shhh");
     req.userd=data;
     next();
 
    }
    catch(error){
     res.redirect("/login");
     
    } 
 
 }


