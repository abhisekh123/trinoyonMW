//alert("constants");
//populated in constant.js
// gGameObject.missionMeshObj = {};
// gGameObject.missionMeshObj.groundMesh = "";
// gGameObject.missionMeshObj.meshArr = [];
// gGameObject.missionMeshObj.staticMeshArr = [];
// gGameObject.redTargetMesh;
// gGameObject.greenTargetMesh;
// gGameObject.userCarIndex = -1;
// gGameObject.stelliteObj = {};
// gGameObject.stelliteObj.active = false;
// gGameObject.spriteManager = null;

// //alert("startWorkers->");
// gGameObject.phRcvTimeStamp = 0;
// gGameObject.aiRcvTimeStamp = 0;
// gGameObject.phSendTime = 0
// gGameObject.aiSendTime = 0
// gGameObject.frameInterval = 1000/60;//in milli seconds
// gGameObject.aiInterval = 1000/60;//in milli seconds

// gGameObject.isRunning = false;
// gGameObject.transObj = [];//transferrable object for physics
// gGameObject.transObjAI = [];//transferrable object for AI


var gDS = gDS || {};
// console.log("################GDS");
gDS.seq = {};

gDS.userProfile = {};
gDS.userTeam = 1;
gDS.userProfile.flag = false;

//gDS.userAutoAim = false;
gDS.userAutoAim = true;
gDS.enableMotionBlurr = false;
gDS.enemyCount = 4;

gDS.botFlag = {};
gDS.botFlag.autonomousBot = 0;
gDS.botFlag.guardBot = 1;
gDS.botFlag.followBot = 2;

gDS.seqComplete = false;
//init seq
gDS.seq.initseq = {};
//gDS.seq.initseq.execute = ["readfilelist","readfiles","execnextseq"];
//gDS.seq.starteditor.execute = ["popCompList","popMsnList","loadconfig","startworkers"];
gDS.seq.initseq.execute = ["readfilelist,files","readfiles","loadconfig","startworkers","acknowledge"];
//gDS.seq.initseq.loadconfig = ["texshadermgr.js","initOutput.js","initInput.js","initWorker.js","gamecontrol.js","startengine.js"];
gDS.seq.initseq.loadconfig = ["texshadermgr.js","initOutput.js","initInput.js","initWorker.js","gamecontrol.js","missionlist.js","meshmgr.js"];//,"startengine.js"];

gDS.seq.initseq.phfile = "config/phWorker.js";
gDS.seq.initseq.aifile = "config/aiWorker.js";


//gDS = {};
gDS.proto = {};
gDS.protoJSON = {};
gDS.fileData = {};
gDS.fileList = [];

gDS.identifier = {};
gDS.pendingAsync = 0;
gDS.pendingExec = [];
gDS.pendingConftoLoad = [];

//gDS.txObjSize = 256;

gDS.cosMap = {};
gDS.sinMap = {};

gDS.cTypList = ["base","hrot","vrot","launcher","projectile","car","wheel"];
gDS.mTypList = ["attack","defend","sabotaj","escort","transporter"];
gDS.iStaticTypList = ["building"];
gDS.iTypList = ["NA","basicskybox","defend","building","car","tank"];
gDS.sTypList = ["start","end","regular"];
gDS.cShapeList = ["box","sphere","cylinder"];

gDS.cJointList = ["jointDistance","jointHinge","jointPrisme","jointSlide","jointBall","jointWheel","NA"];

gDS.condList = ["always","timeup","time"];
gDS.relnList = [">","<","="];
gDS.actTypeList = ["pos","guard","idle","offensive","defensive"];

gDS.identifier.canvasDv = "canvasRootDv";//11
gDS.identifier.edtrLftRootDv = "edtrLftRootDv";//1
gDS.identifier.edtrRghtRootDv = "edtrRghtRootDv";//1
gDS.identifier.edtrBtmRootDv = "edtrBtmRootDv";//1

