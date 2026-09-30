const mongoose = require("mongoose");
const User = require("./models/user");

require("dotenv").config();

const updateProfessionalSlugs = async () => {
    try {

        // Connect to MongoDB

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");


        // Find all professionals

        const professionals = await User.find({
            role: "professional"
        });


        console.log(
            `Found ${professionals.length} professionals`
        );


        // Update each professional

        for (const professional of professionals) {

            const slug = professional.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");


            professional.slug = slug;

            await professional.save();


            console.log(
                `${professional.name} → ${slug}`
            );

        }


        console.log(
            "All professional slugs updated successfully!"
        );


        // Close database connection

        await mongoose.connection.close();

        process.exit(0);

    } catch (error) {

        console.log(
            "PROFESSIONAL SLUG UPDATE ERROR:",
            error
        );

        await mongoose.connection.close();

        process.exit(1);

    }
};


updateProfessionalSlugs();