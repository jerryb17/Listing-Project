const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const {isLoggedIn, isOwner, validateListing} = require('../middleware.js');
const controllerListing = require('../controllers/listings.js');
const multer = require('multer');
const {storage} = require('../cloudConfig.js')
const upload = multer({storage})

router
.route('/')
//index route
.get( wrapAsync(controllerListing.index))
//create route
.post(isLoggedIn, 
    upload.single('listing[image]'),   
    validateListing, 
    wrapAsync(controllerListing.createListing)
    );


//new route
router.get("/new", isLoggedIn, wrapAsync(controllerListing.newListing));

router.route('/:id')
//show route
.get(wrapAsync(controllerListing.showListing))
//update route
.put(isLoggedIn,
     isOwner, 
     upload.single('listing[image]'),     
     validateListing,
     wrapAsync(controllerListing.updateListing))
//delete route
.delete(isLoggedIn, isOwner, wrapAsync(controllerListing.destroyListing));


//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(controllerListing.renderEditListing));

module.exports = router;

