Feature: Registration Journey
  New user walks through a registration journey

  Scenario: User selects sign in without having an account
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email address to sign in to your GOV.UK One Login" page
    When the user enters an email address of an account that does not exist
    Then the user is taken to the "You do not have a GOV.UK One Login" page
    When the user clicks link "Try another email address"
    Then the user is taken to the "Enter your email address to sign in to your GOV.UK One Login" page

  Scenario: User is taken to Check your email page from You do not have a GOV.UK One Login page when Create selected
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email address to sign in to your GOV.UK One Login" page
    When the user enters an email address of an account that does not exist
    Then the user is taken to the "You do not have a GOV.UK One Login" page
    When the user selects create an account
    Then the user is taken to the "Check your email" page

  Scenario: User registration unsuccessful with invalid email, six digit code and password
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects create an account
    Then the user is taken to the "Enter your email address" page
    When the user enters an invalid email address and clicks continue
    Then an error summary is shown containing "Enter an email address in the correct format"
    When the user enters an email address of an account that does not exist
    Then the user is taken to the "Check your email" page
    When the user enters the correct six digit security code from their email
    Then the user is taken to the "Create your password" page
    And the user creates and enters an invalid password and clicks continue
    Then an error summary is shown containing "Your password must be at least 8 characters long and must include letters and numbers"
    When the user creates and enters a weak password and clicks continue
    Then an error summary is shown containing "Enter a stronger password"
    When the user creates and enters a short digit only password and clicks continue
    Then an error summary is shown containing "Your password must be at least 8 characters long and must include letters and numbers"
    When the user creates and enters a sequence of numbers password and clicks continue
    Then an error summary is shown containing "Your password must be at least 8 characters long and must include letters and numbers"

  Scenario: User successfully registers using sms
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects create an account
    Then the user is taken to the "Enter your email address" page
    When the user enters an email address of an account that does not exist
    Then the user is taken to the "Check your email" page
    When the user enters the correct six digit security code from their email
    Then the user is taken to the "Create your password" page
    When the user successfully creates a password
    Then the user is taken to the "Choose how to get security codes" page
    When the user chooses text message to get security codes
    Then the user is taken to the "Enter your mobile phone number" page
    When the user enters their mobile phone number using an international dialling code
    Then the user is taken to the "Check your phone" page
    When the user clicks the Back link
    Then the user is taken to the "Enter your mobile phone number" page
    When the user enters their mobile phone number
    Then the user is taken to the "Check your phone" page
    When the user enters the correct six digit security code from their phone for account creation
    Then the user is taken to the "You’ve created your GOV.UK One Login" page
    When the user clicks the continue button
    Then the user is returned to the service

  Scenario: Partial registered user is able to complete registration when they restart journey and select forgotten password for sms user
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects create an account
    Then the user is taken to the "Enter your email address" page
    When the user enters an email address of an account that does not exist
    Then the user is taken to the "Check your email" page
    When the user enters the correct six digit security code from their email
    Then the user is taken to the "Create your password" page
    When the user successfully creates a password
    Then the user is taken to the "Choose how to get security codes" page
    Given the user's session has ended
#    When the user attempts to re-sign-in after partial registration and selects forgotten password link
#    Then the user is taken to the "Finish creating your GOV.UK One Login" page
#    When the user chooses text message to get security codes and progress to set it up
#    Then the user is taken to the "You’ve created your GOV.UK One Login" page
#    When the user clicks the continue button
#    Then the user is returned to the service
