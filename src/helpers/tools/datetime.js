import {addCommonMethods} from "../addCommonMethods";
import {doubleClick, ungroup} from "../commonObjectFunctions";

export async function initDateTime(id, toolVariant, initialParams, initialGroupParams, canvas, name = null) {
    let additionalParams = {
        fontSize: 36,
        fontStyle: 'normal',
        fontWeight: 'normal',
        textAlign: 'left',
        text: 'hh:mm:ss',
        fill: '#111111',
    };
    let groupParams = {
        id,
        ...initialGroupParams,
    }
    let datetimeParams = {
        id,
        objectType: 'datetime',
        pattern: 'hh:mm:ss',
        ...additionalParams,
        ...{
            top: 0,
            left: 0,
            width: initialGroupParams.width,
            height: initialGroupParams.height
        },
        ...initialParams
    }

    let datetimebox = new fabric.IText('', datetimeParams);

    datetimebox.set({
        left: groupParams.left,
        top: groupParams.top,
        editable: false,
        originX: groupParams.originX,
        originY: groupParams.originY,
    });

    addCommonMethods(datetimebox, canvas);

    datetimebox.initDateTime();
    datetimebox.scaleX = groupParams.width/datetimebox.width;
    datetimebox.scaleY = groupParams.height/datetimebox.height; 
    
    return {
        id,
        name: name ? name : 'Datetime',
        visible: true,
        selectable: true,
        groupParams,
        objectParams: datetimeParams,
        objectType: 'datetime',
        object: datetimebox,
        effects: [],
        animations: []
    };
}
