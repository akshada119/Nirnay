
const express = require("express");

const router = express.Router();

const Review = require("../models/review");
const Booking = require("../models/booking");

const {
    validateObjectId,
    validateRating,
    validateReviewComment
} = require("../utils/validators");


// =====================================
// CUSTOMER - REVIEW FORM
// =====================================

router.get("/create/:bookingId", async (req, res) => {
    try {

        // Validate booking ID
        const bookingIdError = validateObjectId(req.params.bookingId);

        if (bookingIdError) {
            req.error("Invalid booking.");
            return res.redirect("/customer/bookings");
        }


        if (!req.session.userId) {
            req.error("Please login first.");
            return res.redirect("/login");
        }


        if (req.session.role !== "customer") {
            req.error("Only customers can submit reviews.");
            return res.redirect("/");
        }


        const booking = await Booking.findById(
            req.params.bookingId
        )
            .populate("service", "name price duration")
            .populate("professional", "name")
            .populate("company", "name");


        if (!booking) {
            req.error("Booking not found.");
            return res.redirect("/customer/bookings");
        }


        // Make sure this booking belongs to logged-in customer

        if (
            booking.customer.toString() !==
            req.session.userId.toString()
        ) {

            req.error("You are not authorized to review this booking.");

            return res.redirect("/customer/bookings");
        }


        // Only completed bookings can be reviewed

        if (booking.status !== "completed") {

            req.error(
                "You can review a booking only after it is completed."
            );

            return res.redirect("/customer/bookings");
        }


        // Check if review already exists

        const existingReview = await Review.findOne({
            booking: booking._id
        });


        if (existingReview) {

            req.error(
                "You have already reviewed this booking."
            );

            return res.redirect("/customer/bookings");
        }


        res.render("customer/createReview", {
            pageTitle: "Write a Review",
            booking
        });


    } catch (error) {

        console.log(
            "REVIEW FORM ERROR:",
            error
        );

        req.error("Unable to open review form.");

        res.redirect("/customer/bookings");
    }
});


// =====================================
// CUSTOMER - CREATE REVIEW
// =====================================

router.post("/create/:bookingId", async (req, res) => {
    try {

        // Validate booking ID

        const bookingIdError = validateObjectId(req.params.bookingId);

        if (bookingIdError) {

            req.error("Invalid booking.");

            return res.redirect("/customer/bookings");
        }


        if (!req.session.userId) {
            req.error("Please login first.");
            return res.redirect("/login");
        }


        if (req.session.role !== "customer") {
            req.error("Only customers can submit reviews.");
            return res.redirect("/");
        }


        const {
            rating,
            comment
        } = req.body;


        // =====================================
        // VALIDATE RATING
        // =====================================

        const ratingError = validateRating(rating);

        if (ratingError) {

            req.error(ratingError);

            return res.redirect(
                `/review/create/${req.params.bookingId}`
            );
        }


        // =====================================
        // VALIDATE COMMENT
        // =====================================

        const commentError = validateReviewComment(comment);

        if (commentError) {

            req.error(commentError);

            return res.redirect(
                `/review/create/${req.params.bookingId}`
            );
        }


        // Find booking

        const booking = await Booking.findById(
            req.params.bookingId
        );


        if (!booking) {

            req.error("Booking not found.");

            return res.redirect("/customer/bookings");
        }


        // Check ownership

        if (
            booking.customer.toString() !==
            req.session.userId.toString()
        ) {

            req.error("You are not authorized to review this booking.");

            return res.redirect("/customer/bookings");
        }


        // Check completion

        if (booking.status !== "completed") {

            req.error(
                "Only completed bookings can be reviewed."
            );

            return res.redirect("/customer/bookings");
        }


        // Check duplicate review

        const existingReview = await Review.findOne({
            booking: booking._id
        });


        if (existingReview) {

            req.error(
                "You have already reviewed this booking."
            );

            return res.redirect("/customer/bookings");
        }


        // Create review

        const review = new Review({
            customer: booking.customer,
            service: booking.service,
            professional: booking.professional,
            booking: booking._id,
            rating: Number(rating),
            comment: comment.trim()
        });


        await review.save();


        req.success(
            "Your review has been submitted successfully."
        );


        res.redirect("/customer/bookings");


    } catch (error) {

        console.log(
            "CREATE REVIEW ERROR:",
            error
        );

        req.error("Unable to submit review.");

        res.redirect("/customer/bookings");
    }
});


module.exports = router;

