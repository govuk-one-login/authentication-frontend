@UI
Feature: Reset password

  Scenario: User can go back from reset-password-resend-code to reset-password-check-email
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user clicks the forgotten password link
    Then the user is taken to the "Check your email" page
    When the user clicks details with text "Problems with the code?"
    Then the user clicks link "send the code again"
    Then the user is taken to the "Get security code" page
    When the user clicks the Back link
    Then the user is taken to the "Check your email" page
