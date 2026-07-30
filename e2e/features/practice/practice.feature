Feature: Practice mode
  As a traveler learning a language
  I want to drill the phrases as flashcards
  So that I can actually remember how to say them, not just look them up

  # Runs against the seeded Spanish pack (real phrases). The session shows the
  # English prompt, reveals the translation on demand, and self-grades.

  Scenario: Starting practice from a pack shows the first card
    Given a visitor opens the "Spanish (Spain)" pack
    When they start practicing
    Then a practice card prompts for an English phrase

  Scenario: Revealing a card shows its translation
    Given a visitor is practicing the "Spanish (Spain)" pack
    When they reveal the answer
    Then the card's translation and grade buttons are shown
