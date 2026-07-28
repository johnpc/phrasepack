Feature: Accessibility
  As every traveler, including those using assistive technology
  I want the app to meet WCAG accessibility standards
  So that I can browse, read, and generate packs regardless of ability

  # Guards the fixes from the a11y pass: an axe (WCAG 2.1 AA) scan must find no
  # violations on the core screens. If a future change reintroduces a contrast,
  # label, or role problem, CI goes red here instead of shipping it.

  Scenario: The home screen has no accessibility violations
    Given a visitor opens the home shelf
    Then the page has no WCAG accessibility violations

  Scenario: The add-a-language screen has no accessibility violations
    Given a visitor opens the add-a-language screen
    Then the page has no WCAG accessibility violations

  Scenario: The settings screen has no accessibility violations
    Given a visitor opens the settings screen
    Then the page has no WCAG accessibility violations
