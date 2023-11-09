import {cloneAsImage} from "../helpers/cloneAsImage";
import {hexToRgb} from "../helpers/hexToRgb";

class customFilter {
    constructor(params) {
        this.custom = true;
        this.params = params;
    }

    apply(object) {

    }

    restore(object) {

    }
}

export class rotationFilter extends customFilter {
    apply(object) {
        object.angle = this.params.rotation;
    }
    restore(object) {
        object.angle = 0;
    }
}

export class transparencyFilter extends customFilter {
    apply(object) {
        object.opacity = 1 - this.params.transparency;
    }
    restore(object) {
        object.opacity = 1;
    }
}

export class glowFilter extends customFilter {
    apply(object) {
        let color = hexToRgb(this.params.color);
        let shadow = {
            color: `rgba(${color.r}, ${color.g}, ${color.b}, ${this.params.alpha})`,
            blur: this.params.blur * 50,
            offsetX: 0,
            offsetY: 0
        };
       object.set('shadow', shadow);
    }
    restore(object) {
        object.set('shadow', null);
    }
}

export class shadowFilter extends customFilter {
    apply(object) {
        let angle = this.params.angle * (Math.PI / 180);
        let color = hexToRgb(this.params.color);
        let shadow = {
            color: `rgba(${color.r}, ${color.g}, ${color.b}, ${this.params.alpha})`,
            blur: this.params.blur,
            offsetX: this.params.distance * Math.cos(angle),
            offsetY: this.params.distance * Math.sin(angle),
        };
        object.set('shadow', shadow);
    }
    restore(object) {
        object.set('shadow', null);
    }
}

window._tempPixelate = {
    width: 0,
    height: 0,
    canvas: null,
    pixels: 0,
    alpha: .5,
}

let tempCanvas = document.createElement('canvas');
//document.body.appendChild(tempCanvas);
//tempCanvas.style.position = 'absolute';
//tempCanvas.style.top = 0;

const createMask = (object, canvas, mode = 'mask') => {
    return new Promise((resolve, reject) => {
        fabric.Image.fromURL(canvas.toDataURL(), (img) => {
            img.flipY = false;
            let filter = new fabric.Image.filters.BlendImage({
                image: img,
                mode
            })
            if (!object.effects) {
                object.effects = [];
            } else {
                object.effects = object.effects.filter(item => item.id !== 'mask-effect');
            }
            if (object.applyFilters) {
                // group.filters = [];
                // group.applyFilters();
                object.filters = [filter];
                object.applyFilters();
            } else {
                object.effects.push({
                    id: 'mask-effect',
                    filter
                });
            }
            resolve();
        })
    })

}

let copyCanvas = null;

function objectToCanvas(object, width, height) {
    return new Promise(async(resolve) => {
        if (!copyCanvas) {
            let copyCanvasEl = document.createElement('canvas');
            copyCanvasEl.width = width;
            copyCanvasEl.height = height;
         //  document.body.insertBefore(copyCanvasEl, document.body.firstChild);
            copyCanvas = new fabric.Canvas(copyCanvasEl, {
                backgroundColor: 'rgba(255, 255, 255, 0)'
            });

        } else {
            copyCanvas.remove(...copyCanvas.getObjects());
        }
        let objectData = object.toObject();
        if (objectData.filters) {
            objectData.filters = objectData.filters.filter(effect => effect.type !== 'BlendImage');
        }
        if (objectData.objects) {
            objectData.objects.forEach(groupObjectItem => {
                groupObjectItem.top = 0;
                groupObjectItem.left = 0;
            //    groupObjectItem.left = 0;
            //    groupObjectItem.top = 0;
                if (groupObjectItem.filters) {
                    groupObjectItem.filters = groupObjectItem.filters.filter(effect => effect.type !== 'BlendImage');
                }
            })
        }
        copyCanvas.setWidth(width);
        copyCanvas.setHeight(height * 10);

        fabric.Group.fromObject(objectData, (obj) => {
            setTimeout(() => {
                copyCanvas.add(obj);
                obj.left = 0;
                obj.top = 0;
                copyCanvas.renderAll();
                let copyCtx = copyCanvas.getContext('2d');
                resolve(copyCtx);
            }, 125);
        });
    })
}

export class pixelateFilter extends customFilter {
    async apply(object) {
        let width = object.width * object.scaleX;
        let height = object.height * object.scaleY;
        let canvas;
        if (width !== window._tempPixelate.width || height !== window._tempPixelate.height || !window._tempPixelate.canvas || this.params.pixels !== window._tempPixelate.pixels || this.params.alpha !== window._tempPixelate.alpha) {
            let canvas = tempCanvas;
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let pixels = this.params.pixels;
            let copyCtx = await objectToCanvas(object, width, height);
            let alpha = this.params.alpha;
            let alphaData = copyCtx.getImageData(0,0, copyCanvas.width, copyCanvas.height).data;
            for (let i = 0; i < width / pixels; i++) {
                for (let j = 0; j < height / pixels; j++) {
                    let opacity = Math.random();
                    if (alpha < .8) {
                        opacity = opacity - (opacity * alpha);
                    }
                    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                    if (Math.random() > alpha) {
                        ctx.fillRect(i * pixels, j * pixels, pixels, pixels);
                    }
                }
            }
            let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0, n = alphaData.length; i <n; i += 4) {
                data.data[i + 3] = alphaData[i + 3] > 0 ? data.data[i + 3] : 0;
            }
            ctx.putImageData(data, 0, 0, 0, 0, canvas.width, canvas.height);

            window._tempPixelate.width = width;
            window._tempPixelate.height = height;
            window._tempPixelate.canvas = canvas;
            window._tempPixelate.pixels = pixels;
            window._tempPixelate.alpha = alpha;
            await createMask(object, canvas);
        } else {
            canvas = window._tempPixelate.canvas;
            await createMask(object, canvas);
        }

    }

    restore(object) {
        //object.effects = object.effects.filter(item => item.id !== 'pixelate-mask');
    }
}


