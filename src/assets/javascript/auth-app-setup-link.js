const authAppSetupButton = document.getElementById("auth-app-setup-button");

if (authAppSetupButton) {
  authAppSetupButton.addEventListener("click", () => {
    const authAppSetupLink = authAppSetupButton.dataset.authAppSetupLink;

    if (authAppSetupLink) {
      window.location.href = authAppSetupLink;
    }
  });
}
