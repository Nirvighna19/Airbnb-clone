if(process.env.NODE_ENV!="production"){
    require('dotenv').config();

}
// console.log(process.env.SECRET);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require('path');
const methodOverride = require('method-override');
const ejsMate=require('ejs-mate');
const ExpressError=require('./utils/ExpressErrors.js');
const sessions=require('express-session');
const MongoStore=require("connect-mongo");
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user.js');

const listingsRouter=require('./routes/listing.js')
const reviewRouter=require('./routes/reviews.js');
const userRouter=require('./routes/user.js');


app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(methodOverride('_method'))
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/_public")));


const dbUrl=process.env.ATLAS_DB_URL;

main().then(()=>{
    console.log("Connected to DB");
}).catch(err=>console.log(err));



async function main(){
   
    await mongoose.connect(dbUrl);
}

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter: 24*3600
});

store.on("error",()=>{
    console.log("Error in mongo session store ",err);
})

const sessionOption={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() * 7 *24*60*60*1000,
        maxAge: 7 *24*60*60*1000,
        httpOnly:true
    }
};



app.use(sessions(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.succMsg=req.flash("success");
    res.locals.errMsg=req.flash("error"); 
    res.locals.currUser=req.user;
    next();
})
 
app.listen(8080,()=>{
    console.log("Server is listening to 8080");
})

// app.get("/",(req,res)=>{
//     res.send("Hi , I am root");
// })


// app.get("/demoUser", async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });

//    let registerdUser=await User.register(fakeUser,"helloworld");
//    res.send(registerdUser);
// })


//listings
app.use("/listings",listingsRouter);

//reviews
app.use("/listings/:id/reviews",reviewRouter);

//user
app.use("/",userRouter);


app.all('*',(req,res,next)=>{
    next(new ExpressError(404,"!___Page not found___!"));
})

app.use((err,req,res,next)=>{
    let{status=500,message="Something went wrong"}=err;
    res.status(status).render("error.ejs",{message});
    
})

