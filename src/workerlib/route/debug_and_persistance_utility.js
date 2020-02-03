

var fs = require('fs');
const readline = require('readline');

module.exports = {
    testVisibility: function(eyeX, eyeZ, targetX, targetZ){
        // this.visibilityMatrix[x][z] = {
        //     visibility : neighbourhoodVisibilityGrid,
        //     id : null,
        // };
        var visibilityMap = this.visibilityMatrix[eyeX][eyeZ].visibility[targetX];
        if((visibilityMap & (1 << targetZ)) > 0){
            return true;
        }else{
            return false;
        }
    },
    printGrid: function(){
        let width = this.tg.grid.width;
        let height = this.tg.grid.height;
        
        let tmpArray = [];
        for (var i = 0; i < height; ++i) {
            tmpArray.length = 0;
            for (var j = 0; j < width; ++j) {
                // newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
                if(this.tg.grid.isWalkableAt(i, j)){
                    tmpArray.push(1);
                }else{
                    tmpArray.push(0);
                }
            }
            // console.log(tmpArray.join(" "));
        }
    },
}