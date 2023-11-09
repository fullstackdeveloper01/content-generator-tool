import {filtersMap} from "@/effects";
//import {cloneAsImage} from "./cloneAsImage";
import moment from "moment";

var clockcanvas = document.getElementById("clockcanvas");
var radius = clockcanvas.height / 2;
var ctx = clockcanvas.getContext("2d");
ctx.translate(radius, radius);
radius = radius * 0.90;

var minHandImg = new Image();
var hrHandImg = new Image();
// minHandImg.crossOrigin = "anonymous";
// hrHandImg.crossOrigin = "anonymous";
// minHandImg.src = window.appSettings.serverUrl + '/images/minuteshand_1.png';
// hrHandImg.src = window.appSettings.serverUrl + '/images/hourhand_1.png';

const initClockHands = function (clockhandType, minImageSrc, hourImageSrc) {
    if(minImageSrc || hourImageSrc){
        if(minImageSrc){
            minHandImg.src = minImageSrc;
        }
        if(hourImageSrc){
            hrHandImg.src = hourImageSrc;
        }
    }
    else {
        // minHandImg.src = window.appSettings.serverUrl + '/images/minuteshand_' + clockhandType + '.png';
        // hrHandImg.src = window.appSettings.serverUrl + '/images/hourhand_' + clockhandType + '.png';
    }

}

const setGroupSize = function (e) {
    var obj = this,
        w = obj.width * obj.scaleX,
        h = obj.height * obj.scaleY;
    obj.set({
        'height': h,
        'width': w,
        'scaleX': 1,
        'scaleY': 1
    });
}

const getDateTime = function (format) {
    if(!format) {
        format = 'hh:mm:ss';
    }
    var datetime = moment(new Date()).format(format);
    return datetime;
}

export function addCommonMethods(mainObject, canvas, videoEl=null) {
    mainObject.effects = [];
    mainObject.animations = [];

    mainObject.updateWidthHeight = () => {
        if(mainObject.type === 'textbox') {
            if(mainObject.height < mainObject.minHeight) {
                mainObject.height = mainObject.minHeight;
            }
            if(mainObject.width < mainObject.minWidth) {
                mainObject.width = mainObject.minWidth;
            }
            mainObject.setCoords();
        }
    };

    mainObject.getCountOfSameTypeObjs = (sceneIndex = 0) => {
        var objs = canvas.getObjects().filter(obj => {
            return obj.objectType === mainObject.objectType && obj.sceneIndex === sceneIndex;
        });
        var count = 1;
        if(objs && objs.length > 0) {
            objs.sort((a, b) => (a.countid > b.countid) ? 1 : -1);
            count = objs[objs.length-1].countid + 1;
        }
        mainObject.countid = count;
        return count;
    }

    mainObject.initEffects = () => {
        mainObject.effects.forEach(effect => {
            if (filtersMap[effect.id]) {
                effect.filter = new filtersMap[effect.id](effect.params);
            }
        })
    }
    mainObject.removeOldEffects = async () => {
        let customFilters = mainObject.effects.filter(effect => effect.filter && effect.filter.custom).map(effect => effect.filter);
        for (let filter of customFilters) {
            await filter.restore(mainObject);
        }
    }
    mainObject.applyEffects = async() => {
        let defaultFilters = mainObject.effects.filter(effect => effect.filter && !effect.filter.custom).map(effect => effect.filter);
        mainObject.filters = [];
        for (let filter of defaultFilters) {
            mainObject.filters.push(filter);
            mainObject.applyFilters();
        }
        let customFilters = mainObject.effects.filter(effect => effect.filter && effect.filter.custom).map(effect => effect.filter);
        for (let filter of customFilters) {
            await filter.apply(mainObject);
        }

        canvas.renderAll();
        setTimeout(() => {
            canvas.renderAll();
        }, 1)
    }

    if(mainObject.objectType === 'analogdatetime') {
        mainObject.initDateTime = () => {
            if(mainObject.interval) {
                mainObject.removeDateTime();
            }
            mainObject.interval = setInterval(() => {
                drawClock(mainObject.clockFaceNeed);

                var clockImg = new Image();
                clockImg.onload = function (img) {
                    mainObject.opacity = 1;
                    mainObject.setElement(clockImg);
                    canvas.renderAll();
                };
                clockImg.src = clockcanvas.toDataURL();
            }, 1000);
        }
        mainObject.changeHandType = (type, minSrc=null, hourSrc=null) => {
            if(minSrc || hourSrc){
                initClockHands(null, minSrc, hourSrc);
            }
            else initClockHands(type);
            if(mainObject.interval) {
                mainObject.removeDateTime();
            }
            mainObject.interval = setInterval(() => {
                drawClock(mainObject.clockFaceNeed);
                var clockImg = new Image();
                clockImg.onload = function (img) {
                    mainObject.opacity = 1;
                    mainObject.setElement(clockImg);
                    canvas.renderAll();
                };
                clockImg.src = clockcanvas.toDataURL();
            }, 1000);
        }
        mainObject.removeDateTime = () => {
            clearInterval(mainObject.interval);
            mainObject.interval = null;
        }
        mainObject.getClockURL = () => {
            drawClock(mainObject.clockFaceNeed);
            return clockcanvas.toDataURL();
        }
    }

    if(mainObject.objectType === 'datetime') {
        mainObject.initDateTime = () => {
            if(mainObject.interval) {
                mainObject.removeDateTime();
            }
            mainObject.text = getDateTime(mainObject.pattern);
            mainObject.interval = setInterval(function(){
                mainObject.text = getDateTime(mainObject.pattern);
                canvas.renderAll();
            }, 1000);
        }
        mainObject.removeDateTime = () => {
            clearInterval(mainObject.interval);
            mainObject.interval = null;
        }
    }

    if(mainObject.objectType === 'picture') {
        mainObject.onRemove = () => {
            mainObject.animImgs.forEach(img => {
                canvas.remove(img);
            });
            canvas.renderAll();
        }
    }

    if(mainObject.objectType === 'pdf') {
        alert('Load Pdf');;
    }


    if(mainObject.objectType === 'video' && videoEl) {
        mainObject.initVideo = (url) => {
        //     if (!url) {
        //         url = mainObject.url;
        //     } else {
        //         mainObject.url = url;
        //     }
        //     videoEl.src = url;
        //     videoEl.load();
        //     mainObject.videoWidth = videoEl.videoWidth;
        //     mainObject.videoHeight = videoEl.videoHeight;
        //     var playPromise = videoEl.play();
        //     if (playPromise !== undefined) {
        //         playPromise.then(function() {
        //             // Automatic playback started!
        //             canvas.renderAll();
        //             videoEl.pause();
        //             canvas.renderAll();
        //         }).catch(function(error) {
        //             // Automatic playback failed.
        //             // Show a UI element to let the user manually start playback.
        //             console.log('error loading video');
        //         });
        //     }
        }

        // mainObject.onRemove = () => {
        //     videoEl.parentNode.removeChild(videoEl);
        // }

        // fabric.util.requestAnimFrame(function render() {
        //     canvas.renderAll();
        //     fabric.util.requestAnimFrame(render);
        // });
    }
}

