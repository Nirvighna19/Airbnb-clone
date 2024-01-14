const Listing=require('../models/listing.js')

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    // console.log(allListings);
    res.render('index',{allListings});
}

module.exports.renderNewForm=(req,res)=>{
    // console.log(req.User);
    
    res.render("new");
    // console.log("enter details");
}

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        }
    })
    .populate("owner");
    if(!list){
        req.flash("error","Listing you requested for does not exist ")
        res.redirect('/listings');
    }
    console.log(list);
    res.render("show",{list});
}

module.exports.createListing=async(req,res,next)=>{
    
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send Valid Data for listing");
    // }
        let url=req.file.path;
        let filename=req.file.filename;
        // console.log(url," ",filename);

        let listing=req.body.listing;
        const newList=new Listing(listing);
        newList.owner=req.user._id;
        newList.image={url,filename};
        await newList.save();
        req.flash("success","New listing created");
        res.redirect("/listings");
   
   
}

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    let list= await Listing.findById(id);
    if(!list){
        req.flash("error","Listing you requested for does not exist ")
        res.redirect("/listings");
    }

    let originalImageUrl=await list.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");

    res.render("edit",{list,originalImageUrl});
};

module.exports.UpdateListing=async(req,res)=>{
   
    let {id}=req.params;
    
   let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file!="undefined"){
        let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }

    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    console.log(await Listing.findById(id));
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}
