const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');

const listingSchema = new Schema({
    title: {
    type: String,
    require:true,
    },

    description: String,
    image:{
        url:String,
        filename:String,
    },

    price:Number,

    location:String,
    
    country:String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref:"Review"
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    geometry: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});


//delete review from review collections after we delete listing
listingSchema.post ("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in: listing.reviews}});
    }
})

const listing = mongoose.model("Listing", listingSchema);
module.exports= listing;