//Below methods are for canvas clock
//https://www.w3schools.com/graphics/tryit.asp?filename=trycanvas_clock_start
const drawClock = function (clockFaceNeed = true) {
    if(clockFaceNeed) {
        drawFace(ctx, radius);
        drawNumbers(ctx, radius);
    } else {
        clockcanvas.width = clockcanvas.width;
        clockcanvas.height = clockcanvas.height;
        radius = clockcanvas.height / 2;
        ctx.translate(radius, radius);
        radius = radius * 0.90;
        ctx.stroke();
    }
    drawTime(ctx, radius);
    ctx.beginPath();
    ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
}

const drawFace = function (ctx, radius) {
    var grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2*Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
    grad.addColorStop(0, '#333');
    grad.addColorStop(0.5, 'white');
    grad.addColorStop(1, '#333');
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius*0.1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
}

const drawNumbers = function (ctx, radius) {
    var ang;
    var num;
    ctx.font = radius*0.15 + "px arial";
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    for(num = 1; num < 13; num++){
        ang = num * Math.PI / 6;
        ctx.rotate(ang);
        ctx.translate(0, -radius*0.85);
        ctx.rotate(-ang);
        ctx.fillText(num.toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius*0.85);
        ctx.rotate(-ang);
    }
}

const drawTime = function (ctx, radius){
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    //hour
    hour=hour%12;
    hour=(hour*Math.PI/6)+
        (minute*Math.PI/(6*60))+
        (second*Math.PI/(360*60));
    drawHand(ctx, hour, radius*0.5, radius*0.07, 'hour');
    //minute
    minute=(minute*Math.PI/30)+(second*Math.PI/(30*60));
    drawHand(ctx, minute, radius*0.8, radius*0.07, 'minute');
    // second
    second=(second*Math.PI/30);
    drawHand(ctx, second, radius*0.9, radius*0.02, 'second');
}

const drawHand = function (ctx, pos, length, width, type) {

    if(hrHandImg.src && type === 'hour') {

        ctx.beginPath();
    
        ctx.moveTo(0,0);
        ctx.rotate(pos);
    
        if(type === 'hour')
        {
            ctx.drawImage(hrHandImg, -7, 5, width*1.5, -length);
        }
    
        if(type === 'minute')
        {
    
            ctx.drawImage(minHandImg, -5, 7, width*1.5, -length);
    
        }
    
        if(type === 'second') {
            ctx.lineWidth = width;
            ctx.lineCap = "round";
            ctx.lineTo(0, -length);
            ctx.stroke();
        }
    
        ctx.rotate(-pos);

    } else if(minHandImg.src && type === 'minute') {

        ctx.beginPath();
    
        ctx.moveTo(0,0);
        ctx.rotate(pos);
    
        if(type === 'hour')
        {
            ctx.drawImage(hrHandImg, -7, 5, width*1.5, -length);
        }
    
        if(type === 'minute')
        {
    
            ctx.drawImage(minHandImg, -5, 7, width*1.5, -length);
    
        }
    
        if(type === 'second') {
            ctx.lineWidth = width;
            ctx.lineCap = "round";
            ctx.lineTo(0, -length);
            ctx.stroke();
        }
    
        ctx.rotate(-pos);        
    } else {
    
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.moveTo(0,0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.rotate(-pos);

    }
}
