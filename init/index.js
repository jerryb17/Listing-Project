const mongoose = require("mongoose");
const initData = require('./data.js');
const Listing = require('../models/listing.js')

const Mongo_URL = 'mongodb://127.0.0.1:27017/Spices';

main()
.then(()=>{
console.log('connection successful')
})
.catch(err => console.log(err));
async function main() {
await mongoose.connect(Mongo_URL);
}

const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = 
    initData.data.map((obj)=>({...obj, owner:"653a18c68ce57edd4cd95754"}));
    await Listing.insertMany(initData.data);
    console.log("data initialize");
};
initDB();
