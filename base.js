
//// GLOBAL VARIABLES

// Airtable App ID or Base: appqgOIJurd9Tr0L4
var baseID = "appqgOIJurd9Tr0L4";
// Airtable API URL
var apiURL = "https://api.airtable.com/v0/";
// Airtable Table URL
var tableURL = "/Table%201";


//// MAIN

$(function() {

    // Display JQuery status and other info.
	$('#texteJQ').html('JQuery is RUNNING. <br>');

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
    $('h1').queue("operations", function(){

        // Get full base from Airtable, display it and get the size
        getfullAirtableData(apikey, function(full_base_length){
            // Display total count in the corresponding info div
            $('#TotalCount').append(full_base_length);
        });

        // VISION Stats
        getVisionData(apikey);

        // Rating Stats
        getRatingData(apikey);

    });


    // Init the sequence of queued events
    $('h1').dequeue("operations");

  
});


//// FUNCTIONS

///////////////////////////////////
// Get rating data
function getRatingData(apikey){
///////////////////////////////////

var ratingcountarray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Get full base
    // Could be improved by getting only the Note fields (field API parameter)
    airtableApiGet(apikey, "", "", function(response_data){

        // Init vars and get total number of records
        var count = response_data.data.records.length;
        var rsum = 0;

        // Array to compute count of each rating
        //var ratingcountarray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // Sum up the ratings
        for (i=0; i<count; i++){

            // Get the object. Rating is temp[1] when all fields are received.
            var temp = Object.values(response_data.data.records[i].fields);

            // Update array of rating counts
            ratingcountarray[temp[1]-1]++;
            // Update sum for average
            rsum+=temp[1];
        }

        // Get mean
        mean_rating = rsum/count;

        // Print results: average
        $('#RatingStats div:first').append(mean_rating);

        // Print results: rating count
        for (i=0; i<count; i++){
            var index = i+2;
            $('#RatingStats div:nth-of-type(' + index + ')').append(ratingcountarray[i]);
        }

        // Building chart with D3 using basic divs
        // Chart is inside #ratingbarchart div of class .barchart
         d3.select("#ratingbarchart")
        .selectAll("div")
        .data(ratingcountarray)
            .enter()
            .append("div")
            .style("width", function(d) { if(d==0){return 8 + "px"}else{return d*10*2 + "px"}; })
            .text(function(d) { return d; });

    });


}


//////////////////////////////////////////
// Gets data about vision techniques
function getVisionData(apikey){
//////////////////////////////////////////

    // Array contains the type of vision
    var visiontypesarray = ["NX", "CN", "ST", "DL", "TV", "AU"];

    $('#VisionStats div').each(function(index){

        var self = this;
        // Create FilterbyFormula for each type in array
        var formula ="AND(Vision = \"" + visiontypesarray[index] + "\")";

        // Get all records that match formula and count total records
        airtableApiGet(apikey, "", formula, function(response_data){
            var count = response_data.data.records.length;
            $(self).append(count);
        });

    });
    
}


/////////////////////////////////////////////////////////////
// Generic API Get function with filterbyformula parameter
function airtableApiGet(apikey, fields, formula, callback){
/////////////////////////////////////////////////////////////

    // Get function, using Axios.js
    axios.get(

    // Access the Table in the Base, and use the view "Grid View"
    //apiURL + baseID + tableURL + "?view=Grid%20view",
    apiURL + baseID + tableURL,
    { 
        headers: {Authorization: "Bearer " + apikey},
        params: {
            fields: fields,
            // Filter using the formula in parameter
            filterByFormula: formula,
        }
    }
    ).then(function(response) {
        // Send data back to callback
        callback(response);

    }).catch(function(error) {
        // Handle error cases
        $('#texteJQ').append(error);
    });  

}


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

    // Main get function, using Axios.js
    axios.get(

        // Access the Table in the Base, and use the view "Grid View"
        //apiURL + baseID + tableURL + "?view=Grid%20view",
        apiURL + baseID + tableURL,
        { 
            headers: {Authorization: "Bearer " + apikey},
            params: {
                //fields: ["Name"],
                //maxRecords: 10,
                view: "Grid view",
                //filterByFormula: 'AND(Year > 2000, Vision = "NX")',
            }

        }
    ).then(function(response) {
        // Handle the response data

        parseBase(response, "#testarray", function(full_base_length){
            callback(full_base_length);
        });

    }).catch(function(error) {
        // Handle error cases
        $('#texteJQ').append("error<br>");
        $('#texteJQ').append(error);
    });  

}


/////////////////////////////////////////////////////////////////////////////////////
// Uses the DATA from the Airtable API (JSON Object) to construct a classic JS Array
// and print it.
function parseBase(response_data, parselocation, callback) {
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
    print2DArray(full_maped_array, parselocation);

    if(callback) callback(full_unmaped_array.length);

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
