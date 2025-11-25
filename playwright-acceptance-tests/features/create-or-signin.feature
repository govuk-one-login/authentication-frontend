@UI

Feature: Sign-in on the create your GOV.UK One Login or sign in page

  As a user, I want to be able to click signin on the GOV.UK create-or-sign-in page
  So that I can login to start a journey

  Scenario: Go from stub start page to Create or sign in page
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    Then I am taken to the "enter your email" page
