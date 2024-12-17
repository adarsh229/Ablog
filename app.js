var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
const { MongoClient, ServerApiVersion } = require("mongodb");

// mongoose.connect("mongodb://localhost/restfulBlogApp", { useNewUrlParser: true });

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

const dbPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://ouadarsh:${dbPassword}@cluster0.lgoyc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


mongoose.connect(uri);

  mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB via Mongoose");
  });
  
  mongoose.connection.on("error", (err) => {
    console.error(`Mongoose connection error: ${err.message}`);
  });
  
app.get("/", function(req, res) {
    res.redirect("/blogs");
})

app.get("/blogs", function (req, res) {
    Blog.find({})
      .then((blogs) => {
        console.log(`fetched blogs:`,  blogs);
        res.render("index", { blogs: blogs });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error retrieving blogs");
      });
  });
  

//NEW  ROUTE 
app.get("/blogs/new", function(req, res) {
    res.render("new");
});



// CREATE ROUTE
app.post("/blogs", async function (req, res) {
    try {
        req.body.blog.body = req.sanitize(req.body.blog.body);
        const newBlog = await Blog.create(req.body.blog);
        console.log("Blog created:", newBlog);
        res.redirect("/blogs");
    } catch (err) {
        console.error("Error creating blog:", err);
        res.render("new");
    }
});

// SHOW ROUTE
app.get("/blogs/:id", async function (req, res) {
    try {
        const foundBlog = await Blog.findById(req.params.id);
        if (!foundBlog) {
            console.error("Blog not found");
            return res.redirect("/blogs");
        }
        res.render("show", { blog: foundBlog });
    } catch (err) {
        console.error("Error finding blog:", err);
        res.redirect("/blogs");
    }
});

// EDIT ROUTE
app.get("/blogs/:id/edit", async function (req, res) {
    try {
        const foundBlog = await Blog.findById(req.params.id);
        if (!foundBlog) {
            console.error("Blog not found for editing");
            return res.redirect("/blogs");
        }
        res.render("edit", { blog: foundBlog });
    } catch (err) {
        console.error("Error finding blog for editing:", err);
        res.redirect("/blogs");
    }
});

// UPDATE ROUTE
app.put("/blogs/:id", async function (req, res) {
    try {
        req.body.blog.body = req.sanitize(req.body.blog.body);
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body.blog, {
            new: true, // return the updated document
            runValidators: true, // run schema validations
        });
        if (!updatedBlog) {
            console.error("Error updating blog");
            return res.redirect("/blogs");
        }
        res.redirect(`/blogs/${req.params.id}`);
    } catch (err) {
        console.error("Error updating blog:", err);
        res.redirect("/blogs");
    }
});

// DESTROY ROUTE
app.delete("/blogs/:id", async function (req, res) {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) {
            console.error("Error deleting blog");
            return res.redirect("/blogs");
        }
        res.redirect("/blogs");
    } catch (err) {
        console.error("Error deleting blog:", err);
        res.redirect("/blogs");
    }
});


app.listen(3000, function() {
    console.log("server is running");
})