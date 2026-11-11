Feature: Sign in lockouts

  Scenario: A user is shown the account locked page when the backend reports the password lockout limit has been reached
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters an email address of an existing account
    Then the user is taken to the "Enter your password" page
    When the user enters an incorrect password
    Then the user is taken to the "Enter your password" page
    When the user enters an incorrect password and the backend reports the password lockout limit has been reached
    Then the "You entered the wrong password too many times" lockout screen is displayed
    * the page says the user cannot sign in for 2 hours
    * the page says it is because they entered the wrong password more than 5 times

  Scenario: A returning user is shown the sign in blocked page when the backend reports their account is still locked
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address and the backend reports the account is still locked
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the page says it is because they entered the wrong password more than 5 times

  Scenario: A user is shown the security code lockout page when the an incorrect code entry triggers a lockout
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters an email address of an existing account
    Then the user is taken to the "Enter your password" page
    When the user enters a correct password and has sms mfa
    Then the user is taken to the "Check your phone" page
    When the user enters an incorrect phone security code
    Then the user is taken to the "Check your phone" page
    When the user enters an incorrect phone security code and the backend reports the code lockout limit has been reached
    Then the "You entered the wrong security code too many times" lockout screen is displayed
    * the page says the user cannot sign in for 2 hours

  Scenario: A user is shown the resend lockout page when the user cannot request any more codes
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters an email address of an existing account
    Then the user is taken to the "Enter your password" page
    When the user enters a correct password and has sms mfa
    Then the user is taken to the "Check your phone" page
    When the user requests a new phone security code and the backend reports the resend limit has been reached
    Then the "You asked to resend the security code too many times" lockout screen is displayed
    * the page says the user cannot continue for 2 hours

  Scenario: A user is blocked when they enter an incorrect auth app security code more than 5 times during sign in.
    Given a user with App MFA exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    Then the user is taken to the "Enter the 6 digit security code shown in your authenticator app" page
    And the user enters an incorrect auth app security code 6 times
    Then the "You entered the wrong security code too many times" lockout screen is displayed
    * the lockout duration is 2 hours

    Given the lockout has not yet expired
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong security code too many times"
