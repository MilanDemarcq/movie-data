
//// MAIN

$(function() {

	// Display JQuery status and other info.
	$('#texteJQ').html('JQuery is RUNNING.');

  // API Key for Airtable is read from this file
  var apikeyfile = "apikey";

  // Null API Key var
  var apikey;

  // First, read the API Key from the local file it's stored in.
  $('h1').queue("operations", function(){
    var self = this;
    getApiKeyFromFile(apikeyfile, function(response){
      apikey = response;
      $(self).dequeue("operations");
    });
  });

  // Once API Key is known, API calls can be made.

  // Get full base from Airtable, display it and get the size
  $('h1').queue("operations", function(){
    getfullAirtableData(apikey, function(full_base_length){
      // Display total count in the corresponding info div
      $('#TotalCount').append(full_base_length);
    });
  });


  // Init the sequence of queued events
  $('h1').dequeue("operations");

  
});


//// FUNCTIONS

///////////////////////////////////////////////////////////////////
// Reads the API Key in the specified file and sends it back
function getApiKeyFromFile(filename, callback){
///////////////////////////////////////////////////////////////////

  var loadingkey = $('<div>');
  // Loading the content of the given file
  loadingkey.load(filename, function(response, status){
    callback(response);
  });
}


///////////////////////////////////////////////////////////////////
// Sends a GET request to the Airtable API
function getfullAirtableData(apikey, callback){
///////////////////////////////////////////////////////////////////

  // Airtable App ID or Base: appqgOIJurd9Tr0L4
  var baseID = "appqgOIJurd9Tr0L4";
  // Airtable API URL
  var apiURL = "https://api.airtable.com/v0/";
  // Airtable Table URL
  var tableURL = "/Table%201";

  // Main get function, using Axios.js
  axios.get(

    // Access the Table in the Base, and use the view "Grid View"
    //apiURL + baseID + tableURL + "?view=Grid%20view",
    apiURL + baseID + tableURL,
    { 
        headers: {Authorization: "Bearer " + apikey},
        params: {
          //maxRecords: 10,
          view: "Grid view",
          //filterByFormula: 'AND(Year > 2000, Vision = "NX")',
        }

    }).then(function(response) {
      // Handle the response data

      $('#texteJQ').append("<br>ok");

      //var full_base_length = parseBase(response);
      parseBase(response, function(full_base_length){

        callback(full_base_length);
        //alert(full_base_length);

      });

      $('#texteJQ').append("<br>done");

    }).catch(function(error) {
      // Handle error cases
       $('#texteJQ').append("error<br>");
       $('#texteJQ').append(error);
    });  
}


/////////////////////////////////////////////////////////////////////////////////////
// Uses the DATA from the Airtable API (JSON Object) to construct a classic JS Array
// and print it.
function parseBase(response_data, callback) {
/////////////////////////////////////////////////////////////////////////////////////

  // Get all the records in an Array like fashion.
  var full_unmaped_array = Object.values(response_data.data.records);
  // This cannot be used directly since the intresting data is in response_data.data.records[x].fields
  // But is useful to get the number of records.

  //$('#testarray').append(full_unmaped_array.length); $('#testarray').append("<br>");

  // Declare new array of correct length (first dimension)
  var full_maped_array = new Array(full_unmaped_array.length);

  // Loop on all records to construct the 2nd dimension of the array with the content of .fields.
  for(i=0; i<full_unmaped_array.length; i++){
    full_maped_array[i]= Object.values(response_data.data.records[i].fields);
  }

  // Print everything
  print2DArray(full_maped_array, "#testarray");

  callback(full_unmaped_array.length);

}


//////////////////////////////////////////////////////
// Prints a Two-Dimensional Array
function print2DArray(myarray, display_element_id){
//////////////////////////////////////////////////////

  $(display_element_id).append("Table Content : <br>");

  $.each(myarray, function(index,value){    

    $.each(value, function(index2, value2){
      $(display_element_id).append(value2);
      if (index2 != (value.length - 1)){$(display_element_id).append(", ");}
    })

    $(display_element_id).append("<br>");    
  });

}


//////////////////////////////////////////////////////
// Prints a One-Dimension Array
function print1DArray(myarray, display_element_id){
//////////////////////////////////////////////////////

  $(display_element_id).append("Table Content : <br>");
 
  $.each(myarray, function(index, value){
    $(display_element_id).append(value);
    if (index != (myarray.length - 1)){$(display_element_id).append(", ");}
  })

}
