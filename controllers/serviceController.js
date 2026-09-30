const Service = require("../models/service");
const Company = require("../models/company");
const fs = require("fs");
const path = require("path");

const {
  isEmpty,
  validateServiceName,
  validateDescription,
  validatePrice,
  validateDuration,
  validateObjectId,
} = require("../utils/validators");

const serviceUploadPath = path.resolve(__dirname, "../public/uploads/services");

// ==========================================
// HELPER
// ==========================================

const getValidationError = (validator) => {
  const result = validator();

  if (result !== true) {
    return result;
  }

  return null;
};

// ==========================================
// SHOW CREATE SERVICE FORM
// ==========================================

exports.createServiceForm = async (req, res) => {
  try {
    const company = await Company.findOne({
      owner: req.session.userId,
    });

    if (!company) {
      req.error("Please create your company before adding a service.");
      return res.redirect("/professional/company");
    }

    res.render("professional/createService", {
      company,
    });
  } catch (error) {
    console.log("CREATE SERVICE FORM ERROR:", error);

    req.error("Unable to load create service page.");
    return res.redirect("/professional/dashboard");
  }
};

// ==========================================
// CREATE SERVICE
// ==========================================

exports.createService = async (req, res) => {
  try {
    const { name, category, description, price, duration, priorityImage } =
      req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    const nameError = getValidationError(() => validateServiceName(name));

    if (nameError) {
      req.error(nameError);
      return res.redirect("/professional/services/create");
    }

    const categoryValue = typeof category === "string" ? category.trim() : "";

    if (isEmpty(categoryValue)) {
      req.error("Service category is required.");
      return res.redirect("/professional/services/create");
    }

    if (categoryValue.length > 100) {
      req.error("Service category cannot exceed 100 characters.");
      return res.redirect("/professional/services/create");
    }

    const descriptionError = getValidationError(() =>
      validateDescription(description),
    );

    if (descriptionError) {
      req.error(descriptionError);
      return res.redirect("/professional/services/create");
    }

    const priceError = getValidationError(() => validatePrice(price));

    if (priceError) {
      req.error(priceError);
      return res.redirect("/professional/services/create");
    }

    const durationError = getValidationError(() => validateDuration(duration));

    if (durationError) {
      req.error(durationError);
      return res.redirect("/professional/services/create");
    }

    // ==========================================
    // FIND PROFESSIONAL'S COMPANY
    // ==========================================

    const company = await Company.findOne({
      owner: req.session.userId,
    });

    if (!company) {
      req.error("Please create your company before adding a service.");
      return res.redirect("/professional/company");
    }

    // ==========================================
    // PREPARE UPLOADED IMAGES
    // ==========================================

    const uploadedFiles = req.files || [];

    if (uploadedFiles.length > 10) {
      uploadedFiles.forEach((file) => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.log("CREATE IMAGE CLEANUP ERROR:", err.message);
        }
      });

      req.error("You can upload a maximum of 10 images.");
      return res.redirect("/professional/services/create");
    }

    const images = uploadedFiles.map((file) => ({
      url: "/uploads/services/" + file.filename,
      public_id: file.filename,
    }));

    // ==========================================
    // VALIDATE PRIORITY IMAGE
    // ==========================================

    let selectedPriorityImage = null;

    if (!isEmpty(priorityImage)) {
      const priorityIndex = Number(priorityImage);

      if (
        !Number.isInteger(priorityIndex) ||
        priorityIndex < 0 ||
        priorityIndex >= images.length
      ) {
        uploadedFiles.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.log("PRIORITY IMAGE CLEANUP ERROR:", err.message);
          }
        });

        req.error("Invalid priority image selected.");
        return res.redirect("/professional/services/create");
      }

      selectedPriorityImage = images[priorityIndex];
    }

    // ==========================================
    // FIRST IMAGE BECOMES PRIORITY BY DEFAULT
    // ==========================================

    if (!selectedPriorityImage && images.length > 0) {
      selectedPriorityImage = images[0];
    }

    // ==========================================
    // GENERATE SLUG
    // ==========================================

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (isEmpty(slug)) {
      uploadedFiles.forEach((file) => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.log("SLUG IMAGE CLEANUP ERROR:", err.message);
        }
      });

      req.error("Unable to generate a valid service name.");
      return res.redirect("/professional/services/create");
    }

    // ==========================================
    // CREATE SERVICE
    // ==========================================

    const service = new Service({
      name: name.trim(),
      slug,
      category: categoryValue,
      description: description.trim(),
      price: Number(price),
      duration: duration.trim(),
      company: company._id,
      professional: req.session.userId,
      images,
      priorityImage: selectedPriorityImage,
    });

    await service.save();

    req.success("Service added successfully!");

    return res.redirect("/professional/services");
  } catch (error) {
    console.log("CREATE SERVICE ERROR:", error);

    // ==========================================
    // DUPLICATE SLUG
    // ==========================================

    if (error.code === 11000) {
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.log("DUPLICATE SLUG FILE CLEANUP ERROR:", err.message);
          }
        });
      }

      req.error(
        "A service with this name already exists. Please choose a different name.",
      );

      return res.redirect("/professional/services/create");
    }

    // ==========================================
    // DELETE UPLOADED FILES IF SAVE FAILS
    // ==========================================

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.log("CREATE FILE CLEANUP ERROR:", err.message);
        }
      });
    }

    req.error("Unable to add your service. Please try again.");

    return res.redirect("/professional/services");
  }
};

