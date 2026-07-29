Feature: Offline resilience
  As a traveler often abroad without data
  I want packs I've already opened to keep working offline
  So that I can read my phrases when I have no connection

  # The react-query cache is persisted to localStorage, so a pack viewed while
  # online rehydrates offline. An offline banner sets expectations (new
  # languages + first-time audio still need a connection).

  Scenario: A previously-viewed pack still opens offline, with an offline notice
    Given a visitor has viewed the "Spanish (Spain)" pack while online
    When their connection drops and they reopen the pack
    Then the phrase "Gracias" is visible with its English "Thank you"
    And an offline notice is shown
