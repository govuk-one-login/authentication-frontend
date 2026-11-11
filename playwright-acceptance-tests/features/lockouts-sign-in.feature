Feature: Sign in lockouts

  Scenario: A user is blocked when they enter too many incorrect passwords during sign in.
    Given a user exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters an incorrect password 6 times
    Then the "You entered the wrong password too many times" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong password"

    Given the lockout has not yet expired
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the "You cannot sign in at the moment" lockout screen is displayed
    * the lockout duration is 2 hours
    * the lockout reason is "you entered the wrong password"

  Scenario: A user is blocked when they enter too many incorrect sms codes during sign in.
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    Then the user is taken to the "Check your phone" page
    When the user enters an incorrect phone security code 6 times
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

  Scenario: A user is blocked when they request too many sms codes during sign in
    Given a user with SMS MFA exists
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    And the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters their email address
    Then the user is taken to the "Enter your password" page
    When the user enters their password
    Then the user is taken to the "Check your phone" page
    When the user requests the phone otp code a further 5 times
    Then the "You asked to resend the security code too many times" lockout screen is displayed
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
    * the lockout reason is "you asked to resend the security code too many times"

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
