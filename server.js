
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

// API Route to Save Visitor (Existing)
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

// --- NEW SECRET DASHBOARD ROUTE ---
app.get('/view-my-friends', async (req, res) => {
    try {
        // Fetches all entries from your MongoDB Visitor collection
        const allNames = await Visitor.find().sort({ visitedAt: -1 }); 
        
        // Maps the data into a clean HTML list
        let listHTML = allNames.map(v => `
            <li style="margin-bottom: 12px; border-bottom: 1px solid #333; padding-bottom: 8px;">
                <span style="font-size: 18px; font-weight: bold;">${v.name}</span> 
                <br>
                <span style="color: #888; font-size: 13px;">
                    Visited on: ${new Date(v.visitedAt).toLocaleString('en-IN')}
                </span>
            </li>
        `).join('');

        res.send(`
            <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>MSR Visitor Log</title>
            </head>
            <body style="background: #000; color: #fff; padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h1 style="border-bottom: 2px solid cyan; padding-bottom: 10px; color: cyan;">MSR Experience: Friend Log</h1>
                <p style="color: #ccc;">Total Visits: ${allNames.length}</p>
                <ul style="list-style: none; padding: 0;">
                    ${listHTML || "<li>No one has visited yet. Keep sharing!</li>"}
                </ul>
                <br>
                <a href="/" style="display: inline-block; padding: 10px 20px; background: cyan; color: black; text-decoration: none; border-radius: 5px; font-weight: bold;">← Back to Intro</a>
            </body>
            </html>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database connection error. Try again later.");
    }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});
