
var ViewModel = function() {
    var self = this;

    // array of the top 10 search items to be listed
    self.listItems = ko.observableArray([]);

    // array of the NYTimes articles for teh highlited zoo
    self.nytArticles = ko.observableArray([]);

    // an array of all the markers created for the map
    self.markers = []; 

    // The search box value
    self.searchBox = ko.observable('');

    // if there are no list items then a message gets displayed
    self.noListMessage = ko.observable(false);

    // if there are no NYTimes articles, then a message gets displayed
    self.noNYTMessage = ko.observable(true);

    // method to add a search result to the list array
    self.addItems = function(place) {
        self.listItems.push(place);
    };

    // method to add the map markers to the marker array
    self.addMarker = function(marker) {
        self.markers.push(marker);
    };

    // method to add the NYtime articles to the articles array
    self.addArticles = function(article) {
        self.nytArticles.push(article);
    };

    // clear all the markers from the map and empty the marker array.
    self.clearItems = function() {
        self.listItems.removeAll();
        for (var i = 0; i < self.markers.length; i++) {
            self.markers[i].setMap(null);
        };
        self.markers = [];
    };

    // remove all the articles from the article array.
    self.clearArticles = function() {
        self.nytArticles.removeAll();
    };

    // check to see if there are any articles found and set the error message if there were none.
    self.chkNYT = function() {
        if(self.nytArticles().length == 0){
            self.noNYTMessage(true);
        }else {
            self.noNYTMessage(false);
        };
    };

    // check to see if the zoo search found any results and set the error message 
    // if there were none.  also clear out the search box after searching.
    self.chkItems = function() {
        if(self.listItems().length == 0){
            self.noListMessage(true);
        }else {
            self.noListMessage(false);
        };
        self.searchBox('');
    };

    // this is the key press event function for the search box.
    // It checks for a return key and updates the list if pressed.
    self.searchChar = function(data, event) {
        if(event.keyCode == 10 || event.keyCode == 13) {
            listView.zooQuery(listView.zooRequestInitial.type, self.searchBox());
        };
        return true;
    };

    // this is the function for the Search Go and Reset button if pressed.
    // It will start the update for the list based off the search.
    self.searchGo = function(button) {
        if(button == 'go') {
            listView.zooQuery(listView.zooRequestInitial.type, self.searchBox());
        }else if(button == 'reset') {
            listView.zooQuery(listView.zooRequestInitial.type, listView.zooRequestInitial.query);
        }
    };

    // this method will return an info object to be populated on the pop up info window
    // based on the marker clicked title
    self.getInfo = function(title) {
        var address = '';
        var lng = '';
        var lat = '';
        this.listItems().forEach(function(result){
            if(result.name == title){
              address = result.formatted_address;
              lng = result.geometry.location.lng();
              lat = result.geometry.location.lat();;
            };
        });
        return {address: address, lng: lng, lat: lat} ;
    }
};

