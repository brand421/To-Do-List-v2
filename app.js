//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const uri = require(__dirname + "/mongourl.js");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const url = Object.values(uri).toString();

mongoose.connect(url, { useNewUrlParser: true});

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

const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  
  Item.find({})
    .then(function(foundItems) {
      if(foundItems.length === 0) {
        Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
  })

});

app.get("/:customList", function(req, res) {
  const customListName = _.capitalize(req.params.customList);

  List.findOne({name: customListName}).exec()
  .then(function(foundList) {
    if (!foundList) {
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      console.log("New list created!");
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  })  
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).exec()
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
  }

});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today" && checkedItem != undefined) {
    Item.findByIdAndRemove(checkedItem)
      .then(function() {
        console.log(checkedItem + " is deleted.");
        res.redirect("/");
      })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}})
      .then(function() {
        res.redirect("/" + listName);
      })
  }
});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
