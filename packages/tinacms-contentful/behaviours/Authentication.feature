Feature: OAuth Authentication

Allow TinaCMS to do federated user authentication with OAuth
to enable CRUD operations as an authenticated and well-known user.

Background:
  Given the client is added to the CMS
    And you have a <contentful space id>
    And you have a <contentful delivery access token>
    And you have a <contentful preview access token>
    And you have a <default environment id> for your space
    And you have an <oauth client id>
    And you have an <oauth redirect URL> for the application
    And you are <username>
    And have password <password>

  Examples: background data
  | contentful space id | contentful delivery access token | contentful preview access token | default environment id | oauth client id | oauth redirect URL |
  | todo                | todo                             | todo                            | todo                   | todo            | todo               |

  Examples: Test users

  | username | password |
  | todo     | todo     |

Scenario: trigger authentication
  When you call the authenticate method
  Then a popup should open to the contentful Oauth URL:
    "be.contentful.com"
    And it should have a GET param named clientId with the value <oauth client id>
    And it should have a GET param named redirect_url with the value <oauth redirect URL>

Rule: Success Cases

  Scenario: succesful authentication
    Given you are on the contentful OAuth page, 
    When you input your <username>
      And you input your <password>
      And submit the form
    Then you are directed to <oauth redirect URL>
      And it should have a GET param named TODO with an access token

Rule: Failure Cases

  Scenario: invalid client ID
    Given <oauth client id> is not a real oauth client,
    When you call the authenticate method
    Then a popup should open to the contentful Oauth URL:
      "be.contentful.com"
      And you should receive the following error from contentful:
        "An error has occured"

  Scenario: invalid redirect url
    Given <oauth redirect URL> is not the valid redirect URL for the oauth client with <oauth client id>,
    When you call the authenticate method
    Then a popup should open to the contentful Oauth URL:
      "be.contentful.com"
      And you should receive the following error from contentful:
        "An error has occured"

  Scenario: invalid redirect url
    Given <insecure oauth redirect URL> for the oauth client with <oauth client id>,
    When you call the authenticate method
    Then a popup should open to the contentful Oauth URL:
      "be.contentful.com"
      And you should receive the following error from contentful:
        "An error has occured"

  Examples: insecure oauth urls
  # Insecure means it's not HTTPS

  | insecure oauth redirect URL  |
  | http://example.com/authorize |