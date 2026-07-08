@UI
Feature: Back Button Behaviour

  Scenario: User can navigate to reset-password-check-email and navigate back through each page
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user clicks the forgotten password link
    Then the user is taken to the "Check your email" page
    When the user clicks the Back link
    Then the user is taken to the "Enter your password" page
    When the user clicks the Back link
    Then the user is taken to the "Enter your email" page
    When the user clicks the Back link
    Then the user is taken to the "Create your GOV.UK One Login or sign in" page

  @PasskeyUsageEnabled
  Scenario: User can go back to cannot sign in with a passkey page from enter-password
    Given a user exists with a passkey
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email address" page
    When the user enters their email address
    Then the user is taken to the "Sign in with your face, fingerprint or passcode" page
    When the user clicks the continue button
    Then the user is taken to the "We could not sign you in" page
    When the user selects radio button "Sign in with your password and a security code"
    Then the user is taken to the "Enter your password" page
    When the user clicks the Back link
    Then the user is taken to the "We could not sign you in" page

  @PasskeyUsageEnabled
  Scenario: User can go back to sign in with a passkey from enter-password
    Given a user exists with a passkey
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email address" page
    When the user enters their email address
    Then the user is taken to the "Sign in with your face, fingerprint or passcode" page
    When the user clicks link "Sign in another way"
    Then the user is taken to the "Enter your password" page
    When the user clicks the Back link
    Then the user is taken to the "Sign in with your face, fingerprint or passcode" page
