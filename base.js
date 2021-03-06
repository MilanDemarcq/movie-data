
//// GLOBAL VARIABLES

// Airtable App ID or Base: appqgOIJurd9Tr0L4
var baseID = "appqgOIJurd9Tr0L4";
// Airtable API URL
var apiURL = "https://api.airtable.com/v0/";
// Airtable Table URL
var tableURL = "/Table%201";

// API Key for Airtable is read from this file
var apikeyfile = "apikey";
// Null API Key var
var apikey;


//// MAIN

$(function() {

    // Display JQuery status and other info.
	$('#texteJQ').html('JQuery is RUNNING. <br>');

    //$('.Info').hide();
    $('body .container').append('<div class="loading centered"> <span class="glyphicon glyphicon-fire"></span> Fetching API Key, Connecting to Airtable ...</div>');

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

        $('.loading').append("<br> API Key loaded.");

        // Get full base from Airtable, display it and get the size

        //getfullAirtableData(apikey, function(full_base_length){
        getfullestAirtableData("", "", function(response){

            parseBase(response, "#testarray", function(full_base_length){

                // Display total count in the corresponding info div
                $('#TotalCount').append(full_base_length);
                $('.loading').append("<br> Airtable reached.");

                // Hide loading message and display the info widgets
                $('.loading').hide();
                $('.Info').show(400).css("display", "table");

                // Display all the .Info elements one by one
                // $('.Info').each(function(i){
                //     var self = this
                //     setTimeout(function () {
                //         $(self).show(300);
                //     }, i*300);
                // });
                
            });


        });

        // Make wells draggable
        // $(function(){

        //     $('#BaseInfo').draggable();
        //     $('#VisionInfo').draggable();
        //     $('#RatingInfo').draggable();
        //     $('#DateInfo').draggable();

        // });

        // Click Event on Vision Info Chevron
        $('#VisionInfo').on('click', function(event){

            // Remove please click
            $('#VisionInfo .pleaseclick').hide();
            // Vision Stats
            getVisionData(apikey);
            // Unbind
            $('#VisionInfo').unbind( "click" );

        });

        // Click Event on Rating Info Chevron
        $('#RatingInfo').on('click', function(event){

            // Remove please click
            $('#RatingInfo .pleaseclick').hide();
            // Rating Stats
            getRatingData(apikey);
            // Unbind
            $('#RatingInfo').unbind( "click" );

        });

        // Click Event on Date Info Chevron
        $('#DateInfo').on('click', function(event){

            // Remove please click
            $('#DateInfo .pleaseclick').hide();
            // Date Stats
            getDateData(apikey);
            // Unbind
            $('#DateInfo').unbind( "click" );

        });

        // Click Event on Ranking Info Chevron
        $('#RankingInfo').on('click', function(event){

            // Remove please click
            $('#RankingInfo .pleaseclick').hide();
            // Select the desired ranking
            askRankingData();
            // Unbind
            $('#RankingInfo').unbind( "click" );

        });

        // Click Event on Cross Date & Vision Info Chevron
        $('#CrossDateVisionInfo').on('click', function(event){

            // Remove please click
            $('#CrossDateVisionInfo .pleaseclick').hide();
            // Date Stats
            getCrossVisionInfoData();
            // Unbind
            $('#CrossDateVisionInfo').unbind( "click" );

        });


    });


    // Init the sequence of queued events
    $('h1').dequeue("operations");

 
});


//// FUNCTIONS

