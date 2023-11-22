let phoneNumberInput, intPhoneNumberCheckbox;
    
const init = () => {
  phoneNumberInput = document.querySelector("#phoneNumber");
  intPhoneNumberCheckbox = document.querySelector(
    "#hasInternationalPhoneNumber"
  );
  if (phoneNumberInput && intPhoneNumberCheckbox) {
    intPhoneNumberCheckbox.addEventListener("click", function (event) {
      this.onIntNumberSelected(event.currentTarget, phoneNumberInput);
    });
    window.addEventListener(
      "load",
      onIntNumberSelected(intPhoneNumberCheckbox, phoneNumberInput)
    );
  }
}

const onIntNumberSelected = (intPhoneNumberCheckbox, phoneNumberInput) => {
  if (intPhoneNumberCheckbox.checked) {
    phoneNumberInput.value = "";
    phoneNumberInput.disabled = true;
    phoneNumberInput.classList.add("govuk-input--disabled");
  } else {
    phoneNumberInput.disabled = false;
    phoneNumberInput.classList.remove("govuk-input--disabled");
  }
}

export default { init };