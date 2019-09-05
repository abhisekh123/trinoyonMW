//Grid convention : Ones are obstacles and zeroes are walkable
//console.log("ai worker first line@@@@@@@@");

var minGridLen = 1;
var minSpeed = 2;
var shootingRange = 10;
var reloadTime = 1500;



//functions not used for now

// setTimeout("AIWorkerMgr()",500);
// function AIWorkerMgr() {
//  setTimeout("AIWorkerMgr()",500);
//     //driveBot();
//     console.log("ai workerMgr");
// };

var gGameState = {};
var searchGraph = new Array();//this is a 2D array containing the maze details. 1 is obstacle. 0 is empty.
var baseUrl;
var boundarySize = 75;//area around each obstacle treated as empty area.
var mazeUnitSize = boundarySize/3;//lengthe og each grid unit

var finder;
var vehicleDetails = new Array();
var pathArray = new Array();
var carCount = 0;
var gridSize;

var searchGrid;


/////////////////////////---------------------------////////////////////////////
gGameObject = {};
gGameObject.baseUrl;
gGameObject.currentMissionJSON;
gGameObject.currMsnName;

gGameObject.groundSize;
gGameObject.world;
gGameObject.objBoundaryArray;
//gGameObject.itemCount = 0;
gGameObject.stageArr;

gGameObject.searchGraph = new Array();

gGameObject.userCarIndex = -1;


gGameObject.userKeyInput;
gGameObject.userMouseInput;

gGameObject.currentBotIndex = 0;

gGameObject.missionMeshObj = {};
gGameObject.missionMeshObj.groundMesh = "";
gGameObject.missionMeshObj.meshArr = [];
gGameObject.missionMeshObj.staticMeshArr = [];
gGameObject.redTargetMesh;
gGameObject.greenTargetMesh;
gGameObject.userCarIndex = -1;
gGameObject.stelliteObj = {};
gGameObject.stelliteObj.active = false;
gGameObject.spriteManager = null;

//alert("startWorkers->");
gGameObject.phRcvTimeStamp = 0;
gGameObject.aiRcvTimeStamp = 0;
gGameObject.phSendTime = 0
gGameObject.aiSendTime = 0
gGameObject.frameInterval = 1000/60;//in milli seconds
gGameObject.aiInterval = 1000/60;//in milli seconds

gGameObject.isRunning = false;
gGameObject.transObj = [];//transferrable object for physics
gGameObject.transObjAI = [];//transferrable object for AI

// gDS = {};
// gDS.fileData;

function standalone(){
    console.log('standalone');
}

function isPointInPoly(poly, pt)
{
    var i = 0;
    var j = 0;
    var c = false;
    for (i = 0, j = poly.length-1; i < poly.length; j = i++) {
    if ((((poly[i].z<=pt.z) && (pt.z<poly[j].z)) ||
         ((poly[j].z<=pt.z) && (pt.z<poly[i].z))) &&
        (pt.x < (poly[j].x - poly[i].x) * (pt.z - poly[i].z) / (poly[j].z - poly[i].z) + poly[i].x))
    
      c = !c;
    }
    return c;
};

function rotatePoly(poly, theta)
{
    for (var i = 0; i < poly.length;i++) {
        var x_new = poly[i].x*gDS.cosMap[theta] - poly[i].z*gDS.sinMap[theta];
        var z_new = poly[i].x*gDS.sinMap[theta] + poly[i].z*gDS.cosMap[theta];
        poly[i].x = x_new;
        poly[i].z = z_new;
    }
    return poly;
};

function rotatePoint(xParam, zParam, theta)
{
    var x_new = xParam*Math.cos(theta) - zParam*Math.sin(theta);
    var z_new = xParam*Math.sin(theta) + zParam*Math.cos(theta);
    // poly[i].x = x_new;
    // poly[i].z = z_new;

    return [x_new, z_new];
};