// ==========================================
// SHOW MY SERVICES
// ==========================================

exports.myServices = async (req, res) => {
  try {
    const services = await Service.find({
      professional: req.session.userId,
    }).populate("company");

    res.render("professional/services", {
      services,
    });
  } catch (error) {
    console.log("MY SERVICES ERROR:", error);

    req.error("Unable to load your services.");

    return res.redirect("/professional/dashboard");
  }
};

// ==========================================
// EDIT SERVICE FORM
// ==========================================

exports.editServiceForm = async (req, res) => {
  try {
    const idError = validateObjectId(req.params.id);

    if (idError !== true) {
      req.error("Invalid service ID.");
      return res.redirect("/professional/services");
    }

    const service = await Service.findOne({
      _id: req.params.id,
      professional: req.session.userId,
    }).populate("company");

    if (!service) {
      req.error("Service not found or you are not authorized to edit it.");

      return res.redirect("/professional/services");
    }

    res.render("professional/editService", {
      service,
    });
  } catch (error) {
    console.log("EDIT SERVICE FORM ERROR:", error);

    req.error("Unable to load service details.");

    return res.redirect("/professional/services");
  }
};

// ==========================================
// UPDATE SERVICE
// ==========================================

exports.updateService = async (req, res) => {
  try {
    console.log("=================================");
    console.log("UPDATE SERVICE CALLED");
    console.log("SERVICE ID:", req.params.id);
    console.log("USER ID:", req.session.userId);
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("=================================");

    // ==========================================
    // VALIDATE SERVICE ID
    // ==========================================

    const idError = validateObjectId(req.params.id);

    if (idError !== true) {
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.log("INVALID ID FILE CLEANUP ERROR:", err.message);
          }
        });
      }

      req.error("Invalid service ID.");

      return res.redirect("/professional/services");
    }

    const { name, category, description, price, duration } = req.body;

    // ==========================================
    // VALIDATE SERVICE DETAILS
    // ==========================================

    const nameError = getValidationError(() => validateServiceName(name));

    if (nameError) {
      req.error(nameError);
      return res.redirect(`/professional/services/${req.params.id}/edit`);
    }

    const categoryValue = typeof category === "string" ? category.trim() : "";

    if (isEmpty(categoryValue)) {
      req.error("Service category is required.");

      return res.redirect(`/professional/services/${req.params.id}/edit`);
    }

    if (categoryValue.length > 100) {
      req.error("Service category cannot exceed 100 characters.");

      return res.redirect(`/professional/services/${req.params.id}/edit`);
    }

    const descriptionError = getValidationError(() =>
      validateDescription(description),
    );

    if (descriptionError) {
      req.error(descriptionError);

      return res.redirect(`/professional/services/${req.params.id}/edit`);
    }

    const priceError = getValidationError(() => validatePrice(price));

    if (priceError) {
      req.error(priceError);

      return res.redirect(`/professional/services/${req.params.id}/edit`);
    }

    const durationError = getValidationError(() => validateDuration(duration));

    if (durationError) {
      req.error(durationError);

      return res.redirect(`/professional/services/${req.params.id}/edit`);
    }

    // ==========================================
    // FIND SERVICE BELONGING TO PROFESSIONAL
    // ==========================================

    const service = await Service.findOne({
      _id: req.params.id,
      professional: req.session.userId,
    });

    console.log("SERVICE FOUND:", service ? "YES" : "NO");

    if (!service) {
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.log("SERVICE NOT FOUND FILE CLEANUP ERROR:", err.message);
          }
        });
      }

      req.error("Service not found or you are not authorized to edit it.");

      return res.redirect("/professional/services");
    }

    // ==========================================
    // UPDATE NORMAL SERVICE DETAILS
    // ==========================================

    service.name = name.trim();
    service.category = categoryValue;
    service.description = description.trim();
    service.price = Number(price);
    service.duration = duration.trim();

    // ==========================================
    // ADD NEW IMAGES
    // ==========================================

    if (req.files && req.files.length > 0) {
      const existingImageCount = service.images ? service.images.length : 0;

      const newImageCount = req.files.length;

      console.log("EXISTING IMAGES:", existingImageCount);

      console.log("NEW IMAGES:", newImageCount);

      // ==========================================
      // MAXIMUM 10 IMAGES
      // ==========================================

      if (existingImageCount + newImageCount > 10) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.log("FILE CLEANUP ERROR:", err.message);
          }
        });

        req.error(
          `You can have a maximum of 10 images. You already have ${existingImageCount} image(s).`,
        );

        return res.redirect(`/professional/services/${service._id}/edit`);
      }

      // ==========================================
      // PREPARE NEW IMAGES
      // ==========================================

      const newImages = req.files.map((file) => ({
        url: "/uploads/services/" + file.filename,
        public_id: file.filename,
      }));

      // Add images
      service.images.push(...newImages);

      // ==========================================
      // SET PRIORITY IF NONE EXISTS
      // ==========================================

      if (!service.priorityImage || !service.priorityImage.url) {
        service.priorityImage = newImages[0];
      }
    }

    // ==========================================
    // SAVE SERVICE
    // ==========================================

    await service.save();

    console.log("SERVICE UPDATED SUCCESSFULLY");

    console.log("NEW SERVICE NAME:", service.name);

    console.log("TOTAL IMAGES:", service.images.length);

    req.success("Service updated successfully!");

    return res.redirect(`/professional/services/${service._id}/edit`);
  } catch (error) {
    console.log("=================================");

    console.log("UPDATE SERVICE ERROR:");

    console.log(error);

    console.log("=================================");

    // ==========================================
    // DELETE NEWLY UPLOADED FILES
    // ==========================================

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.log("UPDATE FILE CLEANUP ERROR:", err.message);
        }
      });
    }

    if (error.code === 11000) {
      req.error("A service with this name already exists.");

      return res.redirect(`/professional/services/${req.params.id}/edit`);
    }

    req.error("Unable to update your service. Please try again.");

    return res.redirect(`/professional/services/${req.params.id}/edit`);
  }
};

