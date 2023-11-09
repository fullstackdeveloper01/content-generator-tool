import { v4 as uuidv4 } from 'uuid';

import {initTextbox} from "./tools/textbox";
import {initShape} from "./tools/shape";
import {initPicture} from "./tools/picture";
import {initPdf} from "./tools/pdf";
import {initVideo} from "./tools/video";
import {initList} from "./tools/list";
import {initDateTime} from "./tools/datetime";
import {initAnalogDateTime} from "./tools/analogdatetime";
import {initWeather} from "./tools/weather"; 
import {initHtmlembed} from "./tools/htmlembed";

export default async function getObjectFromToolName(toolName, toolVariant, initialParams, initialGroupParams, canvas, isCopy = false, sceneIndex) {
    let data = null;
    let id = initialParams.id ? initialParams.id : uuidv4();
    let name = initialParams.name ? initialParams.name : null;
    initialGroupParams.originX = 'center';
    initialGroupParams.originY = 'center';
    if(!isCopy){
        initialGroupParams.left += initialGroupParams.width / 2;
        initialGroupParams.top += initialGroupParams.height / 2;
    }
    switch (toolName) {
        case 'text':
            data = await initTextbox(id, toolVariant, initialParams, initialGroupParams, canvas, name);
            break;
        case 'shape':
            data = await initShape(id, toolVariant, initialParams, initialGroupParams, canvas, name);
            break;
        case 'picture':
            data = await initPicture(id, toolVariant, initialParams, initialGroupParams, canvas, name);
            break;
        case 'pdf':
                data = await initPdf(id, toolVariant, initialParams, initialGroupParams, canvas, name);
                break;    
        case 'video':
            data = await initVideo(id, toolVariant, initialParams, initialGroupParams, canvas, name);
            break;
        case 'list':
            data = await initList(id, toolVariant, initialParams, initialGroupParams, canvas, name);
            break;
        case 'datetime':
            data = await initDateTime(id, toolVariant, initialParams, initialGroupParams, canvas, name);
            break;
        case 'analogdatetime':
            data = await initAnalogDateTime(id, toolVariant, initialParams, initialGroupParams, canvas, name);
            break;
        case 'weather':
            data = await initWeather(id, toolVariant, initialParams, initialGroupParams, canvas, name);
            break;          
        case 'htmlembed':
            data = await initHtmlembed(id, toolVariant, initialParams, initialGroupParams, canvas, name);
            break;              
        default:
            break;
    }
    if (data && !name) {
        data.name = data.name + ' ' + data.object.getCountOfSameTypeObjs(sceneIndex);
        data.object.name = data.name;
    }
    if (data && data.object) {
        data.object.hasRotatingPoint = false;
        data.locked = false;
        data.object.locked = false;
        data.selectable = true;
        data.object.selectable = true;
    }
    // let proportionLocked = toolName !== 'picture' && toolName !== 'shape';
    // if (data && data.object)
    // data.object.proportionLocked = proportionLocked;
    // if (data && data.objectParams)
    // data.objectParams.proportionLocked = proportionLocked;
    return data;
}
