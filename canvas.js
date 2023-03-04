var frameRate = 1; //frameRate is based on 60 frames per second. So 1=60fps, 1.5=90fps, etc.
var allComps = []; //Array of arrays(for each canvas)
var allGroups = [];
var allCanvas = [];
var allAnis = [];
var compSchema = {
    group: {},
    z:0,
    alwaysActive: false,
    og:{
        hover:[],
        mouseDown:[],
    },
    temp:{
        hover:[],
        mouseDown:[],
    },
    onclick: function() {},
    onhover: function() {},
    onoff: function() {},
    ondown: function() {},
};
const animationFuncs = {
    easeOut: function (time){
        return Math.sin((time * Math.PI) / 2);
    }
};
var defaultImages = {
   brokenImage:image('brokenImage.png'),
};
var rectSchema = {
    type:"rect",
    rotation: 0,
    cursor: '',
    fill: {
        draw: true,
        color: 'red',
    },
    outline: {
        draw: false,
        color: 'black',
        width: '3px',
    },
};
var imageSchema = {
    rotation: 0,
    cursor: '',
    source: defaultImages.brokenImage,
    outline: {
        draw: false,
        color:'black',
        width: '3px',
    }
};
var textSchema = {
    rotation: 0,
    cursor: 'text',
    font: 'arial',
    fill: {
        draw: true,
        color: 'black',
    },
    outline:{
        draw: false,
        color: 'black',
        width: '3px',
    },
}

