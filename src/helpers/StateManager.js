import { sortedIndex } from "lodash";
import {addCommonMethods} from "./addCommonMethods";
import {createVideoEl} from "./createVideoEl";

export class StateManager {   
    //https://www.npmjs.com/package/fabric-history - undo/redo logic

    constructor(canvas) {
        this.canvas = canvas;
        this.historyProcessing = false;
        this.history = [];
        this.extraProps = ['selectable', 'evented', 'visible', 'id', 'countid', 'sceneIndex', 'rx', 'ry', 'lockMovementX', 'lockMovementY', 'custtype', 'dirty', 'objectType', 'minWidth', 'minHeight', 'backgroundColor', 'url', 'videoWidth', 'videoHeight', 'autoSize', 'pattern', 'rssurl', 'clockFaceNeed', 'direction'];
        this.emptyJSON = this.historyNext(0);
    }

    /**
     * Returns current state of the string of the canvas
     */
    historyNext(sceneIndex) {
        var json = this.canvas.toJSON(this.extraProps);
        json.sceneIndex = sceneIndex;
        return JSON.stringify(json);
    }
    
    /**
     * It pushes the state of the canvas into history stack
     */
    historySaveAction(type = '', sceneIndex) {
        if (this.historyProcessing)
        return;
        if(!this.history[sceneIndex]) {
            this.history[sceneIndex] = [];
            this.history[sceneIndex].index = 0;
            this.history[sceneIndex][0] = this.emptyJSON;
        }
        var index = this.history[sceneIndex].index;

        var json = {};

        json = this.historyNext(sceneIndex);
        if (json.localeCompare(this.history[sceneIndex][index]) === 0) {
            return false;
        }
        this.history[sceneIndex][++index] = json;
        if (this.history.length >= 100) this.history[sceneIndex].splice(-5, 5);
        this.history[sceneIndex].length = index+1;
        this.history[sceneIndex].index = index;
        //console.log('save history' + index);
        //console.log(this.history);
    }
    
    addItem(type, sceneIndex, state) {
        if(type === 'deleteScene') {
            this.history.splice(sceneIndex, 1);
        } else if(type === 'setSceneIndex') {
            if(this.history[sceneIndex]) {
                var index = this.history[sceneIndex].index;
                this.loadHistory(this.history[sceneIndex][index], 'setIndex', state);
            }
        } else {
            this.historySaveAction(type, sceneIndex);
        }
    }

