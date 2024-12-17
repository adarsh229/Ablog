var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
const { MongoClient, ServerApiVersion } = require("mongodb");

// mongoose.connect("mongodb://localhost/restfulBlogApp", { useNewUrlParser: true });
const dbPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://ouadarsh:${dbPassword}@cluster0.lgoyc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
    // Ensures that the client will close when you finish/error
    await client.close();
}
}
run().catch(console.dir);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//Mongoose/mode/config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now} 
})

var Blog = mongoose.model("Blog", blogSchema);

// RESTful ROUTES 

// Blog.create({
//     title: "Test",
//     image: "http://www.camp-liza.com/wp-content/uploads/2017/10/DSC_4467.jpg",
//     body: "This is a test blog",
  
// })

app.get("/", function(req, res) {
    res.redirect("/blogs");
})
//INDEX
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if(err) {
            console.log(err);
        } else {
            res.render("index",{blogs: blogs});
        }
    })
    
})

//NEW  ROUTE 
app.get("/blogs/new", function(req, res) {
    res.render("new");
})

//CREATE ROUTE

app.post("/blogs", function(req, res) {
    //create blog then redirect to index
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log("-----------")
    console.log(req.body);
    Blog.create(req.body.blog, function(err,newBlog) {
        if(err) {
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    })
})

//SHOW ROUTE

app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err,foundBlog) {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    })
})

//EDIT route

app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err,foundBlog) {
        if(err){
            res.render("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    })
   
})

//UPDATE Route

app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updatedBlog) {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/"+req.params.id);
        }
    })
})
//DESTROY route
app.delete("/blogs/:id", function(req, res) {
    //destroy blog and redirect somewhere 

    Blog.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })

})

app.listen(3000, function() {
    console.log("server is running");
})