function initCanvas(id, settings){//ID of HTML element you want canvas to be in. Better to use <div> or <custom-element>
    var parent = document.getElementById(id);
    var element = document.createElement("canvas");
    var ctx = element.getContext("2d");

    let canvas = {
        mouseDown: null,
        mouseOn: null,
        index: allCanvas.length,
        element,
        ctx,
        scaled: 1,
        previousLength: 0,
        compNum: 0,
    }
    allCanvas.push(canvas);
    allComps.push([]);

    canvas.element.setAttribute("id", settings.name);
    canvas.element.width = settings.width || 300;
    canvas.element.height = settings.height || 150;
    canvas.element.style["background-color"] = "silver";
    canvas.element.style.display = "block";

    var body = document.getElementsByTagName("body")[0];
    var allComp = allComps[canvas.index];

    parent.appendChild(canvas.element);

    if(settings.scale){
        var ratio = canvas.element.width/canvas.element.height;
        var screenRatio = innerWidth/innerHeight;

        if(settings.full){
            if(ratio>screenRatio){
                canvas.scaled = innerWidth/canvas.element.width;
                canvas.element.width = innerWidth;
                canvas.element.height *= canvas.scaled;
            } else {
                canvas.scaled = innerHeight/canvas.element.height;
                canvas.element.width *= canvas.scaled;
                canvas.element.height = innerHeight;
            }
            body.style.padding = 0;
            body.style.margin = 0;
        } else {
            if(ratio>screenRatio){
                canvas.element.width = innerWidth-(canvas.element.offsetLeft*2);
                canvas.scaled = canvas.element.width/settings.width;
                canvas.element.height *= canvas.scaled;
            } else {
                canvas.element.height = innerHeight-(canvas.element.offsetTop*2);
                canvas.scaled = canvas.element.height/settings.height;
                canvas.element.width *= canvas.scaled;
            }
        }
        
    }

    canvas.element.addEventListener('mousemove', function (event) {
        var scrollLeft =
          window.pageXOffset !== undefined
            ? window.pageXOffset
            : (
                document.documentElement ||
                document.body.parentNode ||
                document.body
              ).scrollLeft;
        var scrollTop =
          window.pageYOffset !== undefined
            ? window.pageYOffset
            : (
                document.documentElement ||
                document.body.parentNode ||
                document.body
              ).scrollTop;

        let x = event.clientX - allCanvas[canvas.index].element.offsetLeft + scrollLeft;
        let y = event.clientY - allCanvas[canvas.index].element.offsetTop + scrollTop;
        if (x > allCanvas[canvas.index].width) {
          x = allCanvas[canvas.index].width;
        }
        if (y > allCanvas[canvas.index].height) {
          y = allCanvas[canvas.index].height;
        }
        canvas.pointerPos = [x, y];
        var cursor = "";
        var cursorOn = null;

        var i;
        for(i=0;i<allComp.length;i++){
            if ((allComp[i].alwaysActive || allComp[i].isShowing()) && allComp[i].mouseOn(canvas.pointerPos[0], canvas.pointerPos[1])) {
                cursor = allComp[i].cursor;
                cursorOn = i;
              }
        }

        if(canvas.cursorOn != null && canvas.cursorOn != cursorOn){
            allComp[canvas.cursorOn].onoff();
            if(allComp[canvas.cursorOn].og.mouseDown.length != 0 && canvas.mouseDown != null){
            var i;
            for(i=0;i<allComp[canvas.cursorOn].temp.mouseDown.length;i++){
                var j;
                let path = allComp[canvas.cursorOn].temp.mouseDown[i].path.split('.');
                let reference = allComp[canvas.cursorOn];
                for(j=0;j<path.length;j++){
                    if(j==path.length-1){
                        reference[path[j]] = allComp[canvas.cursorOn].og.mouseDown[i];
                        break;
                    }
                    reference = reference[path[j]];
                }
        }
        allComp[canvas.cursorOn].og.mouseDown = [];
    }
        
            if(allComp[canvas.cursorOn].temp.hover.length != 0){
                var i;
                for(i=0;i<allComp[canvas.cursorOn].temp.hover.length;i++){
                    var j;
                    let path = allComp[canvas.cursorOn].temp.hover[i].path.split('.');
                    let reference = allComp[canvas.cursorOn];
                    for(j=0;j<path.length;j++){
                        if(j==path.length-1){
                            reference[path[j]] = allComp[canvas.cursorOn].og.hover[i];
                            break;
                        }
                        reference = reference[path[j]];
                    }
                }
                allComp[canvas.cursorOn].og.hover = [];
            }
        }
        
        if(cursorOn != canvas.cursorOn && cursorOn != null){
            allComp[cursorOn].onhover();
            if(allComp[cursorOn].temp.hover.length != 0){
                var i;
                for(i=0;i<allComp[cursorOn].temp.hover.length;i++){
                    let path = allComp[cursorOn].temp.hover[i].path.split('.');
                    var j;
                    let reference = allComp[cursorOn];
                    for(j=0;j<path.length;j++){
                        if(j==path.length-1){
                            allComp[cursorOn].og.hover.push(JSON.parse(JSON.stringify(reference[path[j]])));
                            reference[path[j]] = allComp[cursorOn].temp.hover[i].value;
                            break;
                        }
                        reference = reference[path[j]];
                    }
                }
                
            }
        }
        canvas.cursorOn = cursorOn;
        canvas.element.style.cursor = cursor;
    });
    canvas.element.addEventListener('mousedown', function () {
        if(canvas.cursorOn != null){
            canvas.mouseDown = canvas.cursorOn;
            allComp[canvas.mouseDown].ondown();

            if(allComp[canvas.cursorOn].temp.mouseDown.length != 0){
                var i;
                for(i=0;i<allComp[canvas.cursorOn].temp.mouseDown.length;i++){
                    let path = allComp[canvas.cursorOn].temp.mouseDown[i].path.split('.');
                    var j;
                    let reference = allComp[canvas.cursorOn];
                    for(j=0;j<path.length;j++){
                        if(j==path.length-1){
                            allComp[canvas.cursorOn].og.mouseDown.push(JSON.parse(JSON.stringify(reference[path[j]])));
                            reference[path[j]] = allComp[canvas.cursorOn].temp.mouseDown[i].value;
                            break;
                        }
                        reference = reference[path[j]];
                    }
                }
                
            }
        }
    });
    canvas.element.addEventListener('mouseup', function () {
        if(canvas.mouseDown != null && allComp[canvas.mouseDown].og.mouseDown.length != 0 && allComp[canvas.mouseDown].temp.mouseDown.length != 0 && canvas.cursorOn != null && canvas.mouseDown != null){
            var i;
            for(i=0;i<allComp[canvas.mouseDown].temp.mouseDown.length;i++){
                var j;
                let path = allComp[canvas.mouseDown].temp.mouseDown[i].path.split('.');
                let reference = allComp[canvas.mouseDown];
                for(j=0;j<path.length;j++){
                    if(j==path.length-1){
                        reference[path[j]] = allComp[canvas.mouseDown].og.mouseDown[i];
                        break;
                    }
                    reference = reference[path[j]];
                }
            }
            allComp[canvas.cursorOn].og.mouseDown = [];
        }

        if(canvas.cursorOn == canvas.mouseDown && canvas.cursorOn != null && canvas.mouseDown != null){
            allComp[canvas.mouseDown].onclick();
        }

        canvas.mouseDown = null;
    });

    return canvas;
}

