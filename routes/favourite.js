const router = require("express").Router();
const { authenticateToken } = require("./userAuth");
const User = require("../models/user");

//add book to favorites
router.put("/add-to-favourite",authenticateToken ,async(req,res)=>{
    try{
        const {bookid, id}=req.headers; 
        const userData = await User.findById(id);
        const isBookFavorite = userData.favourites.includes(bookid);
        if(isBookFavorite){
            return res.status(200).json({ message: "Book is already in your favourites" });
        }
        await User.findByIdAndUpdate(id,{$push:{favourites: bookid}});
        return res.status(200).json({message:"Book added in favourites"});
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//delete book from favorites
router.put("/remove-from-favourite",authenticateToken ,async(req,res)=>{
    try{
        const {bookid, id}=req.headers;
        const userData = await User.findById(id);
        const isBookFavorite = userData.favourites.includes(bookid);
        if(isBookFavorite){
            await User.findByIdAndUpdate(id,{$pull:{favourites: bookid}});
            // return res.status(200).json({ message: "Book is already in your favourites" });
        }
        return res.status(200).json({message:"Book removed from favourites"});
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//get favrait book of a particular user
router.get("/get-favourite",authenticateToken,async(req,res)=>{
    try{
        const {id}=req.headers;
        const userData=await User.findById(id).populate("favourites");
        const favouriteBooks = userData.favourites;
        return res.json({
            status:"Success",
            data:favouriteBooks,
        }) 
    }catch(error){
        // console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})
module.exports = router;