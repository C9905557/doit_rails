require 'cucumber/rspec/doubles'

# Extend default wait time for completion of do-it calls when not using cache
Capybara.default_wait_time = 15

Given(/^I am on the homepage$/) do
  	visit root_path
  	within( "div#doit_status" ) do
  	    expect(page).to have_content('Do-it data loading completed')
  	end
end

Then(/^I should see "(.*?)"$/) do |arg1|
  expect(page).to have_content("Volunteer opportunities")
end

Then(/^I should see a map$/) do
  expect(page).to have_selector('div[class="gm-style"]', count: 1)
end

Then(/^I should see on the map same number of pins as volunteer opportunities$/) do
  total_items = find('#total_items').text.to_i
  puts "########## total_items #{total_items}"
  expect(page).to have_selector("map[name^='gmimap']", count: total_items)
end

Given(/^I am on the homepage while Doit is unresponsive$/) do
  allow(HTTParty).to receive(:get).and_return({code:500})
  visit root_path
end

Then(/^I should see an error message in the Do-it status on the page$/) do
  within( "div#doit_status" ) do
     expect(page).to have_content('Do-it data loading: an error occured')
  end
  puts "---- doit_status div content: #{find('#doit_status').text}"
end

Then(/^I should see a random number on the page$/) do
   expect(find('#rndnum').text).to match('^\d+$')
end