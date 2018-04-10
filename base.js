
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

        // Init vars and get total number of records to loop
        var count = 0;
        var rsum = 0;
        var total_length =  response_data.data.records.length;

        // Array to compute count of each rating
        //var ratingcountarray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // Sum up the ratings
        for (i=0; i<total_length; i++){

            // Contains the full record, rating will be record.Note, director will be record.Director
            var record = response_data.data.records[i].fields;

            // Check that rating is not undefined (empty fields are not returned by API)
            if (record.Note != undefined){

                // Update array of rating counts
                ratingcountarray[record.Note-1]++;
                // Update sum for average
                rsum+=record.Note;
                count++;

            }

        }

        // Get mean
        mean_rating = rsum/count;

        // Print results: average
        $('#RatingStats div:first').append(mean_rating).append(" / 10");

        // Print results on stars
        var star_percent = Math.round(mean_rating*10);

        //$('#av_stars').attr("style", "width: " + star_percent + "%");
        $('#av_stars').animate({
            width: star_percent+"%"
        }, 2000);

        // Simple bar chart with D3.js

        //Additionnal info in array to display after bars
        var info_array = ["★", "★★", "★★★", "★★★★", "★★★★★", "★★★★★★", "★★★★★★★", "★★★★★★★★", "★★★★★★★★★", "★★★★★★★★★★"];

        createBarChart(500, 20, ratingcountarray, "#ratingbarchart", info_array, "after", "Rating Distribution");

    });

}


//////////////////////////////////////////
// Gets data about vision techniques
function getVisionData(apikey){
//////////////////////////////////////////

    // Array contains the type of vision
    var visiontypesarray = ["NX", "CN", "ST", "DL", "TV", "AU"];

    // Array containing counts of vision types
    var visioncountarray = [0, 0, 0, 0, 0, 0];

    // Get table and treat it
    airtableApiGet(apikey, "", "", function(response_data){

        var records_array = response_data.data.records;

        $.map(records_array, function(val, i){

           $.map(visiontypesarray, function(value, j){

                if (value == records_array[i].fields.Vision){
                    visioncountarray[j]++;
                }

           });

        });

        // $('#VisionStats div').each(function(index){
        //     $(this).append(visioncountarray[index]);
        // });


        // Create a bar chart

        // Titles
        var info_array = ["Netflix", "Cinema", "Streaming", "Download", "Television", "Other"];

        // Simple bar chart (function uses D3)
        createBarChart(420, 20, visioncountarray, "#visionsbarchart", info_array, "inside", "Vision Techniques Distribution");


        // Create a donut chart

        // Get total number of visions to compute percents
        var totalvisions = 0;
        for (i = 0; i < info_array.length; i++){
            totalvisions += visioncountarray[i];
        }

        // Create an array of objects containing the name and value in percent for each type
        var vision_array = new Array(info_array.length);
        for (var i = 0; i < info_array.length; i++){
            vision_array[i] = {"name": info_array[i], "value": Math.round((visioncountarray[i]/totalvisions)*100)};
        }

        // For vizualisation purposes, it's not convenient to have small percent values side-by-side in the chart
        vision_array = alternateJSObject(vision_array, "value", 5);

        // Define chart's dimensions
        var h= 300;
        var w = $('#visonpiechart').parent().width();
        var chart_inner_margin = 120;

        // Call dedicated function
        createDonutChart(h, w, chart_inner_margin, vision_array, "#visonpiechart");


    }); // End of API GET callback
    
}


////////////////////////////////////////////////////////////////////////////////////////////////
// When given a JS Object in form of array, tries to alternate small elements with bigger ones
// The attribute of object to be taken into consideration is passed as "value_holder" parameter
function alternateJSObject (jsobject, value_holder, threshold){
////////////////////////////////////////////////////////////////////////////////////////////////

    for (i=1; i< jsobject.length; i++){
        if (jsobject[i][value_holder] < threshold && jsobject[i-1][value_holder] < threshold){
            // Two consecutive small values found
            for (j=1; j<jsobject.length-1; j++){
                if (jsobject[j-1][value_holder]>= threshold && jsobject[j][value_holder] >= threshold && jsobject[j+1][value_holder] >= threshold){
                    // Three consecutive big values found
                    // Switch the small value with the big
                    var temp = jsobject[j];
                    jsobject[j] = jsobject[i];
                    jsobject[i] = temp;
                }
            }
        }
    }

    return jsobject;

}