function distance(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))
}

function comp(x, y, size, settings){
    var newComp = new Component(x, y, size, settings);
    return newComp;
}
function group(x, y, scaleX, scaleY, group){
    var newGroup = new Group(x, y, scaleX, scaleY, group);
    return newGroup;
}

function formatSettings(settings){
    if(settings.type == 'image'){
        settings = fillIn(settings, imageSchema);
    } else if(settings.type == 'text') {
        settings = fillIn(settings, textSchema);
    } else {//Rectangle
        settings = fillIn(settings, rectSchema);
    }
    settings = fillIn(settings, compSchema);
    if(!settings.canvas) settings.canvas = [allCanvas[0], 0];
    return settings;
}
function fillIn(set, schema){
    var schemKeys = Object.keys(schema);
    var schemVals = Object.values(schema);

    var i;
    for(i=0;i<schemKeys.length;i++){
        if(set[schemKeys[i]] == undefined){
            if(typeof schemVals[i] === 'object' && !Array.isArray(schemVals[i]) && !(schemVals[i] instanceof Element)){
                set[schemKeys[i]] = {};
            } else {
                set[schemKeys[i]] = schemVals[i];
            }
        }
        if(typeof schemVals[i] == 'object'){
            set[schemKeys[i]] = fillIn(set[schemKeys[i]], schemVals[i]);
        }
    }
    return set;
}

