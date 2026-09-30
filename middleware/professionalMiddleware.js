const isProfessional = (req, res, next) => {
   if (!req.session.userId) {
    req.session.returnTo = req.originalUrl;

    req.error("Please log in first.");

    return res.redirect("/login");
  }

  if (req.session.role !== "professional") {
    req.error("Access denied.");

    return res.redirect("/");
  }

  next();
};

module.exports = isProfessional;