///////////////////////////////////////////
// Get Data crossed btw Date & Vision
function getCrossVisionInfoData(){
///////////////////////////////////////////

    // Create a vertical barchart that shows disctribution of vision types for some date groups : 
    // Year 0 (VY - Year = 0)
    // Following Year (VY - Year = 1)
    // Two years later (VY - Year = 2)
    // Three years later (VY - Year = 3)
    // Less than 5 years later (VY - Year <= 5)
    // Less than 10 years later (VY - Year <= 10)
    // Less than 20 years later (VY - Year <= 20)
    // More than 20 years later (VY - Year > 20)

    // Get the data ready

    // Get full base
    getfullestAirtableData("", "", function(response_data){

        // Easyer to use
        var temp = response_data.data.records;

        // Array to store objets by date categories
        var years = [];

        // Sort the elements by date categories
        years[0] = temp.filter(element => element.fields.VY - element.fields.Year == 0);
        years[1] = temp.filter(element => element.fields.VY - element.fields.Year == 1);
        years[2] = temp.filter(element => element.fields.VY - element.fields.Year == 2);
        years[3] = temp.filter(element => element.fields.VY - element.fields.Year == 3);
        years[4] = temp.filter(element => element.fields.VY - element.fields.Year <= 5 && element.fields.VY - element.fields.Year > 3);
        years[5] = temp.filter(element => element.fields.VY - element.fields.Year <= 10 && element.fields.VY - element.fields.Year > 5);
        years[6] = temp.filter(element => element.fields.VY - element.fields.Year <= 20 && element.fields.VY - element.fields.Year > 10);
        years[7] = temp.filter(element => element.fields.VY - element.fields.Year > 20);

        // Ok date data is ready        

        //// Get the vision type repartition for each date category

        var vision_distribution = [];

        for (var i = 0; i<years.length; i++){
            vision_distribution.push({
                NX: Math.round(100 * years[i].filter(element => element.fields.Vision == "NX").length / years[i].length),
                CN: Math.round(100 * years[i].filter(element => element.fields.Vision == "CN").length / years[i].length),
                ST: Math.round(100 * years[i].filter(element => element.fields.Vision == "ST").length / years[i].length),
                DL: Math.round(100 * years[i].filter(element => element.fields.Vision == "DL").length / years[i].length),
                TV: Math.round(100 * years[i].filter(element => element.fields.Vision == "TV").length / years[i].length),
                AU: Math.round(100 * years[i].filter(element => element.fields.Vision == "AU").length / years[i].length)
            });
        }


        console.log(vision_distribution);

        //// Get the DOM ready to receive the SVG chart : 

        // Add HTML elements
        $('#CrossDateVisionInfo .wellcontent').append('\
            <div class="row">\
                <div class="col-lg-12"><svg class="multibar barchart center-block" id="date_vision_barchart"></svg></div>\
            </div>\
        ');


        /////// D3 START

        var domid = "#date_vision_barchart";

        var width = 500;
        var height = 500;

        var data = years;

        var barwidth = 50;

        // Create y scale : max value is 100 since it's %
        var y = d3.scaleLinear().domain([0, 100]).range([0, height]);

        // Title: assume vertical size of non-null title
        var titlesize = 25;

        // Create chart and specify its size
        var chart = d3.select(domid)
            .attr("height", height + titlesize)
            .attr("width", ((barwidth+2) * data.length));


        margin = {top: 20, right: 20, bottom: 20, left: 20};

        // Create the chart's bars
        var bar = chart.selectAll("g").enter()
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        console.log(bar);



        /////// D3 END




        
    });


}


///////////////////////////////////////////
// Ask what type of ranking is wanted
function askRankingData(){
///////////////////////////////////////////

    $('#RankingInfo .wellcontent').append('<div> Select the desired ranking type : <br><br></div>');

    $('#RankingInfo .wellcontent').append('\
        <div class="form-group form-inline">\
            <span> The </span>\
            <select class="form-control" id="sel1">\
                <option>Best Rated</option>\
                <option>Worst Rated</option>\
            </select>\
            <span> movies that  </span>\
            <select class="form-control" id="sel2">\
                <option>Came out</option>\
                <option>Were watched</option>\
            </select>\
            <span> in the year </span>\
            <select class="form-control" id="sel3">\
                <option>2018</option>\
                <option>2017</option>\
                <option>2016</option>\
                <option>2015</option>\
                <option>2014</option>\
                <option>2013</option>\
                <option>2012</option>\
            </select>\
            <button type="submit" class="btn btn-primary">Submit</button>\
        </div> ');


    // Click Event on Submit
    $('#RankingInfo button').on('click', function(event){

        var rankorder = $('#RankingInfo #sel1').find(":selected").text();
        var yeartype = $('#RankingInfo #sel2').find(":selected").text();
        var year = $('#RankingInfo #sel3').find(":selected").text();

        getRankingData(rankorder, yeartype, year);

    });


}

