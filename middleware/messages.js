// Success message middleware
function successMsg(req, res, next) {
    req.success = (message) => {
        req.flash("success", message);
    };

    next();
}


// Error message middleware
function errorMsg(req, res, next) {
    req.error = (message) => {
        req.flash("error", message);
    };

    next();
}


module.exports = {
    successMsg,
    errorMsg
};