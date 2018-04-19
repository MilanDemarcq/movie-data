
// Functions used to create data visualisations:
// - createBarChart(width, barheight, data, domid, info_loc, chart_title)
// - createDonutChart(h, w, chart_inner_margin, data_object, domid, startcolor, endcolor, callback)


////////////////////////////////////////////////////////////////////////////////
// Add a simple SVG Bar Chart using D3.js
// Chart width, bar height is passed along with the data and DOM element ID.
function createBarChart(width, barheight, data, domid, info_loc, chart_title){
////////////////////////////////////////////////////////////////////////////////

    // Simple bar chart with D3.js

    // Data in parameter must be a JS Object of the following format: 
    // [i] Name: myName(string), Value: myValue(int)
    // Use createDataStructure() 

    // Title: assume vertical size of non-null title
    var titlesize = 25;

    // Get size of longest string in info_array
    var info_max_length = 0;
    for (i=0; i<data.length; i++){
        if (data.getNames()[i].length>info_max_length){info_max_length = data.getNames()[i].length;}
    }

    // Create x scale
    if (info_loc == "after") {
        // The max is the total width of the graph minus some size necessary to display info_array elements after the bars
        var x = d3.scaleLinear().domain([0, d3.max(data.getValues())]).range([0, width - info_max_length*10 - 5]);
    }
    else {
        // The max is the total width of the graph
        var x = d3.scaleLinear().domain([0, d3.max(data.getValues())]).range([0, width]);
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
    var bar = chart.selectAll("g").data(data.getValues()).enter()
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
            if (i==data.length - 1) {
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
            .text(function(d,i){return data.getNames()[i]})
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
                .text(function(d,i){return data.getNames()[i]})
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


/////////////////////////////////////////////////////////////////////////////
// Create a Donut Chart
function createDonutChart(h, w, chart_inner_margin, data_object, domid, startcolor, endcolor, callback){
/////////////////////////////////////////////////////////////////////////////

        // Compute circle radius to fit chart size (with 2 px margin)
        var radius=(h - chart_inner_margin)/2;
        var inner_radius = radius/2;

        // Create pie chart
        var pie=d3.pie()
        // Get values
        .value(function(d){return d.Value})
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
        .domain([0, data_object.length-1])
        .range([startcolor,endcolor]);
        //.range(['#2A6180','#FF7200']);
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
                        if (d.data.Value >= 4) {
                            return d.data.Value+"%";
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
                        caption_coord[i] = {"name": d.data.Name, "x": xtext, "y": ytext, "anchor": anchor};

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


            // If needed, send callback
            if(callback) callback();


        }; // End of donut_animation function
        
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


////////////////////////////////////////////////////////////////////////////////////////////////////
// Create a line chart
function createLineChart(height, width, margin, data_object, domid, title, xcaption, ycaption){
////////////////////////////////////////////////////////////////////////////////////////////////////

    // Create chart of defined size in dom element
    var chart = d3.select(domid)
    .attr("width", width)
    .attr("height", height);

    // Main group with translate to account for left and top margins
    var maingroup = chart.append("g").attr("transform", "translate (" + margin.left + ", " + margin.top + ")");

    // Define the x and y scales
    var x = d3.scaleLinear()
    .rangeRound([0, width - margin.left - margin.right]);

    var y = d3.scaleLinear()
    .rangeRound([height - margin.top - margin.bottom, 0]);

    // Create the graph line
    var valueline = d3.line()
    // X is just the index (age)
    .x(function(d, i) { return x(i); })
    // Y is the value (number of movies)
    .y(function(d) { return y(d.Value); });

    // Create the domains of values (from 0 to max)
    // X is between 0 and last index
    x.domain([0, d3.max(data_object, function(d, i) { return i; })]);
    // Y is between 0 and max age
    y.domain([0, d3.max(data_object, function(d) { return d.Value; })]);

    // Create Left axis
    maingroup.append("g")
    // The axis with ticks
    .call(d3.axisLeft(y))
    // The left axis text
    .append("text")
        //.attr("fill", "#000")
        .attr("y", -15)
        .attr("x", 3)
        .attr("dy", "0.71em")
        .attr("text-anchor", "start")
        .attr("class", "linecart-caption")
        .text(ycaption);

    // Create the bottom axis
    maingroup.append("g")
    .attr("transform", "translate(0," + (height - margin.bottom - margin.top) + ")")
    .call(d3.axisBottom(x))
    .append("text")
        //.attr("fill", "#000")
        .attr("x", width - margin.right)
        .attr("y", margin.bottom)
        .attr("dy", "-0.3em")
        .attr("text-anchor", "end")
        .attr("class", "linecart-caption")
        .text(xcaption);

    // Add title
    chart.append("text")
            .text(title)
            .attr("class", "title")
            .attr("y", 0)
            .attr("dy", "1em")
            .attr("x", width/2);

    // Add the valueline path (the line) to the main group
    var theline = maingroup.append("path")
    .data([data_object])
    .attr("class", "linechart-line")
    .attr("d", valueline)
    .attr("fill", "none");

    // Get total length of the line (used for animation)
    var totalLength = theline.node().getTotalLength();

    // Animate the line using the stroke properties
    theline.attr("stroke-dasharray", totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
        .duration(5000)
        .attr("stroke-dashoffset", 0);

    var chart_annotations = function(){       

        // Add dots at value points
        for (var k=0; k<data_object.length; k++){
            if (k != 0 && data_object[k].Value == data_object[k-1].Value){
                // Don't add a dot because value has not changed
            }
            else {
                // Value has changed (or first value)
                maingroup.append("circle")
                .attr("r", 5)
                .attr("cx", x(k))
                .attr("cy", y(data_object[k].Value))
                .attr("class", "linechart-dot")
            }
        }

    }


    // Create annotations when animation is complete
    setTimeout(chart_annotations,5000);
}
