const router = require("express").Router();
const User = require("../models/user");
const {authenticateToken} = require("./userAuth");

//add to cart
router.put("/add-to-cart", authenticateToken,async(req,res)=>{
    try{
        const {bookid,id}=req.headers;
        const userData = await User.findById(id);
        const isBookinCart = userData.cart.includes(bookid);
        if(isBookinCart) {
            return res.json({
                status: "success",
                message:"book is already in the cart"
            })
        }
        await User.findByIdAndUpdate(id,{
            $push:{cart:bookid},
        });
        return res.json({
            status: "success",
            message: "book added to cart successfully"
        })
    }catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"});
    }
})

//delete book from cart
router.put("/remove-from-cart/:bookid",authenticateToken ,async(req,res)=>{
    try{
        const {id}=req.headers;
        const {bookid}=req.params;
        // const isBookinCart = userData.favourites.includes(bookid);
        await User.findByIdAndUpdate(id,{$pull:{cart: bookid}});
        // if(isBookinCart){
        //     // return res.status(200).json({ message: "Book is already in your favourites" });
        // }
        return res.json({
            status: "success",
            message: "book removed from cart successfully"
        })
        // return res.status(200).json({message:"Book removed from favourites"});
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
    // try{
    //     const {bookid, id}=req.headers;
    //     const userData = await User.findById(id);
    //     const isBookincart = userData.cart.includes(bookid);
    //     if(isBookincart){
    //         await User.findByIdAndUpdate(id,{$pull:{cart: bookid}});
    //         // return res.status(200).json({ message: "Book is already in your favourites" });
    //     }
    //     return res.status(200).json({message:"Book removed from cart"});
    // }catch(error){
    //     console.log(error);
    //     res.status(500).json({ message: "Internal server error" });
    // }
});

router.get("/get-user-cart",authenticateToken,async(req,res)=>{
    try{
        const {id}=req.headers;
        const userData=await User.findById(id).populate("cart");
        const cart = userData.cart.reverse();
        return res.json({
            status:"Success",
            data:cart,
        }) 
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})
module.exports = router;