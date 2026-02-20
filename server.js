const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("MongoDB Error ❌", err));

// Create Schema
const visitorSchema = new mongoose.Schema({
    name: String,
    visitedAt: {
        type: Date,
        default: Date.now
    }
});

const Visitor = mongoose.model("Visitor", visitorSchema);

// API Route to Save Visitor
app.post("/visit", async (req, res) => {
    try {
        const { name } = req.body;

        const newVisitor = new Visitor({ name });
        await newVisitor.save();

        res.json({ message: "Visitor saved successfully" });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});