function Component(x, y, size, settings){
    this.angFrZr = Math.atan(y/x);
    this.distFrZr = distance(0, 0, x, y);
    this.showing = true;
    this.opacity = 1;
    this.x = x || 0;
    this.y = y || 0;
    this.size = size || {};
    this.settings = settings || {};
    this.animations = {};
    this.settings = formatSettings(this.settings);
    this.canvas = this.settings.canvas[0];
    this.index = allComps[this.settings.canvas[1]].length;
    allComps[this.settings.canvas[1]].push(this);

    delete this.settings.canvas;

    var setKeys = Object.keys(this.settings);
    var setVals = Object.values(this.settings);
    var i;
    for(i=0;i<setKeys.length;i++){
        this[setKeys[i]] = setVals[i];
    }

    delete this.settings;

    this.show = function() {
        this.showing = true;
    }
    this.hide = function() {
        this.showing = false;
    }
    this.toggleShow = function() {
        if(this.showing){
            this.showing = false;
            return;
        }
        this.showing = true;
    }

    this.setGroup = function(group) {
        this.group = group;
    }
    this.getX = function() {
        if(this.x == 0) this.x = 0.0001;
        if(this.group.x != undefined){//Component is in a group
            /*
            var groupX = this.group.getX();
            var groupY = this.group.getY();
            var x = groupX + (this.group.getXScale()*(this.x));
            var y = groupY + (this.group.getYScale()*(this.y));
            var xdif = groupX-x;
            var ydif = groupY-y;
            var groupAngle = Math.atan(ydif/xdif);
            var theDiff = distance(x, y, this.group.getX(), this.group.getY());
            var expectPoint = [(Math.cos(groupAngle+this.group.getRotation())*theDiff)+groupX, (Math.sin(groupAngle+this.group.getRotation())*theDiff)+groupY];

            this.angFrZr = Math.atan(expectPoint[1]/expectPoint[0]);
            this.distFrZr = distance(0, 0, expectPoint[0], expectPoint[1]);
            return (Math.cos(Math.abs(this.angFrZr-this.getRotation())))*this.distFrZr*this.canvas.scaled;
            */
            return (this.group.getX() + (this.group.getXScale() * this.x))*this.canvas.scaled;
        }//Free component
        this.angFrZr = Math.atan(this.y/this.x);
        this.distFrZr = distance(0, 0, this.x, this.y);
        return this.x * this.canvas.scaled;
    }
    this.getY = function() {
        if(this.group.y != undefined){//Component is in a group
            //return (Math.sin(Math.abs(this.angFrZr-this.getRotation())))*this.distFrZr*this.canvas.scaled;
            return (this.group.getY() + (this.group.getYScale() * this.y))*this.canvas.scaled;
        }//Free component
       // return (Math.sin(this.angFrZr-this.rotation)) * this.distFrZr * this.canvas.scaled;
       return this.y * this.canvas.scaled;
    }
    this.getWidth = function() {
        if(this.group.scaleY != undefined){//Component is in a group
            return this.group.getXScale() * this.size.width * this.canvas.scaled;
        }
        return this.size.width * this.canvas.scaled;
    }
    this.getHeight = function() {
        if(this.group.scaleY != undefined){//Component is in a group
            return this.group.getYScale() * this.size.height * this.canvas.scaled;
        }
        return this.size.height * this.canvas.scaled;
    }
    this.getRotation = function() {
        if(this.group.rotation != undefined){//Component is in a group
            return this.group.getRotation() + this.rotation;
        }
        return this.rotation;
    }
    this.isShowing = function () {
        if(this.group.x != undefined){
            return this.group.isShowing() && this.showing;
        }
        return this.showing;
    }
    this.addAnimation = function (name, changes, timeFrame, animationType) {
        var animation = {
            type:'normal',
            changes,
            timeFrame,
            animationType: animationType || 'linear',
            running: false,
            expectedFrame: 59,
            frameNum:0,
            tempRunAfter: () => {},
            run: (after, value) => {
                if(typeof after == 'function') animation.tempRunAfter = after;
                animation.tempAfterVal = value;
                animation.resume();
                animation.frameNum = 0;
                var i;
                for(i=0;i<animation.changes.length;i++){
                    animation.expectedFrame = timeFrame*60*frameRate/1000;
                    var j;
                    let path = changes[i].path.split('.');
                    let reference = this;
                    for(j=0;j<path.length;j++){
                        if(j==path.length-1){
                            animation.changes[i].og = JSON.parse(JSON.stringify(reference[path[j]]));
                            if(animation.animationType == 'ease-out') animation.changes[i].dif = animation.changes[i].value-animation.changes[i].og;
                            break;
                        }
                    reference = reference[path[j]];
                    }
                }
            },
            resume: () => {
                animation.running = true;
            },
            stop: () => {
                animation.running = false;
            },
            frame: () => {
                if(animation.animationType == 'ease-out'){
                    var i;
                    for(i=0;i<animation.changes.length;i++){
                        var j;
                        let path = animation.changes[i].path.split('.');
                        let reference = this;

                        for(j=0;j<path.length;j++){
                            if(j==path.length-1){
                                animation.frameNum++;
                                reference[path[j]] = animation.changes[i].og + (animationFuncs.easeOut(animation.frameNum/animation.expectedFrame)*animation.changes[i].dif);
                                if(animation.frameNum == animation.expectedFrame){
                                    reference[path[j]] = animation.changes[i].value;
                                    animation.running = false;
                                    animation.tempRunAfter(animation.tempAfterVal);
                                }
                            }
                            reference = reference[path[j]];
                        }
                    }
                } else {
                    var i;
                    for(i=0;i<animation.changes.length;i++){
                        var j;
                        let path = animation.changes[i].path.split('.');
                        let reference = this;
                    
                        for(j=0;j<path.length;j++){
                            if(j==path.length-1){
                                reference[path[j]] += (animation.changes[i].value-animation.changes[i].og)/animation.expectedFrame;
                                animation.frameNum++;
                                if(animation.frameNum == animation.expectedFrame){
                                    reference[path[j]] = animation.changes[i].value;
                                    animation.running = false;
                                    animation.tempRunAfter(animation.tempAfterVal);
                                }
                                break;
                            }
                            reference = reference[path[j]];
                        }
                    }
                }
                
            },
        }
        this.animations[name] = animation;
        allAnis.push(animation);
    }
    this.addTextureAnimation = function (name, changes, repeat){
        if(repeat == undefined) repeat = true;
        var animation = {
            type:'texture',
            repeat: repeat,
            running: false,
            framesSince: 0,
            position: 0,
            changes: changes,
            run: () => {
                animation.framesSince = 0;
                var i;
                for(i=0;i<animation.changes.length;i++){
                    animation.changes[i].framesTill = animation.changes[i].time/(1000/(60 * frameRate));
                }
                animation.resume();
            },
            resume: () => {
                animation.running = true;
            },
            stop: () => {
                animation.running = false;
            },
            frame: () => {
                animation.framesSince++;
                if(animation.framesSince >= animation.changes[animation.position].framesTill){
                    this.size[animation.changes[animation.position].path] = animation.changes[animation.position].value;
                    animation.framesSince = 0;
                    animation.position++;
                    if(animation.position == animation.changes.length && animation.repeat){
                        animation.position = 0;
                    } else if (animation.position == animation.changes.length && !animation.repeat){
                        animation.stop();
                    }
                }
            },
        }
        this.animations[name] = animation;
        allAnis.push(animation);
    }

    switch(this.type){//Component draw function will not update dynamically after .type is changed | This makes it more efficient
        case 'image':
            this.draw = function() {
                if(this.isShowing()){
                    /*
                    var rotate = false;
                    if(this.getRotation()){
                        rotate = true;
                        this.canvas.ctx.rotate(this.getRotation());
                    }
                    */
                    this.canvas.ctx.drawImage(this.source, this.size.sx || 0, this.size.sy || 0, this.size.sWidth || this.source.naturalWidth, this.size.sHeight || this.source.naturalHeight, this.getX(), this.getY(), this.getWidth(), this.getHeight());

                    //if(rotate) this.canvas.ctx.rotate(-1*this.getRotation());
                }
            }
        break;
        default:
            this.draw = function() {//Rectangle
                if(this.isShowing()){
                    /*
                    var rotate = false;
                    if(this.getRotation()){
                        rotate = true;
                        this.canvas.ctx.rotate(this.getRotation());
                    }
                    */
                    var v = {x:this.getX(), y:this.getY(), w:this.getWidth(), h:this.getHeight(),};
                    this.canvas.ctx.globalAlpha = this.opacity;

                    if(this.fill.draw){
                        this.canvas.ctx.fillStyle = this.fill.color;
                        this.canvas.ctx.fillRect(v.x, v.y, v.w, v.h);
                    }

                    if(this.outline.draw){
                        this.canvas.ctx.strokeStyle = this.outline.color;
                        this.canvas.ctx.lineWidth = this.outline.width;
                        this.canvas.ctx.strokeRect(v.x, v.y, v.w, v.h);
                    }
                    //if(rotate) this.canvas.ctx.rotate(-1*this.getRotation());
                }
            }
        break;
    }

    this.mouseOn = function(x, y) {
        switch(this.type){
            default:
                var left = this.getX();
                var right = this.getX() + this.getWidth();
                var up = this.getY();
                var down = this.getY() + this.getHeight();

                return x >= left && x <= right && y >= up && y <= down;
            break;
        }
    }
}
function Group(x, y, scaleX, scaleY, group, canvas){
    this.x = x || 0;
    this.y = y || 0;
    this.scaleX = scaleX || 1;
    this.scaleY = scaleY || 1;
    this.rotation = 0;
    this.group = group || {};
    this.showing = true;
    this.canvas = canvas || allCanvas[0];
    this.animations = {};

    allGroups.push(this);

    this.setGroup = function(group) {
        this.group = group;
    }
    this.getX = function() {
        if(this.x == 0) this.x = 0.0001;
        if(this.group.x != undefined){//Group is in a group
            /*
            var groupX = this.group.getX();
            var groupY = this.group.getY();
            var x = groupX + (this.group.getXScale()*this.x);
            var y = groupY + (this.group.getYScale()*this.y);
            var xdif = groupX-x;
            var ydif = groupY-y;
            var groupAngle = Math.atan(ydif/xdif);
            var theDiff = distance(x, y, this.group.getX(), this.group.getY());
            this.expectPoint = [(Math.cos(groupAngle+this.group.getRotation())*theDiff)+groupX, (Math.sin(groupAngle+this.group.getRotation())*theDiff)+groupY];
            return this.expectPoint[0]
            */
            return (this.group.getX() + (this.group.getXScale() + this.x));
        }
        return this.x;
    }
    this.getY = function() {
        if(this.group.y != undefined){//Group is in a group
            //return this.expectPoint[1];
            return (this.group.getY() + (this.group.getYScale() + this.y));
        }
        return this.y;
    }
    this.getXScale = function() {
        if(this.group.scaleX != undefined){//Group is in a group
            return this.group.getXScale() * this.scaleX;
        }
        return this.scaleX;
    }
    this.getYScale = function() {
        if(this.group.scaleY != undefined){//Group is in a group
            return this.group.getYScale() * this.scaleY;
        }
        return this.scaleY;
    }
    this.getRotation = function() {
        if(this.group.rotation != undefined){
            return this.group.getRotation() + this.rotation;
        }
        return this.rotation;
    }
    this.isShowing = function() {
        if(this.group.showing != undefined){
            return this.group.isShowing() && this.showing;
        }
        return this.showing;
    }
    this.addAnimation = function (name, changes, timeFrame, animationType) {
        var animation = {
            changes,
            timeFrame,
            animationType: animationType || 'linear',
            running: false,
            expectedFrame: 59,
            frameNum:0,
            tempRunAfter: () => {},
            run: (after, value) => {
                if(typeof after == 'function') animation.tempRunAfter = after;
                animation.tempAfterVal = value;
                animation.resume();
                animation.frameNum = 0;
                var i;
                for(i=0;i<animation.changes.length;i++){
                    animation.expectedFrame = timeFrame*60*frameRate/1000;
                    var j;
                    let path = changes[i].path.split('.');
                    let reference = this;
                    for(j=0;j<path.length;j++){
                        if(j==path.length-1){
                            animation.changes[i].og = JSON.parse(JSON.stringify(reference[path[j]]));
                            if(animation.animationType == 'ease-out') animation.changes[i].dif = animation.changes[i].value-animation.changes[i].og;
                            break;
                        }
                    reference = reference[path[j]];
                    }
                }
            },
            resume: () => {
                animation.running = true;
            },
            stop: () => {
                animation.running = false;
            },
            frame: () => {
                if(animation.animationType == 'ease-out'){
                    var i;
                    for(i=0;i<animation.changes.length;i++){
                        var j;
                        let path = animation.changes[i].path.split('.');
                        let reference = this;

                        for(j=0;j<path.length;j++){
                            if(j==path.length-1){
                                animation.frameNum++;
                                reference[path[j]] = animation.changes[i].og + (animationFuncs.easeOut(animation.frameNum/animation.expectedFrame)*animation.changes[i].dif);
                                if(animation.frameNum == animation.expectedFrame){
                                    reference[path[j]] = animation.changes[i].value;
                                    animation.running = false;
                                    animation.tempRunAfter(animation.tempAfterVal);
                                }
                            }
                            reference = reference[path[j]];
                        }
                    }
                } else {
                    var i;
                    for(i=0;i<animation.changes.length;i++){
                        var j;
                        let path = animation.changes[i].path.split('.');
                        let reference = this;
                    
                        for(j=0;j<path.length;j++){
                            if(j==path.length-1){
                                reference[path[j]] += (animation.changes[i].value-animation.changes[i].og)/animation.expectedFrame;
                                animation.frameNum++;
                                if(animation.frameNum == animation.expectedFrame){
                                    reference[path[j]] = animation.changes[i].value;
                                    animation.running = false;
                                    animation.tempRunAfter(animation.tempAfterVal);
                                }
                                break;
                            }
                            reference = reference[path[j]];
                        }
                    }
                }
                
            },
        }
        this.animations[name] = animation;
        allAnis.push(animation);
    }

    this.show = function() {
        this.showing = true;
    }
    this.hide = function() {
        this.showing = false;
    }
    this.toggleShow = function() {
        if(this.showing){
            this.showing = false;
            return;
        }
        this.showing = true;
    }
}
function radians(degrees){
    return degrees * Math.PI/180;
}
function degrees(radians){
    return radians/Math.PI * 180;
}

