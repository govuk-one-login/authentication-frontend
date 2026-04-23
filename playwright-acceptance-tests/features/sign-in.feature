@SignIn @Frontend
Feature: Sign-in journey

  As an existing user, I want to sign in to my GOV.UK One Login
  So that I can access government services

  Background:
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page

  Scenario: Existing user signs in with SMS MFA
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter my email address
    Then I am taken to the "enter your password" page
    When I enter my password
    Then I am taken to the "check your phone" page
    When I enter the SMS security code
    Then I am returned to the service

  Scenario: Existing user tries to create account with duplicate email
    When I click Create your GOV.UK One Login
    Then I am taken to the "enter your email" create account page
    When I enter my email address
    Then I am taken to the "You have a GOV.UK One Login" page

  Scenario: User is locked out after too many incorrect passwords
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter my email address
    Then I am taken to the "enter your password" page
    When I enter an incorrect password 6 times
    Then the "You entered the wrong password too many times" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong password"
    Given the lockout has not yet expired
    When I start a new journey from the stub
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter my email address
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong password"

  Scenario: User is locked out after too many incorrect SMS codes
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter my email address
    Then I am taken to the "enter your password" page
    When I enter my password
    Then I am taken to the "check your phone" page
    When I enter an incorrect SMS security code 6 times
    Then the "You entered the wrong security code too many times" lockout screen is displayed
    * the lockout duration is 2 hours
    Given the lockout has not yet expired
    When I start a new journey from the stub
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter my email address
    Then I am taken to the "enter your password" page
    When I enter my password
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong security code too many times"

  Scenario: User is locked out after requesting too many SMS resends
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter my email address
    Then I am taken to the "enter your password" page
    When I enter my password
    Then I am taken to the "check your phone" page
    When I request the SMS security code a further 5 times
    Then the "You asked to resend the security code too many times" lockout screen is displayed
    * the lockout duration is 2 hours
    Given the lockout has not yet expired
    When I start a new journey from the stub
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter my email address
    Then I am taken to the "enter your password" page
    When I enter my password
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you asked to resend the security code too many times"

  Scenario: User is locked out after too many incorrect auth app codes
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter the auth app email address
    Then I am taken to the "enter your password" page
    When I enter my password
    Then I am taken to the "enter authenticator app code" page
    When I enter an incorrect auth app security code 6 times
    Then the "You entered the wrong security code too many times" lockout screen is displayed
    * the lockout duration is 2 hours
    Given the lockout has not yet expired
    When I start a new journey from the stub
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter the auth app email address
    Then I am taken to the "enter your password" page
    When I enter my password
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong security code too many times"

  Scenario: User switches content to Welsh and navigates sign-in flow
    When I switch to Welsh
    Then I should see the Welsh sign-in-or-create page
    When I click the Welsh sign in button
    Then I should see the Welsh enter your email page
    When I enter my email address in Welsh
    Then I should see the Welsh enter your password page
    When I click the Welsh back link
    Then I should see the Welsh enter your email page
    When I click the Welsh back link
    Then I should see the Welsh sign-in-or-create page
    When I switch back to English
    Then I should see the Create your GOV.UK One Login or sign in page

  Scenario: Existing user is seamlessly signed in on second visit
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter my email address
    Then I am taken to the "enter your password" page
    When I enter my password
    Then I am taken to the "check your phone" page
    When I enter the SMS security code
    Then I am returned to the service
    When I start a second sign-in journey
    Then I am returned to the service

  Scenario: Existing user logs in without 2FA then uplifts with 2FA
    And I click on Sign in button
    Then I am taken to the "enter your email" page
    When I enter my email address
    Then I am taken to the "enter your password" page
    When I enter my password
    Then I am taken to the "check your phone" page
    When I enter the SMS security code
    Then I am returned to the service
    When I start a second sign-in journey requesting 2FA
    Then I am taken to the "enter a security code to continue" page
    When I enter the SMS security code
    Then I am returned to the service
