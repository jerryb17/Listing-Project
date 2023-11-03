const express = require('express');
const router = express.Router({mergeParams:true});
const Listing =require("../models/listing.js");
const wrapAsync = require('../utils/wrapAsync.js');
const reviewController = require(`../controllers/reviews.js`)
const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware.js')


//reviews 
//post route

router.post(`/`, isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//delete a review by using pull(mongo)
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
