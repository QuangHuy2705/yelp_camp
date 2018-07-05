var mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comments");

var data = [
        {
            name: "Cloud Rest",
            image: "https://static.pexels.com/photos/53537/caravan-desert-safari-dune-53537.jpeg",
            description: "bla bla"
        },
        {
            name: "Desert",
            image: "https://c402277.ssl.cf1.rackcdn.com/photos/1579/images/hero_small/HI_115201.jpg?1345598092",
            description: "bla bla"   
        }
        
    ]

function seedDB() {
    //Remove all campgrounds
    Campground.remove({}, function(err){
        /*if(err){
            console.log(err);
        }
            console.log("Removed campgrounds");
                
            //add campgrounds
            data.forEach(function(seed){
               Campground.create(seed, function(err, campground){
                   if(err){
                       console.log(err);
                   } else {
                       console.log("Added a new camp");
                       //Create a comment
                       Comment.create(
                           {
                               text: "This is great",
                               author: "Homer"
                           }, function(err, comment){
                              if(err){
                                  console.log(err);
                              } else {
                                  campground.comments.push(comment);
                                  campground.save();
                                  console.log("created a new comment");
                              }
                           });
                   }
            })
        });*/
    });

    
    //add a few comments 

}

module.exports = seedDB;
