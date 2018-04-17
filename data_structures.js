
// Functions dedicated to custom data structures 
// created for the need of this project.

// List of functions:
// - createDataStructure(size)
// - datObject()
// - createMarginObject(left, right, top, bottom)


///////////////////////////////////////////////////////////////////////
// Simple Data structure : 
// Array of specified size that contains dataObjects
function createDataStructure(size){
///////////////////////////////////////////////////////////////////////

    var datastruct = Array(size);

    datastruct.init = function(){
        for (i=0; i<this.length; i++){
            this[i] = new dataObject();
        }
        return this;
    }

    datastruct.init();

    // chit[3].Value = 5;

    datastruct.getValues = function(){
        return this.map(function(o){return o.Value});
    }

    datastruct.getNames = function(){
        return this.map(function(o){return o.Name});
    }

    datastruct.giveNames = function(names_array){
        for (i=0; i<this.length; i++){
            this[i].Name = names_array[i];
        }
        return this;
    }

    return datastruct;

}


//////////////////////////////////////////////
// Very simple object with the properties
// Name: string and Value: int
function dataObject(){
//////////////////////////////////////////////

    this.Name = "nullName";
    this.Value = 0;
}


//////////////////////////////////////////////////////////
// Create an oject to store 4 margin values
function createMarginObject(left, right, top, bottom){
//////////////////////////////////////////////////////////

    var margin = {left: 0, right: 0, top:0 , bottom:0};
    margin.left = left;
    margin.right = right;
    margin.top = top;
    margin.bottom = bottom;

    return margin;
}