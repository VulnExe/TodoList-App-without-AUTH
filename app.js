//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose')
const app = express();
const _= require('lodash')

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://jerry:jerryvarsi@cluster0.ym2ea.mongodb.net/todolistDB")

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = new mongoose.Schema({
  name:String
})
const Item = mongoose.model("Item",itemsSchema) 

const item1 = new Item({
  name:"freelance"
})

const item2 = new Item({
  name:"investing"
})

const item3 = new Item({
  name:"day work"
})

const defaultitems = [item1,item2,item3]



app.get("/", function(req, res) {
  Item.find(function(err,items){
    if(items.length===0){
      Item.insertMany(defaultitems),function(){
        console.log("inserted");
      }
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
   
    }
  const day = date.getDate();
  })
});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listitem = req.body.list
  const item = new Item({
    name:itemName
  });
  if(listitem === "Today"){
    item.save()
    res.redirect("/");
  }else{
    List.findOne({name:listitem},function(err, foundList){
      foundList.item.push(item)
      foundList.save()
      res.redirect("/"+listitem)
    });
  }
  
});

const listSchema = {
  name:String,
  item:[itemsSchema]
};

const List = new mongoose.model("List", listSchema)


app.post("/delete", function(req,res){
  const checkitemID = req.body.checkbox;
  // Item.deleteOne({_id:checkitemID},function(err){
  const listName = req.body.listName;
    if(listName === "Today"){
      Item.findByIdAndRemove(checkitemID,function(err){
        if(!err){
          console.log("deleted successfully!!");
          res.redirect("/");
        }; 
      });
    }else{
      List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkitemID}}},function(err, foundList){
        if(err){
          console.log(err);
        }else{
          res.redirect("/" + listName); 
        }
      });
    }
    
});

app.get("/:customName",function(req,res){
  const customNameList = _.capitalize(req.params.customName)
  List.findOne({name:customNameList},function(err, foundList){
    if(!err){
      if(!foundList){
        //create list
        const list = new List({
          name:customNameList,
          item:defaultitems
        });
        list.save();
        res.redirect("/"+ customNameList)
      }else{
         //show list
         res.render("list", {listTitle: foundList.name, newListItems:foundList.item });
         
        }
    }
  })
  
})

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(process.env.PORT || 3000,function(){
  console.log("running in port 3000");
})

