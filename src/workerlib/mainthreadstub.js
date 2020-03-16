
//runs in worker. communicates with main thread.
module.exports = {
    myname:'wer',
    messagebuffer:null,
    consumeMessage: function(data){
        console.log('@@@WRKR@@@' + this.myname + '/t worker got message:' + data);
        // // console.log(this.messagebuffer);
        this.messagebuffer.push(data);

        // // console.log('>>123' + this.messagebuffer.length);
    },
    // getNewMessages: function(){
    //     // console.log('--' + this.myname + '>>getNewMessages:' + this.messagebuffer.messagecount);
    //     var messageList = null;
    //     if(this.messagebuffer.messagecount > 0){
    //         messageList = this.messagebuffer.messagelist;
    //         this.messagebuffer.messagelist = [];
    //         this.messagebuffer.messagecount = 0;
    //     }
    //     return messageList;
    // },
    postMessage: null,
    getResponseEmptyPacket: function(packetType, packetPayload){
        let responseJSON = {
            type:packetType,
            payload:packetPayload
        };
        // return(JSON.stringify(responseJSON));
        return(responseJSON);
    }
}