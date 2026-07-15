@UI
Feature: Account interventions

  Scenario: User will not be prompted to add a passkey if they have a temporary intervention on their account
    Given a user with SMS MFA exists
    And the user has a temporarily suspended intervention
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    And the browser supports passkeys
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    Then the user is taken to the "Check your phone" page
    When the user enters the six digit security code from their phone
    Then the user is taken to the "Sorry, there is a problem" page

  Scenario: User will not be prompted to add a passkey if they have a permanently locked intervention on their account
    Given a user with SMS MFA exists
    And the user has a permanently locked intervention
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    And the browser supports passkeys
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    Then the user is taken to the "Check your phone" page
    When the user enters the six digit security code from their phone
    Then the user is taken to the "Your GOV.UK One Login has been permanently locked" page
