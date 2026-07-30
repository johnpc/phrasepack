Feature: Generate a language with AI
  As a traveler heading somewhere new
  I want to generate a phrasebook for a language that doesn't exist yet
  So that I have the key phrases even for an uncommon destination

  # The generateLanguage mutation is stubbed at the network layer so the e2e
  # doesn't depend on Bedrock/Polly; the flow (pick → progress → land on the
  # new pack) is what's under test.

  Scenario: The add screen offers languages not yet generated
    Given a visitor opens the add-a-language screen
    Then a language choice "German" is offered
    And the already-generated "Spanish (Spain)" is not offered

  Scenario: Picking a language starts generation and shows progress
    Given a visitor opens the add-a-language screen with generation stubbed
    When they pick the "German" language
    Then a generation-in-progress message is shown

  Scenario: A failed start surfaces a try-again, not a dead spinner
    Given a visitor opens the add-a-language screen with generation failing
    When they pick the "German" language
    Then a generation-failed message with a retry is shown

  Scenario: Requesting any language by name starts generation
    Given a visitor opens the add-a-language screen with generation stubbed
    When they type "Swahili" and request generation
    Then a generation-in-progress message is shown

  Scenario: Browsing by destination offers countries mapped to their language
    Given a visitor opens the add-a-language screen
    When they switch to browse by destination
    Then a destination "Japan" is offered
