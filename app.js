if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Listing = require('./models/listing.js');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

// const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));

const dbURL = process.env.ATLASDB_URL;

// app.use(cookieParser("secretcode"));

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on('error', () => {
  console.log('error in mongo session', err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.deleted = req.flash('deleted');
  res.locals.updated = req.flash('updated');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
});

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);

app.engine('ejs', ejsMate);

// const Mongo_URL = 'mongodb://127.0.0.1:27017/Spices';

main()
  .then(() => {
    console.log('connection successful');
  })
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect(dbURL);
}

app.listen(8080, (req, res) => {
  console.log('Listening at port 8080');
});

app.get(
  '/',
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
  })
);

/*cookie*/
// app.get("/getsignCookie", (req,res)=>{
//     res.cookie("madeIn", "India", { signed:true});
//     res.send("sign cookie send")
// });

// app.get("/verify", (req, res)=>{
//     console.log(req.signedCookies);
//     res.send("verify");
// })

// app.get("/getCookie", (req,res)=>{
//     res.cookie("madeIn", "India");
//     res.cookie("color", "blue");
//     res.send("cookie send");
// })

//except all request
app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
});

//error handling middleware
app.use((err, req, res, next) => {
  let { status = 500, message = 'Something wend wrong!!!' } = err;
  res.status(status).render('error.ejs', { err });
  // res.status(status).send(message);
});
