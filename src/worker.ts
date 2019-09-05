

//basic functionality of worker communication with main.

const workerlogic = require(__dirname + '/src/workerlib/workerlogic');
const mainThreadStub = require(__dirname + '/src/workerlib/mainthreadstub');
mainThreadStub.messagebuffer = [];
console.log('starting worker');

onmessage = function(event){
    mainThreadStub.consumeMessage(event.data);
}
mainThreadStub.postMessage = postMessage;

mainThreadStub.myname = 'worker';
workerlogic.init();





