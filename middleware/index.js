var Campground = require("../models/campground.js");
var Comment = require("../models/comments.js");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnerShip = function(req, res, next) {
 if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
           if(err){
               req.flash("error", err.message);
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(!foundCampground){
                req.flash("error", err.message);
                return res.redirect("back");
            }
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("err", "You dont have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("err", "You need to be logged in to do that");
        res.redirect("back");
    }
    
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(!foundComment){
                req.flash("error", "Item not found");
                return res.redirect("back");
            }
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {    
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;