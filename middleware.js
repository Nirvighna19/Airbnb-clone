const Listing=require("./models/listing.js");
const {listingSchema}=require("./schema.js");
const ExpressError=require('./utils/ExpressErrors.js');
const {reviewSchema}=require("./schema.js");
const Review=require("./models/reviews.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","you must logged in");
   return res.redirect("/login");
}
next();
}

module.exports.saveRedirectURL=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
        console.log(res.locals.redirectUrl,' ',req.session.redirectUrl);
    }
    next();
}

module.exports.isOwner=async (req,res,next)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","you are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing =(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

module.exports.validateReview =(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        
        next();
    }
} ;

module.exports.isReviewAuthor=async (req,res,next)=>{
    let{id,reviewId}=req.params;
    console.log(id," ",reviewId);
    let review=await Review.findById(reviewId);
    console.log(review);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","you are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}