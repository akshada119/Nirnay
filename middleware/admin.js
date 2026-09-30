module.exports = function isAdmin(req, res, next) {
  // User is not logged in
  if (!req.session.userId) {
    req.error("Please login first.");
    return res.redirect("/login");
  }

  // User is logged in but is not admin
  if (req.session.role !== "admin") {
    req.error("You are not authorized to access the Admin Panel.");
    return res.redirect("/");
  }

  exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log("Logout error:", err);
        req.success("Logged out successfully");
        return res.redirect("/admin/dashboard");
      }

      res.clearCookie("connect.sid");
      console.log("logged out");
      return res.redirect("/login");
    });
  };
  next();
};