//method that initializes current mission
gGameObject.createGrid = function(){
    var msnItemArr = gGameObject.currentMissionJSON.items;
    var msnStageArr = gGameObject.currentMissionJSON.stages;

    //read ground size from item 0
    gGameObject.groundSize = msnItemArr[0].name * gDS.identifier.blockSize;
    console.log("ground size@ph:" + gGameObject.groundSize);
    gGameObject.objBoundaryArray = new Array();
    gDS.itemList.length = 0;
    gDS.staticItemList.length = 0;
    //initialize maze using grid size from const file
    //gGameObject.itemArr.length = 0;
    //gGameObject.itemCount = 0;


    //for each item in mission
    for(var i = 1,staticCount = 0; i < msnItemArr.length; ++i){//from 1 as 0th item is ambience detail
        if(msnItemArr[i].type == "NA"){
            continue;
        }

        if (gDS.iStaticTypList.indexOf(msnItemArr[i].type) > -1) {//static type items. handled seperately
            
            var baseCompEl = msnItemArr[i].complst[0];//get base component which is the 0th element

            if(baseCompEl.active == true){//base should be active. but still checking
                var compFileJSON = gDS.fileData[baseCompEl.cname];
                var length = compFileJSON[4].value;
                var width = compFileJSON[5].value;
                var height = compFileJSON[6].value;

                var itemPosParamArr = msnStageArr[0].actions[i].tparam.split(",");
                if(itemPosParamArr.length<3){
                    console.log("Error@AI@createGrid:no rotation for item:" + i);
                    itemPosParamArr[2] = 0;
                }
                for(var j = 0; j < itemPosParamArr.length; ++j){
                    itemPosParamArr[j] = parseFloat(itemPosParamArr[j]);
                }
                //add buffer from const file
                //get position and rotation from stage 0
                //create polygon
                //rotate polygon
                //save polygon in item array as item attribute

                var poly = new Array();
                // console.log(baseCompEl);
                // console.log(compFileJSON);
                // console.log("test112:" );
                // console.log(gDS.fileData);
                // console.log("test1:" + itemPosParamArr[0]);
                // console.log("test1:" + itemPosParamArr[1]);
                // console.log("test1:" + width/2);
                // console.log("test1:" + height/2);
                // console.log("test1:" + gDS.identifier.itemBoundaryBuff);
                poly[0] = {};
                poly[0].x = itemPosParamArr[0] - ((width/2) + gDS.identifier.itemBoundaryBuff);
                poly[0].z = itemPosParamArr[1] - ((height/2) + gDS.identifier.itemBoundaryBuff);


                poly[1] = {};
                poly[1].x = itemPosParamArr[0] - (width/2 + gDS.identifier.itemBoundaryBuff);
                poly[1].z = itemPosParamArr[1] + (height/2 + gDS.identifier.itemBoundaryBuff);
                console.log((height/2) + gDS.identifier.itemBoundaryBuff);
                console.log(poly[1]);

                poly[2] = {};
                poly[2].x = itemPosParamArr[0] + ((width/2) + gDS.identifier.itemBoundaryBuff);
                poly[2].z = itemPosParamArr[1] + ((height/2) + gDS.identifier.itemBoundaryBuff);
                console.log("-->");
                console.log(poly);

                poly[3] = {};
                poly[3].x = itemPosParamArr[0] + ((width/2) + gDS.identifier.itemBoundaryBuff);
                poly[3].z = itemPosParamArr[1] - ((height/2) + gDS.identifier.itemBoundaryBuff);
                // console.log("going to rotate poly");
                // console.log(poly);
                poly = rotatePoly(poly, itemPosParamArr[2]);
                // console.log(poly);
                msnItemArr[i].poly = poly;
                gGameObject.objBoundaryArray[gGameObject.objBoundaryArray.length] = poly;
            }else{
                console.log("Error:Base of item is not active. Item:" + i);
            }
            gDS.staticItemList[gDS.staticItemList.length] = {};
            gDS.staticItemList[gDS.staticItemList.length - 1].pos = {};
            gDS.staticItemList[gDS.staticItemList.length - 1].pos.x = itemPosParamArr[0];
            gDS.staticItemList[gDS.staticItemList.length - 1].pos.z = itemPosParamArr[1];
            gDS.staticItemList[gDS.staticItemList.length - 1].team = itemPosParamArr[3]||0;
            gDS.staticItemList[gDS.staticItemList.length - 1].life = gDS.staticLife;

            ++staticCount;
            continue;
        }

        gDS.itemList[gDS.itemList.length] = {};
        gDS.itemList[gDS.itemList.length - 1].type = msnItemArr[i].type;
        gDS.itemList[gDS.itemList.length - 1].pos = {};
        gDS.itemList[gDS.itemList.length - 1].quat = {};
        gDS.itemList[gDS.itemList.length - 1].quatCannon = {};
        gDS.itemList[gDS.itemList.length - 1].explPos = {};
        gDS.itemList[gDS.itemList.length - 1].targetPos = {};
        gDS.itemList[gDS.itemList.length - 1].aimAngle = 0;
        gDS.itemList[gDS.itemList.length - 1].aimAngleMax = 270;
        gDS.itemList[gDS.itemList.length - 1].aimAngleMin = 90;
        gDS.itemList[gDS.itemList.length - 1].action = 0;
        gDS.itemList[gDS.itemList.length - 1].team = msnStageArr[0].actions[i].tparam.split(",")[3]||0;
        // if(gDS.itemList.length==1){//first item ... user car
        //     gDS.userTeam = gDS.itemList[gDS.itemList.length - 1].team;
        // }
        gDS.itemList[gDS.itemList.length - 1].targetParam1 = -1;
        gDS.itemList[gDS.itemList.length - 1].targetParam2 = -1;
        gDS.itemList[gDS.itemList.length - 1].ItemAngleAngle = 0;
        gDS.itemList[gDS.itemList.length - 1].cannonAngle = 0;
        gDS.itemList[gDS.itemList.length - 1].reqdCannonAngle = 0;
        //gDS.itemList[gDS.itemList.length - 1].shotReady = true;
        gDS.itemList[gDS.itemList.length - 1].speed = {x:0,y:0,z:0};

        if(msnItemArr[i].type == "car" || msnItemArr[i].type == "tank"){//skip un initialized items and cars
            if(gGameObject.userCarIndex<0){//initialize user car index and the initial target pointer position
                gGameObject.userCarIndex = i - (1 + staticCount);
                gDS.userTeam = gDS.itemList[gDS.itemList.length - 1].team;
                var itemPosParamArr = msnStageArr[0].actions[i].tparam.split(",");
                itemPosParamArr[0] = parseFloat(itemPosParamArr[0]);
                itemPosParamArr[1] = parseFloat(itemPosParamArr[1]);
                if(itemPosParamArr.length<3){
                    console.log("Error@AI@createGrid:no rotation for item:" + i);
                    itemPosParamArr[2] = 0;
                }else{
                    itemPosParamArr[2] = parseFloat(itemPosParamArr[2]*Math.PI/180);
                }
                console.log("user rot"+itemPosParamArr[2]);
                console.log(itemPosParamArr);
                //var tmpDist = (gDS.minDist+gDS.maxDist)/2;

                //gDS.targetDist = 10;
                //gDS.targetAngle = 0;//radian
                gDS.targetX = 0;
                gDS.targetZ = gDS.targetDist;
                //console.log("user tmpDist"+tmpDist);
                var tmpArr = rotatePoint(gDS.targetX, gDS.targetZ, itemPosParamArr[2]);//now tmp dist stores array of rotated points
                console.log(tmpArr + "Arr");
                gDS.targetX = itemPosParamArr[0] + tmpArr[0];
                gDS.targetZ = itemPosParamArr[1] + tmpArr[1];
            }
            continue;
        }
        //if type = defence or buildings

        //get base size from component json
        var baseCompEl = msnItemArr[i].complst[0];//get base component which is the 0th element
        if(baseCompEl.active == true){//base should be active. but still checking
            var compFileJSON = gDS.fileData[baseCompEl.cname];
            var length = compFileJSON[4].value;
            var width = compFileJSON[5].value;
            var height = compFileJSON[6].value;

            var itemPosParamArr = msnStageArr[0].actions[i].tparam.split(",");
            if(itemPosParamArr.length<3){
                console.log("Error@AI@createGrid:no rotation for item:" + i);
                itemPosParamArr[2] = 0;
            }
            for(var j = 0; j < itemPosParamArr.length; ++j){
                itemPosParamArr[j] = parseFloat(itemPosParamArr[j]);
            }
            //add buffer from const file
            //get position and rotation from stage 0
            //create polygon
            //rotate polygon
            //save polygon in item array as item attribute

            var poly = new Array();
            // console.log(baseCompEl);
            // console.log(compFileJSON);
            // console.log("test112:" );
            // console.log(gDS.fileData);
            // console.log("test1:" + itemPosParamArr[0]);
            // console.log("test1:" + itemPosParamArr[1]);
            // console.log("test1:" + width/2);
            // console.log("test1:" + height/2);
            // console.log("test1:" + gDS.identifier.itemBoundaryBuff);
            poly[0] = {};
            poly[0].x = itemPosParamArr[0] - ((width/2) + gDS.identifier.itemBoundaryBuff);
            poly[0].z = itemPosParamArr[1] - ((height/2) + gDS.identifier.itemBoundaryBuff);


            poly[1] = {};
            poly[1].x = itemPosParamArr[0] - (width/2 + gDS.identifier.itemBoundaryBuff);
            poly[1].z = itemPosParamArr[1] + (height/2 + gDS.identifier.itemBoundaryBuff);
            console.log((height/2) + gDS.identifier.itemBoundaryBuff);
            console.log(poly[1]);

            poly[2] = {};
            poly[2].x = itemPosParamArr[0] + ((width/2) + gDS.identifier.itemBoundaryBuff);
            poly[2].z = itemPosParamArr[1] + ((height/2) + gDS.identifier.itemBoundaryBuff);
            console.log("-->");
            console.log(poly);

            poly[3] = {};
            poly[3].x = itemPosParamArr[0] + ((width/2) + gDS.identifier.itemBoundaryBuff);
            poly[3].z = itemPosParamArr[1] - ((height/2) + gDS.identifier.itemBoundaryBuff);
            // console.log("going to rotate poly");
            // console.log(poly);
            poly = rotatePoly(poly, itemPosParamArr[2]);
            // console.log(poly);
            msnItemArr[i].poly = poly;
            gGameObject.objBoundaryArray[gGameObject.objBoundaryArray.length] = poly;
        }else{
            console.log("Error:Base of item is not active. Item:" + i);
        }
    }
    
    //gGameObject.itemArr = msnItemArr;
    console.log("msnItemArr:");
    console.log(msnItemArr);

    var maze = {};
    maze.groundSize = gGameObject.groundSize;
    var pointInPolyFlag;
    var mazePoint = {};

    /*xPos = (0 - (gridSize/2)) + mazeUnitSize;//x axis co ordinate
    zPos = (0 - (gridSize/2)) + mazeUnitSize;//z axis coordinate*/
    var xPos = (0 - (gGameObject.groundSize/2)) + (gDS.identifier.blockSize/2);//x axis co ordinate
    var zPos = (0 - (gGameObject.groundSize/2)) + (gDS.identifier.blockSize/2);//z axis coordinate
    var row, col;
    maze.graph = new Array();
    k = 0;
    for(row = 0; zPos <= (gGameObject.groundSize/2); ++row, zPos+=gDS.identifier.blockSize){//z coordinate.
        gGameObject.searchGraph[row] = new Array();
        for(col = 0; xPos <= (gGameObject.groundSize/2); ++col,xPos+=gDS.identifier.blockSize){//x co ordinate.
            mazePoint.x = xPos;
            mazePoint.z = zPos;
            //console.log("checking for point:");
            //console.log(mazePoint);
            pointInPolyFlag = false;
            //for(l = 0; l < grid.length && pointInPolyFlag == false; ++l){

            //setting the default value for grid. To handle situation for empty graph.
            maze.graph[k] = 0;
            gGameObject.searchGraph[row][col] = 0;
            for(var i = 1; i < msnItemArr.length && pointInPolyFlag == false; ++i){//from 1 as 0th item is ambience detail
                if('poly' in msnItemArr[i]){
                    //console.log("msnItemArr index:" + i);
                    pointInPolyFlag = isPointInPoly(msnItemArr[i].poly,mazePoint);
                    //console.log("msnItemArr flag:" + pointInPolyFlag);
                    //console.log(mazePoint);
                    if(pointInPolyFlag==true){//obstacle
                        maze.graph[k] = 1;
                        gGameObject.searchGraph[row][col] = 1;
                        //console.log("msnItemArr flag:" + pointInPolyFlag);
                        //console.log(mazePoint);
                    }
                }
                
                /**if((mazePoint.x<100)&&(mazePoint.x>-100)&&(mazePoint.z<100)&&(mazePoint.z>-100)){
                    console.log("checking for:" + JSON.stringify(objBoundaryArray[l]) + " ADN " + JSON.stringify(mazePoint));
                    console.log("result:" + pointInPolyFlag);
                }**/
            }
            
            ++k;
        }
        xPos = (0 - (gGameObject.groundSize/2)) + (gDS.identifier.blockSize/2);
    }
    maze.columns = col;
    maze.blockSize = gDS.identifier.blockSize;
    //Grid(col,row,grid)
    searchGrid = new PF.Grid(gGameObject.searchGraph[0].length,gGameObject.searchGraph.length,gGameObject.searchGraph);
    finder = new PF.AStarFinder({//finder is being initialized with current grid
        allowDiagonal: true,
        dontCrossCorners: true
    });
    
    gGameObject.maze = maze;
    
    
    //gor each grid .. check if inside polygon and update maze

    //parse grid
    //create debug data and msg main
};


