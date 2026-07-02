@UI
Feature: Sign in lockouts

  # ENTER INCORRECT PASSWORD TOO MANY TIMES DURING SIGN IN - 2060
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

  # USER BLOCKED FOR TOO MANY INCORRECT PASSWORDS CAN RESET THEIR PASSWORD AND BLOCK IS LIFTED
  # Temporarily commented due to flakiness
#  Scenario: When a user is blocked due to entering too many incorrect passwords during sign in they can reset their password.
#    Given the user "SIGN_IN_INCORRECT_PASSWORD_LOCKOUT_RESET_PW" is on the blocked page for entering too many incorrect passwords
#    When the user resets their password
#    Then the block is lifted and the user "SIGN_IN_INCORRECT_PASSWORD_LOCKOUT_RESET_PW" can login

  # ENTER INCORRECT SMS SECURITY CODE TOO MANY TIMES DURING SIGN IN - 2064
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

  # REQUEST TOO MANY SMS SECURITY CODE TOO MANY TIMES DURING SIGN IN - 2378
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

  # ENTER TOO MANY INCORRECT AUTH APP CODES TOO MANY TIMES DURING SIGN IN - 2061
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
