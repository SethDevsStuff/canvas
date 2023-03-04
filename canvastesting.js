var canvas = initCanvas("testArea", {scale:true, width:1366, height:657, full:true,});
var testImage = image('testImage.png');
var jude = image('jude.png');
var direction = 0;

canvas.ctx.imageSmoothingEnabled = false;
var testGroup = group(400, 300);
testGroup.addAnimation('ease', [{path:'rotation', value:radians(-1440)}], 30000, 'ease-out');

//var imageTest = comp(0, 0, {width:220, height:153,}, {group:testGroup, type:'image', source:testImage});
var square = comp(0, 0, {width:50, height:50},{group:testGroup, fill:{color:'lime'}});

var ani = comp(100, 100, {width:160, height:160, sx:0, sy:0, sWidth:16, sHeight:16}, {type:'image', source:jude});
ani.addTextureAnimation('walk', [{path:'sy', value:16, time:300}, {path:'sy', value:32, time:300}]);