    /**
     * Undo to latest history. 
     * Pop the latest state of the history. Re-render.
     * Also, pushes into redo history.
     */
    undo(state, callback=null) {
        // The undo process will render the new states of the objects
        // Therefore, object:added and object:modified events will triggered again
        // To ignore those events, we are setting a flag.        
        var sceneIndex = state.currentSceneIndex;
        this.historyProcessing = true;
        var index = this.history[sceneIndex].index;
        //console.log('undo :' + index, sceneIndex, this.history[sceneIndex].length);
        if (index > 0) {
            index -= 1;
            //#114 fix
            if (index > this.history[sceneIndex].length) {
                index = this.history[sceneIndex].length - 1;
            }
            if (!this.history[sceneIndex][index]) {
                this.historyProcessing = false;
                return false;
            }            
            this.loadHistory(this.history[sceneIndex][index], 'undo', state, callback);
            this.history[sceneIndex].index = index;
        } else {            
            this.historyProcessing = false;
        }
        //console.log('undoend :' + index, this.history[sceneIndex].index, this.history[sceneIndex].length);
    }    
    /**
     * Redo to latest undo history.
     */
    redo(state, callback=null) {
        // The undo process will render the new states of the objects
        // Therefore, object:added and object:modified events will triggered again
        // To ignore those events, we are setting a flag.
        var sceneIndex = state.currentSceneIndex;
        this.historyProcessing = true;
        var index = this.history[sceneIndex].index;
        //console.log('redo :' + index, sceneIndex, this.history[sceneIndex].length);
        if (index <= this.history[sceneIndex].length - 1) {
            index += 1;
            if (!this.history[sceneIndex][index]) {
                this.historyProcessing = false;
                return false;
            }
            this.loadHistory(this.history[sceneIndex][index], 'redo', state, callback);
            this.history[sceneIndex].index = index;
        } else {            
            this.historyProcessing = false;
        }
        //console.log('redoend :' + index, this.history[sceneIndex].index, this.history[sceneIndex].length);
    }
    loadHistory(history, event, state, callback=null) {        

        var canobjs = this.canvas.getObjects();
        canobjs.forEach(obj => {
            if(obj.objectType === 'video') {
                if(obj.getElement()) {
                    //obj.getElement().pause();
                    var videoEl = obj.getElement();
                    if(videoEl && videoEl.parentNode)
                    videoEl.parentNode.removeChild(videoEl);
                }
            }
        });
    
        this.canvas.loadFromJSON(history, () => {
            this.canvas.renderAll.bind(this.canvas);

            //process video object after undo / redo
            var objs = JSON.parse(history)['objects'];      
            for(var i=0; i< objs.length; i++){
               if(objs[i].hasOwnProperty('url') && objs[i].objectType === 'video'){
                    var videoEl = createVideoEl(objs[i]['url']); 
                    var fab_video = new fabric.Image(videoEl, {left: objs[i]['left'], top: objs[i]['top'], width: objs[i]['width'], height: objs[i]['height'], scaleX: objs[i]['scaleX'], scaleY: objs[i]['scaleY']});                   

                    //copy props exclude the below props.
                    var nProps = ['rx', 'ry', 'dirty', 'getCountOfSameTypeObjs', 'initEffects', 'removeOldEffects', 'applyEffects']
                    Object.keys(objs[i]).forEach(function(key) {
                        if(!nProps.includes(key)) {
                            fab_video[key] = objs[i][key];
                        }
                    });

                    this.canvas.add(fab_video);      
                    addCommonMethods(fab_video, this.canvas, videoEl);
                    fab_video.initVideo(fab_video.url);
               }
            }

            if(state) {
                //add common methods after undo / redo
                var canobjs = this.canvas.getObjects();
                canobjs.forEach(obj => {
                    addCommonMethods(obj, this.canvas);
                    if(obj.objectType === 'text') {
                        obj.updateWidthHeight();
                        this.canvas.renderAll();
                    }
                    if(obj.objectType === 'datetime' || obj.objectType === 'analogdatetime') {
                        obj.initDateTime();
                        this.canvas.renderAll();
                    }
                })
                
                //object mapping after undo / redo                
                var scene = state.file.scenes[state.currentSceneIndex];
                var canObjs = this.canvas.getObjects().filter(cobj => {
                    return cobj.sceneIndex === state.currentSceneIndex;
                });

                let ids = canObjs.map(a => a.id);

                if(state.file.origobjects)
                    scene.objects = state.file.origobjects.filter(sobj => {
                        return ids.includes(sobj.id);
                    });

                var sceObjs = [];
                canObjs.map(cobj => {
                    let sceObj = scene.objects.filter(sobj => {
                        return sobj.id === cobj.id;
                    });
                    if(sceObj && sceObj.length > 0) {
                        sceObj[0].object = cobj;
                        sceObjs.push(sceObj[0]);
                    }
                })
                scene.objects = sceObjs;
                
                //map background rect after undo / redo
                var objs = this.canvas.getObjects().filter(object => {
                    return object.custtype === 'bgrect'
                })            
                if(objs && objs.length > 0) {
                    if(!objs[0].opacity)
                        objs[0].opacity = 1;
                    this.canvas.backgroundRect = objs[0];
                    state.file.params = {    
                        width: objs[0].width,
                        height: objs[0].height,
                        backgroundColor: objs[0].fill,
                        // backgroundImage: null,
                        // hideBackground: false,
                        // duration: 20,
                        // opacity: objs[0].opacity
                    }
                }
            }
        
            //this.canvas.fire(event);
            this.canvas.renderAll();
            this.historyProcessing = false;
            
            if (callback && typeof callback === 'function')
                callback();
        });
    }
}