///////////////////////////////////////////
// Get Ranking data
function getRankingData(rankorder, yeartype, year){
///////////////////////////////////////////

    // Filter by year of apparition or year of vision
    if (yeartype == "Came out"){
        // The year to display
        yearsort = '(Year = ' + year + ')';
    } else {
        yearsort = '(VY = ' + year + ')';
    }

    // Get full base
    getfullestAirtableData(yearsort, "", function(response_data){
    //airtableApiGet(apikey, "", yearsort, function(response_data){

        // Sort the field by asc or desc rating
        var sorted_fields = response_data.data.records.sort(function(a,b){
            if (rankorder == "Best Rated"){
                return b.fields.N - a.fields.N;
            } else {
                return a.fields.N - b.fields.N;
            }
        });

        if ($('#RankingInfo .wellcontent table').length != 0){
            $('#RankingInfo .wellcontent table').remove();
        }

        // Add a table
        $('#RankingInfo .wellcontent').append('<table class="table table-hover"></table>');
        $('#RankingInfo .wellcontent table').append('<thead><tr><th>Movie</th><th>Director</th><th>Rating</th></tr></thead');
        $('#RankingInfo .wellcontent table').append('<tbody></tbody>');

        for (var i = 0; i<sorted_fields.length; i++){

            // Fill table with the resulting movies
            $('#RankingInfo .wellcontent tbody').append("<tr> <th>" + sorted_fields[i].fields.Name + "</th><th>" +  sorted_fields[i].fields.Director + "</th><th>" + "★".repeat(sorted_fields[i].fields.N) + "  (" + sorted_fields[i].fields.N + ")  " + "</th> </tr>");

            if (sorted_fields[i].fields.N == 10){
                $('#RankingInfo .wellcontent tbody').find('tr:last-of-type').find('th:first-of-type').prepend('<span class="symbol">🏆</span>');
            } else if (sorted_fields[i].fields.N == 9){
                $('#RankingInfo .wellcontent tbody').find('tr:last-of-type').find('th:first-of-type').prepend('<span class="symbol">💙</span>');
            } else if (sorted_fields[i].fields.N == 1){
                $('#RankingInfo .wellcontent tbody').find('tr:last-of-type').find('th:first-of-type').prepend('<span class="symbol">🚀</span>');
            } else if (sorted_fields[i].fields.N == 0){
                $('#RankingInfo .wellcontent tbody').find('tr:last-of-type').find('th:first-of-type').prepend('<span class="symbol">🕒</span>');
            } else if (sorted_fields[i].fields.N <= 5){
                $('#RankingInfo .wellcontent tbody').find('tr:last-of-type').find('th:first-of-type').prepend('<span class="symbol red">✘</span>');
            }           

        }

    });


}

///////////////////////////////////////////
// Get data about movie's release date
function getDateData(apikey){
///////////////////////////////////////////

    // Get full base
    getfullestAirtableData("", "", function(response_data){
    //airtableApiGet(apikey, "", "", function(response_data){

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

        // Check if first click
        if ($('#average_year').length == 0){

            // Add HTML elements
            $('#DateInfo .wellcontent').append('\
                <div id="average_year"> Average Release Year of movies: </div>\
                <div id="average_age"> Average Age of movies at time of viewing: </div>\
                <br>\
                <div class="row">\
                    <div class="col-lg-6 col-md-8"><svg class="donutchart center-block" id="age_barchart"></svg></div>\
                    <div class="col-lg-6 col-md-8"><svg class="linechart center-block" id="age_linechart"></svg></div>\
                </div>\
                ');

        }

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
        createDonutChart(400, 500, 200, date_cat, "#age_barchart", "#2A6180", "#FF7200");
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
        width = 550;
        height = 400;

        createLineChart(height, width, margin, yearlyage, "#age_linechart", "Age Distribution", "Movie Age", "Number of Movies", false);

    }); // airtableApiGet callback end
}

///////////////////////////////////
// Get rating data
function getRatingData(apikey){
///////////////////////////////////

    // Get full base
    // Could be improved by getting only the Note fields (field API parameter)
    getfullestAirtableData("", "", function(response_data){
   // airtableApiGet(apikey, "", "", function(response_data){

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

        // Check if first click
        if ($('#RatingStats').length == 0){

            // Add HTML elements
            $('#RatingInfo .wellcontent').append('\
                <div class="StatSpace" id="RatingStats">\
                    <div id="verboserating"> Average Rating: </div>\
                    <div class="starsrating">\
                        <div id="av_stars" class="stars-in" style="width: 0%"> <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span> </div>\
                        <div class="stars-out"> <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span> </div>\
                    </div>\
                </div>\
                <div id="RatingGraphs" class="GraphSpace">\
                    <svg id=ratingbarchart class="barchart"></svg>\
                </div>');

             // Print results: average
            $('#RatingStats div:first').append(Math.round(mean_rating*10)/10).append(" / 10");

        }

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
    getfullestAirtableData("", "", function(response_data){
    //airtableApiGet(apikey, "", "", function(response_data){

        var records_array = response_data.data.records;

        $.map(records_array, function(val, i){

           $.map(visiontypesarray, function(value, j){

                if (value == records_array[i].fields.Vision){
                    visioncountarray[j].Value++;
                }

           });

        });


        // Check if first click
        if ($('#VisionGraphs').length == 0){

            // Add HTML elements
            $('#VisionInfo .wellcontent').append('\
                <div id="VisionGraphs" class="GraphSpace">\
                    <div><svg id="visionsbarchart" class="barchart"></svg></div>\
                    <div><svg id="visonpiechart"></svg></div>\
                </div>');

        }

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