gDS.identifier.msnLstDv = "msnLstDv";//1
gDS.identifier.msnAttrLstDv = "msnAttrLstDv";//2
gDS.identifier.itemLstDv = "itemLstDv";//3
gDS.identifier.itemCompLstDv = "itemCompLstDv";//4
gDS.identifier.transLstDv = "transLstDv";//5
gDS.identifier.actionLstDv = "actionLstDv";//6
//gDS.identifier.itemActionLstDv = "itemActionLstDv";//7
gDS.identifier.compAttrLstDv = "compAttrLstDv";//8
gDS.identifier.compLstDv = "compLstDv";//9
gDS.identifier.edtrCtrlDv = "edtrCtrlDv";//10

//gDS.identifier.compLstProto = "compLstProto";//12
//gDS.identifier.compAttrLstProto = "compAttrLstProto";//13

gDS.identifier.newCompNmInput = "newCompNmInput";
gDS.identifier.newCompTypInput = "newCompTypInput";


gDS.identifier.newMsnNmInput = "newMsnNmInput";
gDS.identifier.newMsnTypInput = "newMsnTypInput";

gDS.identifier.msnItemMaxCount = 30;
gDS.identifier.msnItemCompMaxCount = 10;
gDS.identifier.msnStageMaxCount = 4;
gDS.identifier.msnStageActionMaxCount = gDS.identifier.msnItemMaxCount;
gDS.identifier.msnStageTransMaxCount = 4;

//gDS.identifier.sizeMultiplier = 80;
gDS.identifier.skyBoxMultiplier = 2;

gDS.identifier.blockSize = 20;
gDS.identifier.itemBoundaryBuff = 40;

gDS.identifier.launcherRange = gDS.identifier.blockSize * 2.5;
gDS.play = {};
gDS.play.replayrewardfactor = 0.1;

gDS.identifier.itemSelMaxDist = 20;
gDS.identifier.intersectionMesh = 0;
gDS.identifier.curSelectedItemIndex = -1;
gDS.identifier.potentialSelectedItemIndex = -1;

gDS.itemConfig = [
	{
		"type":"defend",
		"basecomplist":["base"],
		"actionlist":[""]
	},
	{
		"type":"building",
		"basecomplist":[""],
		"actionlist":[""]},
	{
		"type":"car",
		"basecomplist":["car"],
		"actionlist":[""]},
	{
		"type":"basicskybox",
		"basecomplist":["wheel"],//dummy ... just putting a component with no child
		"actionlist":[""]},
	{
		"type":"tank",
		"basecomplist":[""],
		"actionlist":[""]}
];

gDS.itemConfig.car = {
	"range":100,
	"shootrange":60
};

gDS.itemConfig.defend = {
	"range":100,
	"shootrange":60
};

gDS.itemAction = [
	{
		"name":"hsweep",
		"handler":"",
		"audio":""
	},
	{
		"name":"vsweep",
		"handler":"",
		"audio":""
	},
	{
		"name":"fire",
		"handler":"",
		"audio":""
	},
	{
		"name":"foreward",
		"handler":"",
		"audio":""
	},
	{
		"name":"reverse",
		"handler":"",
		"audio":""
	},
	{
		"name":"steerleft",
		"handler":"",
		"audio":""
	},
	{
		"name":"steerright",
		"handler":"",
		"audio":""
	}
];

gDS.itemList = new Array();
gDS.staticItemList = new Array();


gDS.inputMap = {
    "fwd":[87],
    "rwd":[83],
    "lft":[65],
    "rgt":[68],
    "fire":[70],//space
    "explFlg":[0],//space
};

gDS.userVSpeed = 20;
gDS.botVSpeed = 15;

gDS.mouseDeltaX = 0;
gDS.mouseDeltaZ = 0;

gDS.minDist = 8;
gDS.maxDist = 50;



gDS.minAngle = -Math.PI/2;
gDS.maxAngle = Math.PI/2;
gDS.aimDeltaAngle = 15*Math.PI/180;

gDS.targetX = 0;
gDS.targetZ = 0;
gDS.targetDist = 5;
gDS.targetAngle = 0;//radian
gDS.targetFlag = true;

gDS.distMultiplier = 0.1;
gDS.angleMultiplier = 0.02;
gDS.forceMultiplier = 1.5;

gDS.projectileMultiplier = 3;

gDS.defLife = 200;
gDS.userLife = 300;
gDS.botLife = 200;
gDS.staticLife = 5000;

//gDS.explosionDamage = 50;
gDS.explosionDamage = 60;

