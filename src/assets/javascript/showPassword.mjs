let module, input, showPasswordText, hidePasswordText, showPasswordFullText, hidePasswordFullText, shownPassword, hiddenPassword, showHide, statusText;

const init = ($module) => {
  module = $module;
  input = $module.querySelector(".govuk-password-input");
  showPasswordText = $module.getAttribute("data-show-text");
  hidePasswordText = $module.getAttribute("data-hide-text");
  showPasswordFullText = $module.getAttribute(
    "data-show-full-text"
  );
  hidePasswordFullText = $module.getAttribute(
    "data-hide-full-text"
  );
  shownPassword = $module.getAttribute("data-announce-show");
  hiddenPassword = module.getAttribute("data-announce-hide");
  showHide = document.createElement("button");
  statusText = document.createElement("span");
  input.classList.add("govuk-input--with-password");

  // wrap the input in a new div
  const wrapper = document.createElement("div");
  wrapper.classList.add("govuk-show-password__input-wrapper");
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  // create and append the button
  showHide.className = "govuk-show-password__toggle";
  showHide.setAttribute("aria-controls", input.getAttribute("id"));
  showHide.setAttribute("type", "button");
  showHide.setAttribute("aria-label", showPasswordFullText);
  showHide.innerHTML = showPasswordText;
  wrapper.insertBefore(showHide, input.nextSibling);

  // create and append the status text for screen readers
  statusText.classList.add("govuk-visually-hidden");
  statusText.innerHTML = hiddenPassword;
  statusText.setAttribute("aria-live", "polite");
  wrapper.insertBefore(statusText, showHide.nextSibling);

  showHide.addEventListener("click", module.togglePassword);
  // moveDataAttributesToButton();

  const parentForm = input.form;
  var disableFormSubmitCheck = module.getAttribute(
    "data-disable-form-submit-check"
  );

  if (parentForm && !disableFormSubmitCheck) {
    parentForm.addEventListener(
      "submit",
      module.revertToPasswordOnFormSubmit
    );
  }
};

const togglePassword = (event) => {
  event.preventDefault();
  showHide.innerHTML =
    showHide.innerHTML === showPasswordText
      ? hidePasswordText
      : showPasswordText;
  showHide.setAttribute(
    "aria-label",
    showHide.getAttribute("aria-label") === showPasswordFullText
      ? hidePasswordFullText
      : showPasswordFullText
  );
  statusText.innerHTML =
    statusText.innerHTML === shownPassword
      ? hiddenPassword
      : shownPassword;
  input.setAttribute(
    "type",
    input.getAttribute("type") === "text" ? "password" : "text"
  );
};

const revertToPasswordOnFormSubmit = () => {
  showHide.innerHTML = showPasswordText;
  showHide.setAttribute("aria-label", showPasswordFullText);
  statusText.innerHTML = hiddenPassword;
  input.setAttribute("type", "password");
};

export default { init, togglePassword, revertToPasswordOnFormSubmit };