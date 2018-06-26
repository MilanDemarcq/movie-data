
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

        // Click Event on Vision Info Chevron
        $('#VisionInfo .glyphicon-chevron-right').on('click', function(event){

            // Vision Stats
            getVisionData(apikey);

        });

        // Click Event on Rating Info Chevron
        $('#RatingInfo .glyphicon-chevron-right').on('click', function(event){

            // Rating Stats
            getRatingData(apikey);

        });


        // Date Stats
        getDateData(apikey);

    });


    // Init the sequence of queued events
    $('h1').dequeue("operations");

 
});


//// FUNCTIONS

///////////////////////////////////////////
// Get data about movie's release date
function getDateData(apikey){
///////////////////////////////////////////

    // Get full base
    airtableApiGet(apikey, "", "", function(response_data){

        //// First, put the received Object in a more convenient format (classic JS Object)

        // Get number of records for convenience
        var records_nb = response_data.data.records.length;

        // List of fields that are possible
        // (Because if a field is empty in Airtable, it will not be present in received data for this record)
        var fieldlist = ["Name", "Year", "Director", "Note", "Language", "Vision", "VY", "VN"];

        // Create object in form of an array of correct length
        var full_array = new Array (records_nb);
        // Fill it with a skeleton of expected content
        for (k=0; k<records_nb; k++){
            full_array[k] = {Name: "Name", Year: "Year", Director: "Director", Note: "Note", Language: "Language", Vision: "Vision", VY: "VY", VN: "VN"};
        }

        // Copy everything into new container
        for (i=0; i<records_nb; i++){
            for (j=0; j<fieldlist.length; j++){
                full_array[i][fieldlist[j]] = response_data.data.records[i].fields[fieldlist[j]];

            }
        }

        //// OK, new container is done

        // Calculate average year and average date
        var avg_year = 0;
        var avg_age = 0;
        for (i=0; i<records_nb; i++){
            if (full_array[i].Year != undefined){
                avg_year += full_array[i].Year;
                avg_age += full_array[i].VY - full_array[i].Year;
            } 
        }
        avg_year = avg_year/records_nb;
        avg_age = avg_age/records_nb;

        // Append values on page
        $('#average_year').append(Math.round(avg_year*100)/100);
        $('#average_age').append(Math.round(avg_age*100)/100).append(" years");

        // Sort movies into categories according to time difference between release and viewing
        var categories = ["Release Year", "Following year", "Under 3 years", "Under 5 years", "Under 10 years", "More than 10 years after"];

        //Create an array of defined type
        var date_cat = createDataStructure(categories.length);

        // Put the categories names
        date_cat.giveNames(categories);

        // Get the data values
        for (i=0; i<records_nb; i++){

            // Compute age
            var age = full_array[i].VY - full_array[i].Year;

            // Increment age category
            if (age==0){date_cat[0].Value++;}
            else if (age==1){date_cat[1].Value++;}
            else if (age<3){date_cat[2].Value++;}
            else if (age<5){date_cat[3].Value++;}
            else if (age<10){date_cat[4].Value++;}
            else if (age>=10){date_cat[5].Value++;}

        }

        // Make the BarChart
        //createBarChart(500, 20, date_cat, "#age_barchart", "inside", "Age Categories");

        // Make a donut chart
        createDonutChart(400, 500, 200, date_cat, "#age_barchart", "black", "lightgrey");
        //function createDonutChart(h, w, chart_inner_margin, data_object, domid, startcolor, endcolor, callback){


        //// Now, make a chart of the data by age (granularity = 1 year): get the data ready
        // Note: movies are considered under a certain age, ie age 1 actually means the movie
        // is seen in its first year (or release year more precisely). Age 2 means under two years, 
        // ie the following year.

        // Get all the ages (+1 is because it's "under xx")
        var age_array = full_array.map(function(o){
            return (o.VY - o.Year + 1);
        });

        // Biggest age
        var oldest = Math.max(...age_array);

        // Spans starts at age zero
        var age_span = oldest + 1;

        // Create structure
        var yearlyage = createDataStructure(age_span);

        // Make an array of age strings
        var years_string = Array(age_span);
        for (i=0; i<=oldest; i++){
            years_string[i]=i.toString();
        }

        // Add ages as strings into data
        yearlyage.giveNames(years_string);

        for (i=0; i<age_array.length; i++){
            yearlyage[age_array[i]].Value++;
        }

        // Add another two years with no movie to smooth graph
        yearlyage[yearlyage.length]={Name: yearlyage.length.toString(), Value: 0};
        yearlyage[yearlyage.length]={Name: yearlyage.length.toString(), Value: 0};

        //// Create Line chart with D3.js

        // All margins are 30 px
        var margin = createMarginObject(30,30,50,30);

        // Chart total size
        width = 500;
        height = 400;

        createLineChart(height, width, margin, yearlyage, "#age_linechart", "Age Distribution", "Movie Age", "Number of Movies");

    }); // airtableApiGet callback end
}

