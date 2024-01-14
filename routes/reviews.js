const express=require('express');
const router=express.Router({mergeParams:true});
const Listing=require('../models/listing.js');
const Review=require('../models/reviews.js');
const wrapAsync=require('../utils/wrapAsync.js');
const ExpressError=require('../utils/ExpressErrors.js');
const {validateReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");


const reviewController=require('../controllers/reviews.js');


//reviews route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview ));

//Delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));


module.exports=router;