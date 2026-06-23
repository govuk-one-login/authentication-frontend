@Frontend @SignIn
Feature: Sign-in journeys

  Scenario: Existing user signs in with SMS MFA
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "test@example.com"
    And I enter password "correct-password"
    And I enter the phone security code "123456"
    Then I am returned to the service

  Scenario: Existing user signs in with auth app MFA
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "authapp@example.com"
    And I enter password "correct-password"
    And I enter the auth app security code "123456"
    Then I am returned to the service

  Scenario: Existing user signs in without MFA
    Given I open the orchestration stub start page
    And I select the 2fa-off stub option
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "nomfa@example.com"
    And I enter password "correct-password"
    Then I am returned to the service

  Scenario: Existing user tries to create account with same email
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    When I select create an account
    Then I am taken to the enter your email address page
    When I enter email "test@example.com"
    Then I am taken to the you have a GOV.UK One Login page

  Scenario: Existing user switches content to Welsh
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    When I switch to "Welsh" language
    Then I am taken to the Welsh create or sign in page
    When I click the sign in button
    Then I am taken to the Welsh enter your email page
    When I enter email "test@example.com" in Welsh
    Then I am prompted for my password in Welsh
    When I click link "Yn ôl"
    Then I am taken to the Welsh enter your email page
    When I click link "Yn ôl"
    Then I am taken to the Welsh create or sign in page
    When I switch to "English" language
    Then I should see the Create your GOV.UK One Login or sign in page
