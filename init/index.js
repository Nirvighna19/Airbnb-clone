const mongoose=require("mongoose");
const initdata=require('./data.js');
const Listing=require("../models/listing.js");


main().then(()=>{
    console.log("Connected to DB");
}).catch(err=>console.log(err));

async function main(){
    await mongoose.connect('mongodb://127.0.0.1/wonderlust');
}

const initDB = async () =>{
   await Listing.deleteMany({});
   initdata.data=initdata.data.map((obj)=>({...obj,owner:'659ae6b389a838f83aa66c53'}));
    await Listing.insertMany(initdata.data);
    console.log("data is initialized");
}

initDB();
