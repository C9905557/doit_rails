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
  Scenario: User sees all the pins on the map
    Given I am on the homepage
    Then I should see on the map same number of pins as volunteer opportunities 

  @javascript @billy @vcr
  Scenario: User sees an error message when Doit is unreachable
    Given I am on the homepage while Doit is unresponsive
    Then I should see an error message in the Do-it status on the page


  @javascript @billy @vcr
  Scenario: User sees a random number from Australia
    Given I am on the homepage
    Then I should see a random number on the page