gGameObject.terminateMission = function(){
    self.postMessage({ack:"init"});
};

gGameObject.startMission = function(){
    //gGameObject.terminateMission();
    gGameObject.createGrid();
    gGameObject.currentBotIndex = 0;
    //setTimeout("botActionMgr()",500);
    self.postMessage({aiDebug:gGameObject.objBoundaryArray,aiDebugMaze:gGameObject.maze, ack:"init"});
};

gGameObject.initWorker = function(){
    console.log("initAIWorker....");
    //importScripts('../lib/Oimo.js','../util.js','../models/car.js','../../assets/config/initWorld.js');
    //importScripts('../js/lib/Oimo.js');
    //importScripts(gGameObject.baseUrl + '/mw_editor/js/lib/pathfinding.js');
    importScripts(gGameObject.baseUrl + '/js/lib/pathfinding.js');
    importScripts(gGameObject.baseUrl + '/js/constants.js');
    //importScripts(gGameObject.baseUrl + '/mw_editor/js/aiWorkerBot.js');


    gGameObject.transObj = new Float32Array(gDS.identifier.msnItemMaxCount * gDS.identifier.msnItemCompMaxCount * 8);
    self.postMessage({minfo:gGameObject.transObj }, [gGameObject.transObj.buffer]);
};

gGameObject.processConfig = function(configParam){
    switch(configParam.type){
        case "starmission":
            //alert("starmission");
            console.log('AI:url in worldConfig : init');
            console.log(configParam.fileData);
            //urlConfig.type = "starmission";
            
            gGameObject.currMsnName = configParam.currMsnFile;
            gDS.fileData = configParam.fileData;
            gGameObject.currentMissionJSON = gDS.fileData[gGameObject.currMsnName];
            console.log(gGameObject.currentMissionJSON);
            //gGameObject.compCount = configParam.data.length - 1;
            gGameObject.startMission();
            return;
            break;
        case "terminate":
            gGameObject.terminateMission();
            console.log('AI:url in worldConfig : terminateMission');
            return;
            break;
        case "init":
            //alert("sdv");
            console.log('url in worldConfig : init');
            gGameObject.baseUrl = configParam.url;
            gGameObject.initWorker();
            return;
            break;
        default:
            break;
    }
};

