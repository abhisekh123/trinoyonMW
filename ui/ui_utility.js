tg.uu = {};

tg.uu.convertSecondsHHMMSS = function (sec) {
    var hrs = Math.floor(sec / 3600);
    var min = Math.floor((sec - (hrs * 3600)) / 60);
    var seconds = sec - (hrs * 3600) - (min * 60);
    seconds = Math.round(seconds * 100) / 100

    var result = (hrs < 10 ? "0" + hrs : hrs);
    result += "-" + (min < 10 ? "0" + min : min);
    result += "-" + (seconds < 10 ? "0" + seconds : seconds);
    return result;
};

tg.uu.convertSecondsMMSS = function (sec) {
    // var hrs = Math.floor(sec / 3600);
    sec = Math.floor(sec);
    var min = Math.floor(sec / 60);
    var seconds = sec - (min * 60);
    seconds = Math.round(seconds * 100) / 100

    // var result = (hrs < 10 ? "0" + hrs : hrs);
    var result = (min < 10 ? "0" + min : min);
    result += ":" + (seconds < 10 ? "0" + seconds : seconds);
    return result;
};

tg.uu.getObjectKeys = function (objectParam) {
    return Object.keys(objectParam);
};

tg.uu.getObjectValues = function (objectParam) {
    return Object.values(objectParam);
};

tg.uu.getObjectClone = function (objectParam) {
    return JSON.parse(JSON.stringify(objectParam));
};

// both inputs should be integers.
tg.uu.getRandom = function (rangeStart, rangeEnd) {
    return Math.floor(Math.random() * (rangeEnd - rangeStart)) + rangeStart;
};

tg.uu.addAmazonAdToContent = function(){
    // var content = '<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-in.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=IN&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=trinoyon-21&language=en_IN&marketplace=amazon&region=IN&placement=B07ZNRJ6JV&asins=B07ZNRJ6JV&linkId=cd4c14812c6c5f1e3dc9411daa1e3db9&show_border=true&link_opens_in_new_window=true"></iframe>';
    var content = '<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-in.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=IN&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=trinoyon-21&language=en_IN&marketplace=amazon&region=IN&placement=B07ZNRJ6JV&asins=B07ZNRJ6JV&linkId=cd4c14812c6c5f1e3dc9411daa1e3db9&show_border=true&link_opens_in_new_window=true"></iframe>';
    var content2 = '<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-in.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=IN&source=ac&ref=tf_til&ad_type=product_link&tracking_id=trinoyon-21&marketplace=amazon&region=IN&placement=B07FMFGGNR&asins=B07FMFGGNR&linkId=40fd30266917f7df696ade693e490094&show_border=true&link_opens_in_new_window=true&price_color=333333&title_color=0066c0&bg_color=ffffff"></iframe>';
    $('.hg-ad1').html(content);

    // setTimeout((()=>{
    //     console.log('calling checktext');
    //     $('.hg-ad1').html(content2);
    // }), 5000);
}

tg.uu.markSelectedItem = function(elementArray, selectedIndex){
    // update selection class.
    tg.uu.addRemoveClassFromElementArray(elementArray, 'remove', 'selected-bot-footer-item');
    tg.uu.addRemoveClassFromElementArray(elementArray, 'add', 'unselected-bot-footer-item');
    $(elementArray[selectedIndex]).removeClass('unselected-bot-footer-item');
    $(elementArray[selectedIndex]).addClass('selected-bot-footer-item');
};

