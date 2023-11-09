import getObjectFromToolName from "../../helpers/getObjectFromToolName";
import { StateManager } from '../../helpers/StateManager';
import {cloneCanvas, parseFileData, saveFileToServer} from "@/helpers/importExport";
import store from "@/store";
import Vue from 'vue';

const defaultFile = {
    name: null,
    params: {
        width: 1280,
        height: 720,
        backgroundColor: '#ffffff',
        backgroundImage: null,
        hideBackground: false,
        duration: 20,
        opacity:1
    },
    origobjects: [],
    scenes: [
        {
            name: 'Scene 1',
            duration: 20,
            preview: null,
            loop: false,
            backgroundColor: '#ffffff',
            backgroundImage: null,
            hideBackground: false,
            opacity: 1,
            objects: []
        },
    ]
};

const defaultScene = {
    name: `New Scene`,
    preview: null,
    duration: 20,
    backgroundColor: '#ffffff',
    backgroundImage: null,
    hideBackground: false,
    opacity: 1,
    objects: []
};

let lastFileSaveTime = 0;
const saveToServer = async({file, bgRect}) => {
    var filename = file.name;
    // if(!filename)
    //     filename = 'draft';
    if ((new Date().getTime()) - lastFileSaveTime > 10000) {
        lastFileSaveTime = new Date().getTime();
        await saveFileToServer({file, name: filename, bgRect, isDraft: true});
    }
}

