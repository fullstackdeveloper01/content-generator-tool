export function drawGrid(canvas, params) {
    let gridElements = [];
    var w = canvas.backgroundRect.width;    
    var h = canvas.backgroundRect.height;
    var z = canvas.getZoom();
    for (let i = 0; i < (w*z) / (params.width*z); i++) {
        for (let j = 0; j < (h*z) / (params.height*z); j++) {
            let circle = new fabric.Circle({
                left: i * params.width,
                top: j * params.height,
                radius: params.cellSize/z,
                fill: params.cellColor,
                selectable: false,
                evented: false,
                objectCaching: false,
                custtype: 'grid'
            });
            gridElements.push(circle);
        }
    }
    let group = new fabric.Group(gridElements, {
        left: canvas.backgroundRect.aCoords.tl.x,
        top: canvas.backgroundRect.aCoords.tl.y,
        selectable: false,
        evented: false,
        objectCaching: false,
        custtype: 'grid'
    });
    canvas.add(group);
    canvas.renderAll();
    return group;
}
