import {addCommonMethods} from "../addCommonMethods";
import {fabric} from "@/fabric";
import {doubleClick} from "../commonObjectFunctions";
import store from '../../store'
import {cloneCanvas, parseFileData} from "@/helpers/importExport";

export async function initList(id, toolVariant, initialParams, initialGroupParams, canvas, name = null) {
    alert("sasas");
     let additionalParams = {
        listData: {
            name: null,
            params: {
                width: initialGroupParams.width,
                height: initialGroupParams.height,
                backgroundColor: '#ffffff',
                backgroundImage: null,
            },
            scenes: [
                {
                    name: 'List Scene',
                    duration: 90,
                    loop: false,
                    opacity: 1,
                    objects: []
                },
            ]
        }
    };
    let groupParams = {
        id,
        ...initialGroupParams,
    }
    let listParams = {
        id,
        objectType: 'list',
        ...additionalParams,
        originY: 'top',
        fill: '#fff0',
        stroke: '#ccc',
        strokeWidth: 2,
        strokeDashArray: [10],
        ...{
            top: 0,
            left: 0,
            width: initialGroupParams.width,
            height: initialGroupParams.height
        }
    }


    let list = new fabric.Rect(listParams);
    // let group = new fabric.Group([list], groupParams);
    list.set({
        id,
        left: groupParams.left,
        top: groupParams.top,
        originX: groupParams.originX,
        originY: groupParams.originY,
      //  objectCaching: false,
    });

    // group.on('mousedown', doubleClick(group,  async()  => {
    //     await store.commit('tools/setShowTimeline', false);
    //     await store.commit('scenes/enterListMode', {list});
    //     setTimeout(() => {
    //         store.commit('tools/setTool', null);
    //         window._onCanvasResize();
    //         window._onCanvasChangeZoom(null,.5);
    //         store.commit('canvas/setZoomValue', .5);
    //     }, 1)

    // }));

    addCommonMethods(list, canvas);
    list.visible = false;
    
    // let {clone} = await addCommonMethods(list, canvas, 'list');
    // list.updatePosition = (align) => {
    //     list.set({
    //         top: -1 * group.height / 2,
    //         left: -1 * group.width / 2,
    //         width: group.width - list.strokeWidth,
    //         height: group.height - list.strokeWidth,
    //         scaleX: 1,
    //         scaleY: 1,
    //         originX: "left",
    //         originY: "top",
    //     });
    // }
    // setTimeout(() => {
    //     list.visible = false;
    // }, 1)

    // group.on('scaled', () => {
    //     listParams.listData.params.width = group.width;
    //     listParams.listData.params.height = group.height;
    //     store.commit('scenes/updateObjectParam', {key: 'listData', value: listParams.listData, addToHistory: false});
    // });

    return {
        id,
        name: name ? name : 'List',
        visible: true,
        selectable: true,
        groupParams,
        objectParams: listParams,
        objectType: 'list',
        object: list,
        effects: [],
        animations: []
    };
}
