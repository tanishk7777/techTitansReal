const express=require("express");
const jwt=require("jsonwebtoken");
const{Hospital,Doctor,Patient,User,Inventory}=require("./connec.js");
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

const JWT_SECRET = 'shhhhhhhhhh';





const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (err) {
        res.status(401).send('Invalid token.');
    }
};


app.post("/home",async(req,res)=>{
  globalThis=await Hospital.find({city:req.body.city});
  console.log(req.cookies.userd);
  if(req.cookies.userd==undefined||req.cookies.userd==""){

  res.render("index",{globalThis,datausr:null});}
else{
    const data=jwt.verify(req.cookies.userd,"shhh");
    const datausr=await User.findOne({_id:data});
    console.log(datausr);
    res.render("index",{globalThis,datausr});



}})



app.get("/opdqueue.ejs",async(req,res)=>{
    const token= jwt.verify(req.cookies.token,"shhh");
    console.log(token);
    const user=await Hospital.findOne({_id:token});
res.render("opdqueue");
});

app.get("/bed.ejs",async(req,res)=>{
    const token= jwt.verify(req.cookies.taken,"shhh");
    const user=await Hospital.findOne({_id:token});
    res.render("bed",{bed:user.beds});
    });

app.get("/book.ejs",async(req,res)=>{
        res.render("book");
        });

app.post("/bed.ejs",async(req,res)=>{
    const token= jwt.verify(req.cookies.taken,"shhh");
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
    const token= jwt.verify(req.cookies.taken,"shhh");
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
   
//    const hosp=jwt.verify(req.cookies.token,"shhh");
//    console.log(hosp._id);
   
   
   let userl=await User.findOne({name:req.body.name});
   if(req.body.password==userl.password){
    const userd=jwt.sign({_id:userl._id},"shhh");
    res.cookie("userd",userd);
    
    console.log(userl);
    
    res.render("index",{globalThis,userl});
   }
   else{
    res.send("invalid login");
   }


   






})


                          
                                          

