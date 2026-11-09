Feature: Login Journey
  Existing user walks through a login journey

  Scenario: Existing user tries to create an account with the same email address
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects create an account
    Then the user is taken to the "Enter your email address" page
    When the user enters their email address
    Then the user is taken to the "You have a GOV.UK One Login" page
