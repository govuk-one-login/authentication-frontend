@UI
Feature: Login Journey
  Existing user walks through a login journey

  Scenario: Existing user tries to create an account with the same email address
    Given a user exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects create an account
    Then the user is taken to the "Enter your email address" page
    When the user enters their email address
    Then the user is taken to the "You have a GOV.UK One Login" page

  Scenario: Existing user is correctly prompted to login using sms
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    Then the user is taken to the "Check your phone" page
    When the user enters the six digit security code from their phone
    And the user dismisses the passkey registration page if present
    Then the user is returned to the service

  Scenario: Existing user switches content to Welsh
    Given a user exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user switches to "Welsh" language
    Then the user is taken to the Identity Provider Welsh Login Page
    When the user selects sign in
    Then the user is taken to the Welsh enter your email page
    When the user enters their email address in Welsh
    Then the user is prompted for their password in Welsh
    When the user clicks link "Yn ôl"
    Then the user is taken to the Welsh enter your email page
    When the user clicks link "Yn ôl"
    Then the user is taken to the Identity Provider Welsh Login Page
    When the user switches to "English" language
    Then the user is taken to the "Create your GOV.UK One Login or sign in" page

  Scenario: Existing user logs in without 2FA then uplift with 2FA
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
    Then the user is taken to the "Enter a security code to continue" page
    When the user enters the six digit security code from their phone
    And the user dismisses the passkey registration page if present
    Then the user is returned to the service
    And the user clicks logout

  Scenario: Existing user logs in once and is logged in seamlessly when signing in again
    Given a user with SMS MFA exists
    # First sign in
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    Then the user is taken to the "Check your phone" page
    When the user enters the six digit security code from their phone
    And the user dismisses the passkey registration page if present
    Then the user is returned to the service
    # Second (silent) sign in
    When the user comes from the stub relying party with option authenticated-2
    And the user dismisses the passkey registration page if present
    Then the user is returned to the service

  @PasskeyUsageEnabled
  Scenario: Existing user with a passkey tries to create an account with the same email address
    Given a user exists with a passkey
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects create an account
    Then the user is taken to the "Enter your email address" page
    When the user enters their email address
    Then the user is taken to the "You have a GOV.UK One Login" page
    When the user clicks the continue button
    Then the user is taken to the "Sign in with your face, fingerprint or passcode" page
