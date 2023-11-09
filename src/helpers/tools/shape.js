import {addCommonMethods} from "../addCommonMethods";
//import {doubleClick, ungroup} from "../commonObjectFunctions";

const paths = {
    arrow: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="39 177 208 206" preserveAspectRatio="none" xml:space="preserve"> <path class="st0" d="M143.23,178.32c0.85,0,5.43,0.02,6.53,0c3.94-0.06,8.46,2.78,10.98,5.72c4.79,5.6,78.01,82.36,83.9,94.2 	c5.7,11.46-7.55,23.54-14.5,23.55c-9.37,0.02-21.46,0.06-23.4,0.05c-1.65-0.01-9.09,2.25-9.09,8.65c0,6.4-0.24,55.8-0.24,55.8 	s-1.24,14.23-15.28,14.86c-14.15,0.64-38.89,0.32-38.89,0.32c0,0-24.74,0.32-38.89-0.32c-14.04-0.63-15.28-14.86-15.28-14.86 	s-0.24-49.4-0.24-55.8c0-6.4-7.44-8.66-9.09-8.65c-1.95,0.01-14.03-0.04-23.4-0.05c-6.95-0.01-20.2-12.09-14.5-23.55 	c5.89-11.85,79.11-88.61,83.9-94.2c2.51-2.93,7.04-5.77,10.98-5.72C137.8,178.33,142.39,178.32,143.23,178.32z"/> </svg> ',
    circle: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">  <circle cx="50" cy="50" r="110"/></svg>',
    rectangle: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" /></svg>',
}

const SHAPE_WIDTH = 210;
const SHAPE_HEIGHT = 210;

function loadSVG(imageString) {
    return new Promise((resolve, reject) => {
        fabric.loadSVGFromString(imageString, function (objects, options) {
            let obj = fabric.util.groupSVGElements(objects, options);
            resolve(obj);
        })
    });
}

export async function initShape(id, toolVariant, initialParams, initialGroupParams, canvas, name = null) {

    let additionalParams = {
        shape: toolVariant
    };
    let groupParams = {
        id,
        ...initialGroupParams,
    }
    let shapeParams = {
        id,
        objectType: 'shape',
        ...additionalParams,
        originY: 'top',
        ...{
            top: 0,
            left: 0,
            width: initialGroupParams.width,
            height: initialGroupParams.height
        }
    }

    //let shape = await loadSVG(paths[toolVariant]);
    let shape = null;
    switch (toolVariant) {
        case 'circle':
            shape = new fabric.Ellipse({rx: initialGroupParams.width / 2, ry: initialGroupParams.height / 2});
            break;
        case 'rectangle':
            shape = new fabric.Rect({width: initialGroupParams.width, height: initialGroupParams.height});
            break;
        case 'arrow':
            shape = new fabric.Path('M143.23,178.32c0.85,0,5.43,0.02,6.53,0c3.94-0.06,8.46,2.78,10.98,5.72c4.79,5.6,78.01,82.36,83.9,94.2 	c5.7,11.46-7.55,23.54-14.5,23.55c-9.37,0.02-21.46,0.06-23.4,0.05c-1.65-0.01-9.09,2.25-9.09,8.65c0,6.4-0.24,55.8-0.24,55.8 	s-1.24,14.23-15.28,14.86c-14.15,0.64-38.89,0.32-38.89,0.32c0,0-24.74,0.32-38.89-0.32c-14.04-0.63-15.28-14.86-15.28-14.86 	s-0.24-49.4-0.24-55.8c0-6.4-7.44-8.66-9.09-8.65c-1.95,0.01-14.03-0.04-23.4-0.05c-6.95-0.01-20.2-12.09-14.5-23.55 	c5.89-11.85,79.11-88.61,83.9-94.2c2.51-2.93,7.04-5.77,10.98-5.72C137.8,178.33,142.39,178.32,143.23,178.32z', {width: initialGroupParams.width, height: initialGroupParams.height});
            break;
        default:
            shape = await loadSVG(paths[toolVariant]);
            break;
    }

    shape.set({
        id,
        fill: '#cccccc',
        stroke: '#000000',
        strokeWidth: 1,
        strokeUniform: true,
        left: groupParams.left,
        top: groupParams.top,
        originX: groupParams.originX,
        originY: groupParams.originY,
        objectType: shapeParams.objectType,
        toolVariant: toolVariant,
    });

    if (toolVariant === 'circle') {
        shape.set({
            rx: groupParams.width / 2,
            ry: groupParams.height / 2,
        });
    } else {
        shape.scaleX = groupParams.width/shape.width;
        shape.scaleY = groupParams.height/shape.height; 
        // if(groupParams.width > groupParams.height)
        //     shape.scaleToWidth(groupParams.width);
        // else 
        //     shape.scaleToHeight(groupParams.height);
    }

    addCommonMethods(shape, canvas);

    return {
        id,
        name: name ? name : 'Shape',
        visible: true,
        selectable: true,
        groupParams,
        objectParams: shapeParams,
        objectType: 'shape',
        object: shape,
        effects: [],
        animations: []
    };
}
