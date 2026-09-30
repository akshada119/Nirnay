
const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const isProfessional = require("../middleware/professionalMiddleware");

const serviceController = require("../controllers/serviceController");

const {
    validateObjectId
} = require("../utils/validators");


// =====================================
// VALIDATE SERVICE ID
// =====================================

const validateServiceId = (req, res, next) => {

    const idError = validateObjectId(req.params.id);

    if (idError) {
        req.error("Invalid service.");
        return res.redirect("/professional/services");
    }

    next();
};


// =====================================
// PROFESSIONAL - MY SERVICES
// =====================================

router.get(
    "/",
    isProfessional,
    serviceController.myServices
);


// =====================================
// PROFESSIONAL - CREATE SERVICE FORM
// =====================================

router.get(
    "/create",
    isProfessional,
    serviceController.createServiceForm
);


// =====================================
// PROFESSIONAL - CREATE SERVICE
// =====================================

router.post(
    "/create",
    isProfessional,
    upload.array("images", 10),
    serviceController.createService
);


// =====================================
// PROFESSIONAL - EDIT SERVICE FORM
// =====================================

router.get(
    "/:id/edit",
    isProfessional,
    validateServiceId,
    serviceController.editServiceForm
);


// =====================================
// PROFESSIONAL - UPDATE SERVICE
// =====================================

router.post(
    "/:id/edit",
    isProfessional,
    validateServiceId,
    upload.array("images", 10),
    serviceController.updateService
);


// =====================================
// PROFESSIONAL - DELETE SERVICE IMAGE
// =====================================

router.post(
    "/:id/images/:public_id/delete",
    isProfessional,
    validateServiceId,
    serviceController.deleteServiceImage
);


// =====================================
// PROFESSIONAL - SET PRIORITY IMAGE
// =====================================

router.post(
    "/:id/priority-image",
    isProfessional,
    validateServiceId,
    serviceController.setPriorityImage
);


module.exports = router;

