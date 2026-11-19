Feature: Reset password

  Scenario: User can go back from reset-password-resend-code to reset-password-check-email
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters an email address of an existing account
    Then the user is taken to the "Enter your password" page
    When the user clicks the forgotten password link and a password reset is permitted via SMS
    Then the user is taken to the "Check your email" page
    When the user clicks details with text "Problems with the code?"
    Then the user clicks link "send the code again"
    Then the user is taken to the "Get security code" page
    When the user clicks the Back link
    Then the user is taken to the "Check your email" page

  Scenario: User with Auth App MFA can successfully reset their password
    Given a user does not have an authenticated session
    When the user comes from the stub relying party with default options and is taken to the "Create your GOV.UK One Login or sign in" page
    When the user selects sign in
    Then the user is taken to the "Enter your email" page
    When the user enters an email address of an existing account
    Then the user is taken to the "Enter your password" page
    When the user clicks the forgotten password link and a password reset is permitted via their Auth App
    Then the user is taken to the "Check your email" page
    When the user enters the correct six digit security code from their email
    Then the user is taken to the "Enter a security code from your authenticator app" page
    And the text "I do not have access to the authenticator app" is not present
    And the text "check if you can change how you get security codes" is not present
    When the user enters the correct security code from their auth app
    Then the user is taken to the "Reset your password" page
    When the user with Auth App MFA successfully resets their password
    Then the user is returned to the service