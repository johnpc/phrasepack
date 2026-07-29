Feature: View a language pack
  As a traveler
  I want to open a pack and see each phrase with its spelling, phonetics, and a play button
  So that I can read and hear how to say it

  # Honest e2e: assert on the REAL seeded Spanish phrases (correct spelling +
  # phonetic), the guest phrase read path.

  Scenario: Opening a pack shows phrases with translation and phonetics
    Given a visitor opens the "Spanish (Spain)" pack
    Then the phrase "Gracias" is visible with its English "Thank you"
    And the phonetic "GRAH-syahs" is visible

  Scenario: Phrases are grouped into category sections
    Given a visitor opens the "Spanish (Spain)" pack
    Then a category section "Greetings" is visible
    And a category section "Getting Around" is visible

  Scenario: Each phrase offers a play control
    Given a visitor opens the "Spanish (Spain)" pack
    Then every phrase row has a play control

  Scenario: A pack surfaces a retry when its phrases fail to load
    Given a visitor opens the "Spanish (Spain)" pack with phrase reads failing
    Then the pack shows a retry, not a blank list

  Scenario: Searching filters the pack to matching phrases
    Given a visitor opens the "Spanish (Spain)" pack
    When they search the pack for "taxi"
    Then the phrase "Necesito un taxi" is visible with its English "I need a taxi"
    And the phrase "Gracias" is not visible

  Scenario: Favoriting a phrase pins it to a Favorites section on top
    Given a visitor opens the "Spanish (Spain)" pack
    When they favorite the "La cuenta, por favor" phrase
    Then a "★ Favorites" section is pinned at the top of the pack

  Scenario: Tapping a phrase shows it full-screen to hold up
    Given a visitor opens the "Spanish (Spain)" pack
    When they tap the "La cuenta, por favor" phrase to show it
    Then the phrase is shown full-screen in large type
