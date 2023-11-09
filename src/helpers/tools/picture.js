import {addCommonMethods} from "../addCommonMethods";
import EventBus from "@/EventBus";
export async function initPicture(id, toolVariant, initialParams, initialGroupParams, canvas, name = null) {
    
    let additionalParams = {
        url: ''
    };
    let groupParams = {
        id,
        ...initialGroupParams,
    }
    let pictureParams = {
        id,
        objectType: 'picture',
        ...additionalParams,
        originY: 'top',
        ...{
            top: 0,
            left: 0,
            width: initialGroupParams.width,
            height: initialGroupParams.height
        }
    }

    let picture = new fabric.Image();
    picture.objectType = pictureParams.objectType;
    picture.otherUrls = [''];
    
    picture.initPicture = (url, index=-1) => {
        const noPicture = url === 'n';
        if (!url) {
            url = picture.url;
        } else {
            picture.url = url;
        }

        //let fullUrl = `http://flash.webcraft.company/picture?uri=${url}`;
        let fullUrl = `${url}`;
        const verifyIndex = index !=-1 && picture.otherUrls.length > index;
        verifyIndex && (picture.otherUrls[index] = fullUrl)
        if (noPicture) {
            fullUrl = '/images/blank.png';
            if(verifyIndex){
                picture.otherUrls.splice(index, 1)
                setTimeout(()=>{
                    EventBus.$emit('ExpandContentSection');
                },100)
            }
        }
        return new Promise((resolve, reject) => { 
            pictureParams.otherUrls = picture.otherUrls;
            if( picture.otherUrls.length > 1){
                pictureParams.transitionType        = picture.transitionType; 
                pictureParams.transitionDirection   = picture.transitionDirection;
                pictureParams.transitionEase        = picture.transitionEase;
                pictureParams.easeDirection         = picture.easeDirection;
                pictureParams.scrollStopTime        = picture.scrollStopTime;
                pictureParams.type = "slideShow";
                pictureParams.transition = { "type":picture.transitionType,"typeDirection":picture.transitionDirection, "ease":picture.transitionEase,"easeDirection":picture.easeDirection, "time":picture.scrollStopTime};
            }else{
                pictureParams.type = "normal";
            }
            if(!picture.animImgs) {
                picture.animImgs = [];
            }
            let img = new Image();
            img.onload = () => {
                if(!picture.autoSize) {
                    picture.scaleX = picture.width * picture.scaleX / img.width;
                    picture.scaleY = picture.height * picture.scaleY / img.height;
                } else {
                    picture.scaleX = 1;
                    picture.scaleY = 1;
                }
                picture.pictureWidth = img.width;
                picture.pictureHeight = img.height;
                picture.setSrc(fullUrl, () => {

                    //clone and add in array for multiple image animations
                    picture.clone(function(clone) {
                        clone.opacity = 0;
                        clone.selectable = false;
                        canvas.add(clone);
                        clone.setCoords();
                        canvas.renderAll();
                        canvas.bringToFront(picture);
                        picture.animImgs.push(clone);
                    });  

                    if (noPicture) {
                        setTimeout(() => {
                            picture.url = '';
                        }, 1)
                    }
                     resolve();
                }, {
                     crossOrigin: 'anonymous'
                });         
            }
            img.src = fullUrl;
        })
    }
    if (initialParams.url) {
       await picture.initPicture(initialParams.url);
    }
    let width = picture.pictureWidth || 400;
    let height = picture.pictureHeight || 400;

    picture.set({
        id,
        left: groupParams.left,
        top: groupParams.top,
        width: width,
        height: height,
        scaleX: groupParams.width / width,
        scaleY: groupParams.height / height,
        originX: groupParams.originX,
        originY: groupParams.originY,
        interval: 0,
    });

    addCommonMethods(picture, canvas);
    
    return {
        id,
        name: name ? name : 'Picture',
        visible: true,
        selectable: true,
        groupParams,
        objectParams: pictureParams,
        objectType: 'picture',
        object: picture,
        effects: [],
        animations: []
    };
}
