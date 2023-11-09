
export const doubleClick = function (obj, handler) {
    return function () {
        if (obj.clicked) handler(obj);
        else {
            obj.clicked = true;
            setTimeout(function () {
                obj.clicked = false;
            }, 500);
        }
    };
};

export const ungroup = function (group, canvas) {
    let items = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);
    for (let i = 0; i < items.length; i++) {
        items[i]._ungrouped = true;
        canvas.add(items[i]);
    }
    canvas.renderAll();
};
