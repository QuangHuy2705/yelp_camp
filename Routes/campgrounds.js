var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var multer = require("multer");
var geocoder    = require("geocoder");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'duswrh0tx', 
  api_key: 862342259982118, 
  api_secret: "6CmnXK8YLmlmtAmO0Wc7fF3WsYs"
});

//INDEX - show all campgrounds
router.get("/", function(req, res){
    if (req.query.search){
        var regex = new RegExp(escapeRegex(req.query.search), 'gi');
        var perpage = 4;
        var pageQuery = req.query.page;
        var pageNumber = pageQuery ? pageQuery : 1;
        Campground.find({name: regex}).skip((perpage * pageNumber) - perpage).limit(perpage).exec(function(err, allCampgrounds){
            Campground.count().exec(function(err, count){
                if(err){    
                    console.log(err)
                } else {
                    
                    if (allCampgrounds.length < 1){
                        req.flash("error", "No campgrounds found. Try again");
                        return res.render("campgrounds/index", {
                            page: 'campgrounds',
                            campgrounds: allCampgrounds,
                            current: pageNumber,
                            pages: Math.ceil(count / perpage)
                        });
                    }
                    res.render("campgrounds/index", {
                        page: 'campgrounds',
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perpage)
                    });
                    
                }
            });
        });
    }
     else {
        var perpage = 4;
        var pageQuery = req.query.page;
        var pageNumber = pageQuery ? pageQuery : 1;
        Campground.find({}).skip((perpage * pageNumber) - perpage).limit(perpage).exec(function(err, allCampgrounds){
            Campground.count().exec(function(err, count){
                if(err){
                    console.log(err)
                } else {
                    res.render("campgrounds/index", {
                        page: 'campgrounds',
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perpage)
                    });
                    
                }
            });
        });
    
    };
    
});
//NEW - show form
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new"); 
});

//Create route  - add new 
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {

        cloudinary.uploader.upload(req.file.path, function(result) {
        
      // add cloudinary url for the image to the campground object under image property
        
        var name = req.body.name;
        var image = result.secure_url;
        var desc = req.body.description;
          // add author to campground
        var author = {
              id: req.user._id,
              username: req.user.username
          };
        var price = req.body.price;
        geocoder.geocode(req.body.location, function (err, data) {
            if(data.status !== "OK"){
                console.log(data);
                req.flash("error", "Sorry, location not found!");
                res.redirect("back");
            } else {
                var lat = data.results[0].geometry.location.lat;
                var lng = data.results[0].geometry.location.lng;
                var location = data.results[0].formatted_address;
                var newCampground = {name: name, image: image, description: desc, price: price, author: author, location: location, lat: lat, lng: lng};
                // Create a new campground and save to DB
                Campground.create(newCampground, function(err, newlyCreated){
                    if(err){
                        console.log(err);
                    } else {
                        //redirect back to campgrounds page
                    
                        res.redirect("/campgrounds");
                    }
                });
            }
            

        });
       
    });
});

//SHOW - shows more info
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});
//EIDT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnerShip, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });


});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnerShip, upload.single('image'), function(req, res){
          geocoder.geocode(req.body.location, function (err, data) {
                if(data.results.status !== "OK"){
                
                    req.flash("error", "Sorry can not update location");
                    res.redirect("back");                
                    
                } else {
                    var image = req.body.image;
                    var lat = data.results[0].geometry.location.lat;
                    var lng = data.results[0].geometry.location.lng;
                    var location = data.results[0].formatted_address;   
                    var newData = {name: req.body.name, image: image, description: req.body.description, price: req.body.price, location: location, lat: lat, lng: lng};
                    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
                        if(err){
                            req.flash("error", err.message);
                            res.redirect("back");
                        } else {
                            console.log(campground);
                            req.flash("success","Successfully Updated!");
                            res.redirect("/campgrounds/" + campground._id);
                        }   
                    });
                }
            
          });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnerShip, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds");
       }
   });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;