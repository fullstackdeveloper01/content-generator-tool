import {addCommonMethods} from "../addCommonMethods";

export async function initAnalogDateTime(id, toolVariant, initialParams, initialGroupParams, canvas, name = null) {
    let additionalParams = {
    };
    let groupParams = {
        id,
        ...initialGroupParams,
    }
    let datetimeParams = {
        id,
        objectType: 'analogdatetime',
        ...additionalParams,
        ...{
            top: 0,
            left: 0,
            width: initialGroupParams.width,
            height: initialGroupParams.height
        },
        ...initialParams
    }

    var clockImg = new Image();
    var analogclockImg = new fabric.Image(clockImg);

    analogclockImg.set({
        id,
        left: groupParams.left,
        top: groupParams.top,
        width: groupParams.width,
        height: groupParams.height,
        originX: groupParams.originX,
        originY: groupParams.originY,
        objectType: datetimeParams.objectType,
        opacity: 0,
        clockFaceNeed: true,
    });

    addCommonMethods(analogclockImg, canvas);
    clockImg.src = analogclockImg.getClockURL();
    analogclockImg.initDateTime();

    return {
        id,
        name: name ? name : 'Timer',
        visible: true,
        selectable: true,
        groupParams,
        objectParams: datetimeParams,
        objectType: 'analogdatetime',
        object: analogclockImg,
        effects: [],
        animations: []
    };
}