gDS.explosionDamageRange = 15;

gDS.reloadMS = 2700;
///////174@init worker

gDS.rangeMap = new Array();

gDS.initConstDS = function(){
	//gDS.cosMap;
	//gDS.sinMap;
	var degToRadMult = Math.PI/180;
	var radian;

	for(var i = -360; i<361; i = i + 15){
		radian = degToRadMult * i;
		gDS.cosMap[i] = parseFloat(Math.cos(radian).toFixed(3));
		gDS.sinMap[i] = parseFloat(Math.sin(radian).toFixed(3));

		if(gDS.cosMap[i] < 0.001 && gDS.cosMap[i] > -0.001){
			gDS.cosMap[i] = 0;
		}
		if(gDS.sinMap[i] < 0.001 && gDS.sinMap[i] > -0.001){
			gDS.sinMap[i] = 0;
		}
	}
	var tmp = 1;
	gDS.inputMap.fwd[1] = tmp;
	gDS.inputMap.fwd[2] = 255 - tmp;
	//gDS.inputMap.fwd[2] = tmp ˆ 255;
	tmp = tmp << 1;
	gDS.inputMap.rwd[1] = tmp;
	gDS.inputMap.rwd[2] = 255 - tmp;
	//gDS.inputMap.rwd[2] = tmp ˆ 255;
	tmp = tmp << 1;
	gDS.inputMap.lft[1] = tmp;
	gDS.inputMap.lft[2] = 255 - tmp;
	//gDS.inputMap.lft[2] = tmp ˆ 255;
	tmp = tmp << 1;
	gDS.inputMap.rgt[1] = tmp;
	gDS.inputMap.rgt[2] = 255 - tmp;
	tmp = tmp << 1;
	gDS.inputMap.fire[1] = tmp;
	gDS.inputMap.fire[2] = 255 - tmp;
	tmp = tmp << 1;
	gDS.inputMap.explFlg[1] = tmp;
	gDS.inputMap.explFlg[2] = 255 - tmp;
	//gDS.inputMap.rgt[2] = tmp ˆ 255;

	//// console.log("trigoMaps:");
	//// console.log("gDS.inputMap");

	//// console.log(gDS.inputMap);

	for(var i = -gDS.identifier.launcherRange; i <= gDS.identifier.launcherRange; ++i){
		gDS.rangeMap[i] = new Array();
		for(var j = -gDS.identifier.launcherRange; j <= gDS.identifier.launcherRange; ++j){
			gDS.rangeMap[i][j] = {};
			gDS.rangeMap[i][j].dist = parseFloat(Math.sqrt((i * i) + (j * j)).toFixed(3));
			gDS.rangeMap[i][j].angle = parseFloat((Math.atan2(i, j) * 180/Math.PI).toFixed(3));
		}
	}
	//// console.log(gDS.rangeMap);
};

gDS.getDistfromDelta = function(deltaXParam, deltazParam) {
    for(var i = -gDS.identifier.launcherRange; i <= gDS.identifier.launcherRange; ++i){
    	if(i>deltaXParam){
    		for(var j = -gDS.identifier.launcherRange; j <= gDS.identifier.launcherRange; ++j){
    			if(j>deltaZParam){
    				return gDS.rangeMap[i][j].dist;
    			}
    		}
    	}
	}
	return gDS.identifier.launcherRange * 2;
}

gDS.initConstDS();

/**
gDS.itemList[j].pos = gGameObject.missionMeshObj.meshArr[gDS.itemList[j].baseIndex].position;
        gDS.itemList[j].quat = gGameObject.missionMeshObj.meshArr[gDS.itemList[j].baseIndex].rotationQuaternion;
        gDS.itemList[j].quatCannon = gGameObject.missionMeshObj.meshArr[gDS.itemList[j].launcherIndex].rotationQuaternion;
        k = k + (j * 6);
        gDS.itemList[j].explPos = new BABYLON.Vector3( minfo[k+0], minfo[k+1], minfo[k+2]);
        minfo[k+3] = gDS.itemList[j].lfExplFlg;
        minfo[k+4] = gDS.itemList[j].aim;
        minfo[k+5] = gDS.itemList[j].action;
**/





