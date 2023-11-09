const axios = require('axios');
import fileSaver from 'file-saver';
import getObjectFromToolName from "./getObjectFromToolName";

const instance = axios.create({
    transformRequest: [
        (data, headers) => {
            delete headers.common['Content-Type']
            return data
        },
    ],
});

var apiUrl = window.appSettings.apiUrl;
const listUrl = apiUrl + 'admin/creation-tool/get-saved-composite';
const saveUrl = apiUrl + 'admin/creation-tool/save-composite';
const saveScenesUrl = apiUrl + 'admin/creation-tool/save-scene-thumb';
const openUrl = apiUrl + 'admin/creation-tool/get-composite?path=';
const draftUrl = apiUrl + 'admin/creation-tool/get-draft';
const weatherUrl = apiUrl + 'signage-api/get-weather?woeid=24830&degrees=c';

export async function cloneCanvas(obj, bgRect=null, isDraft=false) {
    let file = {
        name: obj.name,
        params: obj.params,
        origobjects: [],
        scenes: []
    }
    // if(!isDraft)
    // await saveScenePreviews(obj.scenes, obj.name);
    obj.scenes.forEach(scene => {
        let clonedScene = {
            name: scene.name,
            duration: scene.duration,
            //preview: scene.preview,
            preview: '',
            backgroundColor: scene.backgroundColor,
            backgroundImage: scene.backgroundImage,
            hideBackground: scene.hideBackground,
            loop: false,
            opacity: 1,
            objects: []
        };
        scene.objects.forEach(object => { 
            let effects = [];
            let animations = [];
            object.effects.forEach(effect => {
                effects.push({
                    id: effect.id,
                    title: effect.title,
                    params: effect.params
                })
            })
            object.animations.forEach(animation => {
                animations.push({
                    id: animation.id,
                    title: animation.title,
                    params: animation.params
                })
            })

            object.objectParams.scaleX = object.object.scaleX;
            object.objectParams.scaleY = object.object.scaleY;
            object.objectParams.width = object.object.width;
            object.objectParams.height = object.object.height;
            object.objectParams.minWidth = object.object.minWidth;
            object.objectParams.minHeight = object.object.minHeight;
            object.objectParams.left = object.object.left;
            object.objectParams.top = object.object.top;
            object.objectParams.originX = object.object.originX;
            object.objectParams.originY = object.object.originY;
            object.objectParams.text = object.object.text;
            object.objectParams.rssurl = object.object.rssurl;
            object.objectParams.clockFaceNeed = object.object.clockFaceNeed;
            object.objectParams.direction = object.object.direction;
            object.objectParams.topnewscount = object.object.topnewscount;
            object.objectParams.pattern = object.object.pattern;

            if(bgRect) { //generate relative left top
                var bgX = bgRect.aCoords.tl.x;
                var bgY = bgRect.aCoords.tl.y;
                
                var left = (object.object.originX === 'center' ? object.object.left-(object.object.width*object.object.scaleX/2) : object.object.left) - bgX; 
                var top = (object.object.originY === 'center' ? object.object.top-(object.object.height*object.object.scaleY/2) : object.object.top) - bgY;

                object.objectParams.rleft = left;
                object.objectParams.rtop = top;
            }

            const groupParams = JSON.parse(JSON.stringify(object.groupParams));
            groupParams.left-= groupParams.width / 2;
            groupParams.top-= groupParams.height / 2;
            clonedScene.objects.push({
                id: object.id,
                name: object.name,
                groupParams: groupParams,
                objectParams: object.objectParams,
                objectType: object.objectType,
                visible: object.visible,
                selectable: object.selectable,
                effects,
                animations
            })
        })
        file.scenes.push(clonedScene);
    })
    return file;
}

export const exportJson =  (file, bgRect) => {
    return new Promise(async (resolve, reject) => {        
        let jsonFile = await cloneCanvas(file, bgRect);
        let blob = new Blob([JSON.stringify(jsonFile)], {type: 'text/plain;charset=utf-8'});
        fileSaver.saveAs(blob, (file.name || 'Untitled') + '.json');
        resolve();
     })
}

