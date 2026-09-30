const User = require("../models/user");

module.exports.users = async (req, res) => {
    try {
        const users = await User.find()
            .sort({ createdAt: -1 });

        res.render("admin/customers", {
            users,
           
        });

    } catch (err) {
        console.error("Admin users error:", err);

        req.flash("error", "Unable to load users.");
        res.redirect("/admin/dashboard");
    }
};