Feature: Contentful API Client

An API client that abstracts the Contentful SDKs to a standard interface
to make the plugin and dependent plugins less fragile when depending on it.

Background:
  Given you are using contentful
    And you have a <contentful space id>
    And you have a <contentful delivery access token>
    And you have a <contentful preview access token>
    And you have a <default environment id> for your space
    And you have an <oauth client id>
    And you have an <oauth redirect URL> for the application
    And the following entries exist in space <contentful space id>:
      | entry ID | content type id |
      | 0        | test            | 
      | 1        | other-test      |

Examples: background data

| contentful space id | contentful delivery access token | contentful preview access token | default environment id | oauth client id | oauth redirect URL |
| todo                | todo                             | todo                            | todo                   | todo            | todo               |

Scenario: Create the client
  When you add the client to the CMS
  Then the client is mounted to the <API name> provided

Examples: API names

| API name   |
| contentful |

Rule: Entry operations

  Scenario: Get an entry
    Given the client is added to the CMS
    When you call getEntry
      And provide an <entry ID>
      And the entry <entry ID> exists in the space
    Then you should receive <entry>

  Examples: getEntry results

  | entry ID | entry |
  | TODO     | TODO  |

  Scenario: Create an entry
    Given the client is added to the CMS
    When you call createEntry
      And provide an <entry ID>
      And you provide <new entry>
      And the entry <entry ID> exists in the space
    Then the entry should be updated to <entry>

  Examples: createEntry results

  | entry ID | new entry    | entry |
  | TODO     | TODO         | todo  |

  Scenario: Update an entry
    Given the client is added to the CMS
    When you call updateEntry
      And provide an <entry ID>
      And you provide <entry update>
      And the entry <entry ID> exists in the space
    Then the entry should be updated to <entry>

  Examples: updateEntry results

  | entry ID | entry update | entry |
  | TODO     | TODO         | todo  |

  Scenario: Get many entries
    Given the client is added to the CMS
    When you call getEntries
      And provide a <query>
      And the content type <content type ID> exists in the space
    Then you should receive <entries>

  Examples: getEntries results

  | query | entries |
  | TODO  | TODO    |

  Scenario: Delete an entry
    Given the client is added to the CMS
    When you call deleteEntry
      And provide an <entry ID>
      And the entry <entry ID> exists in the space
    Then entry <entry ID> should be deleted

  Examples: deleteEntry results

  | entry ID |
  | TODO     |

Rule: Content Type operations

  Scenario: Get a content type
    Given the client is added to the CMS
    When you call getContentType
      And you provide a <content type ID>
      And the <content type ID> exists in the space
    Then you should receive <content type>

  Examples: getContentType results

  | content type ID | content type |
  | TODO            | TODO         |