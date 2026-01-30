document.querySelectorAll("form").forEach((r) => {
  r.addEventListener("submit", (t) => {
    var e = r.querySelector(
      '[type="submit"][data-prevent-double-click="true"]'
    );
    e &&
      (e.dataset.submitting
        ? t.preventDefault()
        : (e.dataset.submitting = "true"));
  });
});