self.onmessage = function(e) {
    var i;
    //console.log("onmessage:")
    if('worldConfig' in e.data){
        //sceneFixedObj
        console.log("worldConfig@ph@onmessage");
        //initPHWorld(e.data.worldConfig);
        gGameObject.processConfig(e.data.worldConfig);
        return;
    }
    gGameObject.transObj = e.data.minfo;

    gGameObject.userKeyInput = gGameObject.transObj[0];
    //gGameObject.mouseDeltaX = gGameObject.transObj[1];
    gGameObject.userCarIndex = gGameObject.transObj[1];
    //console.log("@gGameObject.currentBotIndex:" + gGameObject.userCarIndex);
    gGameObject.mouseDeltaZ = gGameObject.transObj[2];


    for(var j = 0, k = 3; j < gDS.itemList.length; ++j){
        //k = k + (j * 17);
        // gDS.itemList[j].pos = gGameObject.missionMeshObj.meshArr[gDS.itemList[j].baseIndex].position;
        if('pos' in gDS.itemList[j]){        
            gDS.itemList[j].pos.x = gGameObject.transObj[k];
            gDS.itemList[j].pos.y = gGameObject.transObj[k+1];
            gDS.itemList[j].pos.z = gGameObject.transObj[k+2];
        }

        k += 3;
        // gDS.itemList[j].quat = gGameObject.missionMeshObj.meshArr[gDS.itemList[j].baseIndex].rotationQuaternion;
        if('quat' in gDS.itemList[j]){
            gDS.itemList[j].quat.x = gGameObject.transObj[k];
            gDS.itemList[j].quat.y = gGameObject.transObj[k + 1];
            gDS.itemList[j].quat.z = gGameObject.transObj[k + 2];
            gDS.itemList[j].quat.w = gGameObject.transObj[k + 3];
        }

        k += 4;
        // gDS.itemList[j].quatCannon = gGameObject.missionMeshObj.meshArr[gDS.itemList[j].launcherIndex].rotationQuaternion;
        if('quatCannon' in gDS.itemList[j]){
            gDS.itemList[j].quatCannon.x = gGameObject.transObj[k];
            gDS.itemList[j].quatCannon.y = gGameObject.transObj[k + 1];
            gDS.itemList[j].quatCannon.z = gGameObject.transObj[k + 2];
            gDS.itemList[j].quatCannon.w = gGameObject.transObj[k + 3];
        }

        k += 4;
        // k = k + (j * 6);
        // gDS.itemList[j].explPos = new BABYLON.Vector3( minfo[k+0], minfo[k+1], minfo[k+2]);
        if('explPos' in gDS.itemList[j]){
            gDS.itemList[j].explPos.x = gGameObject.transObj[k];
            gDS.itemList[j].explPos.y = gGameObject.transObj[k+1];
            gDS.itemList[j].explPos.z = gGameObject.transObj[k+2];
        }

        k += 3;
        // minfo[k] = gDS.itemList[j].lfExplFlg;
        // minfo[k+1] = gDS.itemList[j].aim;
        gDS.itemList[j].targetParam1 = gGameObject.transObj[k];
        gDS.itemList[j].targetParam2 = gGameObject.transObj[k+1];
        gGameObject.transObj[k] = gDS.itemList[j].lfExplFlg;
        //gGameObject.transObj[k+1] = gDS.itemList[j].aimAngle;
        gGameObject.transObj[k+1] = gDS.itemList[j].cannonAngle;

        // if(gDS.itemList[j].targetParam1>0){
        //     if(gDS.itemList[j].targetParam2>0){
        //         console.log("aaaaaa:" + j);
        //     }
        // }

        //if(j == gGameObject.userCarIndex){
        // if(j == gGameObject.userCarIndex){
        //     console.log("user to aim:" + gGameObject.transObj[k+1]);
        // }
        //console.log("angle::" + gDS.itemList[j].aimAngle);
        gDS.itemList[j].life = gGameObject.transObj[k+2];
        gGameObject.transObj[k+2] = gDS.itemList[j].action;
        //console.log("ai:" + gDS.itemList[j].life);

        k += 3;

        gDS.itemList[j].speed.x = gGameObject.transObj[k];
        gDS.itemList[j].speed.y = gGameObject.transObj[k+1];
        gDS.itemList[j].speed.z = gGameObject.transObj[k+2];

        k += 3;

        //front wheel rear wheel delta
        gDS.itemList[j].deltaX = gGameObject.transObj[k];
        gDS.itemList[j].deltaZ = gGameObject.transObj[k+1];
        //console.log("AI::j:" + j + " X:" + gDS.itemList[j].deltaX + " z:" + gDS.itemList[j].deltaZ);


        k += 2;

        //cannon delta
        //gDS.itemList[j].deltaXCannon = gGameObject.transObj[k];
        gDS.itemList[j].deltaXCannon = 0;
        gDS.itemList[j].targetFollowFlag = gGameObject.transObj[k];
        gDS.itemList[j].deltaZCannon = gGameObject.transObj[k+1];
        //console.log("AI::j:" + j + " X:" + gDS.itemList[j].deltaX + " z:" + gDS.itemList[j].deltaZ);


        k += 2;
    }

    
    //validate game state and do stage transition
    //process all items and update action
    gGameObject.itemActionMgr();

    // gDS.targetX = 0;
    // gDS.targetZ = 0;
    // gDS.targetFlag = true;

    gGameObject.transObj[0] = gDS.targetFlag;
    gGameObject.transObj[1] = gDS.targetX;
    gGameObject.transObj[2] = gDS.targetZ;

    for(var j = 0, k = 3; j < gDS.itemList.length; ++j){
        

        k += 3;
        

        k += 4;
        

        k += 4;
        // k = k + (j * 6);
        // gDS.itemList[j].explPos = new BABYLON.Vector3( minfo[k+0], minfo[k+1], minfo[k+2]);
        if('explPos' in gDS.itemList[j]){
            
            gGameObject.transObj[k] = gDS.itemList[j].explPos.x;
            gGameObject.transObj[k+1] = gDS.itemList[j].explPos.y;
            gGameObject.transObj[k+2] = gDS.itemList[j].explPos.z;
        }

        k += 3;
        

        k += 3;

        

        k += 3;

        

        k += 2;

       

        k += 2;
    }

    //console.log(gGameObject.transObj[1] + ":" + gGameObject.transObj[2] + ":" + gGameObject.transObj[0]);
    
    //self.postMessage({aiDebug:objBoundaryArray,aiDebugMaze:maze});
    // Send data back to the main thread
    //self.postMessage({ perf:fps, minfo:minfo }, [minfo.buffer]);
    
    self.postMessage({minfo:gGameObject.transObj }, [gGameObject.transObj.buffer]);
    
};



function getRotationQuatrant(deltaX,deltaZ){
    var targetRotation = 0;
    var deltaXAbs = Math.abs(deltaX);
    var deltaZAbs = Math.abs(deltaZ);


    if(deltaZ>0){
        if(deltaX>0){
            if(deltaZAbs>deltaXAbs){//1 - 22
                //console.log("bot:" + "-> 1");
                targetRotation = 20;
            }else{//2 - 67
                //console.log("bot:" + "-> 2");
                targetRotation = 66;
            }
        }
        else{
            if(deltaZAbs>deltaXAbs){//8 - 337
                //console.log("bot:" + "-> 8");
                targetRotation = 341;
            }else{//7 - 292
                //console.log("bot:" + "-> 7");
                targetRotation = 295;
            }
        }
    }else{//deltaRow > 0
        if(deltaX>0){
            if(deltaZAbs>deltaXAbs){//4 - 157
                //console.log("bot:" + "-> 4");
                targetRotation = 156;
            }else{//3 - 112
                //console.log("bot:" + "-> 3");
                targetRotation = 111;
            }
        }
        else{
            if(deltaZAbs>deltaXAbs){//5 - 202
                //console.log("bot:" + "-> 5");
                targetRotation = 203;
            }else{//6 - 247
                //console.log("bot:" + "-> 6");
                targetRotation = 249;
            }
        }
    }

    return targetRotation;
}

