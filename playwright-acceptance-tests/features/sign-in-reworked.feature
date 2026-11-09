Feature: Login Journey
  Existing user walks through a login journey

  Scenario: Existing user tries to create an account with the same email address
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects create an account
    Then the user is taken to the "Enter your email address" page
    When the user enters an email address of an existing account
    Then the user is taken to the "You have a GOV.UK One Login" page

  Scenario: Existing user is correctly prompted to login using sms
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters an email address of an existing account
    Then the user is taken to the "Enter your password" page
    When the user enters a correct password and has sms mfa
    Then the user is taken to the "Check your phone" page
    When the user enters the correct six digit security code from their phone
    And the user dismisses the passkey registration page if present
    Then the user is returned to the service

  Scenario: Existing user switches content to Welsh
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user switches to "Welsh" language
    Then the user is taken to the Identity Provider Welsh Login Page
    When the user selects sign in
    Then the user is taken to the Welsh enter your email page
    When the user enters an email address of an existing account in Welsh
    Then the user is prompted for their password in Welsh
    When the user clicks link "Yn ôl"
    Then the user is taken to the Welsh enter your email page
    When the user clicks link "Yn ôl"
    Then the user is taken to the Identity Provider Welsh Login Page
    When the user switches to "English" language
    Then the user is taken to the "Create your GOV.UK One Login or sign in" page

  Scenario: Existing user logs in without 2FA then uplift with 2FA
    Given a user does not have an authenticated session and does not require 2fa
    When the user comes from the stub relying party with option 2fa-off and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters an email address of an existing account
    Then the user is taken to the "Enter your password" page
    When the user enters a correct password and has sms mfa
    And the user dismisses the passkey registration page if present
    Then the user is returned to the service
    Given the user has an authenticated session that requires uplift with sms
    When the user comes from the stub relying party with options: [2fa-on,authenticated-2] and is taken to the "Enter a security code to continue" page
    Then the user is taken to the "Enter a security code to continue" page
    When the user enters the correct six digit security code from their phone
    And the user dismisses the passkey registration page if present
    Then the user is returned to the service
    And the user clicks logout

  Scenario: Existing user logs in once and is logged in seamlessly when signing in again
    # First sign in
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters an email address of an existing account
    Then the user is taken to the "Enter your password" page
    When the user enters a correct password and has sms mfa
    Then the user is taken to the "Check your phone" page
    When the user enters the correct six digit security code from their phone
    And the user dismisses the passkey registration page if present
    Then the user is returned to the service
    # Second (silent) sign in
    Given a user has an authenticated session
    When the user comes from the stub relying party with option authenticated-2
    Then the user is returned to the service

