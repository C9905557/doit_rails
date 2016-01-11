$(document).ready(function() {

  var organizations = gon.orgs

  var myLatlng = new google.maps.LatLng(51.567526, -0.182308);
  var mapOptions = {
    zoom: 12,
    center: myLatlng
  }
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  for (i=0; i<organizations.length; i++){
    (function placeMarker (i){
      lat = JSON.stringify(organizations[i].lat)
      lng = JSON.stringify(organizations[i].lng)
      title = JSON.stringify(organizations[i].title)

      var myLatlng = new google.maps.LatLng(lat, lng);

      var marker = new google.maps.Marker({
          position: myLatlng,
          title: title,
          optimized: false
      });
      
      marker.setMap(map);
    })(i);
  };
  
  $.getJSON("//qrng.anu.edu.au/API/jsonI.php", { length: 1, type: "uint16" }, function( obj ) {
    $( "#rndnum" ).text( obj.data );
  })

});
