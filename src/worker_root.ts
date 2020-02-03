

//basic functionality of worker communication with main.

const workerloop = require(__dirname + '/src/workerlib/workerloop');
const mainThreadStub = require(__dirname + '/src/workerlib/mainthreadstub');
mainThreadStub.messagebuffer = [];
// console.log('starting worker');

onmessage = function(event){
    mainThreadStub.consumeMessage(event.data);
}
mainThreadStub.postMessage = postMessage;

mainThreadStub.myname = 'worker';
workerloop.init();





