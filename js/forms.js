// ===== FORM VALIDATION (contact, admissions, and result verification) =====

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var requiredFields = form.querySelectorAll("[required]");
      var isValid = true;
      requiredFields.forEach(function (field) {
        field.classList.toggle("invalid", !field.value.trim());
        if (!field.value.trim()) isValid = false;
      });
      var successBox = form.querySelector(".form-success-box");
      if (successBox && isValid) {
        successBox.style.display = "block";
        form.reset();
      }
    });
  });
});