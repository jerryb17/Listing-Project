const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
    
};

module.exports.newListing = async (req,res)=>{
    res.render('listings/new.ejs')    
};

module.exports.showListing = async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews", populate: {path:"author"},})
    .populate("owner");
    if(!listing){
        req.flash("error", "listing you requested for does not exist!!!!");
        res.redirect("/listings")
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async(req,res, next)=>{
    let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
    })
    .send();
    let url = req.file.path;
    let filename = req.file.filename;
   
    
    // let {title, description, image, price, location, country}=req.body;
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Bad Request, send valid data");
    // }
  
    const newListing = new Listing (req.body.listing);
    newListing.owner = req.user._id;
    newListing.image= {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "new listing added!!!!");
    res.redirect("/listings");
    
};

module.exports.renderEditListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error", "listing you requested for does not exist!!!!");
        res.redirect("/listings")
    }
    let originalImageURL = listing.image.url;
    originalImageURL= originalImageURL.replace('/upload', '/upload/h_200,w_250')
    res.render("listings/edit.ejs", {listing, originalImageURL});
};

module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;   
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing});
    if(typeof req.file !=="undefined"){
        let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    
    req.flash("updated", "listing updated");
    res.redirect(`/listings/${id}` );
};

module.exports.destroyListing= async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("deleted", "listing deleted!!!!");
    console.log(deletedListing);
    res.redirect("/listings");
};