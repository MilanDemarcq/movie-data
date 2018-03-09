$(function() {

	// Display JQuery status and other info.
	$('#texteJQ').html('JQuery is RUNNING.');
	$('#texteJQ').append("<br>");

  $('#texteJQ').append("temp1 <br>");

	// Airtable Info

	// App ID or Base: appqgOIJurd9Tr0L4
  var baseID = "appqgOIJurd9Tr0L4";

  // API Key is read from file
  var apikeyfile = "apikey";
  var apiKey;
  var loadingkey = $('<div>');

  //$("#texteJQ").load(apikeyfile);
  //$("#texteJQ").load(apikeyfile, function(data){
  loadingkey.load(apikeyfile, function(response, status){
    apiKey= response;
    $('#texteJQ').append(apiKey);
    $('#texteJQ').append(status);
    //alert("done loading");
  });




  $('#texteJQ').append("blablabla");
  $('#texteJQ').append(apiKey);
  alert("api key wait -- temp");

  // API URL
	var apiURL = "https://api.airtable.com/v0/";
  // Table URL
  var tableURL = "/Table%201";

  var readFile = "apikey.txt";


  axios.get(
    //"https://api.airtable.com/v0/appqgOIJurd9Tr0L4/Table%201",
    //"https://api.airtable.com/v0/" + baseID + "/Table%201",
    //"https://api.airtable.com/v0/" + baseID + "/Table%201" + "?maxRecords=3&view=Grid%20view",

    // Access the Table in the Base, and use the view "Grid View"
    apiURL + baseID + tableURL + "?view=Grid%20view",
    { 
        headers: { Authorization: "Bearer "+apiKey } 

    }).then(function(response) {
      // Handle the response data

      $('#texteJQ').append("ok<br>");

      //$('#texteJQ').append(JSON.stringify(response));

      parseBase(response);

      $('#texteJQ').append("<br>done");
      //console.log(response.data);

    }).catch(function(error) {
      // Handle error cases
       $('#texteJQ').append("error<br>");
       $('#texteJQ').append(error);
       //console.log(error.response.data);
    });
       

  
});




function parseBase(response_data) {

  //$('#texteJQ').append(JSON.stringify(response_data));
  $('#texteJQ').append("<br>");


  var myarray = [["A", "5", "ART"], ["B", "45", "POP"], ["F", "5", "TIP"]];

  print2DArray(myarray, "#testarray");
  
  $('#testarray').append("<br>");

  var JSobject = JSON.parse((JSON.stringify(response_data)));

  //$('#testarray').append(response_data.records[0].id);
  //$('#testarray').append(response_data.records[0].id);

  //var maped_array = $.map(response_data, function(el) { return el });

  var maped_array = Object.values(response_data.data.records[0].fields);

  $('#testarray').append(maped_array);
  $('#testarray').append("<br>");

  print1DArray(maped_array, "#testarray");

  $('#testarray').append("<br>");$('#testarray').append("<br>");



  
  var full_unmaped_array = Object.values(response_data.data.records);
  $('#testarray').append(full_unmaped_array.length);

  $('#testarray').append("<br>");$('#testarray').append("<br>");

  var full_maped_array = new Array(full_unmaped_array.length);

  for(i=0; i<full_unmaped_array.length; i++){

    // var bob = Object.values(response_data.data.records[i].fields);
    // print1DArray(bob, "#testarray");
    // $('#testarray').append("<br>");

    full_maped_array[i]= Object.values(response_data.data.records[i].fields);


  }

  print2DArray(full_maped_array, "#testarray");



}


function print2DArray(myarray, display_element_id){

  $(display_element_id).append("Table Content : <br>");

  $.each(myarray, function(index,value){    

    $.each(value, function(index2, value2){
      $(display_element_id).append(value2);
      if (index2 != (value.length - 1)){$(display_element_id).append(", ");}
    })

    $(display_element_id).append("<br>");    

  });

}

function print1DArray(myarray, display_element_id){

  $(display_element_id).append("Table Content : <br>");
 
  $.each(myarray, function(index, value){
    $(display_element_id).append(value);
    if (index != (myarray.length - 1)){$(display_element_id).append(", ");}
  })

}