function findContainingGrid(xParam,zParam){
    //gGameObject.groundSize
    //gDS.identifier.blockSize
    
    var pos = {};
    var x_new = (0 - (gGameObject.groundSize/2)) + gDS.identifier.blockSize;//x axis co ordinate
    var z_new = (0 - (gGameObject.groundSize/2)) + gDS.identifier.blockSize;//z axis coordinate
    //console.log(x_new);
    //iterate through the grid
    for(pos.row = 0;z_new < (gGameObject.groundSize/2);++pos.row, z_new+=gDS.identifier.blockSize){
        if(z_new>zParam){
            break;
        }
    }
    for(pos.col = 0;x_new < (gGameObject.groundSize/2);++pos.col, x_new+=gDS.identifier.blockSize){
        if(x_new>xParam){
            break;
        }
    }
    return pos;
};



function findNextBreadCrumb(sourceItem, targetItem){
    

    var userVehicleItem = targetItem;
    var curVehicleItem = sourceItem;
    curVehicleItem.action = 0;
    //curVehicleItem.action = curVehicleItem.action | gDS.inputMap.fire[1];
    //var targetPos, selfPos;
    userVehicleItem.grid = findContainingGrid(userVehicleItem.pos.x, userVehicleItem.pos.z);
    curVehicleItem.grid = findContainingGrid(curVehicleItem.pos.x, curVehicleItem.pos.z);
    //console.log(searchGrid);
    //console.log(userVehicleItem.grid);
    //console.log(curVehicleItem.grid);
    //testPathFinder();
    var gridBackup = searchGrid.clone();

    curVehicleItem.path = finder.findPath(curVehicleItem.grid.col, curVehicleItem.grid.row, userVehicleItem.grid.col, userVehicleItem.grid.row, gridBackup);
    curVehicleItem.pathIndex = 1;
    
    //console.log(curVehicleItem.path);
    //console.log(pathArray[i-1].path);
    if(curVehicleItem.path.length>0){
        gridBackup = searchGrid.clone();
        var newPath = PF.Util.smoothenPath(gridBackup, curVehicleItem.path);
        //console.log("newPath->" + i);
        //console.log(newPath);
        curVehicleItem.path = newPath;
    }
    //console.log(curVehicleItem.path);
    //var botDriveInstruction = new Array();
    
    var i, deltaRow,deltaRowAbs,deltaCol,deltaColAbs,targetRotation,deltaX,deltaZ,botRot,targetRot,deltaRot;
    //for(i=1;i<vehicleDetails.length;++i){
    //console.log("driveBot:" + i);
    //botDriveInstruction[i - 1] = {};
    deltaCol = userVehicleItem.grid.col - curVehicleItem.grid.col;
    deltaColAbs = Math.abs(deltaCol);
    deltaRow = userVehicleItem.grid.row - curVehicleItem.grid.row;
    deltaRowAbs = Math.abs(deltaRow);
    /**
    deltaX = vehicleDetails[0].posX - vehicleDetails[i].posX;
    
    deltaZ = vehicleDetails[0].posZ - vehicleDetails[i].posZ;
    **/
    //get approximate distance and decide current destination.
    //bot grid
    //target grid
    //if close to target ... get new target
    if(deltaColAbs<minGridLen && deltaRowAbs<minGridLen){
        if(curVehicleItem.pathIndex < (curVehicleItem.path.length - 1)){
            //console.log("updating pathIndex");
            curVehicleItem.pathIndex++;
        }
    }
    var pathIndexTmp = curVehicleItem.pathIndex;
    //console.log("--->driveBot number:" + i + "->pathIndex:" + pathIndexTmp);
    //console.log("current target : Col(x):" + pathArray[i-1].path[pathIndexTmp][0] + " Row(z):" + pathArray[i-1].path[pathIndexTmp][1]);
    var currentTargetX = 0;
    var currentTargetZ = 0;
    if(curVehicleItem.path.length>0){
        currentTargetX = (0 - (gGameObject.groundSize/2)) + (curVehicleItem.path[pathIndexTmp][0] * gDS.identifier.blockSize) + gDS.identifier.blockSize/2;
        currentTargetZ = (0 - (gGameObject.groundSize/2)) + (curVehicleItem.path[pathIndexTmp][1] * gDS.identifier.blockSize) + gDS.identifier.blockSize/2;
    }else{
        currentTargetX = userVehicleItem.pos.x;
        currentTargetZ = userVehicleItem.pos.z;
    }

    let retJSON = {};
    retJSON.pos = {};
    retJSON.pos.x = currentTargetX;
    retJSON.pos.z = currentTargetZ;

    return retJSON;

};


//setTimeout("AIWorkerMgr()",500);
//set drive instruction for the bots
gGameObject.itemActionMgr = function() {
    //setTimeout("botActionMgr()",500);

    gGameObject.scanItemList();
    
    //var userVehicleItem = gDS.itemList[gGameObject.userCarIndex];

    for (gGameObject.currentBotIndex = 0; gGameObject.currentBotIndex < gDS.itemList.length; gGameObject.currentBotIndex++) {
        gDS.itemList[gGameObject.currentBotIndex].lfExplFlg = 0;
        gDS.itemList[gGameObject.currentBotIndex].aimAngle = 0;
        gDS.itemList[gGameObject.currentBotIndex].action = 0;

        if(gDS.itemList[gGameObject.currentBotIndex].life < 0){
            continue;
        }else{
            var currentItem = gDS.itemList[gGameObject.currentBotIndex];
            switch(currentItem.type){
                case "car":
                    //console.log("gGameObject.userCarIndex:" + gGameObject.userCarIndex);
                    // driveBot(gGameObject.currentBotIndex);
                    // aimBot(gGameObject.currentBotIndex);
                    if(gGameObject.currentBotIndex == gGameObject.userCarIndex){//process user vehicle
                        //++gGameObject.currentBotIndex;
                        //console.log("gGameObject.userKeyInput:" + gGameObject.userKeyInput);
                        gGameObject.manageUserBot(gGameObject.currentBotIndex);
                    }else{
                        gGameObject.manageBot(gGameObject.currentBotIndex);
                    }
                    
                    break;
                case "defend":
                    //aimBot(gGameObject.currentBotIndex);
                    // manageDefend();
                    gGameObject.manageDefendBot(gGameObject.currentBotIndex);
                    break;
                default:
                    console.log("ERROR: unknown type for botActionMgr:" + currentItem.type);
                    break;
            }
        }
        
    };
    
    
    return;
};
/*
gDS.itemConfig.car = {
    "range":100,
    "shootrange":30
};
*/

