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

  // Url to get the doit data
  var doitUrl = "/doitproxy.json" ;

  // Get the Do-it data asynchronously
  $.ajax({
      url : doitUrl,
      type : 'GET',
      dataType: "json",
      data :  { page: 1 },   
      timeout : 100000,    // 10 seconds timeout
      cache: true,
      success : function(doitResponse) {
          var markersHash = doitResponse.markers ;
          handler.addMarkers( markersHash ) ;
          console.log( "Doit response success, page: " + doitResponse.meta.current_page) ;

          var nextPage = doitResponse.meta.next_page ;
          if( nextPage ) {
              this.url = doitUrl ;
              this.data = { page: nextPage } ;
              $.ajax(this) ;   //get next buffer
              return ;
          }
          // Request completed
          $( "#items_per_page" ).text( doitResponse.meta.items_per_page ) ;
          $( "#total_items" ).text( doitResponse.meta.total_items ) ;
          $( "#total_pages" ).text( doitResponse.meta.total_pages ) ;
          $( "#doit_status" ).text( "Do-it data loading completed" ) ;
          console.log( "Doit response success, loading completed" ) ;
      },
      error : function( xhr, textStatus, errorThrown ) {
          console.log( "Doit response error textStatus " + textStatus + " errorThrown " + errorThrown ) ;
          if (textStatus == 'timeout') $( "#doit_status" ).text( "Do-it data loading: no response" ) ;
          else $( "#doit_status" ).text( "Do-it data loading: an error occured, status: " + xhr.status ) ;
      }
  });
  
  $.getJSON("//qrng.anu.edu.au/API/jsonI.php", { length: 1, type: "uint16" }, function( obj ) {
      $( "#rndnum" ).text( obj.data );
  });

});
