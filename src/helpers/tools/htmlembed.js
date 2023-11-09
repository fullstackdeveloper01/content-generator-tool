import {addCommonMethods} from "../addCommonMethods";
import {doubleClick, ungroup} from "../commonObjectFunctions";

export async function initHtmlembed(id, toolVariant, initialParams, initialGroupParams, canvas, name = null) {
    let additionalParams = {
        fontSize: 36,
        fontStyle: 'normal',
        fontWeight: 'normal',
        textAlign: 'left',
        text: 'MM DD YYYY h:mm:ss',
        fill: '#111111',
    };
    let groupParams = {
        id,
        ...initialGroupParams,
    }
    let htmlembedParams = {
        id,
        objectType: 'htmlembed',
        pattern: 'MM DD YYYY h:mm:ss',
        ...additionalParams,
        ...{
            top: 0,
            left: 0,
            width: initialGroupParams.width,
            height: initialGroupParams.height
        },
        ...initialParams
    }

    let htmlembedbox = new fabric.IText('', htmlembedParams);

    htmlembedbox.set({
        left: groupParams.left,
        top: groupParams.top,
        editable: false,
        originX: groupParams.originX,
        originY: groupParams.originY,
    });

    addCommonMethods(htmlembedbox, canvas);

    htmlembedbox.scaleX = groupParams.width/htmlembedbox.width;
    htmlembedbox.scaleY = groupParams.height/htmlembedbox.height; 
    
    return {
        id,
        name: name ? name : 'Html',
        visible: true,
        selectable: true,
        groupParams,
        objectParams: htmlembedParams,
        objectType: 'htmlembed',
        object: htmlembedbox,
        effects: [],
        animations: []
    };
}