gGameObject.manageUserBot = function(currentIndexParam){
    // console.log("manageUserBot");
    var userCar = gDS.itemList[currentIndexParam];
    userCar.action = gGameObject.userKeyInput;
    // console.log("manageUserBot:" + userCar.action);

    userCar.targetParam1 = -1;
    userCar.targetParam2 = -1;

    var targetVehicle = gGameObject.getNextTarget(currentIndexParam);
    //console.log(targetVehicle);
    
    if(targetVehicle==null){
        //no target ... no action
        userCar.action = userCar.action & gDS.inputMap.fire[2];
        // console.log("manageUserBot-:" + userCar.action);
    }else{
        //shoot
        userCar.explPos.x = targetVehicle.pos.x;
        userCar.explPos.y = 0;
        userCar.explPos.z = targetVehicle.pos.z;

        //set target pointer
        gDS.targetX = userCar.explPos.x;
        gDS.targetZ = userCar.explPos.z;
        gGameObject.shoot(currentIndexParam);
    }
};


gGameObject.manageDefendBot = function(currentIndexParam){
    var defendItem = gDS.itemList[currentIndexParam];
    // return;
    var targetVehicle = gGameObject.getNextTarget(currentIndexParam);
    
    if(targetVehicle==null){
        //no target ... no action
        defendItem.action = defendItem.action & gDS.inputMap.fire[2];
    }else{
        //shoot
        defendItem.explPos.x = targetVehicle.pos.x;
        defendItem.explPos.y = 0;
        defendItem.explPos.z = targetVehicle.pos.z;

        //set target pointer
        gDS.targetX = defendItem.explPos.x;
        gDS.targetZ = defendItem.explPos.z;
        gGameObject.shoot(currentIndexParam);
    }
};

gGameObject.shoot = function(currentIndexParam){

    var curItem = gDS.itemList[currentIndexParam];
    // if(currentIndexParam == 1){
    //     console.log("shoot:" + currentIndexParam + " curItem.cannonAngle:" + curItem.cannonAngle + " curItem.reqdCannonAngle:" + curItem.reqdCannonAngle);
    // }

    // if(currentIndexParam == 1){
    //     console.log("ca:" + curItem.cannonAngle + "rca:" + curItem.reqdCannonAngle + " d:" + Math.abs(curItem.cannonAngle + curItem.reqdCannonAngle));
    //     console.log(gDS.aimDeltaAngle);
    // }
    
    //get req angle
    var reqdAngle = curItem.reqdCannonAngle;
    //get cur angle
    //var cannonAngle = Math.atan2(curVehicleItem.deltaXCannon, curVehicleItem.deltaZCannon);


    if(Math.abs(curItem.cannonAngle + curItem.reqdCannonAngle)<gDS.aimDeltaAngle){
        //fire
        // console.log("##shoot:" + currentIndexParam);
        curItem.action = curItem.action | gDS.inputMap.fire[1];
        //console.log("fire bot");
    }else{
        // console.log("dont fire bot:" + curItem.cannonAngle + " reqCanAngle:" + curItem.reqdCannonAngle);
        for(var tmpRot = gDS.minAngle; tmpRot < gDS.maxAngle; tmpRot += 15*Math.PI/180){
            if(tmpRot > reqdAngle){
                curItem.aimAngle = -tmpRot;
                break;
            }
        }
        //dont fire
        curItem.action = curItem.action & gDS.inputMap.fire[2];
        gGameObject.rotateCannon(currentIndexParam);
    }
    
};

gGameObject.rotateCannon = function(currentIndexParam){
    var curItem = gDS.itemList[currentIndexParam];
    if(curItem.aimAngle < curItem.cannonAngle){
        curItem.cannonAngle = curItem.cannonAngle - 0.1*Math.PI/180;
    }else{
        curItem.cannonAngle = curItem.cannonAngle + 0.1*Math.PI/180;
    }
}

gGameObject.manageBot = function(currentIndexParam){
    // console.log("manageBot");

    var curVehicleItem = gDS.itemList[currentIndexParam];
    //console.log("1:" + curVehicleItem.targetParam1 + " 2:" + curVehicleItem.targetParam2 + " itemIndex:" + currentIndexParam);
    // gDS.itemList[gDS.itemList.length - 1].targetParam1 = -1;
    // gDS.itemList[gDS.itemList.length - 1].targetParam2 = -1;


    if(curVehicleItem.targetFollowFlag == gDS.botFlag.autonomousBot){
        gGameObject.manageAutonomusBot(currentIndexParam);
    }else if(curVehicleItem.targetFollowFlag == gDS.botFlag.guardBot){
        gGameObject.manageGuardBot(currentIndexParam);
    }else if(curVehicleItem.targetFollowFlag == gDS.botFlag.followBot){
        gGameObject.manageFollowBot(currentIndexParam);
    }else{
        console.log("Error:unknown flag value:" + curVehicleItem.targetFollowFlag + " for bot index:" + currentIndexParam);
    }
    
};

gGameObject.manageAutonomusBot = function(currentIndexParam){
    // return;
    // console.log("gGameObject.manageAutonomusBot:" + currentIndexParam);
    var curVehicleItem = gDS.itemList[currentIndexParam];
    var itemConfig = gDS.itemConfig[curVehicleItem.type];
    var targetIndex = gGameObject.scanRegion(curVehicleItem.pos.x, curVehicleItem.pos.z, 
        itemConfig.range, curVehicleItem.type, curVehicleItem.team);
    //scan self position region
    //if target found
    if(targetIndex!=null){
        gGameObject.engageTarget(targetIndex, currentIndexParam);
    }
    //engage
};

gGameObject.manageGuardBot = function(currentIndexParam){
    var curVehicleItem = gDS.itemList[currentIndexParam];
    var posXParam = curVehicleItem.targetParam1;
    var posZParam = curVehicleItem.targetParam2;

    //console.log("gGameObject.manageGuardBot:" + posXParam + "::" + posZParam);
    
    var itemConfig = gDS.itemConfig[curVehicleItem.type];
    //scan target position region
    var targetIndex = gGameObject.scanRegion(posXParam, posZParam, 
        itemConfig.range, curVehicleItem.type, curVehicleItem.team);
    //if target found
    //engage
    if(targetIndex!=null){
        gGameObject.engageTarget(targetIndex, currentIndexParam);
    }else{
        var tmpTargetPositionJSON = {};
        tmpTargetPositionJSON.pos = {};
        tmpTargetPositionJSON.pos.x = posXParam;
        tmpTargetPositionJSON.pos.z = posZParam;
        gGameObject.driveBot(curVehicleItem, tmpTargetPositionJSON);
    }
};