function sortZ(comps){
    console.log('sorted Z values');
    var min;
    var i;
    for(i=0;i<comps.length;i++){
        min = i;
        var j;
        for(j=i+1;j<comps.length;j++){
            if(comps[j].z < comps[min].z){
                min = j;
            }
        }

        if(min !== i){
            [comps[i], comps[min]] = [comps[min], comps[i]];
        }
    }
}

function changeFrameRate(newFrameRate) {
    window.clearInterval(updateInterval);
    frameRate = newFrameRate;
    updateInterval = setInterval(animate, 1000 / (frameRate*60));
  }

function onFrame(){
    var i;
    for(i=0;i<allCanvas.length;i++){
        allCanvas[i].ctx.clearRect(0, 0, allCanvas[i].element.width, allCanvas[i].element.height);
        allCanvas[i].ctx.beginPath();
    }
    runAnimations();
    drawComps();
}

function runAnimations(){
    var i;
    var runningAnis = allAnis.filter(anim => anim.running);
    for(i=0;i<runningAnis.length;i++){
        runningAnis[i].frame();
    }
}
function drawComps(){
    var i;
    for(i=0;i<allComps.length;i++){//For each canvas
        var j;
        if(allCanvas[i].previousLength > allComps[i].length){
            allComps[i] = sortZ(allComps[i]);
        }
        for(j=0;j<allComps[i].length;j++){//For each component in a canvas
            allComps[i][j].draw();
        }
    }
}
function image(src) {
    let imageCoolPog = new Image();
    imageCoolPog.src = src;
    return imageCoolPog;
  }

var updateInterval = setInterval(onFrame, 1000 / (frameRate*60));