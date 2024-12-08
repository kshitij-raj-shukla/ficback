const router = require("express").Router();
const { authenticateToken } = require("./userAuth");
const Book = require("../models/book");
const Order = require("../models/order");
const User = require("../models/user");

//place order
// router.post("/place-order", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.headers;
//     const { order } = req.body;
//     for (const orderData of order) {
//       const neworder = new Order({ user: id, book: orderData._id });
//       const orderDataFromDb = await neworder.save();

//       //saving order
//       await User.findByIdAndUpdate(id, {
//         $push: { orders: orderDataFromDb._id },
//       });
//       await User.findByIdAndUpdate(id, {
//         $pull: { cart: orderData._id },
//       });
//     }
//     return res.json({
//       status: "success",
//       message: "Order placed successfully",
//     });
//   } catch (error) { 
//     console.log(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables from a .env file

router.post("/place-order", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers; // User ID from headers
    const { order } = req.body; // Order details from request body

    let orderDetails = []; // To store order details for the email

    for (const orderData of order) {
      // Create a new order
      const neworder = new Order({ user: id, book: orderData._id});
      const orderDataFromDb = await neworder.save();

      // Save the order in the user's orders list
      await User.findByIdAndUpdate(id, {
        $push: { orders: orderDataFromDb._id },
      });

      // Remove the item from the cart
      await User.findByIdAndUpdate(id, {
        $pull: { cart: orderData._id },
      });

      // Add order details to the array for the email
      orderDetails.push(orderDataFromDb);
    }

    // Fetch user details to get their email
    const user = await User.findById(id);
    // const book = await Book.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Email from .env file
        pass: process.env.EMAIL_PASS, // Password from .env file
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email
      to: user.email, // User's email from the database
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

    // Send the email
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
