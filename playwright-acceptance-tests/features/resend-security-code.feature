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

  Scenario: Uplift user can resend their security code and return to enter the code
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with option 2fa-off and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    And the user dismisses the passkey registration page if present
    Then the user is returned to the service
    When the user comes from the stub relying party with options: [2fa-on,authenticated-2] and is taken to the "Enter a security code to continue" page
    And the current page path is "/enter-code"
    When the user chooses to resend the security code
    Then the user is taken to the "Get security code" page
    And the current page path is "/resend-code"
    When the user requests a new security code
    Then the user is taken to the "Enter a security code to continue" page
    And the current page path is "/enter-code"

  Scenario: Uplift user can go back from the resend security code page to enter the code
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with option 2fa-off and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    And the user dismisses the passkey registration page if present
    Then the user is returned to the service
    When the user comes from the stub relying party with options: [2fa-on,authenticated-2] and is taken to the "Enter a security code to continue" page
    And the current page path is "/enter-code"
    When the user chooses to resend the security code
    Then the user is taken to the "Get security code" page
    And the current page path is "/resend-code"
    When the user clicks the Back link
    Then the user is taken to the "Enter a security code to continue" page
    And the current page path is "/enter-code"

  Scenario: Password reset user can resend their security code and return to enter the code
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user clicks the forgotten password link
    Then the user is taken to the "Check your email" page
    When the user enters the six digit security code from their email
    Then the user is taken to the "Check your phone" page
    And the current page path is "/reset-password-2fa-sms"
    When the user chooses to resend the security code
    Then the user is taken to the "Get security code" page
    And the current page path is "/reset-password-resend-code-2fa-sms"
    When the user requests a new security code
    Then the user is taken to the "Check your phone" page
    And the current page path is "/reset-password-2fa-sms"

  Scenario: Password reset user can go back from the resend security code page to enter the code
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user clicks the forgotten password link
    Then the user is taken to the "Check your email" page
    When the user enters the six digit security code from their email
    Then the user is taken to the "Check your phone" page
    And the current page path is "/reset-password-2fa-sms"
    When the user chooses to resend the security code
    Then the user is taken to the "Get security code" page
    And the current page path is "/reset-password-resend-code-2fa-sms"
    When the user clicks the Back link
    Then the user is taken to the "Check your phone" page
    And the current page path is "/reset-password-2fa-sms"

  Scenario: Account creation user can resend their security code and return to enter the code
    Given a user does not yet exist
    When the user comes from the stub relying party with option 2fa-off and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects create an account
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Check your email" page
    When the user enters the six digit security code from their email
    Then the user is taken to the "Create your password" page
    When the user creates a password
    Then the user is taken to the "Choose how to get security codes" page
    When the user chooses text message to get security codes
    Then the user is taken to the "Enter your mobile phone number" page
    When the user enters their mobile phone number
    Then the user is taken to the "Check your phone" page
    And the current page path is "/check-your-phone"
    When the user chooses to resend the security code
    Then the user is taken to the "Get security code" page
    And the current page path is "/resend-code-create-account"
    When the user requests a new security code
    Then the user is taken to the "Check your phone" page
    And the current page path is "/check-your-phone"

  Scenario: Account creation user can go back from the resend security code page to enter the code
    Given a user does not yet exist
    When the user comes from the stub relying party with option 2fa-off and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects create an account
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Check your email" page
    When the user enters the six digit security code from their email
    Then the user is taken to the "Create your password" page
    When the user creates a password
    Then the user is taken to the "Choose how to get security codes" page
    When the user chooses text message to get security codes
    Then the user is taken to the "Enter your mobile phone number" page
    When the user enters their mobile phone number
    Then the user is taken to the "Check your phone" page
    And the current page path is "/check-your-phone"
    When the user chooses to resend the security code
    Then the user is taken to the "Get security code" page
    And the current page path is "/resend-code-create-account"
    When the user clicks the Back link
    Then the user is taken to the "Check your phone" page
    And the current page path is "/check-your-phone"