// ==========================================
// DELETE SERVICE IMAGE
// ==========================================

exports.deleteServiceImage = async (req, res) => {
  try {
    // ==========================================
    // VALIDATE SERVICE ID
    // ==========================================

    const idError = validateObjectId(req.params.id);

    if (idError !== true) {
      req.error("Invalid service ID.");

      return res.redirect("/professional/services");
    }

    const service = await Service.findOne({
      _id: req.params.id,
      professional: req.session.userId,
    });

    if (!service) {
      req.error("Service not found or you are not authorized to manage it.");

      return res.redirect("/professional/services");
    }

    // ==========================================
    // SECURELY GET FILENAME
    // ==========================================

    const publicId = path.basename(req.params.public_id || "");

    if (isEmpty(publicId)) {
      req.error("Invalid image.");

      return res.redirect(`/professional/services/${service._id}/edit`);
    }

    // ==========================================
    // FIND IMAGE
    // ==========================================

    const imageIndex = service.images.findIndex(
      (image) => image.public_id === publicId,
    );

    if (imageIndex === -1) {
      req.error("Image not found.");

      return res.redirect(`/professional/services/${service._id}/edit`);
    }

    const deletedImage = service.images[imageIndex];

    // ==========================================
    // REMOVE IMAGE FROM DATABASE
    // ==========================================

    service.images.splice(imageIndex, 1);

    // ==========================================
    // IF PRIORITY IMAGE WAS DELETED
    // ==========================================

    if (service.priorityImage && service.priorityImage.public_id === publicId) {
      if (service.images.length > 0) {
        service.priorityImage = service.images[0];
      } else {
        service.priorityImage = null;
      }
    }

    // ==========================================
    // SAVE DATABASE FIRST
    // ==========================================

    await service.save();

    // ==========================================
    // DELETE FILE FROM LOCAL STORAGE
    // ==========================================

    const fileName = path.basename(deletedImage.public_id);

    const filePath = path.join(serviceUploadPath, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    req.success("Image deleted successfully!");

    return res.redirect(`/professional/services/${service._id}/edit`);
  } catch (error) {
    console.log("DELETE SERVICE IMAGE ERROR:", error);

    req.error("Unable to delete the image. Please try again.");

    return res.redirect(`/professional/services/${req.params.id}/edit`);
  }
};

// ==========================================
// SET PRIORITY IMAGE
// ==========================================

exports.setPriorityImage = async (req, res) => {
  try {
    // ==========================================
    // VALIDATE SERVICE ID
    // ==========================================

    const idError = validateObjectId(req.params.id);

    if (idError !== true) {
      req.error("Invalid service ID.");

      return res.redirect("/professional/services");
    }

    const { public_id } = req.body;

    // ==========================================
    // VALIDATE PUBLIC ID
    // ==========================================

    const cleanPublicId =
      typeof public_id === "string" ? path.basename(public_id.trim()) : "";

    if (isEmpty(cleanPublicId)) {
      req.error("Invalid image selection.");

      return res.redirect(`/professional/services/${req.params.id}/edit`);
    }

    const service = await Service.findOne({
      _id: req.params.id,
      professional: req.session.userId,
    });

    if (!service) {
      req.error("Service not found or you are not authorized to manage it.");

      return res.redirect("/professional/services");
    }

    // ==========================================
    // FIND SELECTED IMAGE
    // ==========================================

    const selectedImage = service.images.find(
      (image) => image.public_id === cleanPublicId,
    );

    if (!selectedImage) {
      req.error("Selected image was not found.");

      return res.redirect(`/professional/services/${service._id}/edit`);
    }

    // ==========================================
    // SET PRIORITY IMAGE
    // ==========================================

    service.priorityImage = {
      url: selectedImage.url,
      public_id: selectedImage.public_id,
    };

    await service.save();

    req.success("Priority image updated successfully!");

    return res.redirect(`/professional/services/${service._id}/edit`);
  } catch (error) {
    console.log("SET PRIORITY IMAGE ERROR:", error);

    req.error("Unable to update the priority image.");

    return res.redirect(`/professional/services/${req.params.id}/edit`);
  }
};
