Shows volunteer opportunities around North end based on doit API

# Variation on the doit_rails spike

This is a version of the doit_rails spike of the AgileVentures/LocalSupport project, aimed at illustrating some alternate techniques for driving the Do-it api, namely:

1. Requesting the Do-it data with AJAX through a rails proxy 
1. Testing markers without using specific data (e.g. ‘Driver volunteer’)
1. Setting `optimized: false` when creating a marker only during tests
1. Testing behavior when the Do-it api is unreacheable
1. A long explanation for #1


## 1. The browser requests the Do-it data with AJAX through a rails proxy

*Note:* this may not be useful to LocalSupport, since the advantages are relevant for a high volume of requests.

Implementation of : It would be interesting to have the welcome page rendered initially without the marker data, that would be fetched by a js function with an ajax request to the welcome controller and added to the map. This would insure a faster/smoother loading of the page for the user, especially when errors and timeout occur with the Doit connection.

The Welcome controller was changed :

* `#index` only renders the form without any processing

* `#doitproxy` was added (along with a route) to request a page from the Do-it server and forward it as a JSONP response

The code to query the data and create was added in an ajax query in welcome.js

In index.html.erb, `<div id="doit_status">Do-it data loading</div>` was added under the map. The text is changed upon completion of the data loading.


## 2. Testing markers without using specific data (e.g. ‘Driver volunteer’)

If we observe that all markers have an element in the form:

```
<map name="gmimapX" id="gmimapX"><area href="javascript:void(0)" log="miw" coords="8,0,..." shape="poly" title="Volunteer Customer Service Assistant - Hampstead" style="cursor: pointer;"></map>
```

where X in `gmimapX` is an integer, we can compare the number of these elements with the *Total numbers of items:* displayed on the page:

In welcome.feature

```
  @javascript @billy @vcr
  Scenario: User sees all the pins on the map
    Given I am on the homepage
    Then I should see on the map same number of pins as volunteer opportunities 
```

In welcome_steps.rb

```
Then(/^I should see on the map same number of pins as volunteer opportunities$/) do
  total_items = find('#total_items').text.to_i
  expect(page).to have_selector("map[name^='gmimap']", count: total_items)
end
```

Note: since we are using ajax requests, we must insure that these requests are completed. This is accomplished by testing the div added on the form to display the status of the data loading:

```
# Extend default wait time for completion of do-it calls when not using cache
Capybara.default_wait_time = 15

Given(/^I am on the homepage$/) do
    visit root_path
    within( "div#doit_status" ) do
        expect(page).to have_content('Do-it data loading completed')
    end
end
```

## 3. Setting `optimized: false` when creating a marker only during tests

Add a field in the form that only appears when in test environment:

```
<% if Rails.env.test? %>
  <div id="RailsTestEnv"> </div>
<% end %>
```

Setup a variable according to the existance of the #RailsTestEnv div, and use it as needed:

```
var MarkerOptimize = $('#RailsTestEnv').length ? false : true
...
var marker = new google.maps.Marker({position: myLatlng, title: title, optimized: MarkerOptimize });
```

Other ways are possible: add a header, add an attribute to the body tag, etc...

A google developer has written:

> Recently a new version of the Maps API went live. We have made improvements to Marker rendering performance. Mobile browsers and IE can now display hundreds of markers in a second, while modern desktop browsers can render thousands of markers in a second.

Since LocalSupport will not display thousands or even hundreds of markers in a second, it may not need to run the optimized version.

## 4. Testing behavior when the Do-it api is unreacheable 

Add code to test for HTTParty errors in render_json and return a 500 error to the browser ajax request: 

in welcome_controller.rb

```
begin
  response = HTTParty.get(url)
  # Check for HTTP errors
  unless response.code == 200 then
    head :internal_server_error and return
  end
# Rescue other errors (timeout, bug,...)
rescue
  # I leave that ststement repetition to smne zaelous dryer
  head :internal_server_error and return
end
```
Write the test in welcome.feature:

```
@javascript @billy @vcr
Scenario: User sees an error message when Doit is unreachable
  Given I am on the homepage while Doit is unresponsive
  Then I should see an error message in the Do-it status on the page
```

In welcome_steps.rb, the tricky part is to mock the HTTParty.get:

```
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
```

## 5. A long explanation for #1

The flow of interactions in the doit_rails spike goes as follow:

1. browser requests the page from the application server
1. application server passes the request to controller
1. controller sends requests to the Do-it server and aggregates the received data in a single object
1. controller renders the view
1. view stuffs the request data object in a JS variable and send the page
1. the browser receives the whole page and displays it

This page may be slow to show itself to the user because the controller has to gather the data from do-it. Between step 1 and 7, the user sees nothing happening in his browser window. Step 3 can take some time, or finish with a time out after some length of time (it happened once to me while I was playing with doit_rail, I got a browser time-out after some time). And, a more obscure detail: during the time of the interaction with the Do-it api, the rails thread is stuck in waiting, which could degrade responsiveness of the production server if ever all available threads were busy.

Another model for this flow, not necessarily faster, that may provide for a better user experience, is this one:

1. browser request the page from the application server
1. application server passes the request to controller
1. controller renders the view with the map and without any markers
1. browser displays the page with the map (without any markers), with an indicator "Do-it data loading"
1. browser js code makes an ajax request to the *application server proxy* (see below) in order to get the first do-it data buffer
1. browser js code does the following when receiving a response:
   1. if the response status is ok
      1. extract the data and add markers on the map
      1. if the data indicates that more items are available, make an ajax request to get the next do-it data buffer
      1. if there are no more items available, change the indicator to "Do-it data loading completed"
   1. if the response status indicates an error or a timeout, change the indicator to "Do-it data loading not completed (and some error message)"
1. when all the ajax requests are processed, the page is fully displayed with significant indicator about the status of data loading

With this flow, the page is promptly loaded and the user is given a meaningful status of the loading that is happening. It is easy to provide a signficant feedback to the user if an error or a timout occurs. Most processing of the data is moved to the user's browser, which benefits to the server, and this is fine since the server doesn't need this data.

The *application server proxy* refers to the application server used as a json proxy, that is it will pass any request received to the Do-it server, wrap any answer received in jsonp and send this back to the browser. In this case, the controller in rails is only involved for one do-it message at the time, with a minimal processing.