Feature: As a user,
  I want to be able to see Volunteer opportunities

  @billy @vcr
  Scenario: User sees volunteer opportunities
	  Given I am on the homepage
	  Then I should see "Volunteer opportunities"

  @javascript @billy @vcr
  Scenario: User sees a map
    Given I am on the homepage
    Then I should see a map

  @javascript @billy @vcr
  Scenario: User sees particular pin on the map
    Given I am on the homepage
    Then I should see a pin on the map with Driver volunteer opportunity

  @javascript @billy @vcr
  Scenario: User sees a random number from Australia
    Given I am on the homepage
    Then I should see a random number on the page
