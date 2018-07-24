
// Functions related to the Airtable API
// - getApiKeyFromFile(filename, callback)
// - getfullestAirtableData(formula, offset, callback)


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
// Get the full content of the table
// Recursive call
function getfullestAirtableData(formula, myoffset, callback){
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
                offset: myoffset,
                filterByFormula: formula
                //filterByFormula: 'AND(Year > 2000, Vision = "NX")',
            }

        }
    ).then(function(response) {
        // Handle the response data

        // Recursively call itself until there is no more offset
       if (response.data.offset) {

            getfullestAirtableData(formula, response.data.offset, (nextResponse) => {
                // Concat the new result with previous and callback that
                response.data.records = response.data.records.concat(nextResponse.data.records)
                callback (response)   
            })

       } else {
            callback(response)
       }


    }).catch(function(error) {
        // Handle error cases
        $('#texteJQ').append("error<br>");
        $('#texteJQ').append(error);
    });  

}