export class reflectionFilter extends customFilter {
    async apply(group) {
        group.reflection = await cloneAsImage(group);
        if (group.reflectionGroup) {
            group.remove(group.reflectionGroup);
            group.canvas.remove(group.reflectionGroup);
        }
        group.reflectionGroup = new fabric.Group([group.reflection]);
        group.add(group.reflectionGroup);
        group.reflection.flipY = false;
        group.reflection.top = this.params.distance;
        group.reflection.left = -1 * group.width;
        group.reflection.scaleY = 1;

        let canvas = tempCanvas;
        canvas.width = group.width;
        canvas.height = group.height;

        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let copyCtx = await objectToCanvas(group.reflectionGroup, group.reflectionGroup.width, group.reflectionGroup.height);
        let alphaData = copyCtx.getImageData(0,0, copyCanvas.width, copyCanvas.height);

        let gradient = ctx.createLinearGradient(0,0, 0, canvas.height);
        gradient.addColorStop(1 - this.params.length, `rgba(0, 0, 0, ${this.params.bottom}`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${this.params.top})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0, n = alphaData.data.length; i <n; i += 4) {
            data.data[i + 3] = alphaData.data[i + 3] > 0 ? data.data[i + 3] : 0;
        }
        ctx.putImageData(data, 0, 0, 0, 0, canvas.width, canvas.height);
        ctx.translate(group.reflectionGroup.width, 0);
        ctx.scale(-1, 1);
        group.reflection.flipY = true;
        group.reflection.scaleY = this.params.scale;
        await createMask(group.reflection, canvas);
    }

    restore(group) {
        if (group.reflection) {
            group.remove(group.reflection);
            group.canvas.remove(group.reflection);
            group.reflection = undefined;
        }
        if (group.reflectionGroup) {
            group.remove(group.reflectionGroup);
            group.canvas.remove(group.reflectionGroup);
            group.reflectionGroup = undefined;
        }
        console.log(group);
    }
}


export class wipeFilter extends customFilter {
    async apply(group) {
        let canvas = tempCanvas;
        canvas.width = group.width;
        canvas.height = group.height;

        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let copyCtx = await objectToCanvas(group, group.width, group.height);
        let alphaData = copyCtx.getImageData(0,0, copyCanvas.width, copyCanvas.height);

        let gradient = ctx.createLinearGradient(group.width / 2 + Math.cos(this.params.angle) * (this.params.position - .5) * group.width,group.height / 2 + Math.sin(this.params.angle) * (this.params.position - .5) * group.height, group.width / 2 + Math.cos(this.params.angle) * this.params.blur + Math.cos(this.params.angle) * (this.params.position - .5) * group.width,  group.height / 2 + Math.sin(this.params.angle) *  this.params.blur + Math.sin(this.params.angle) * (this.params.position - .5) * group.height);
        gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
        gradient.addColorStop(1, `rgba(0, 0, 0, 1)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0, n = alphaData.data.length; i <n; i += 4) {
            data.data[i + 3] = alphaData.data[i + 3] > 0 ? data.data[i + 3] : 0;
        }
        ctx.putImageData(data, 0, 0, 0, 0, canvas.width, canvas.height);
        await createMask(group, canvas);

    }

    restore(group) {

    }
}



export class shineFilter extends customFilter {
    async apply(group) {
        let canvas = tempCanvas;
        canvas.width = group.width;
        canvas.height = group.height;

        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let copyCtx = await objectToCanvas(group, group.width, group.height);
        let alphaData = copyCtx.getImageData(0,0, copyCanvas.width, copyCanvas.height);
        let color = hexToRgb(this.params.color);
        let rgb = `${color.r}, ${color.g}, ${color.b}`;
        const angle = (this.params.angle - 90) * (Math.PI/180);
        let gradient = ctx.createLinearGradient(group.width / 2 + Math.cos(angle) * (this.params.position - .5) * group.width,group.height / 2 + Math.sin(angle) * (this.params.position - .5) * group.height, group.width / 2 + Math.cos(angle) * this.params.blur + Math.cos(angle) * (this.params.position - .5) * group.width,  group.height / 2 + Math.sin(angle) *  this.params.blur + Math.sin(angle) * (this.params.position - .5) * group.height);
        gradient.addColorStop(0, `rgba(0, 0, 0, 1)`);
        gradient.addColorStop(.5, `rgba(${rgb}, 1)`);
        gradient.addColorStop(1, `rgba(0, 0, 0, 1)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0, n = alphaData.data.length; i <n; i += 4) {
            data.data[i + 3] = alphaData.data[i + 3] > 0 ? data.data[i + 3] : 0;
        }
       // ctx.putImageData(data, 0, 0, 0, 0, canvas.width, canvas.height);
        await createMask(group, canvas, 'add');

    }

    restore(group) {

    }
}
