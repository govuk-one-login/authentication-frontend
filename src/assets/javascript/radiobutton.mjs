const init = () => {
    const feedbackRadioButtons = Array.prototype.slice.call(
        document.querySelectorAll('input[name="feedbackContact"]')
    );
    const container = document.querySelector("#contact-details-container");
    feedbackRadioButtons.forEach((element) => {
        element.addEventListener(
            "click",
            (event) => {
                if (event.target.value === "true") {
                    container.classList.remove("govuk-!-display-none");
                } else {
                    container.classList.add("govuk-!-display-none");
                    const elements = container.getElementsByTagName("input");
                    for (let i = 0; i < elements.length; i++) {
                        if (elements[i].type == "text") {
                            elements[i].value = "";
                        }
                    }
                }
            }
        );
    });
}

export default { init };