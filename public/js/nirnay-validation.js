
/* =========================================================
   NIRNAY - CLIENT SIDE VALIDATION
   Live validation + Bootstrap validation

   FIX:
   - Prevents duplicate validation messages
   - One error message per field
   - Existing error is updated instead of recreated
   - Existing Nirnay CSS/classes preserved
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* =====================================================
       ERROR MESSAGE
  ===================================================== */
  
function showError(field, message) {
  if (!field) return;

  field.classList.add("is-invalid");

  /*
   * Give every field a unique validation ID.
   */
  if (!field.dataset.validationId) {
    field.dataset.validationId =
      "nirnay-validation-" +
      Math.random().toString(36).substring(2, 10);
  }

  const validationId = field.dataset.validationId;

  /*
   * Find existing error for this field.
   */
  let error = document.querySelector(
    `.nirnay-validation-error[data-for="${validationId}"]`
  );

  /*
   * Create error only once.
   */
  if (!error) {
    error = document.createElement("div");

    error.className =
      "invalid-feedback nirnay-validation-error";

    error.dataset.for = validationId;

    /*
     * Force error below the complete input wrapper.
     */
    error.style.display = "block";
    error.style.width = "100%";
    error.style.marginTop = "6px";
    error.style.clear = "both";

    /*
     * Find the complete input wrapper.
     *
     * Example:
     *
     * <div class="input-wrapper">
     *     <i ...></i>
     *     <input ...>
     *     <button ...></button>
     * </div>
     *
     * The error will be inserted AFTER this wrapper.
     */
    const inputWrapper = field.closest(".input-wrapper");

    if (inputWrapper) {
      inputWrapper.insertAdjacentElement("afterend", error);
    } else {
      /*
       * Fallback for fields that don't use
       * .input-wrapper.
       */
      field.insertAdjacentElement("afterend", error);
    }
  }

  /*
   * Update the existing message.
   */
  error.textContent = message;
}



  /* =====================================================
       CLEAR ERROR
  ===================================================== */

  function clearError(field) {
    if (!field) return;

    field.classList.remove("is-invalid");

    const validationId = field.dataset.validationId;

    if (!validationId) return;

    const error = document.querySelector(
      `.nirnay-validation-error[data-for="${validationId}"]`
    );

    if (error) {
      error.remove();
    }
  }


  /* =====================================================
       NAME
  ===================================================== */

  function validateName(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {
        showError(field, "Name is required.");
        return false;
      }

      return true;
    }

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]+$/.test(value)) {

      showError(
        field,
        "Name can contain only letters, spaces, apostrophes, dots, or hyphens."
      );

      return false;
    }

    if (value.length < 2) {

      showError(
        field,
        "Name must contain at least 2 characters."
      );

      return false;
    }

    if (value.length > 50) {

      showError(
        field,
        "Name cannot exceed 50 characters."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       EMAIL
  ===================================================== */

  function validateEmail(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {
        showError(
          field,
          "Email address is required."
        );

        return false;
      }

      return true;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(value)) {

      showError(
        field,
        "Please enter a valid email address."
      );

      return false;
    }

    if (value.length > 100) {

      showError(
        field,
        "Email cannot exceed 100 characters."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       MOBILE
  ===================================================== */

  function validateMobile(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Mobile number is required."
        );

        return false;
      }

      return true;
    }

    if (!/^[6-9][0-9]{9}$/.test(value)) {

      showError(
        field,
        "Mobile number must contain 10 digits and start with 6, 7, 8 or 9."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       PASSWORD
  ===================================================== */

  function validatePassword(field) {

    const value = field.value;

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Password is required."
        );

        return false;
      }

      return true;
    }

    if (value.length < 8) {

      showError(
        field,
        "Password must contain at least 8 characters."
      );

      return false;
    }

    if (value.length > 128) {

      showError(
        field,
        "Password cannot exceed 128 characters."
      );

      return false;
    }

    if (!/[A-Z]/.test(value)) {

      showError(
        field,
        "Password must contain at least one uppercase letter."
      );

      return false;
    }

    if (!/[a-z]/.test(value)) {

      showError(
        field,
        "Password must contain at least one lowercase letter."
      );

      return false;
    }

    if (!/[0-9]/.test(value)) {

      showError(
        field,
        "Password must contain at least one number."
      );

      return false;
    }

    if (!/[^A-Za-z0-9]/.test(value)) {

      showError(
        field,
        "Password must contain at least one special character."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       CURRENT PASSWORD
  ===================================================== */

  function validateCurrentPassword(field) {

    const value = field.value;

    if (value.trim() === "") {

      if (field.required) {

        showError(
          field,
          "Current password is required."
        );

        return false;
      }

      return true;
    }

    return true;
  }


  /* =====================================================
       ADDRESS
  ===================================================== */

  function validateAddress(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Address is required."
        );

        return false;
      }

      return true;
    }

    if (value.length < 5) {

      showError(
        field,
        "Address must contain at least 5 characters."
      );

      return false;
    }

    if (value.length > 250) {

      showError(
        field,
        "Address cannot exceed 250 characters."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       EXPERIENCE
  ===================================================== */

  function validateExperience(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Experience is required."
        );

        return false;
      }

      return true;
    }

    if (!/^[0-9]+$/.test(value)) {

      showError(
        field,
        "Experience can contain numbers only."
      );

      return false;
    }

    if (Number(value) > 50) {

      showError(
        field,
        "Experience cannot exceed 50 years."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       SEARCH
  ===================================================== */

  function validateSearch(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Please enter something to search."
        );

        return false;
      }

      return true;
    }

    if (value.length < 2) {

      showError(
        field,
        "Please enter at least 2 characters."
      );

      return false;
    }

    if (value.length > 100) {

      showError(
        field,
        "Search cannot exceed 100 characters."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       COMPANY NAME
  ===================================================== */

  function validateCompanyName(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Company name is required."
        );

        return false;
      }

      return true;
    }

    if (value.length < 2) {

      showError(
        field,
        "Company name must contain at least 2 characters."
      );

      return false;
    }

    if (value.length > 150) {

      showError(
        field,
        "Company name cannot exceed 150 characters."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       SERVICE NAME
  ===================================================== */

  function validateServiceName(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Service name is required."
        );

        return false;
      }

      return true;
    }

    if (value.length < 2) {

      showError(
        field,
        "Service name must contain at least 2 characters."
      );

      return false;
    }

    if (value.length > 150) {

      showError(
        field,
        "Service name cannot exceed 150 characters."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       BOOKING DATE
  ===================================================== */

  function validateBookingDate(field) {

    const value = field.value;

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Please select a booking date and time."
        );

        return false;
      }

      return true;
    }

    const selectedDate = new Date(value);
    const now = new Date();

    if (isNaN(selectedDate.getTime())) {

      showError(
        field,
        "Please select a valid booking date and time."
      );

      return false;
    }

    if (selectedDate <= now) {

      showError(
        field,
        "Booking date and time must be in the future."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       CANCELLATION REASON
  ===================================================== */

  function validateCancellationReason(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Please provide a cancellation reason."
        );

        return false;
      }

      return true;
    }

    if (value.length < 3) {

      showError(
        field,
        "Cancellation reason must contain at least 3 characters."
      );

      return false;
    }

    if (value.length > 500) {

      showError(
        field,
        "Cancellation reason cannot exceed 500 characters."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       PLATFORM NAME
  ===================================================== */

  function validatePlatformName(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Platform name is required."
        );

        return false;
      }

      return true;
    }

    if (value.length < 2) {

      showError(
        field,
        "Platform name must contain at least 2 characters."
      );

      return false;
    }

    if (value.length > 100) {

      showError(
        field,
        "Platform name cannot exceed 100 characters."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       RATING
  ===================================================== */

  function validateRating(field) {

    const value = field.value.trim();

    if (value === "") {

      if (field.required) {

        showError(
          field,
          "Please select a rating."
        );

        return false;
      }

      return true;
    }

    const rating = Number(value);

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {

      showError(
        field,
        "Rating must be between 1 and 5."
      );

      return false;
    }

    return true;
  }


  /* =====================================================
       VALIDATION ROUTER
  ===================================================== */

  function validateField(field) {

    if (!field) return true;

    const type = field.dataset.validation;

    let result = true;

    switch (type) {

      case "name":
        result = validateName(field);
        break;

      case "email":
        result = validateEmail(field);
        break;

      case "mobile":
        result = validateMobile(field);
        break;

      case "password":
        result = validatePassword(field);
        break;

      case "current-password":
        result = validateCurrentPassword(field);
        break;

      case "address":
        result = validateAddress(field);
        break;

      case "experience":
        result = validateExperience(field);
        break;

      case "search":
        result = validateSearch(field);
        break;

      case "company-name":
        result = validateCompanyName(field);
        break;

      case "service-name":
        result = validateServiceName(field);
        break;

      case "booking-date":
        result = validateBookingDate(field);
        break;

      case "cancellation-reason":
        result = validateCancellationReason(field);
        break;

      case "platform-name":
        result = validatePlatformName(field);
        break;

      case "rating":
        result = validateRating(field);
        break;

      default:
        return true;
    }

    /*
     * If the field is valid,
     * remove its old validation message.
     */
    if (result) {
      clearError(field);
    }

    return result;
  }


  /* =====================================================
       CONNECT VALIDATION FIELDS
  ===================================================== */

  const fields =
    document.querySelectorAll("[data-validation]");


  fields.forEach(function (field) {

    /* -------------------------------------------------
       LIVE VALIDATION
    ------------------------------------------------- */

    field.addEventListener("input", function () {

      validateField(field);

    });


    /* -------------------------------------------------
       BLUR VALIDATION
    ------------------------------------------------- */

    field.addEventListener("blur", function () {

      validateField(field);

    });

  });


  /* =====================================================
       FORM SUBMIT VALIDATION
  ===================================================== */

  const forms =
    document.querySelectorAll(".nirnay-validation-form");


  forms.forEach(function (form) {

    form.addEventListener("submit", function (event) {

      let isValid = true;

      const formFields =
        form.querySelectorAll("[data-validation]");


      /* -------------------------------------------------
         VALIDATE EVERY FIELD
      ------------------------------------------------- */

      formFields.forEach(function (field) {

        const result =
          validateField(field);

        if (!result) {
          isValid = false;
        }

      });


      /* -------------------------------------------------
         STOP SUBMISSION
      ------------------------------------------------- */

      if (!isValid) {

        event.preventDefault();


        /* -------------------------------------------------
           FIND FIRST INVALID FIELD
        ------------------------------------------------- */

        const firstInvalid =
          form.querySelector(".is-invalid");


        if (firstInvalid) {

          firstInvalid.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });


          setTimeout(function () {

            firstInvalid.focus();

          }, 300);

        }

      }

    });

  });

});

