const router = require("express").Router();
const { authenticateToken } = require("./userAuth");
const Book = require("../models/book");
const Order = require("../models/order");
const User = require("../models/user");


const nodemailer = require("nodemailer");
require("dotenv").config(); 

router.post("/place-order", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers; 
    const { order } = req.body; 

    let orderDetails = []; 

    for (const orderData of order) {
      // Create a new order
      const neworder = new Order({ user: id, book: orderData._id});
      const orderDataFromDb = await neworder.save();

      await User.findByIdAndUpdate(id, {
        $push: { orders: orderDataFromDb._id },
      });

      await User.findByIdAndUpdate(id, {
        $pull: { cart: orderData._id },
      });

      orderDetails.push(orderDataFromDb);
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: user.email, 
      subject: "Order Confirmation",
      html: `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order, ${user.username}!</p>
        <h3>Order Details:</h3>
        <h3></h3>
        <ul>
          ${orderDetails
            .map(
              (order) => `<li>Book ID: ${order.book}</li>`
            )
            .join("")}
        </ul>
        <p>We hope you enjoy your purchase!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    // console.error("Error placing order:", error);


    // Respond to the client
    return res.json({
      status: "success",
      message: "Order placed successfully and confirmation email sent!",
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});














//get order history of particular user
router.get("/get-order-history", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const userData = await User.findById(id).populate({
      path: "orders",
      populate: {
        path: "book",
      },
    });
    const orderData = userData.orders.reverse();
    return res.json({
      status: "Success",
      data: orderData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occoured" });
  }
});

//get all order --admin
router.get("/get-all-orders", authenticateToken, async (req, res) => {
  try {
    const userData = await Order.find()
      .populate({
        path: "book",
      })
      .populate({
        path: "user",
      })
      .sort({ createAt: -1 });
    return res.json({
      status: "Success",
      data: userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//update order --admin
router.put("/update-status/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (role == "admin") {
      await Order.findByIdAndUpdate(id, { stauts: req.body.status });
      return res.json({
        status: "Success",
        message: "Order status updated successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