///////////////////////////////////
// Get rating data
function getRatingData(apikey){
///////////////////////////////////

    // Get full base
    // Could be improved by getting only the Note fields (field API parameter)
    airtableApiGet(apikey, "", "", function(response_data){

        // Init vars and get total number of records to loop
        var count = 0;
        var rsum = 0;
        var total_length =  response_data.data.records.length;  

        //The categories (stars)
        var info_array = ["★", "★★", "★★★", "★★★★", "★★★★★", "★★★★★★", "★★★★★★★", "★★★★★★★★", "★★★★★★★★★", "★★★★★★★★★★"];   

        // Array to compute count of each rating
        var ratingcountarray = createDataStructure(info_array.length); 
        ratingcountarray.giveNames(info_array);  

        // Sum up the ratings
        for (i=0; i<total_length; i++){

            // Contains the full record, rating will be record.Note, director will be record.Director
            var record = response_data.data.records[i].fields;

            // Check that rating is not undefined (empty fields are not returned by API)
            if (record.Note != undefined){

                // Update array of rating counts
                ratingcountarray[record.Note-1].Value++;
                // Update sum for average
                rsum+=record.Note;
                count++;

            }

        }

        // Get mean
        mean_rating = rsum/count;

        // Print results: average
        $('#RatingStats div:first').append(Math.round(mean_rating*10)/10).append(" / 10");

        // Print results on stars
        var star_percent = Math.round(mean_rating*10);

        //$('#av_stars').attr("style", "width: " + star_percent + "%");
        $('#av_stars').animate({
            width: star_percent+"%"
        }, 2000);

        // Simple bar chart with D3.js
        createBarChart(500, 20, ratingcountarray, "#ratingbarchart", "after", "Rating Distribution");

    });

}


//////////////////////////////////////////
// Gets data about vision techniques
function getVisionData(apikey){
//////////////////////////////////////////

    // Array contains the type of vision
    var visiontypesarray = ["NX", "CN", "ST", "DL", "TV", "AU"];

    // Array containing counts of vision types
    var visioncountarray = createDataStructure(visiontypesarray.length);

    // Get table and treat it
    airtableApiGet(apikey, "", "", function(response_data){

        var records_array = response_data.data.records;

        $.map(records_array, function(val, i){

           $.map(visiontypesarray, function(value, j){

                if (value == records_array[i].fields.Vision){
                    visioncountarray[j].Value++;
                }

           });

        });

        // Create a bar chart

        // Titles
        var info_array = ["Netflix", "Cinema", "Streaming", "Download", "Television", "Other"];

        visioncountarray.giveNames(info_array);

        // Simple bar chart (function uses D3)
        createBarChart(420, 20, visioncountarray, "#visionsbarchart", "inside", "Vision Techniques Distribution");


        // Create a donut chart

        // Get total number of visions to compute percents
        var totalvisions = 0;
        for (i = 0; i < info_array.length; i++){
            totalvisions += visioncountarray[i].Value;
        }

        // Create an array of objects containing the name and value in percent for each type
        var vision_array = new Array(info_array.length);
        for (var i = 0; i < info_array.length; i++){
            vision_array[i] = {"Name": info_array[i], "Value": Math.round(((visioncountarray[i].Value)/totalvisions)*100)};
        }

        // For vizualisation purposes, it's not convenient to have small percent values side-by-side in the chart
        vision_array = alternateJSObject(vision_array, "Value", 5);

        // Define chart's dimensions
        var h= 300;
        var w = $('#visonpiechart').parent().width();
        var chart_inner_margin = 120;

        // Call dedicated function
        createDonutChart(h, w, chart_inner_margin, vision_array, "#visonpiechart", "#2A6180", "#FF7200", function(){

            // When donut chart is created
            // Add circle in middle of donut (will be used to trigger modification of the viewed data)
            var okcircle = d3.select("#visonpiechart").selectAll("g");
            okcircle.append("circle").attr("cx", 0).attr("cy", 0).attr("r", "15").attr("class", "pie-inner-circle");
            okcircle.append("text").text("OK?").attr("dy",".3em").attr("class", "pie-inner-circle");

            // Track clicks
            var already_clicked = false;

            // When circle is clicked
            $('.pie-inner-circle').on("click", function(){

                // If first time clicked ie displaying the full dataset
                if (already_clicked == false){

                    // Create a new set of data to represent the "OK" and "Not OK" datasets
                    var ok_array = new Array(2);
                    ok_array[0] = {"Name": "OK", "Value": 0};
                    ok_array[1] = {"Name": "Not OK", "Value": 0};

                    for (i=0; i<vision_array.length; i++){
                        if (vision_array[i].Name == "Netflix" || vision_array[i].Name == "Cinema" || vision_array[i].Name == "Television" || vision_array[i].Name == "Other"){
                            ok_array[0].Value += vision_array[i].Value;
                        } else {
                            ok_array[1].Value += vision_array[i].Value;
                        }
                    }

                    // Remove the donut chart, keep only the title (ugly if removed then recreated) and inner circle
                    $('#visonpiechart').find('path, text:not(.title, .pie-inner-circle)').remove();

                    // Create another donut chart with same specs expect the dataset
                    createDonutChart(h, w, chart_inner_margin, ok_array, "#visonpiechart", "#006F3C", "#BF212F", function(){
                        // Remove one of the two title that are on top of each other
                        $('#visonpiechart').find('.title:first-of-type').remove();
                    });

                    // Note click
                    already_clicked = true;

                } else {

                    // Remove the donut chart, keep only the title (ugly if removed then recreated) and inner circle
                    $('#visonpiechart').find('path, text:not(.title, .pie-inner-circle)').remove();
                    // Recreate the original donut chart with full dataset
                    createDonutChart(h, w, chart_inner_margin, vision_array, "#visonpiechart", "#2A6180", "#FF7200", function(){
                        // Remove one of the two title that are on top of each other
                        $('#visonpiechart').find('.title:first-of-type').remove();
                    });
                    
                    // Note click
                    already_clicked = false;

                }


            }); // Inner circle click action end


        }); // First creation of donut chart callback

 

    }); // End of API GET callback
    
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

