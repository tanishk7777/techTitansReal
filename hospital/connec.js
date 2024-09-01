const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/hospital").then(()=>{console.log("connection succesfull")});
const hospital=new mongoose.Schema({
    name:String,
    password:String,
    address:String,
    doctors:[{type:mongoose.Schema.Types.ObjectId,ref:"doctor"}],
    beds:[Number]
    ,
    city:String
})
const userl=new mongoose.Schema({
 name:String,
 password:String


})


const doctor=new mongoose.Schema({
    name:String,
    hospital:{type:mongoose.Schema.Types.ObjectId,ref:"hospital"}, 
    appointment:[{type:mongoose.Schema.Types.ObjectId,ref:"pateint"}]
    
})
const patient=new mongoose.Schema({
    name:String,
    age:Number,
    hospital:{type:mongoose.Schema.Types.ObjectId,ref:"hospital"},
    doctor:String,
    user:{type:mongoose.Schema.Types.ObjectId,ref:"userl"},

    
})
const inventorySchema = new mongoose.Schema({
    name: String,
    
    dosage: String,
    quantity:Number,
    manufacturer: String
    
});

const Inventory = mongoose.model('Inventory', inventorySchema);



const Hospital=new mongoose.model("hospital",hospital);
const Doctor=new mongoose.model("doctor",doctor);
const Patient=new mongoose.model("pateint",patient);
const User=new mongoose.model("userl",userl);
module.exports={Hospital,Doctor,Patient,User,Inventory};
