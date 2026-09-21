@UI
Feature: Resend security code

  Scenario: Sign-in user can resend their security code and return to enter the code
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    Then the user is taken to the "Check your phone" page
    And the current page path is "/enter-code"
    When the user chooses to resend the security code
    Then the user is taken to the "Get security code" page
    And the current page path is "/resend-code"
    When the user requests a new security code
    Then the user is taken to the "Check your phone" page
    And the current page path is "/enter-code"

  Scenario: Sign-in user can go back from the resend security code page to enter the code
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    Then the user is taken to the "Check your phone" page
    And the current page path is "/enter-code"
    When the user chooses to resend the security code
    Then the user is taken to the "Get security code" page
    And the current page path is "/resend-code"
    When the user clicks the Back link
    Then the user is taken to the "Check your phone" page
    And the current page path is "/enter-code"
