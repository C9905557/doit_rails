
Given(/^I am on the homepage$/) do
  	visit root_path
end

Then(/^I should see "(.*?)"$/) do |arg1|
  expect(page).to have_content("Volunteer opportunities")
end

Then(/^I should see a map$/) do
    expect(page).to have_selector('div[class="gm-style"]', count: 1)
end

Then(/^I should see a pin on the map with Driver volunteer opportunity$/) do
   expect(page).to have_selector('area[title="\"Driver volunteer\""]', count: 1)
end

Then(/^I should see a random number on the page$/) do
   expect(find('#rndnum').text).to match('^\d+$')
end