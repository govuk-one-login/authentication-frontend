Feature: Registration Journey
  New user walks through a registration journey

  Scenario: User selects sign in without having an account
    Given a user does not yet exist
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email address to sign in to your GOV.UK One Login" page
    When the user enters their email address
    Then the user is taken to the "You do not have a GOV.UK One Login" page
    When the user clicks link "Try another email address"
    Then the user is taken to the "Enter your email address to sign in to your GOV.UK One Login" page
