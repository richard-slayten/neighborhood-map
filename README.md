## Neighborhood Map Project

I decided to create a map site that will search for, find, and display info about zoo's. 

The search area has a search box where you type in some kind of location information (name, city, state, ...).  If you hit enter the search will use google maps places to find matching locations.  There is also a GO button to activate the search as well.  The reset button will clear the current search and return default zoo results.

The filter area is a text box that gets trigger on every key stroke.  It will filter out the list with what ever matches the filter and reloads the list and map markers.

The list area lists the top 10 results of the search.  Each item in the list is clickable and when clicked, there will be up to 5 New York Time News articles items displayed that is related for that item.

The map area is the google map that displays by marker all the search list items.  If you clicked on a list item it will change the color of the marker to yellow and pop up the window.  if you mouse over a marker it will change to yellow.  When you click on a marker, it will open a info window with the address of the location.  The map resizes for each search based on the items in the list.

###Files
* index.html - main page for application
* README.md - read me file
* app.js -  js file for the viewmodel and view functions
* styles.css - css stlye sheet for main page and map

###Tools / Resources used
* Knockout.js - used for the search box and list items.  interfaced it with the bootstrap accordian feature to display the news articles.
* JQuery - used for the bootstrap functions
* bootstrap - used the grid for displaying the 3 sections(search, list, and map).  Used the accordian feature for the list box to open the news articles when clicked.
* NY Times API - used to get news articles onthe searched items
* Google Maps API - used to display the searched items on the map.
* All code was inspired by all the course examples, documentation sites from the APIs(goggle map, NY Times, knockout, bootstrap), and reviewer comments.
