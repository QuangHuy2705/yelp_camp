var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStategy = require("passport-local"),
    methodOverride = require("method-override"),
    Comment     = require("./models/comments"),
    Campground  = require("./models/campground"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");
    
    
var commentRoutes = require("./Routes/comments"),
    campgroundRoutes = require("./Routes/campgrounds"),
    indexRoutes       = require("./Routes/index");




var url = process.env.DATABASEURL;
mongoose.connect(url);
//seedDB();    
//mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true});
//mongoose.connect("mongodb://thacquanghuy2705:thachuy123@ds215208.mlab.com:15208/myyelpcamp", {useMongoClient: true});
//://thacquanghuy2705:thachuy123@ds215208.mlab.com:15208/myyelpcamp
mongoose.Promise = global.Promise; 
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//Passport Config
app.use(require("express-session")({
    secret: "Whatever",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.moment = require("moment");
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
  console.log("YelpCamp Server has started");  
});