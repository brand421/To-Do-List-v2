//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const uri = require(__dirname + "/mongourl.js");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const url = Object.values(uri).toString();

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item ({
  name: "Welcome to the to-do list!"
});

const item2 = new Item({
  name: "Click the + button to add a new item."
})

const item3 = new Item({
  name: "Click the checkbox to complete an item"
})

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  
  Item.find({}).then(function(foundItems) {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  Item.create({name: itemName});

  res.redirect("/");

});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  Item.findByIdAndRemove(checkedItem).then(function() {
    console.log(checkedItem + " is deleted.");
  }).catch(function(err) {
    console.log(err);
  });
  res.redirect("/");
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
