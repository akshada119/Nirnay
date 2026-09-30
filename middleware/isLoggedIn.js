const isLoggedIn = (req, res, next) => {

    if (!req.session.userId) {

        // Save the exact page the user wanted to visit
        req.session.returnTo = req.originalUrl;

        req.error("Please log in to continue.");

        return res.redirect("/login");

    }

    next();

};

module.exports = isLoggedIn;