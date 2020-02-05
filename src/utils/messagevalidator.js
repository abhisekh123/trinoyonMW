module.exports = {
    validateIncomingMessage:function (stringMessageParam){
        var messageJSON = null;
        if(stringMessageParam != null && stringMessageParam != undefined) {
            try {
                messageJSON = JSON.parse(stringMessageParam);
                if(!messageJSON.hasOwnProperty('type')){
                    //bad request. discard.
                    console.log('error : message does not have a type.');
                    return null;
                }
            } catch(e) {
                console.log(e); // error in the above string (in this case, yes)!
                return null;
            }
        }
        return messageJSON;
    }  
    
};