tg.uu.displaySelectedBotDetails = function(elementParam, botIndex){
    console.log('displaySelectedBotDetails');
    var selectedBotDetailsImage = elementParam.find('.hg-bot-image');
    var selectedBotDetailsInformation = elementParam.find('.hg-botinfo');
    var selectedBotDetailsAbilityImage = elementParam.find('.ability-Image');
    var selectedBotDetailsAbilityName = elementParam.find('.ability-name');
    var selectedBotDetailsAbilityStatistics = elementParam.find('.ability-statistics');
    var selectedBotDetailsAbilityDescription = elementParam.find('.ability-description');


    // var selectedBotDetailsStatistics = elementParam.find('.hg-botstat');

    // selectedBotDetailsImage[0].src = tg.uu.getIconURLFromType('item', tg.botSelection.hero);
    
    var botType = null;
    if(botIndex == 0){
        // requested hero change
        botType = tg.botSelection.hero;
    } else { // swap bots
        botType = tg.botSelection.botList[botIndex - 1];
    }

    selectedBotDetailsImage[0].src = tg.uu.getIconURLFromType('item', botType);

    var botItemConfig = tg.itemConfigs.items[botType];
    var botLevelMap = botItemConfig.levelMap;
    
    for (let index = 0; index < botItemConfig.ability.length; index++) {
        const botAbilityConfig = tg.itemConfigs.abilityConfig[botItemConfig.ability[index].action];

        selectedBotDetailsAbilityImage[index].src = botAbilityConfig.iconurl;
        selectedBotDetailsAbilityDescription[index].innerHTML = botAbilityConfig.description;

        selectedBotDetailsAbilityStatistics[index].innerHTML = 'Duration: ' + botAbilityConfig.duration / 1000
        + ' seconds.<br>Reset time: ' + botAbilityConfig.resetInterval / 1000 + ' seconds.';
        selectedBotDetailsAbilityName[index].innerHTML = botItemConfig.ability[index].action.toUpperCase();
    }

    // selectedBotDetailsInformation[0].innerHTML = botItemConfig.description;
    var botInfoHeader = $(selectedBotDetailsInformation[0]).find('.bot-info-header')[0];
    botInfoHeader.innerHTML = botType.toUpperCase();
    // selectedBotDetailsStatistics[0].innerHTML = botItemConfig.description;


    // vitals 
    var selectedBotDetailsLife = 'Life:<br>';
    var selectedBotDetailsAttack = 'Attack<br>';
    var selectedBotDetailsMovement = 'Movement:<br>';

    for (let index = 0; index < botLevelMap.length; index++) {
        var levelConfig = botLevelMap[index];

        selectedBotDetailsLife += '<br>Level' + (index + 1) + ' : ' + levelConfig.life;
        selectedBotDetailsAttack += '<br>Level' + (index + 1) + ' : ' + levelConfig.attack;
        selectedBotDetailsMovement += '<br>Level' + (index + 1) + ' : ' + levelConfig.speed;
    }

    elementParam.find('.bot-stat-life')[0].innerHTML;
    elementParam.find('.bot-stat-attack')[0].innerHTML;
    elementParam.find('.bot-stat-movement')[0].innerHTML;
};

tg.uu.viewSelectedBotDetails = function(element, botIndex){
    // tst
    var parentElement = $(element).parent();
    tg.uu.displaySelectedBotDetails(parentElement.parent().parent(), botIndex);
}

tg.uu.changeSelectedBot = function(element, botIndex){
    // tt
    var parentElement = $(element).parent();
    var selectedBotContainerList = parentElement.find('.game-footer-bot-selection');
    // alert('change:' + botIndex);
    var imageElement = parentElement.find('.image-icon');
    if(botIndex == 0){
        // requested hero change
    } else { // swap bots
        if(tg.botSelection.botList[botIndex - 1] == 'swordman'){
            tg.botSelection.botList[botIndex - 1] = 'archer';
        } else {
            tg.botSelection.botList[botIndex - 1] = 'swordman';
        }
        imageElement[0].src = tg.uu.getIconURLFromType('item', tg.botSelection.botList[botIndex - 1]);
    }

    tg.uu.displaySelectedBotDetails(parentElement.parent().parent(), botIndex);

    tg.uu.markSelectedItem(selectedBotContainerList, botIndex);
};

tg.uu.populatePlayerBot = function(parentElement){
    // tg.uu.getIconURLFromType('item', type);
    // tg.botSelection = {
    //     botList: ['swordman', 'swordman', 'swordman', 'swordman'],
    //     hero: 'lion',
    // }
    var selectedBotContainerList = parentElement.find('.game-footer-bot-selection');
    var selectedBotIconList = parentElement.find('.image-icon');

    selectedBotIconList[0].src = tg.uu.getIconURLFromType('item', tg.botSelection.hero);

    for (let index = 0; index < tg.botSelection.botList.length; index++) {
        const botType = tg.botSelection.botList[index];
        selectedBotIconList[index + 1].src = tg.uu.getIconURLFromType('item', botType);
    }

    tg.uu.displaySelectedBotDetails(parentElement, 0);

    tg.uu.markSelectedItem(selectedBotContainerList, 0);
};


tg.uu.getIconURLFromType = function(itemType, itemKey){
    switch (itemType) {
        case 'ability':
            
            return tg.itemConfigs.abilityConfig[itemKey].iconurl;
        case 'item':
            
            return tg.itemConfigs.items[itemKey].iconurl;
        default:
            return tg.itemConfigs.items[itemKey].iconurl;
    }
    
};


tg.uu.addRemoveClassFromElementArray = function(elementArray, operationType, classArray){
    for (let index = 0; index < elementArray.length; index++) {
        const element = elementArray[index];
        for (let classIndex = 0; classIndex < classArray.length; classIndex++) {
            const classElement = classArray[classIndex];
            switch (operationType) {
                case 'add':
                    $(element).addClass(classElement);
                    break;
                case 'remove':
                    $(element).removeClass(classElement);
                    break;
                default:
                    $(element).addClass(classElement);
                    break;
            }
        }
    }
};


