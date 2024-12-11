const router = require("express").Router();
const User = require("../models/user");
const { authenticateToken } = require("./userAuth");

// Add to cart
router.put("/add-to-cart", authenticateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers;
        const userData = await User.findById(id);
        const isBookinCart = userData.cart.includes(bookid);
        if (isBookinCart) {
            return res.json({
                status: "success",
                message: "Book is already in the cart"
            });
        }
        await User.findByIdAndUpdate(id, {
            $push: { cart: bookid },
        });
        return res.json({
            status: "success",
            message: "Book added to cart successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Remove book from cart
router.put("/remove-from-cart/:bookid", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const { bookid } = req.params;
        await User.findByIdAndUpdate(id, { $pull: { cart: bookid } });
        return res.json({
            status: "success",
            message: "Book removed from cart successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Remove all items from cart
router.put("/clear-cart", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        await User.findByIdAndUpdate(id, { $set: { cart: [] } });
        return res.json({
            status: "success",
            message: "All items removed from cart successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get user cart
router.get("/get-user-cart", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const userData = await User.findById(id).populate("cart");
        const cart = userData.cart.reverse();
        return res.json({
            status: "Success",
            data: cart,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