/////////////////////////////////////////////////////////////////////////////
// Create a Donut Chart
function createDonutChart(h, w, chart_inner_margin, data_object, domid){
/////////////////////////////////////////////////////////////////////////////

        // Compute circle radius to fit chart size (with 2 px margin)
        var radius=(h - chart_inner_margin)/2;
        var inner_radius = radius/2;

        // Create pie chart
        var pie=d3.pie()
        // Get values
        .value(function(d){return d.value})
        // No sorting
        .sort(null)
        // Pad angle to separate arcs
        .padAngle(.04);

        // Create arc
        var arc=d3.arc()
        .innerRadius(inner_radius)
        .outerRadius(radius);

        // Other bigger arc used on click
        var arc2=d3.arc()
        .innerRadius(inner_radius + 5)
        .outerRadius(radius + 10);

        // Color scale : linear colors between to values
        var mycolor = d3.scaleLinear()
        .domain([0, data_object.length])
        .range(['#2A6180','#D75C37']);
        //.range(['#e75244','#2A6180']);

        // Create SVG diagram
        var mysvg=d3.select(domid)
        .attr("width", "100%")
        .attr("height", h);

        // The main group
        var piegroup = mysvg.append('g')
            // Set translate to point to the center of the chart
            .attr("transform", "translate("+w/2+","+(h/2)+")");

        // The pie elements
        var path=piegroup.selectAll('path')
        .data(pie(data_object))
        .enter()
            .append('path')
            .attr("d", arc)
            // Color
            .attr("fill", function(d, i){return mycolor(i)})
            // Additionnal style is set in css
            .attr("class", "donut_arc")
            // Click and mouseleave events
            .on("click", function(d) {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("d", arc2)             
            })
            .on("mouseleave", function(d) {
                d3.select(this).transition()            
                    .attr("d", arc)
           });

        // Annotations will be executed after donut animation
        var donut_annotations = function(){

            // Caption
            var text=piegroup.selectAll('text')
            .data(pie(data_object))
            .enter()
                .append("text")
                    // Animate the text: transition from center of donut
                    .transition()
                    .duration(200)
                    // Put text to centroid of arc
                    .attr("transform", function (d) {
                        return "translate(" + arc.centroid(d) + ")";
                    })
                    // Middle of text is on arc centroid
                    .attr("text-anchor", "middle")
                    // Specific class
                    .attr("class", "pie-text")
                    // Print the desired text (name, value, etc)
                    .text(function(d){
                        //return d.data.name+" ("+d.data.value+"%)" ;
                        // Only display value for significant groups (won't fit under 4%)
                        if (d.data.value >= 4) {
                            return d.data.value+"%";
                        }                   
                    });

            // Add title
            mysvg.append("text")
                .text("Distribution")
                .attr("class", "title")
                .attr("y", 0)
                .attr("dy", "1em")
                .attr("x", w/2);

            // Will be used later to store coordinates for tetx caption elements
            var caption_coord = new Array (data_object.length);

            // Add a cool legend with lines pointing at arcs
            var mypath=piegroup.selectAll('mypath')
            .data(pie(data_object))
            .enter()
                .append("path")
                    //.attr("d", "M 0 0 L 10 10")
                    .attr("d", function(d,i){
                        // Get the angle (in rad) corresponding to the middle of each arc
                        var teta = ((d.startAngle + d.endAngle)/2);
                        var r = radius;
                        // Convert to degrees
                        var teta_deg = Math.round((teta*180)/Math.PI);
                        // Polar to cartesian cordinates for origin
                        // Modified coordinates since d3 starts at 90° and goes clockwise
                        var x0 = Math.round((r+3)*Math.sin(teta));
                        var y0 = -Math.round((r+3)*Math.cos(teta));
                        // Next point: end of first line, same direction, further
                        var x1 = Math.round((r+25)*Math.sin(teta));
                        var y1 = -Math.round((r+25)*Math.cos(teta));
                        // Last point, horizontal line
                        // Goes left or right depending on where in chart is the arc placed
                        if (teta_deg < 180){
                            var x2 = x1+25;
                            var anchor = "start";
                            var xtext = x2 + 3;
                        } else {
                            var x2 = x1-25;
                            var anchor = "end";
                            var xtext = x2 - 3;
                        }
                        var y2 = y1;
                        var ytext = y2;

                        // Update caption coordinates and anchor type
                        caption_coord[i] = {"name": d.data.name, "x": xtext, "y": ytext, "anchor": anchor};

                        // Write path
                        return ("M " + x0 + " " + y0 + " L "+ x1 + " " + y1 + " H " + x2);

                    })
                    .attr("fill", "none")
                    .attr("stroke", "white")
                    .attr("stroke-width", 1);

            // Add text after l=the path using the coordinates stored when creating path
            var mypath=piegroup.selectAll('mypath')
            .data(pie(data_object))
            .enter()
                .append("text")
                .attr("class", "pie-caption")
                .attr("x", function(d,i){return caption_coord[i].x})
                .attr("y", function(d,i){return caption_coord[i].y})
                .attr("dy", ".3em")
                .attr("text-anchor", function(d,i){return caption_coord[i].anchor})
                .text(function(d,i){return caption_coord[i].name});


        };
        
        // Animate the donut
        path.transition()
        .duration(1000)
        .attrTween('d', function(d) {
            var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
            return function(t) {
                return arc(interpolate(t));
            };
        });

        // Create annotations when animation is complete
        setTimeout(donut_annotations,1000);
}