const scenesModule = {
    namespaced: true,
    getters: {
        currentObject({file, currentObjectIndex, currentSceneIndex}) {
            return file.scenes[currentSceneIndex] ? file.scenes[currentSceneIndex].objects[currentObjectIndex] : false;
        },
        currentScene({file, currentSceneIndex}) {
            return file.scenes[currentSceneIndex];
        },
        params({file}) {
            return file.params;
        },
        scenes({file}) {
            return file.scenes;
        }
    },
    state: {
        file: JSON.parse(JSON.stringify(defaultFile)),
        list: {
            current: null,
            originalFile: null,
            sceneIndex: 0,
            objectIndex: -1
        },
        currentSceneIndex: 0,
        currentObjectIndex: -1,
        currentMultiObjectIndex:[],
        multiObjects: false,
        fabricObject: null,
        copyPaste: {
            isCopy: true,
            object: null,
            fabricObject: null
        },
        stateManager: null,
        bgRect: null
    },
    mutations: {
        async exitListMode(state) {
            return new Promise(resolve => {
                const clonedFile = cloneCanvas(state.file);
                state.list.listData = clonedFile;
                parseFileData(state.list.originalFile, state.list.current.canvas, (file => {
                    state.file = file;
                    state.list.current = null;
                    state.file.scenes[state.list.sceneIndex].objects[state.list.objectIndex].objectParams.listData = clonedFile;

                    state.currentSceneIndex = state.list.sceneIndex;
                    state.currentObjectIndex = state.list.objectIndex;
                    let list = state.file.scenes[state.list.sceneIndex].objects[state.currentObjectIndex];
                    list.groupParams.width = clonedFile.params.width;
                    list.groupParams.height = clonedFile.params.height;
                    list.objectParams.width = clonedFile.params.width;
                    list.objectParams.height = clonedFile.params.height;
                    list.object.width = clonedFile.params.width;
                    list.object.height = clonedFile.params.height;
        

                    setTimeout(() => {
                        resolve();
                    }, 1)
                }));
            });
        },
        async enterListMode(state, {list}) {
            return new Promise(resolve => {
                state.list.sceneIndex = state.currentSceneIndex;
                state.list.objectIndex = state.currentObjectIndex;
                const clonedFile = cloneCanvas(state.file);
                state.list.originalFile = clonedFile;
                state.list.current = list;
                parseFileData(state.file.scenes[state.list.sceneIndex].objects[state.currentObjectIndex].objectParams.listData, list.canvas, (file => {
                    state.file = file;
                }));
                resolve();
            })

        },
        initStateManager(state, canvas) {
            state.bgRect = canvas.backgroundRect;
            state.stateManager = new StateManager(canvas);
        },
        setSceneParam(state, {key, val}) {
            state.file.scenes[state.currentSceneIndex][key] = val;
        },
        setFileName(state, {name}) {
            state.file.name = name;
        },
        setFileParam(state, {key, val}) {
            state.file.params[key] = val;
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        setFile(state, file) {
            state.currentSceneIndex = 0;
            state.currentObjectIndex = 0;
            state.fabricObject = null;
            state.file = file;
        },
        addScene(state,index =null) {
            let newScene = JSON.parse(JSON.stringify(defaultScene));
            let newIndex = index != null? index+1:state.file.scenes.length + 1 
            newScene.name = `Scene ${newIndex}`;
            state.file.scenes = [
                ...state.file.scenes,
                newScene
            ]
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        deleteAllScene(state, canvas) {        
            if(canvas) {
                var canObjs = canvas.getObjects().filter(cobj => {
                    return cobj.sceneIndex >= 0 && cobj.custtype != 'bgrect';
                });
                canObjs.forEach((canObj) => {
                    canvas.remove(canObj);
                });
                canvas.renderAll();
                state.stateManager = new StateManager(canvas);
            }            
            state.file.scenes.forEach((scene) => {
                scene.objects = [];
            });
            state.file = JSON.parse(JSON.stringify(defaultFile));
            state.currentSceneIndex = 0;
        },
        deleteScene(state, params) {
            var index = params.index;
            var canvas = params.canvas;
                          
            if(canvas) {
                var canObjs = canvas.getObjects().filter(cobj => {
                    return cobj.sceneIndex >= 0 && cobj.sceneIndex === index;
                });
                canObjs.forEach((canObj) => {
                    canvas.remove(canObj);
                });
            }            
            state.file.scenes = state.file.scenes.filter((scene, sceneIndex) => {
                return sceneIndex !== index;
            })
            
            state.stateManager.addItem('deleteScene', index, state);
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        setSceneIndex (state, newSceneIndex) {
            let oldSceneIndex = state.currentSceneIndex;
            let scenes = state.file.scenes;

            if (scenes[oldSceneIndex]) {
                scenes[oldSceneIndex].objects.forEach(objectData => {
                    objectData.object.visible = false;
                })
            }
            if (scenes[newSceneIndex]) {
                scenes[newSceneIndex].objects.forEach(objectData => {
                    objectData.object.visible = objectData.visible;
                })
            }
            state.currentSceneIndex = newSceneIndex;
            state.stateManager.addItem('setSceneIndex', newSceneIndex, state);
            console.log(' state.currentSceneIndex ',  state.currentSceneIndex )
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        updateScenePreview(state, canvas) {
            if(state.file.scenes[state.currentSceneIndex])
                state.file.scenes[state.currentSceneIndex].preview = canvas.toDataURL();
        },
        addObjectToScene(state, object) {
            state.file.scenes[state.currentSceneIndex].objects = [
                ...state.file.scenes[state.currentSceneIndex].objects,
                object
            ]

            state.file.origobjects.push(object);

            state.currentObjectIndex = state.file.scenes[state.currentSceneIndex].objects.length - 1;

            object.object.sceneIndex = state.currentSceneIndex;

            state.stateManager.addItem('newObject', state.currentSceneIndex, state);
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        removeObjectFromScene(state, target) {
            let objectToRemove = state.file.scenes[state.currentSceneIndex].objects.filter(object => object.id === target.id)[0];
            if (objectToRemove && objectToRemove.object && objectToRemove.object.onRemove) {
                objectToRemove.object.onRemove();
            }
            let index = state.file.scenes[state.currentSceneIndex].objects.indexOf(objectToRemove);
            state.stateManager.addItem('removeObject', state.currentSceneIndex, state);
            state.file.scenes[state.currentSceneIndex].objects = state.file.scenes[state.currentSceneIndex].objects.filter(object => {
                return object.id !== target.id;
            })
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        setFabricObject(state, target) {
            state.fabricObject = target;
            if (target && state.file.scenes[state.currentSceneIndex]) {
                state.currentObjectIndex = state.file.scenes[state.currentSceneIndex].objects.map(object => object.id).indexOf(target.id);
            }
        },
        setMultiObjects(state, multiObjects) {
            // this is going to create list of multiple selected indexes
            if(multiObjects){
                state.currentObjectIndex = -1
                state.currentMultiObjectIndex = multiObjects.map(item=> {
                    return multiObjects[0].canvas.getObjects().indexOf(item)
                })
            }else{
                state.currentMultiObjectIndex =[]
            }
            state.multiObjects = multiObjects;
        },
        selectObject(state, params) {
            var index = params.index;
            var canvas = params.canvas;
            state.currentObjectIndex = index;
            state.currentMultiObjectIndex =[]
            state.fabricObject = state.file.scenes[state.currentSceneIndex].objects[index].object;
            canvas.setActiveObject(state.fabricObject);
            canvas.renderAll();
        },
        updateObjectName(state, name) {
            state.file.scenes[state.currentSceneIndex].objects[state.currentObjectIndex].name = name;
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        updateObjectParam(state, {key, value, object=null}) {
            if(object != null){
                let foundIndex  = 0 
                state.file.scenes[state.currentSceneIndex].objects.map((item,index) => {
                    if(item.id == object.id){
                        foundIndex = index
                    }
                }
                )                    
                state.stateManager.addItem('updateObjectParam', state.currentSceneIndex, state);
                state.file.scenes[state.currentSceneIndex].objects[foundIndex].objectParams[key] = value;

            }else{            
                if(state.multiObjects) {
                    state.multiObjects.map(singleObject=>{
            
                        let foundIndex  = 0 
                        state.file.scenes[state.currentSceneIndex].objects.map((item,index) => {
                            if(item.id == singleObject.id){
                                foundIndex = index
                            }
                        }
                        )                    
                        state.stateManager.addItem('updateObjectParam', state.currentSceneIndex, state);
                        if(state.file.scenes[state.currentSceneIndex].objects[foundIndex])
                        state.file.scenes[state.currentSceneIndex].objects[foundIndex].objectParams[key] = value;
            
                    })
                } else if(state.file.scenes[state.currentSceneIndex].objects.length > 0 && state.file.scenes[state.currentSceneIndex].objects[state.currentObjectIndex]) {
                    state.stateManager.addItem('updateObjectParam', state.currentSceneIndex, state);
                    //console.log('updating object param', key, value);
                    state.file.scenes[state.currentSceneIndex].objects[state.currentObjectIndex].objectParams[key] = value;
                } else {
                    if(state.stateManager)
                    state.stateManager.addItem('updateObjectParam', state.currentSceneIndex, state);
                }
            }
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        updateGroupParam(state, {key, value, addToHistory = true}) {
            if(!state.file.scenes[state.currentSceneIndex].objects[state.currentObjectIndex]) return;
            if (addToHistory) {
                state.stateManager.addItem('updateGroupParam', state.currentSceneIndex, state);
            }
            // console.log('updating group param', key, value);
            state.file.scenes[state.currentSceneIndex].objects[state.currentObjectIndex].groupParams[key] = value;
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        async setObjectEffects(state, effects) {
            state.file.scenes[state.currentSceneIndex].objects[state.currentObjectIndex].effects = effects;
            var object = state.fabricObject;
            await object.removeOldEffects();
            object.effects = effects;
            object.initEffects();
            object.applyEffects();
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        setObjectAnimations(state, animations) {
            state.file.scenes[state.currentSceneIndex].objects[state.currentObjectIndex].animations = animations;
            state.fabricObject.effects = animations;
            // state.fabricObject.initEffects();
            // state.fabricObject.applyEffects();
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        toggleObjectVisibility(state, objectIndex) {
            let visible = !state.file.scenes[state.currentSceneIndex].objects[objectIndex].object.visible;
            state.file.scenes[state.currentSceneIndex].objects[objectIndex].visible = visible;
            state.file.scenes[state.currentSceneIndex].objects[objectIndex].object.visible = visible;
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        toggleObjectSelectable(state, objectIndex) {
            let selectable = state.file.scenes[state.currentSceneIndex].objects[objectIndex].object.locked;

            Vue.set(state.file.scenes[state.currentSceneIndex].objects[objectIndex], 'locked', !selectable);
            state.file.scenes[state.currentSceneIndex].objects[objectIndex].object.locked = !selectable;

            state.file.scenes[state.currentSceneIndex].objects[objectIndex].selectable = selectable;
            state.file.scenes[state.currentSceneIndex].objects[objectIndex].object.selectable = selectable;
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
       

        setSelectedObjectIndex(state, {index, relative = false}) {
           
           function  move(array, from, to) {
                if( to === from ) return array;
              
                var target = array[from];                         
                var increment = to < from ? -1 : 1;
              
                for(var k = from; k != to; k += increment){
                  array[k] = array[k + increment];
                }
                array[to] = target;
                return array;
              }

                if(state.fabricObject != null){
                    if (relative) {
                        index = state.currentObjectIndex + index;
                    }
                    if (index < 0) {
                        index = 0;
                    }
                    if (index >= state.file.scenes[state.currentSceneIndex].objects.length) {
                        index = state.file.scenes[state.currentSceneIndex].objects.length-1;
                    }
                    let object = state.file.scenes[state.currentSceneIndex].objects.splice(state.currentObjectIndex, 1)[0];
                    state.file.scenes[state.currentSceneIndex].objects.splice(index, 0, object);
                    state.currentObjectIndex = index;
                    state.fabricObject.moveTo(index + 1);
                    state.fabricObject.canvas.setActiveObject(state.fabricObject);
                    state.fabricObject.canvas.renderAll();
                }else{
                    // checking if multiple objects selected
                    if(state.multiObjects != null) {
                        // mainObjects from store copied to use 
                        let mainListOfObjects = JSON.parse( JSON.stringify( state.file.scenes[state.currentSceneIndex].objects))
                        let multiIndexes =  state.currentMultiObjectIndex

                        // if index is 1 then sort desc or sort asc (indexes)
                        if(index >0)
                            multiIndexes =  state.currentMultiObjectIndex.sort((f, s) => s - f)
                         else{
                            multiIndexes =  state.currentMultiObjectIndex.sort((f, s) =>   f-s)
                         }
                         // select objects from store based on selected indexes
                        const sceneObjects =  multiIndexes.map(currentIndex => { 
                            return mainListOfObjects[currentIndex-1]
                        })
                        let newIndexes= []
                        // check if object reached at end at both end lower or higher 
                        if((index > 0 && multiIndexes[0] < mainListOfObjects.length ) || index < 0  && multiIndexes[0] > 1){
                            sceneObjects.forEach(singleObject => { 
                                const currentIndex = mainListOfObjects.indexOf(singleObject)
                                    newIndexes.push(currentIndex+index)
                                    mainListOfObjects = move(mainListOfObjects, currentIndex, currentIndex+index)                            
                                    const selectedCanvasObject = state.multiObjects[0].canvas.getActiveObjects().filter(item=>{
                                        return (item.id == singleObject.object.id || singleObject.id == item.id)
                                    })
                                    //moving object index on canvas
                                    const canvasObjIndex = state.multiObjects[0].canvas.getObjects().indexOf(selectedCanvasObject[0])
                                    if(selectedCanvasObject[0])
                                        selectedCanvasObject[0].moveTo(canvasObjIndex+index);
                                
                            })
                            state.file.scenes[state.currentSceneIndex].objects = mainListOfObjects

                            state.currentMultiObjectIndex = state.currentMultiObjectIndex.map(item=> { 
                                
                                return item + index
                            })
                        }

                    }
                }
            
        },
        cutObject(state, canvas) {
            if (state.fabricObject) {
                state.copyPaste.isCopy = false;
                state.copyPaste.object = state.file.scenes[state.currentSceneIndex].objects.splice(state.currentObjectIndex, 1)[0];
                state.copyPaste.fabricObject = state.copyPaste.object.object;
                canvas.remove(state.fabricObject);
                saveToServer({file: state.file, bgRect: state.bgRect});
            }
        },
        copyMultiple(state, canvas){
            if(state.multiObjects){
                state.copyPaste.isCopy = true;
                state.multiObjects.map(singleObject=>{
                    let found =  state.file.scenes[state.currentSceneIndex].objects.filter((item=> item.id == singleObject.id ))
                    state.copyPaste.object  = found[0]
                    this.commit("scenes/pasteMultiObject", {canvas: canvas, toCenter: false, cpObj:state.copyPaste})
                })
                saveToServer({file: state.file, bgRect: state.bgRect});

            }
        },
        async pasteMultiObject(state, {canvas, toCenter = false, cpObj}) {
            let object = cpObj.object;
            let objectParams = JSON.parse(JSON.stringify(object.objectParams));
            objectParams.name = object.name;
            if (cpObj.isCopy) {
                objectParams.id = null;
                objectParams.name+= ' - copy';
            }
            let groupParams = JSON.parse(JSON.stringify(object.groupParams));
            if (toCenter) {
                groupParams.left = (canvas.width - groupParams.width) / 2;
                groupParams.top = (canvas.height - groupParams.height) / 2;
            }
            let newObject = await getObjectFromToolName(object.objectType, object.objectParams.shape, objectParams, groupParams, canvas, cpObj.isCopy, state.currentSceneIndex);
            newObject.object.id = newObject.id;
            
            //apply the properties to pasted object
            newObject.object.width = object.object.width;
            newObject.object.height = object.object.height;
            newObject.object.scaleX = object.object.scaleX;
            newObject.object.scaleY = object.object.scaleY;
            newObject.object.text = object.object.text;
            
            state.file.scenes[state.currentSceneIndex].objects.push(newObject);
            canvas.add(newObject.object);
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        copyObject(state, canvas) {
            if (state.fabricObject) {
                state.copyPaste.isCopy = true;
                state.copyPaste.object  = state.file.scenes[state.currentSceneIndex].objects[state.currentObjectIndex];
                state.copyPaste.fabricObject = state.copyPaste.object.object;
                saveToServer({file: state.file, bgRect: state.bgRect});
            }
        },
        async pasteObject(state, {canvas, toCenter = false}) {
            let object =  state.copyPaste.object;
            if(!object) return false;
            let objectParams = JSON.parse(JSON.stringify(object.objectParams));
            if (state.copyPaste.isCopy) {
                objectParams.id = null;
            }
            let groupParams = JSON.parse(JSON.stringify(object.groupParams));
            var coords = canvas.getMouseCoords();
            groupParams.left = coords.x;
            groupParams.top = coords.y;
            let newObject = await getObjectFromToolName(object.objectType, object.objectParams.shape, objectParams, groupParams, canvas, state.copyPaste.isCopy, state.currentSceneIndex);
            newObject.object.id = newObject.id;
            newObject.object.sceneIndex = state.currentSceneIndex;
            newObject.object.getCountOfSameTypeObjs(state.currentSceneIndex);
            
            //apply the properties to pasted object
            newObject.object.width = object.object.width;
            newObject.object.height = object.object.height;
            newObject.object.scaleX = object.object.scaleX;
            newObject.object.scaleY = object.object.scaleY;
            newObject.object.text = object.object.text;

            state.file.scenes[state.currentSceneIndex].objects.push(newObject);
            canvas.add(newObject.object);
            if (toCenter) {
                newObject.object.center();
            }
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        undo(state) {
            state.stateManager.undo(state);
            saveToServer({file: state.file, bgRect: state.bgRect});
        },
        redo(state) {
            state.stateManager.redo(state);
            saveToServer({file: state.file, bgRect: state.bgRect});
        }
    }
};

export default scenesModule;