gGameObject.manageFollowBot = function(currentIndexParam){
    var curVehicleItem = gDS.itemList[currentIndexParam];
    var parentIndex = curVehicleItem.targetParam1;
    console.log("gGameObject.manageFollowBot:" + parentIndex);
    var itemConfig = gDS.itemConfig[curVehicleItem.type];
    var targetItem = gDS.itemList[parentIndex];
    //console.log("gGameObject.manageFollowBot:" + targetItem.pos.x + "::" + targetItem.pos.z);
    //scan parent position region
    var targetIndex = gGameObject.scanRegion(targetItem.pos.x, targetItem.pos.z, 
        itemConfig.range, curVehicleItem.type, curVehicleItem.team);
    //if target found
    //engage
    if(targetIndex!=null){
        gGameObject.engageTarget(targetIndex, currentIndexParam);
    }
};

gGameObject.engageTarget = function(targetIndex, selfIndex){
    // console.log("gGameObject.engageTarget:" + selfIndex);
    var curItem = gDS.itemList[selfIndex];
    var itemConfig = gDS.itemConfig[curItem.type];
    var targetItem = gDS.itemList[targetIndex];
    //get distance.
    var deltaX = targetItem.pos.x - curItem.pos.x;
    var deltaZ = targetItem.pos.z - curItem.pos.z;
    var dist = Math.sqrt((deltaX * deltaX) + (deltaZ * deltaZ));
    //if in shooting range
    var aimAngleNeeded = gGameObject.getAimAngleNeeded(selfIndex, targetItem.pos.x, targetItem.pos.z);

    // if(selfIndex==1){
    //     console.log("item:" + selfIndex + " aimAngleNeeded:" + aimAngleNeeded);
    // }

    var reqdCannonAngleAbs = Math.abs(aimAngleNeeded);
    curItem.reqdCannonAngle = aimAngleNeeded;


    //console.log("within range with angle:" + reqdCannonAngle);
    if(reqdCannonAngleAbs<=gDS.maxAngle && dist < itemConfig.shootrange){
        //shoot
        // console.log("shoot : " + selfIndex);
                //shoot
        curItem.explPos.x = targetItem.pos.x;
        curItem.explPos.y = 0;
        curItem.explPos.z = targetItem.pos.z;

        gGameObject.shoot(selfIndex);
    }else{
        //else
        //drive
        // console.log("drive");
        
        gGameObject.driveBot(curItem, targetItem);
    }
};

gGameObject.scanItemList = function(){

    for (var i = 0; i < gDS.itemList.length; i++) {
        var curVehicleItem = gDS.itemList[i];
        if(curVehicleItem.life<0){
            continue;
        }else{
            curVehicleItem.ItemAngle = Math.atan2(curVehicleItem.deltaX, curVehicleItem.deltaZ);;
            //curVehicleItem.cannonAngle = Math.atan2(curVehicleItem.deltaXCannon, curVehicleItem.deltaZCannon);
        }
    }
};

/*
gDS.itemConfig.car = {
    "range":100,
    "shootrange":30
};
*/

//for user vehicle and defence ... return item in renge with min angle
gGameObject.getNextTarget = function(currentIndexParam){

    var currentItem = gDS.itemList[currentIndexParam];
    var itemConfig = gDS.itemConfig[currentItem.type];
    var selfTeam = gDS.itemList[currentIndexParam].team;
    var reqdCannonAngleForTarget = 270;
    var retTargetAngle = null;
    var targetItem = null;
    var targetItemRet = null;

    for (var i = 0; i < gDS.itemList.length; i++) {
        //find target
        if(i == currentIndexParam || gDS.itemList[i].team==selfTeam){
            continue;
        }
        targetItem = gDS.itemList[i];
        if(targetItem.life < 0){
            continue;
        }

        var deltaX = targetItem.pos.x - currentItem.pos.x;
        var deltaZ = targetItem.pos.z - currentItem.pos.z;
        //console.log("testing for : " + i + " deltaX:" + deltaX + " deltaZ:" + deltaZ);

        // if(secondaryDist > (deltaX + deltaZ)){
        //     secondaryDist = (deltaX + deltaZ);
        //     secondaryTarget = targetItem;
        // }

        //if target in range
        if(Math.abs(deltaX)<itemConfig.shootrange){
            if(Math.abs(deltaZ)<itemConfig.shootrange){

                dist = Math.sqrt((deltaX * deltaX) + (deltaZ * deltaZ));
                //console.log("may be shoot?" + dist);
                if(dist<itemConfig.shootrange){

                    var reqdCannonAngle = gGameObject.getAimAngleNeeded(currentIndexParam, targetItem.pos.x, targetItem.pos.z);
                    

                    var reqdCannonAngleAbs = Math.abs(reqdCannonAngle);
                    //console.log("within range with angle:" + reqdCannonAngle);
                    if(reqdCannonAngleAbs<=gDS.maxAngle && reqdCannonAngleAbs<reqdCannonAngleForTarget){
                        targetItemRet = targetItem;
                        reqdCannonAngleForTarget = reqdCannonAngleAbs;
                        currentItem.reqdCannonAngle = reqdCannonAngle;
                    }
                }
                //break;
            }
        }
    }
    return targetItemRet;
};

gGameObject.scanRegion = function(posX, posZ, range, type, selfTeam){
    var minDist = range * 10;
    var targetIndex = null;
    //for all items
    //if alive and not in team
    //if in box
    //get dist.
    //if dist < min dist
    //closet = cur index

    //return cur index
    //get target vehicle
    //iterate threough defend and other vehicles
    for (var i = 0; i < gDS.itemList.length; i++) {
        //find target
        if(gDS.itemList[i].team==selfTeam){
            continue;
        }
        targetVehicle = gDS.itemList[i];
        if(targetVehicle.life < 0){
            continue;
        }

        var deltaX = targetVehicle.pos.x - posX;
        var deltaZ = targetVehicle.pos.z - posZ;

        // if(secondaryDist > (deltaX + deltaZ)){
        //     secondaryDist = (deltaX + deltaZ);
        //     secondaryTarget = targetVehicle;
        // }

        //if target in range
        if(Math.abs(deltaX)<range){
            if(Math.abs(deltaZ)<range){
                dist = Math.sqrt((deltaX * deltaX) + (deltaZ * deltaZ));
                if(dist<range){
                    if(dist < minDist){
                        minDist = dist;
                        secondaryTarget = targetVehicle;
                        targetIndex = i;
                    }
                }
            }
        }
    }

    return targetIndex;
};

