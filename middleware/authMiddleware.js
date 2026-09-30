const isCustomer = (req, res, next) => {
	if (!req.session || !req.session.userId) {
		req.error("Please log in to access your customer account.");
		return res.redirect("/login");
	}

	if (req.session.role !== "customer") {
		req.error("This page is available only to customer accounts.");
		return res.redirect("/");
	}

	next();
};

module.exports = isCustomer;