////////////////////////////////////////////////////////////////////////////////
// Add a simple SVG Bar Chart using D3.js
// Chart width, bar height is passed along with the data and DOM element ID.
function createBarChart(width, barheight, data, domid, info_array, info_loc, chart_title){
////////////////////////////////////////////////////////////////////////////////

    // Simple bar chart with D3.js

    // Title: assume vertical size of non-null title
    var titlesize = 25;

    // Get size of longest string in info_array
    var info_max_length = 0;
    for (i=0; i<info_array.length; i++){
        if (info_array[i].length>info_max_length){info_max_length = info_array[i].length;}
    }

    // Create x scale
    if (info_loc == "after") {
        // The max is the total width of the graph minus some size necessary to display info_array elements after the bars
        var x = d3.scaleLinear().domain([0, d3.max(data)]).range([0, width - info_max_length*10 - 5]);
    }
    else {
        // The max is the total width of the graph
        var x = d3.scaleLinear().domain([0, d3.max(data)]).range([0, width]);
    }

    // Create chart and specify its size
    // Width is expendand to fit add. info NOT anymore
    //var chart = d3.select(domid).attr("width", width + 15 + info.length*15).attr("height", (barheight+2) * data.length);
    var chart = d3.select(domid)
        .attr("width", width)
        .attr("height", ((barheight+2) * data.length + titlesize));

    // Add info as attributes into chart to use them later // TODO maybe use data() instead
    chart.attr("mybarheight", barheight).attr("mydatalength", data.length).attr("mytitlesize", titlesize);

    // Create the chart's bars
    var bar = chart.selectAll("g").data(data).enter()
        .append("g")
            .attr("transform", function(d, i) { return "translate(0," + (i * (barheight+2) + titlesize) + ")"; });

    // In each g svg element (the chart's bars) add an svg rectangle.
    // When construction is over (with transition), call the annotateGraph() function to complete graph.
    bar.append("rect")
        .attr("height", barheight - 1)
        .attr("width", 0)
        .transition()
        .delay(function(d, i){ return i*50; })
        .duration(1000)
        .attr("width", x)
        .on("end", function(d,i){
            if (i==info_array.length - 1) {
                //alert("done");
                annotateGraph();
            }
        });

    // Adds everything in the graph after the bars
    function annotateGraph(){

        // Loop over the created rectangles
        var rectselect = domid + " rect";
        $(rectselect).each(function(){

            // If rect is void, increase width 
            if ($(this).attr("width")==0){
                $(this).attr("width", 3);
            }

        });

        // In each g svg element add the value text
        bar.append("text")
            .text(function(d){return d})
            .attr("y", barheight / 2)
            .attr("dy", ".3em")
            .attr("x", function(d, i){return x(d)})
            .attr("dx", function(d){return "-" + (0.2 + (0.5 * d.toString().length)) + "em"});

        // Second text to add more info : located inside or after the bar

        // After the bar
        if (info_loc == "after"){
            bar.append("text")
            .attr("class", "caption")
            .text(function(d,i){return info_array[i]})
            .attr("y", barheight / 2)
            .attr("dy", ".3em")
            .attr("x", function(d, i){return x(d)})
            .attr("dx", ".6em");
        }

        // Inside the bar (if width permits it, after if not)
        else if (info_loc == "inside"){

            // Add the text
            bar.append("text")
                .attr("class", "inside_info")
                .attr("y", barheight / 2)
                .attr("dy", ".3em")
                .attr("x", "10")
                .attr("text-anchor", "start")
                .text(function(d,i){return info_array[i]})
                // Get actual size of text and store it as an attribute
                .attr("mylength", function(d,i){return this.getComputedTextLength();});

            // Loop over the bars of chart
             $(domid).find('g rect').each(function(index){   

                // Get the text object
                var mytext = $(this).parent().find('text.inside_info');
                // Size of rectangle
                var rect_width = parseInt($(this).attr("width"));
                // Size of text
                var text_width = parseInt(mytext.attr("mylength"));

                // If text fits, ok, if not, move it.
                if (text_width < rect_width){

                } else {
                    //alert("Text : " + text_width + ".... Rect : " + rect_width);
                    // Move text
                    mytext.attr("x", rect_width + 10);
                    // Change class
                    mytext.attr("class", "caption");
                }
                
                // When over, display text (default css visibility was hidden)
                $(this).parent().find('text.inside_info').css("visibility", "visible");

             }); 

        }

        // Add title
        chart.append("text")
            .text(chart_title)
            .attr("class", "title")
            .attr("y", 0)
            .attr("dy", "1em")
            .attr("x", width/2);

        // Add axis-like lines
        chart.append("line")
            .attr("class", "axis-like")
            .attr("x1", "0")
            .attr("y1", (titlesize - 5))
            .attr("x2", "0")
            .attr("y2", (titlesize + (barheight+2) * data.length));

    } // End of annotateGraph subfunction

    
    // Dynamic behaviour

    // Avoid multiple clicks or mouseouts
    var already_clicked = false;

    // On click actions on barcharts rectangles
    $('.barchart').unbind('click').on("click", "g", function(){

        if (already_clicked == false) {

            // Get the charts info values that are stored as attributes in the svg element
            var mybarheight = parseInt($(this).parent().attr("mybarheight"));
            var mydatalength = parseInt($(this).parent().attr("mydatalength"));
            var mytitlesize = parseInt($(this).parent().attr("mytitlesize"));

            // Temp style
            $(this).children('rect').css("fill", "grey");

            // Increase rectangle size by barheight
            $(this).children('rect').attr("height", mybarheight*2 - 1);

            // All following groups are added a transform to translate in y by barheight
            $(this).nextAll('g').attr("transform", function(d){
                return this.getAttribute("transform") + "translate(0," + mybarheight + ")";
            });

            // The graph is expanded by barheight
            $(this).parent().attr("height", ((mybarheight+2) * mydatalength + mytitlesize + mybarheight));

            // The line is expanded by barheight
            $(this).parent().find('line').attr("y2", (mytitlesize + (mybarheight+2) * mydatalength + mybarheight));

            already_clicked = true;

        }       

    });

    // Mouseover actions on barcharts rectangles
    $('.barchart').on("mouseover", "rect", function(){
        //$(this).css("fill", "grey");
    });

    // Mouseout actions
    $('.barchart').on("mouseout", "g", function(){   
        //

        // Cancel click actions on rectangles

        if (already_clicked==true){

            // Get the charts info values that are stored as attributes in the svg element
            var mybarheight = parseInt($(this).parent().attr("mybarheight"));
            var mydatalength = parseInt($(this).parent().attr("mydatalength"));
            var mytitlesize = parseInt($(this).parent().attr("mytitlesize"));

            // Temp style
            //$(this).children('rect').css("fill", "red");
            $(this).children('rect').removeAttr("style");

            // Back to standard rect size
            $(this).children('rect').attr("height", mybarheight - 1);

            // All following groups are added an inverting transform translate
            $(this).nextAll('g').attr("transform", function(d){
                return this.getAttribute("transform") + "translate(0,-" + mybarheight + ")";
            });

            // The graph is back to standard (reduced by barheight)
            $(this).parent().attr("height", ((mybarheight+2) * mydatalength + mytitlesize));

            // The line is back to standard (reduced by barheight)
            $(this).parent().find('line').attr("y2", (mytitlesize + (mybarheight+2) * mydatalength));

            // Reset already clicked
            already_clicked = false;

        }

    });

    
}


/////////////////////////////////////////////////////////////
// Generic API Get function with filterbyformula parameter
function airtableApiGet(apikey, myfields, formula, callback){
/////////////////////////////////////////////////////////////

    // Get function, using Axios.js
    axios.get(

    // Access the Table in the Base, and use the view "Grid View"
    //apiURL + baseID + tableURL + "?view=Grid%20view",
    apiURL + baseID + tableURL,
    { 
        headers: {Authorization: "Bearer " + apikey},
        params: {
            //fields: myfields,
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
                //fields: ['Vision'],
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