gGameObject.driveBot = function(curVehicleItem, targetItem){
    //get path
    var breadCrumb = findNextBreadCrumb(curVehicleItem, targetItem);

    var targetAngle = Math.atan2((breadCrumb.pos.x - curVehicleItem.pos.x), (breadCrumb.pos.z - curVehicleItem.pos.z));
    var reqCanAngle = targetAngle - curVehicleItem.ItemAngle;

    curVehicleItem.aimAngle = 0;
    curVehicleItem.action = curVehicleItem.action & gDS.inputMap.fire[2];
    // console.log(defAngle);
    // var targetPosRelative = rotatePoint(userVehicleItem.pos.x, userVehicleItem.pos.z, -defAngle);
    //var relAngle = Math.atan2(targetPosRelative[0], targetPosRelative[1]);
    //console.log(reqCanAngle);
    
    if(reqCanAngle<0){
        if(reqCanAngle<gDS.minAngle){
            //console.log("rgt");
            curVehicleItem.action = curVehicleItem.action & gDS.inputMap.fwd[2];
            curVehicleItem.action = curVehicleItem.action & gDS.inputMap.lft[2];

            curVehicleItem.action = curVehicleItem.action | gDS.inputMap.rwd[1];
            curVehicleItem.action = curVehicleItem.action | gDS.inputMap.rgt[1];
        }else{

            curVehicleItem.action = curVehicleItem.action & gDS.inputMap.rwd[2];
            curVehicleItem.action = curVehicleItem.action & gDS.inputMap.rgt[2];

            curVehicleItem.action = curVehicleItem.action | gDS.inputMap.fwd[1];
            curVehicleItem.action = curVehicleItem.action | gDS.inputMap.lft[1];
        }
    }else{
        //console.log("lft");
        // curVehicleItem.action = curVehicleItem.action | gDS.inputMap.fwd[1];
        // curVehicleItem.action = curVehicleItem.action | gDS.inputMap.lft[1];
        if(reqCanAngle>gDS.maxAngle){
            //console.log("rgt");

            curVehicleItem.action = curVehicleItem.action & gDS.inputMap.fwd[2];
            curVehicleItem.action = curVehicleItem.action & gDS.inputMap.rgt[2];

            curVehicleItem.action = curVehicleItem.action | gDS.inputMap.rwd[1];
            curVehicleItem.action = curVehicleItem.action | gDS.inputMap.lft[1];
        }else{

            curVehicleItem.action = curVehicleItem.action & gDS.inputMap.rwd[2];
            curVehicleItem.action = curVehicleItem.action & gDS.inputMap.lft[2];

            curVehicleItem.action = curVehicleItem.action | gDS.inputMap.fwd[1];
            curVehicleItem.action = curVehicleItem.action | gDS.inputMap.rgt[1];
        }
    }
    //get immediate action
    //update item action
};



gGameObject.getAimAngleNeeded = function(currentIndexParam, posX, posZ){
    var curVehicleItem = gDS.itemList[currentIndexParam];

    //curVehicleItem.ItemAngle = Math.atan2(curVehicleItem.deltaX, curVehicleItem.deltaZ);;
    //curVehicleItem.cannonAngle = Math.atan2(curVehicleItem.deltaXCannon, curVehicleItem.deltaZCannon);
    
    //var defAngle = Math.atan2(curVehicleItem.deltaX, curVehicleItem.deltaZ);
    
    var targetAngle = Math.atan2((posX - curVehicleItem.pos.x), (posZ - curVehicleItem.pos.z));
    var reqCanAngle = targetAngle - curVehicleItem.ItemAngle;
    return reqCanAngle;
};


/////////////////////////---------------------------////////////////////////////








/**
 * Converts the quaternion to axis/angle representation.
 * @method toAxisAngle
 * @param {Vec3} targetAxis Optional. A vector object to reuse for storing the axis.
 * @return Array An array, first elemnt is the axis and the second is the angle in radians.
 */
function QuaterniontoAxisAngle(targetAxis,quad){
    var vec = {};
    vec.x = 0;
    vec.y = 1;
    vec.z = 0;
    targetAxis = targetAxis || vec;
    //this.normalize(); // if w>1 acos and sqrt will produce errors, this cant happen if quaternion is normalised
    //quad = quatnormalizeFast(quad);
    quad = quatnormalize(quad);
    //console.log(quad);
    //console.log(quad.w);
    var angle = 2 * Math.acos(quad.w);
    var s = Math.sqrt(1-quad.w*quad.w); // assuming quaternion normalised then w is less than 1, so term always positive.
    if (s < 0.001) { // test to avoid divide by zero, s is always positive due to sqrt
        // if s close to zero then direction of axis not important
        targetAxis.x = quad.x; // if it is important that axis is normalised then replace with x=1; y=z=0;
        targetAxis.y = quad.y;
        targetAxis.z = quad.z;
    } else {
        targetAxis.x = quad.x / s; // normalise axis
        targetAxis.y = quad.y / s;
        targetAxis.z = quad.z / s;
    }
    return [targetAxis,angle];
    //return angle;
};


/**
 * Normalize the quaternion. Note that this changes the values of the quaternion.
 * @method normalize
 */
function quatnormalize(quat){
    var l = Math.sqrt(quat.x*quat.x+quat.y*quat.y+quat.z*quat.z+quat.w*quat.w);
    if ( l === 0 ) {
        quat.x = 0;
        quat.y = 0;
        quat.z = 0;
        quat.w = 0;
    } else {
        l = 1 / l;
        quat.x *= l;
        quat.y *= l;
        quat.z *= l;
        quat.w *= l;
    }
    return quat;
};
 
/**
 * Approximation of quaternion normalization. Works best when quat is already almost-normalized.
 * @method normalizeFast
 * @see http://jsperf.com/fast-quaternion-normalization
 * @author unphased, https://github.com/unphased
 */
function quatnormalizeFast(quat) {
    var f = (3.0-(quat.x*quat.x+quat.y*quat.y+quat.z*quat.z+quat.w*quat.w))/2.0;
    if ( f === 0 ) {
        quat.x = 0;
        quat.y = 0;
        quat.z = 0;
        quat.w = 0;
    } else {
        quat.x *= f;
        quat.y *= f;
        quat.z *= f;
        quat.w *= f;
    }
    return quat;
};


function testPathFinder(){
    console.log("testPathFinder");
    var matrix = [
        [0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0]
    ];
    var grid = new PF.Grid(5, 5, matrix);
    console.log(grid);
    var finder = new PF.AStarFinder();
    var gridBackup = grid.clone();
    var path = finder.findPath(0, 0, 2, 3, gridBackup);   
    console.log("found path");
    console.log(path);
    var gridBackup = grid.clone();
    var path = finder.findPath(0, 0, 2, 3, gridBackup);   
    console.log("found path");
    console.log(path);

    var gridBackup = grid.clone();
    var path = finder.findPath(0, 0, 2, 3, gridBackup);   
    console.log("found path");
    console.log(path);
};



 


/**
//initWorker();
function sendMsgToMain(data){
    postMessage(data);
};
**/