var mapView = {
    // method is ran when the google map api call gets returned
    init: function() {

        // Constructor creates a new map - only center and zoom are required.
        // centered near middle of US.
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 38.63, lng: -90.29},
            zoom: 4
        });

      // if map is not available then show error message
      if(this.map === undefined){
         this.mapElement = document.getElementById('map');
         this.mapElement.innerHTML = 'Map not available at this time.  Try later.';

      //  map is valid.
      }else{
          // create a pop up info window for the map
          this.popInfowindow = new google.maps.InfoWindow(); 

          // create the four different color markers taht will be used
          // blue - default, 
          // yellow - mouse over on a blue marker
          // red - if the list item was clicked it turns red
          // ggreen - mouse over on a red marker.
          this.markerImageYellow =  this.makeMarkerIcon('FFFF24');
          this.markerImageRed =  this.makeMarkerIcon('FF0000');
          this.markerImageBlue =  this.makeMarkerIcon('0091ff');
          this.markerImageGreen =   this.makeMarkerIcon('008000');

          // display the default search list.
          listView.init();
      };
  },
  // method to create the colored markers being used.
  // colored markers initiated from map init.
  makeMarkerIcon: function(markerColor) {
      var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
      return markerImage;
  },
  // display the pop up info window when clicking on a marker
  popInfoWindow: function(marker, infowin) { 
      
      // Check to make sure the infowindow is not already opened on this marker.
      if (infowin.marker != marker) {
          // Clear the infowindow content so old data wont display.
          infowin.setContent('');
          // set the infowindow to the marker that was clicked.
          infowin.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowin.addListener('closeclick', function() {
              infowin.marker = null;
          });
          // display info from the google place search for the marked marker.
          infowin.setContent('<div>' + marker.title + '</div>'
              +'<div>ADDRESS: '+ vm.getInfo(marker.title).address + '</div>'
              +'<div>LONGITUDE: '+  vm.getInfo(marker.title).lat + '</div>'
              +'<div>LATITUDE: '+  vm.getInfo(marker.title).lng + '</div>'                            );
          infowin.open(map, marker);
        }
    }
}
var listView = {
    // ran from initial map view to set up the original list. 
    init: function() {
        // apply the data bindings for the view model to the DOM
        ko.applyBindings(vm);

        // using the places library to do a place search and run initial zoo query.
        this.zooList = new google.maps.places.PlacesService(mapView.map);
        this.zooRequestInitial = { type: 'zoo', query: 'zoo' };
        this.zooQuery(this.zooRequestInitial.type, this.zooRequestInitial.query);
    },
    //search the google map api for places running lsit zoo afterwards.
    // to populate the list and map markers.
    zooQuery: function(searchType, searchQuery) {
        this.zooRequest = { type: searchType, query: searchQuery };
        this.zooList.textSearch(this.zooRequest, this.listzoo );
    },
    // method is ran when user clicks on an item in the list
    listClick: function(zooName) {
        console.log(zooName);

        // change the marker's color defaulting to blue and the clicked item's marker turns red.
        // the marker is reset back to blue when the list is clicked again.
        vm.markers.forEach(function(marker) {
            if(marker.title == zooName){
                if(marker.icon.url == mapView.markerImageRed.url){
                    marker.setIcon(mapView.markerImageBlue);
                }else if(marker.icon.url == mapView.markerImageBlue.url){
                    marker.setIcon(mapView.markerImageRed);
                }
            } else {
                marker.setIcon(mapView.markerImageBlue);
            };
        });

        //Get articles from the NY Times for the clicked item

        // clear all the articles if any existed 
        vm.clearArticles();

        // replace the single quote for NYTimes search.
        zooName = zooName.replace('&#39;',"'");
        
        // use the NYTimes api to search for the zoo name that was clicked.
        var nytUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
        nytUrl = nytUrl + '?q="'+zooName+'"&api-key=9e4e65b482504a9caaed29ce341a6f72&page=0';
        $.getJSON( nytUrl, function(data) {
            articles = data.response.docs;
            
            // get the top 5 articles and add to the articles array.
            for (var i = 0; i< articles.length && i< 5  ; i++){
                vm.addArticles(articles[i]);
            };

            // check to see if there are any articles found.  if not, disply message.
            vm.chkNYT();

        }).error( function() {
            alert("We are having problems retrieving articles.");
        });

    },
    listzoo: function (results, status) {
        // clear any existing lsit and articles
        vm.clearItems();
        vm.clearArticles();

        // check status and create list items
        if (status == google.maps.places.PlacesServiceStatus.OK) {

            // create a bounds variable to figure out the map resizing of list items
            var bounds = new google.maps.LatLngBounds();

            // loop through search results and get the top 10
            for (var i = 0; i < results.length; i++) {
                if(i < 10) {
                    // add 1 field to the results data, 
                    // list num is for the item number in the array to be used in the HTML
                    results[i].listNum = i;

                    //replace all single quotes with valid html escapes
                    results[i].name = results[i].name.replace("\'",'&#39;');
 
                    // add the item to the list array.
                    vm.addItems(results[i]);

                    // create a marker for the list item
                    var marker = new google.maps.Marker({
                        map: mapView.map,
                        position: results[i].geometry.location,
                        title: results[i].name,
                        icon: mapView.markerImageBlue
                    });

                    // add the marker to the marker array
                    vm.addMarker(marker);

                    // add the mouse over event handler to the marker
                    marker.addListener('mouseover', function() {
                        if(this.icon.url == mapView.markerImageBlue.url) {
                            this.setIcon(mapView.markerImageYellow);
                        }else if(this.icon.url == mapView.markerImageRed.url) {
                            this.setIcon(mapView.markerImageGreen);
                        }
                     });

                    // add the mouse out event handler to the marker
                    marker.addListener('mouseout', function() {
                        if(this.icon.url == mapView.markerImageGreen.url) {
                            this.setIcon(mapView.markerImageRed);
                        }else if(this.icon.url == mapView.markerImageYellow.url) {
                            this.setIcon(mapView.markerImageBlue);
                        }
                    });

                    // add the click event to the marker fro teh pop up window.
                    marker.addListener('click', function() {
                        mapView.popInfoWindow(this, mapView.popInfowindow);
                    });

                    bounds.extend(marker.position);
                }
            }

            // resize the map for the new list of places
            // set the zoom to a 6 max so that it doesn't go to close.
            mapView.map.fitBounds(bounds);
            if(mapView.map.getZoom() >6) {
                mapView.map.setZoom(6);
            }
        }

        // display error message if no search items are found.
        vm.chkItems();
    }
}

// declare the view model variable global to be used in other functions.
var vm = new ViewModel();