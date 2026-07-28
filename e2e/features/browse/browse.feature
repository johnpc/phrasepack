Feature: Browse language packs
  As a traveler opening PhrasePack
  I want to see my generated language packs on the home screen
  So that I can pick one to study before a trip

  # Honest e2e: assert on REAL seeded data (the Spanish + French packs from the
  # seed), not just that the page rendered. This proves the guest read path
  # returns published packs with no account.

  Scenario: The app root lands on the home shelf
    Given a visitor opens the app at the root
    Then they are taken to the home shelf

  Scenario: A visitor sees the seeded language packs
    Given a visitor opens the home shelf
    Then a language pack "Spanish (Spain)" is visible
    And a language pack "French" is visible

  Scenario: Home surfaces a retry when packs fail to load
    Given a visitor opens the home shelf with a failing network
    Then home shows a retry, not a blank list
