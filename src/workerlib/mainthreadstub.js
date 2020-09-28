
//runs in worker. communicates with main thread.
module.exports = {
    myname:'wer',
    messagebuffer:null,
    consumeMessage: function(data){
        // console.log('@@@WRKR@@@' + this.myname + '/t worker got message:' + data);
        // // console.log(this.messagebuffer);
        this.messagebuffer.push(data);

        // // console.log('>>123' + this.messagebuffer.length);
    },
    
    postMessage: null,
    getResponseEmptyPacket: function(packetType, packetPayload){
        let responseJSON = {
            type:packetType,
            payload:packetPayload
        };
        return(responseJSON);
    }
}