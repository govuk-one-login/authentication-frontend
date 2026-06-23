@Frontend @SignIn
Feature: Sign-in lockouts

  Scenario: User is blocked after entering too many incorrect passwords
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "test@example.com"
    And I enter an incorrect password 6 times
    Then the "You entered the wrong password too many times" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong password"

    Given the lockout has not yet expired
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "test@example.com"
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong password"

  Scenario: User is blocked after entering too many incorrect SMS codes
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "test@example.com"
    And I enter password "correct-password"
    And I enter an incorrect phone security code 6 times
    Then the "You entered the wrong security code too many times" lockout screen is displayed
    * the lockout duration is 2 hours

    Given the lockout has not yet expired
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "test@example.com"
    And I enter password "correct-password"
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong security code too many times"

  Scenario: User is blocked after requesting too many SMS codes
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "test@example.com"
    And I enter password "correct-password"
    And I request the phone security code a further 5 times
    Then the "You asked to resend the security code too many times" lockout screen is displayed
    * the lockout duration is 2 hours

    Given the lockout has not yet expired
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "test@example.com"
    And I enter password "correct-password"
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you asked to resend the security code too many times"

  Scenario: User is blocked after entering too many incorrect auth app codes
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "authapp@example.com"
    And I enter password "correct-password"
    And I enter an incorrect auth app security code 6 times
    Then the "You entered the wrong security code too many times" lockout screen is displayed
    * the lockout duration is 2 hours

    Given the lockout has not yet expired
    Given I open the orchestration stub start page
    And I select the default stub options
    When I submit the stub form
    Then I should see the Create your GOV.UK One Login or sign in page
    And I click on Sign in button
    When I enter email "authapp@example.com"
    And I enter password "correct-password"
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong security code too many times"
