$(document).ready( function() {

  // Optimize markers unless in test mode
  //var MarkerOptimize = $('#RailsTestEnv').length ? false : true
  if( $('#RailsTestEnv').length ) {
      console.log("In test environment") ;
      var MarkerOptimize = false ;
  }
  else {
      console.log( "*Not* in test environment" ) ;
      var MarkerOptimize = true ;
  }

  /* global google */
  var myLatlng = new google.maps.LatLng(51.567526, -0.182308);
  var mapOptions = {
      zoom: 12,
      center: myLatlng,
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  // Url and base href to get the doit data
  var doitUrl = "/doitproxy.json" ;
  var doitHrefBase = "/v1/opportunities\?lat\=51.567526\&lng\=-0.182308\&miles\=2" ;

  //var locationsCount = {} ;

  // Get the Do-it data asynchronously
  $.ajax({
      url : doitUrl,
      type : 'GET',
      jsonp: "callback",
      dataType: "jsonp",
      data :  { href: doitHrefBase },   
      timeout : 100000,    // 10 seconds timeout
      cache: true,
      success : function(doitResponse) {
          // Put the markers on the map
          var items = doitResponse["data"]["items"]
          for ( var i=0 ; i < items.length ; i++ ) {
              var lat = items[i].lat ; var lng = items[i].lng ;
              var title = items[i].title ;
              var myLatlng = new google.maps.LatLng(lat, lng) ;
              var marker = new google.maps.Marker({position: myLatlng, title: title, optimized: MarkerOptimize });
              marker.setMap(map) ;
              //var locKey = "lat " + lat + " lng " + lng
              //locationsCount[locKey] = (locKey in locationsCount) ? locationsCount[locKey] +1 : 1
          }
          console.log( "Doit response success, page: " + doitResponse["meta"]["current_page"] ) ;

          // Get next do-it buffer
          var nextHash = doitResponse["links"]["next"] ;
          var href = nextHash ? nextHash["href"] : null ;
          if( href ) {
              this.url = doitUrl ;
              this.data = { href: href } ;
              $.ajax(this) ;   //get next buffer
              return ;
          }
          // Request completed
          $( "#items_per_page" ).text( doitResponse["meta"]["items_per_page"] ) ;
          $( "#total_items" ).text( doitResponse["meta"]["total_items"] ) ;
          $( "#total_pages" ).text( doitResponse["meta"]["total_pages"] ) ;
          $( "#doit_status" ).text( "Do-it data loading completed" ) ;
          console.log( "Doit response success, loading completed" ) ;
      },
      error : function( xhr, textStatus, errorThrown ) {
          console.log( "Doit response error" ) ;
          if (textStatus == 'timeout') $( "#doit_status" ).text( "Do-it data loading: no response" ) ;
          else $( "#doit_status" ).text( "Do-it data loading: an error occured, status: " + xhr.status ) ;
      }
  }) ;

  $.getJSON("//qrng.anu.edu.au/API/jsonI.php", { length: 1, type: "uint16" }, function( obj ) {
      $( "#rndnum" ).text( obj.data );
  });

});