app.get("/:name",islogged,async(req,res)=>{
    const id=req.params.name;


 const token= jwt.verify(req.cookies.userd,"shhh");
 const userl=await User.findOne({_id:token._id});
 
const user=await Hospital.findOne({_id:id}).populate("doctors").exec();
 const taken=jwt.sign({_id:user._id},"shhh");
 res.cookie("taken",taken);
 res.render("hs",{user,userl
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
 
app.get('/hospital/hlogin', (req, res) => {
    res.render('hlogin');
});
app.get('/hospital',async(req, res) => {
    const user = await Hospital.findOne({ name: req.user.name });
    if (!user) {
        return res.status(404).send('User not found');
    }
    res.render('hmain', { user });
});

app.post('/hospital/hlogin', async (req, res) => {
    const { name,password } = req.body;
    const user = await Hospital.findOne({ name });
    console.log(user);
    if (!user) {
        return res.status(400).send('Invalid username or password');
    }
    if(user.password==password){
        let token=jwt.sign( {name},"shhhhhhhhhh");
        res.cookie("token",token);
        
        res.render("hmain");
    }
    else {
        res.status(400).send('Invalid username or password');
    }
 
});
app.get('/hospital/inventory',async (req, res) => {
    try {
        const inventory = await Inventory.find();
        res.render('inventory', { inventory });
    } catch (err) {
        res.status(500).send('Error fetching patient data.');
    }
});


app.get('/hospital/updateinventory', async (req, res) => {
    res.render('updi');
});

app.post('/hospital/updateinventory',authenticateJWT, async (req, res) => {
    const { name, dosage,quantity, manufacturer } = req.body;

    try {
        // Get the hospital associated with the logged-in user
        const hospital = await Hospital.findOne({ name: req.user.name });
        
        if (!hospital) {
            return res.status(404).send('Hospital not found');
        }

        // Decrease the bed count
        
        // Create a new patient entry associated with this hospital
        const newinventory = new Inventory({
            name,
            dosage,
            quantity,
            manufacturer,
            
        });

        await newinventory.save();
        res.send('inventory added');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating inventory');
    }
});


app.get('/hospital/patients', authenticateJWT, async (req, res) => {
    try {
        // Extract hospital ID from the decoded JWT token
        const hospital = await Hospital.findOne({ name: req.user.name });
        
        // Find patients associated with this hospital
        const patients = await Patient.find({ hospital: hospital._id });
        
        // Render the patients view with the filtered patients
        res.render('patients', { patients });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching patient data.');
    }
}); 
app.get('/hospital/addbed',authenticateJWT, async (req, res) => {
    res.render('updbed');
});
app.post('/hospital/addbed', authenticateJWT, async (req, res) => {
    const { name, age, doctor } = req.body;

    try {
        // Get the hospital associated with the logged-in user
        const hospital = await Hospital.findOne({ name: req.user.name });
        
        if (!hospital) {
            return res.status(404).send('Hospital not found');
        }

        // Decrease the bed count
        if (hospital.beds[0] > 0) {
            hospital.beds[0] = hospital.beds[0] - 1;
            await hospital.save();
        } else {
            return res.status(400).send('No beds available');
        }

        // Create a new patient entry associated with this hospital
        const newPatient = new Patient({
            name,
            age,
            doctor,
            hospital: hospital._id, // Associate the patient with the hospital
        });

        await newPatient.save();
        res.send('Bed booked successfully and patient registered!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating bed or registering patient.');
    }
});
app.get('/hospital/minbed',authenticateJWT, async (req, res) => {
    const hospital = await Hospital.findOne({ name: req.user.name });
        
        

    // Decrease the bed count
   
        hospital.beds[0] = hospital.beds[0] + 1;
        await hospital.save();
        res.send("done");
});

app.get('/hospital/viewbeds', authenticateJWT, async (req, res) => {
    try {
        // Get the hospital associated with the logged-in user
        const hospital = await Hospital.findOne({ name: req.user.name });
        
        if (!hospital) {
            return res.status(404).send('Hospital not found');
        }
   console.log(hospital.beds);
        // Render the view with the hospital's bed status
        res.render('bedst', { beds: hospital.beds });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching bed status.');
    }
});
app.get('/hospital/updatequeue',authenticateJWT, async (req, res) => {
    res.render('updq');
});
app.post('/hospital/updatequeue', authenticateJWT, async (req, res) => {
    const { name, age, doctor } = req.body;

    try {
        // Get the hospital associated with the logged-in user
        const hospital = await Hospital.findOne({ name: req.user.name });

        if (!hospital) {
            return res.status(404).send('Hospital not found');
        }

        // Update the queue count or any other queue-related logic
       
            hospital.queue = hospital.queue - 1;  // Example of decrementing the queue
            await hospital.save();
       
        // Create a new patient entry associated with this hospital
        const newPatient = new Patient({
            name,
            age,
            doctor,
            hospital: hospital._id, // Associate the patient with the hospital
        });

        await newPatient.save();
        res.send('Appointment booked successfully and patient registered!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating queue or registering patient.');
    }
});
app.get('/hospital/minqueue',authenticateJWT, async (req, res) => {
    const hospital = await Hospital.findOne({ name: req.user.name }).populate("doctors").exec();
    const user=hospital.doctors;
    res.send("done");
        
});

app.get('/hospital/viewopd', authenticateJWT, async (req, res) => {
    try {
        // Extract hospital ID from the decoded JWT token
        const hospital = await Hospital.findOne({ name: req.user.name }).populate("doctors").exec();
        const user=hospital.doctors;
        console.log(user)
        // Find patients associated with this hospital
        // const doctor = await Doctor.find({ hospital: hospital._id });
        
        // Render the patients view with the filtered patients
        res.render('opdst', { user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching patient data.');
    }
});