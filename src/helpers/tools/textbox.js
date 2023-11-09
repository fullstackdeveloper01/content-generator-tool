import {addCommonMethods} from "../addCommonMethods";
import {doubleClick, ungroup} from "../commonObjectFunctions";

export async function initTextbox(id, toolVariant, initialParams, initialGroupParams, canvas, name = null) {
    let additionalParams = {
        fontSize: 36,
        fontStyle: 'normal',
        fontWeight: 'normal',
        textAlign: 'left',
        text: 'Hello World',
        fill: '#111111',
    };
    let groupParams = {
        id,
        ...initialGroupParams,
    }
    let textboxParams = {
        id,
        objectType: 'text',
        scrollDirection: null,
        scrollSpeed: 50,
        scrollStopTime: 0,
        originY: 'top',
        fixedHeight:initialGroupParams.height,
        ...additionalParams,
        ...{
            top: 0,
            left: 0,
            width: initialGroupParams.width,
            height: initialGroupParams.height
        },
        ...initialParams
    }

    let textbox = new fabric.Textbox('', textboxParams);

    textbox.set({
        left: groupParams.left,
        top: groupParams.top,
        originX: groupParams.originX,
        originY: groupParams.originY,
        splitByGrapheme: false,
        width: initialGroupParams.width,
        minWidth: initialGroupParams.width,
        height: initialGroupParams.height,
        minHeight: initialGroupParams.height,
    });
    addCommonMethods(textbox, canvas);

    return {
        id,
        name: name ? name : 'Text',
        visible: true,
        selectable: true,
        groupParams,
        objectParams: textboxParams,
        objectType: 'text',
        object: textbox,
        effects: [],
        animations: [],
        fixedHeight:initialGroupParams.height
    };
}