export const parseFileData = async (fileData, canvas, setFile) => {
    if(!fileData.params) return false;
    canvas.clear();
    canvas.init();
    canvas.backgroundRect.width = fileData.params.width;
    canvas.backgroundRect.height = fileData.params.height;
    let sceneIndex = 0;
    var firstscene = null;
    for (let scene of fileData.scenes) {
        console.log(scene.preview)
        if(!firstscene)
        firstscene = scene;
        let objectIndex = 0;
        for (let object of scene.objects) {
            let data = await getObjectFromToolName(object.objectType, object.objectParams.shape, object.objectParams, object.groupParams, canvas, false, sceneIndex);
            if (data && data.object) {
                data.effects = object.effects;
                data.animations = object.animations;

                let sobject = data.object;
                sobject.effects = object.effects;
                sobject.animations = object.animations;
                let fabricObject = sobject;
                for (let key in object.objectParams) {
                    fabricObject[key] = object.objectParams[key];
                }

                data.objectParams = object.objectParams;

                const groupParams = JSON.parse(JSON.stringify(object.groupParams));
                //groupParams.left+= groupParams.width / 2;
                //groupParams.top+= groupParams.height / 2;

                data.groupParams = groupParams;

                if (sceneIndex > 0) {
                    fabricObject.visible = false;
                }
                fabricObject.sceneIndex = sceneIndex;
                canvas.add(fabricObject);

                fabricObject.updateWidthHeight();
                
                if(object.objectParams.rleft) {
                    var bgX = canvas.backgroundRect.aCoords.tl.x;
                    var bgY = canvas.backgroundRect.aCoords.tl.y;
                    
                    fabricObject.left = bgX + object.objectParams.rleft + (fabricObject.width*fabricObject.scaleX/2);
                    fabricObject.top = bgY + object.objectParams.rtop + (fabricObject.height*fabricObject.scaleY/2);
                    fabricObject.setCoords();
                }

                scene.objects[objectIndex] = data;
                fileData.origobjects.push(data);

                sobject.initEffects();
                sobject.applyEffects();
                objectIndex++;

                setTimeout(() => {
                    sobject.applyEffects();
                }, 1000)
            }
        }
        sceneIndex++;
    }
    setFile(fileData);
    if (fileData.scenes.length > 0 && fileData.scenes[0].objects.length > 0) {
      canvas.setActiveObject(fileData.scenes[0].objects[0].object);
    }
    
    if(firstscene) {
        canvas.backgroundRect.fill = firstscene.backgroundColor;
        canvas.backgroundRect.visible = true;
        if (firstscene.backgroundImage) {
            canvas.backgroundRect.visible = false;
            fabric.Image.fromURL(firstscene.backgroundImage, (img) => {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    left: canvas.backgroundRect.aCoords.tl.x,
                    top: canvas.backgroundRect.aCoords.tl.y,
                    originX: 'left',
                    originY: 'top',
                    scaleX: canvas.backgroundRect.width / img.width,
                    scaleY: canvas.backgroundRect.height / img.height,
                    backgroundImageStretch: true,
                });
                canvas.backgroundImage.visible = !firstscene.hideBackground;
            });
        }
        if (firstscene.hideBackground) {
            if (canvas.backgroundImage) {
                canvas.backgroundRect.visible = true;
                canvas.backgroundImage.visible = false;
            }
        }
    }
}

export const importJson = async (file, canvas, setFile) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        let fileData = JSON.parse(e.target.result);
        if (fileData) {
            parseFileData(fileData, canvas, setFile);
        }
    };
    reader.readAsText(file);
}

export const saveScenePreviews = (scenes, filename) => {
   return new Promise((resolve, reject) => {
        const data = new FormData();
        var previews = [];        
        scenes.forEach(scene => {
            data.append('scene[]', scene.preview);
        });
        data.append('name', filename);
        previews = [];
        axios.post(saveScenesUrl, data).then(res => {
            previews = res.data.thumbs;
            if(previews) {
                for(var i=0;i<scenes.length;i++) {
                    console.log(scenes[i].preview);
                    scenes[i].preview = previews[i] + '?' + Math.random();
                }
            }
            resolve();
        })
    })
}

export const saveFileToServer = ({file, name, bgRect=null, isDraft=false}) => {
   return new Promise(async (resolve, reject) => {
        const clonedFile = await cloneCanvas(file, bgRect, isDraft);
        clonedFile.name = name;
        const data = new FormData();
        data.append('canvas', '1');
        data.append('data', JSON.stringify(clonedFile));
        data.append('rewrite', '1');
        data.append('draft', isDraft);
        axios.post(saveUrl, data).then(res => {
            resolve();
        })
    })
}

export const loadDraftFromServer = () => {
    return new Promise((resolve, reject) => {
        axios.get(draftUrl).then(({data}) => {
            resolve(data);
        })
    });
}

export const loadweatherData = () => {
    return new Promise((resolve, reject) => {
        axios.get(weatherUrl).then(({data}) => {
            resolve(data);
        })
    });
}

export const loadFileFromServer = ({path}) => {
    return new Promise((resolve, reject) => {
        axios.get(openUrl+path).then(({data}) => {
            resolve(data);
        })
    });
}

export const loadFilesList = () => {
    return new Promise((resolve, reject) => {
        axios.get(listUrl).then(({data}) => {
            resolve(data.files[Object.keys(data.files)[0]]);
        });
    });
}
