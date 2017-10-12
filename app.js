var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose       = require("mongoose"),
express        = require("express"),
app            = express();


mongoose.connect("mongodb://localhost/restful_blog_app", {useMongoClient: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "https://farm2.staticflickr.com/1291/4677961495_2c1ce8c73a.jpg",
//     body: "Hello, this is a blog post. Some text here."
// });

// RESTFUL ROUTES

app.get("/", function(req, res) {
   res.redirect("/blogs"); 
});

// INDEX ROUTE
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if(err) {
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
    res.render("new");
});


// CREATE ROUTE
app.post("/blogs", function(req, res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if(err) {
            res.render("new");
        } else {
            //then, redirect to index
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE 
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog})
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
        if(err) {
            res.redirect("/blogs");
            console.log(err);
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });    
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});


// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    //destroy blog post
    Blog.findByIdAndRemove(req.params.id, function(err, blog){
    //redirect somewhere
        if(err) {
            console.log(err);
        } else {
            blog.remove();
            res.redirect("/blogs");
        }
    });
});


//title
//image
//body
//created

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server Has Started");
});