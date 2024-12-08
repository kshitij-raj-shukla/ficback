const router = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");
const Book = require("../models/book");

//add book --admin
router.post("/add-book", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const user = await User.findById(id);
    if (user.role !== "admin") {
      return res
        .status(404)
        .json({ message: "You do not have access as admin" });
    }
    const book = new Book({
      url: req.body.url,
      title: req.body.title,
      author: req.body.author,
      price: req.body.price,
      desc: req.body.desc,
      language: req.body.language,
    });
    await book.save();
    res.status(200).json({ message: "book added successfully" });
  } catch (error) {
    console.log(error); 
    res.status(500).json({ message: "Internal server error" });
  }
});

//update book
router.put("/update-book", authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.headers;
    await Book.findByIdAndUpdate(bookId, {
      url: req.body.url,
      title: req.body.title,
      author: req.body.author,
      price: req.body.price,
      desc: req.body.desc,
      language: req.body.language,
    });

    return res.status(200).json({message: "Book updated successfully"});
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "An error occurred" });
  }
});

//delete book --admin
router.delete("/delete-book",async(req,res)=>{
  try{
    const { bookid}=req.headers;
    await Book.findByIdAndDelete(bookid);
    return res.status(200).json({message: "Book deleted successfully"});
  }catch(error){
    res.status(404).json({message:"internal server error"});
  } 
})

//get book --admin
router.get("/get-all-books",async(req,res)=>{
  try{
    const books=await Book.find().sort({createAt:-1});
    return res.json({status:"Success",data:books,});

  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Internal server error"});
  }
}) 

//get recent books
router.get("/get-recent-books",async(req,res)=>{
  try{
    const book=await Book.find().sort({createAt:-1}).limit(8);
    return res.json({status:"Success",data:book,});
  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Internal server error"});
  }
})

//get book by id
router.get("/get-book-id/:id",async(req,res)=>{
  try{
    // console.log(req)  
    const {id}=req.params;
    const book=await Book.findById(id);
    return res.json({status:"Success",data:book});
  }catch(error){
    console.log(error);
    return res.status(404)({message:"Internal server error"});
  }
})

module.exports = router;
