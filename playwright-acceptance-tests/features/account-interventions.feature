Feature: Account interventions

  Scenario: User will not be prompted to add a passkey if they have a temporary intervention on their account
    Given a user does not have an authenticated session
    And the user has a temporarily suspended intervention
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    And the browser supports passkeys
    When the user enters an email address of an existing account
    Then the user is taken to the "Enter your password" page
    When the user enters a correct password and has sms mfa
    Then the user is taken to the "Check your phone" page
    When the user enters the correct six digit security code from their phone
    Then the user is returned to the service

  Scenario: User with outdated terms and conditions will see the terms and conditions if they have a permanent intervention
    Given a user does not have an authenticated session
    And the user has a permanently locked intervention
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    And the browser supports passkeys
    When the user enters an email address of an existing account
    Then the user is taken to the "Enter your password" page
    When the user enters a correct password and has sms mfa but has not accepted the latest terms and conditions
    Then the user is taken to the "Check your phone" page
    When the user enters the correct six digit security code from their phone
    Then the user is taken to the "We’ve updated our terms of use" page
    When the user agrees to the updated terms and conditions
    Then the user is taken to the "Your GOV.UK One Login has been permanently locked" page
