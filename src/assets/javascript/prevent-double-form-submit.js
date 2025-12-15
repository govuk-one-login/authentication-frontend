// Prevent double-submission on forms with data-prevent-double-click attribute.
document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    const submitButton = form.querySelector(
      '[type="submit"][data-prevent-double-click="true"]'
    );

    if (!submitButton) {
      return;
    }

    // Prevent additional submissions if already submitted.
    if (submitButton.dataset.submitting) {
      event.preventDefault();
      return;
    }

    // Use data attribute instead of disabled to avoid styling changes.
    submitButton.dataset.submitting = "true";
  });
});
