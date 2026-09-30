require("dotenv").config();


const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");

const MONGO_URL = process.env.MONGO_URI

async function createAdmin() {
    try {
        await mongoose.connect(MONGO_URL);

        console.log("MongoDB connected");

        const existingAdmin = await User.findOne({
            email: "admin@nirnay.com"
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash("Admin@12345", 10);

        const admin = new User({
            name: "Admin",
            email: "admin@nirnay.com",
            password: hashedPassword,
            mobile: "9999999999",
            address: "Nirnay",
            role: "admin"
        });

        await admin.save();

        console.log("================================");
        console.log("Admin created successfully!");
        console.log("Email: admin@nirnay.com");
        console.log("Password: Admin@12345");
        console.log("================================");

    } catch (error) {
        console.log("Error creating admin:", error);
    } finally {
        await mongoose.connection.close();
    }
}

createAdmin();