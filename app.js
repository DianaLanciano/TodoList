const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));//static files such as images, CSS files, and JavaScript file

/****************for mongoose*****************/
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Welcom to your todolist!"
});
const item2 = new Item({
  name: "push the button"
});
const item3 = new Item({
  name: "for new item!"
});
const defaultItems = [item1, item2, item3];

const listChema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listChema);

/****************end mongoose*****************/


/**********************************************/
app.get("/", function(req, res) {
  const day = date.getDate();
  Item.find({}, (err, foundItems)=>{
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, (err)=>{
        if(err){
          console.log(err);
        }else{
          console.log("Inserted!!!");
        }
      });
      res.redirect("/");
    } else{  res.render("list", {listTitle: day, newListItems: foundItems});}
});
});
/**********************************************/


/**********************************************/
app.get("/:customListName", function(req, res){
 const customListName = req.params.customListName;

  List.findOne({name: customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        //Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //Shoe existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});
});
/**********************************************/


/**********************************************/
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const day = date.getDate();

  const item = new Item({
    name: itemName
  });

  if(listName === day){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});
/**********************************************/


/**********************************************/
app.post("/delete", function(req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  const day = date.getDate();

  if(listName === day){
    Item.findByIdAndRemove(itemId, (err)=>{
      if(err) {console.log(err);}
      else{console.log("Successfully removed!");}
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, function(err, fountList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }


});
/**********************************************/


/**********************************************/
app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});
/**********************************************/


/**********************************************/
app.get("/about", function(req, res) {
  res.render("about");
});
/**********************************************/

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
