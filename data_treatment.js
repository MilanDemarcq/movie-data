

// Functions dedicated to data treatment:
// - alternateJSObject (jsobject, value_holder, threshold)


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