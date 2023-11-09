import {fabric} from "@/fabric";
import { v4 as uuidv4 } from 'uuid';

import MoveControls from "@/components/controls/blocks/animations/MoveControls";
import RotationControls from "@/components/controls/blocks/animations/RotationControls";
import ScaleControls from "@/components/controls/blocks/animations/ScaleControls";
import BlurControls from "../components/controls/blocks/animations/BlurControls";
import TintControls from "../components/controls/blocks/animations/TintControls";
import TransparencyControls from "../components/controls/blocks/animations/TransparencyControls";
import BCSHControls from "../components/controls/blocks/animations/BCSHControls";
import GlowControls from "../components/controls/blocks/animations/GlowControls";

export const defaultCommonAnimationParams = {
    time_start: 0,
    time_end: 5,
    ease: 'linear',
    ease_direction: 'out'
}

export const availableAnimations = [
    {
        id: 'move_in',
        name: 'Move In',
        defaultParams: {
            x: 0,
            y: 0
        }
    },
    {
        id: 'move_out',
        name: 'Move Out',
        defaultParams: {
            x: 0,
            y: 0
        }
    },
    {
        id: 'scale_in',
        name: 'Scale In',
        defaultParams: {
            x: 1,
            y: 1
        }
    },
    {
        id: 'scale_out',
        name: 'Scale Out',
        defaultParams: {
            x: 1,
            y: 1
        }
    },
    {
        id: 'rotate',
        name: 'Rotation',
        defaultParams: {
            start: 0,
            end: 0,
            loops: 1,
            direction: 'cw'
        }
    },
    {
        id: 'transparency',
        name: 'Transparency',
        defaultParams: {
            start: 0,
            end: 1,
        }
    },
    {
        id: 'blur',
        name: 'Blur',
        defaultParams: {
            start: 0,
            end: 1,
        }
    },
    {
        id: 'tint',
        name: 'Tint',
        defaultParams: {
            color: '#00ff00',
            alpha: 1,
            start: 0,
            end: 1,
        }
    },
    {
        id: 'brightness',
        name: 'Brightness',
        defaultParams: {
            start: 0,
            end: 0,
        }
    },
    {
        id: 'contrast',
        name: 'Contrast',
        defaultParams: {
            start: 0,
            end: 0,
        }
    },
    {
        id: 'saturation',
        name: 'Saturation',
        defaultParams: {
            start: 0,
            end: 0,
        }
    },
    {
        id: 'hue',
        name: 'Hue',
        defaultParams: {
            start: 0,
            end: 0,
        }
    },
    {
        id: 'glow',
        name: 'Glow',
        defaultParams: {
            color: '#00ff00',
            alpha: 1,
            start: 0,
            end: 8,
        }
    },
]

export const controlsMap = {
    'move_in': MoveControls,
    'move_out': MoveControls,
    'scale_in': ScaleControls,
    'scale_out': ScaleControls,
    'rotate': RotationControls,
    'transparency': TransparencyControls,
    'blur': BlurControls,
    'tint': TintControls,
    'brightness': BCSHControls,
    'contrast': BCSHControls,
    'saturation': BCSHControls,
    'hue': BCSHControls,
    'glow': GlowControls
}

const EasingFunctions = {
    // no easing, no acceleration
    linear: t => t,
    // accelerating from zero velocity
    easeInQuad: t => t*t,
    // decelerating to zero velocity
    easeOutQuad: t => t*(2-t),
    // acceleration until halfway, then deceleration
    easeInOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,
    // accelerating from zero velocity
    easeInCubic: t => t*t*t,
    // decelerating to zero velocity
    easeOutCubic: t => (--t)*t*t+1,
    // acceleration until halfway, then deceleration
    easeInOutCubic: t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
    // accelerating from zero velocity
    easeInQuart: t => t*t*t*t,
    // decelerating to zero velocity
    easeOutQuart: t => 1-(--t)*t*t*t,
    // acceleration until halfway, then deceleration
    easeInOutQuart: t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
    // accelerating from zero velocity
    easeInQuint: t => t*t*t*t*t,
    // decelerating to zero velocity
    easeOutQuint: t => 1+(--t)*t*t*t*t,
    // acceleration until halfway, then deceleration
    easeInOutQuint: t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t,
    easeOutBounce(x) {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (x < 1 / d1) {
           return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    },
    easeInElastic(x) {
        const c4 = (2 * Math.PI) / 3;
        return x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
    },
    easeOutElastic(x) {
        const c4 = (2 * Math.PI) / 3;
        return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
    easeInOutElastic(x) {
        const c5 = (2 * Math.PI) / 4.5;
        return x === 0 ? 0 : x === 1 ? 1 : x < 0.5
            ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
            : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
    },
   easeInBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * x * x * x - c1 * x * x;
    },
    easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
    easeInOutBack(x) {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return x < 0.5 ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2 : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    }
}

EasingFunctions.easeInBounce = (x) => {
    return 1 - EasingFunctions.easeOutBounce(1 - x);
}
EasingFunctions.easeInOutBounce = (x) => {
    return x < 0.5 ? (1 - EasingFunctions.easeOutBounce(1 - 2 * x)) / 2 : (1 + EasingFunctions.easeOutBounce(2 * x - 1)) / 2;
}

class Animation {
    constructor(object, params, canvas) {
        this.initialParams = {};
        this.object = object;
        this.params = params;
        this.canvas = canvas;
    }

    getProperties() {return {}}

    setInitialParams() {}

    getEasing() {
        if (this.params.ease === 'linear') {
            return null;
        }
        let directionsMap = {
            'in': 'In',
            'out': 'Out',
            'in_out': 'InOut',
        }
        let typesMap = {
            'smooth': 'Quad',
            'smooth_x2': 'Cubic',
            'smooth_x4': 'Quart',
            'elastic': 'Elastic',
            'backward': 'Back',
            'bouncing': 'Bounce'
        }
        let name = `ease${directionsMap[this.params.ease_direction]}${typesMap[this.params.ease]}`;
        return fabric.util.ease[name];
    }

    restoreInitialParams() {

    }

    start() {
        this.setInitialParams();
        this.object.animate(this.getProperties(), {
            onChange: this.canvas.renderAll.bind(this.canvas),
            easing: this.getEasing(),
            onComplete: () => {
                this.restoreInitialParams();
                this.canvas.renderAll();
            },
            duration: (this.params.time_end - this.params.time_start) * 1000,
        });
    }
}

class FilterAnimation {

    getFilterClass() {

    }
    getParamName() {

    }

    transformParams(params) {
        return params;
    }

    constructor(object, params, canvas) {
        this.object = object;
        this.params = this.transformParams(params);
        this.canvas = canvas;
        this.flipVisibility = false;
        this.percent = 0;
    }
    restoreInitialParams() {
        if (this.flipVisibility) {
            this.object.visible = true;
            //this.object.clone.visible = false;
        }
        // this.object.clone.filters = [];
        // this.object.clone.applyFilters();
        this.object.canvas.renderAll();
    }

    getEasing() {
        let directionsMap = {
            'in': 'In',
            'out': 'Out',
            'in_out': 'InOut',
        }
        let typesMap = {
            'linear': 'Linear',
            'smooth': 'Quad',
            'smooth_x2': 'Cubic',
            'smooth_x4': 'Quart',
            'elastic': 'Elastic',
            'backward': 'Back',
            'bouncing': 'Bounce'
        }
        let name = `ease${directionsMap[this.params.ease_direction]}${typesMap[this.params.ease]}`;
        return EasingFunctions[name] ? EasingFunctions[name] : EasingFunctions.linear;
    }

    start() {
       this.percent = 0;
       this.easing = this.getEasing();
       let object = this.object;
        if (!object.visible) {    
           this.flipVisibility = true;
           object.visible = true;
       }
       this.filter = new this.getFilterClass({
           ...this.params,
           [this.getParamName()]: this.params.alpha !== undefined ? this.params.alpha * this.params.start : this.params.start
       });

       object.filters = [this.filter];

       this.start = window.performance.now();
       requestAnimationFrame(this.nextFrame.bind(this));
    }

    nextFrame() {
        let percent = (window.performance.now() - this.start) / ((this.params.time_end - this.params.time_start) * 1000);
        this.percent = this.easing(percent);
        this.filter[this.getParamName()] = (this.params.start + (this.params.end - this.params.start) * this.percent) * (this.params.alpha !== undefined ? this.params.alpha : 1);
        //this.object.clone.applyFilters();
        this.object.canvas.renderAll();
        if (this.percent < 1) {
            requestAnimationFrame(this.nextFrame.bind(this));
        } else {
            this.restoreInitialParams();
        }
    }
}

class MoveInAnimation extends Animation {
    setInitialParams() {
        this.initialParams = {
            left: this.object.left,
            top: this.object.top
        }
        this.object.left+= this.params.x * (this.params.x >= 0 ?  (this.canvas.width - this.object.left + this.object.width / 2) : (this.object.left + this.object.width / 2));
        this.object.top+= this.params.y * (this.params.y >= 0 ?  (this.canvas.height - this.object.top + this.object.height / 2) : (this.object.top + this.object.height / 2));
    }
    restoreInitialParams() {
        this.object.left = this.initialParams.left;
        this.object.top = this.initialParams.top;
    }

    getProperties() {
        return {
            left: this.initialParams.left,
            top: this.initialParams.top,
        }
    }
}

class MoveOutAnimation extends Animation {
    setInitialParams() {
        this.initialParams = {
            left: this.object.left,
            top: this.object.top
        }
    }
    restoreInitialParams() {
        this.object.left = this.initialParams.left;
        this.object.top = this.initialParams.top;
    }

    getProperties() {
        return {
            left: this.initialParams.left + this.params.x * (this.params.x >= 0 ?  (this.canvas.width - this.initialParams.left + this.object.width / 2) : (this.object.left + this.object.width / 2)),
            top: this.initialParams.top + this.params.y * (this.params.y >= 0 ?  (this.canvas.height - this.initialParams.top + this.object.height / 2) : (this.object.top + this.object.height / 2))
        }
    }
}

class ScaleInAnimation extends Animation {
    setInitialParams() {
        this.object.scaleX = this.params.x;
        this.object.scaleY = this.params.y;
    }
    restoreInitialParams() {
        this.object.scaleX = 1;
        this.object.scaleY = 1;
    }

    getProperties() {
        return {
            scaleX: 1,
            scaleY: 1,
        }
    }
}
class ScaleOutAnimation extends Animation {
    setInitialParams() {

    }
    restoreInitialParams() {
        this.object.scaleX = 1;
        this.object.scaleY = 1;
    }

    getProperties() {
        return {
            scaleX: this.params.x,
            scaleY: this.params.y,
        }
    }
}


class GlowAnimation extends Animation {
    setInitialParams() {
        let object = this.object;
        if (!object.visible) {
            this.flipVisibility = true;
            object.visible = true;
        }
        object.shadow = {
            offsetX: 0,
            offsetY: 0,
            color: this.params.color,
            blur: this.params.start
        }
    }
    restoreInitialParams() {
        if (this.flipVisibility) {
            this.object.visible = true;
        }
        this.object.shadow.blur = 0;
    }

    getProperties() {
        return {
            'shadow.blur': this.params.end
        }
    }

    start() {
        this.setInitialParams();
        this.object.animate(this.getProperties(), {
            onChange: this.canvas.renderAll.bind(this.canvas),
            easing: this.getEasing(),
            onComplete: () => {
                this.restoreInitialParams();
                this.canvas.renderAll();
            },
            duration: (this.params.time_end - this.params.time_start) * 1000,
        });
    }
}

class RotateAnimation extends Animation {
    setInitialParams() {
        this.initialParams = {
            left: this.object.left,
            top: this.object.top,
            originX: this.object.originX,
            originY: this.object.originY,
        }
        this.object.top+= this.object.width / 2;
        this.object.left+= this.object.height / 2;
        this.object.originX = 'center';
        this.object.originY = 'center';
        this.object.angle = this.params.start;
    }
    restoreInitialParams() {
        this.object.angle = 0;
        this.object.originX = this.initialParams.originX;
        this.object.originY = this.initialParams.originY;
        this.object.left = this.initialParams.left;
        this.object.top = this.initialParams.top;
    }

    getProperties() {
        let deg = this.params.end + 360 * this.params.loops;
        if (this.params.direction === 'ccw') {
            deg = this.params.end - 360 * (this.params.loops + 1);
        }
        return {
            angle: deg,
        }
    }
}

class TransparencyAnimation extends Animation {
    setInitialParams() {
        this.object.opacity = 1 - this.params.start;
    }
    restoreInitialParams() {
        this.object.opacity = 1;
    }

    getProperties() {
        return {
            opacity: 1 - this.params.end
        }
    }
}

class BlurAnimation extends FilterAnimation {
    transformParams(params) {
        return {
            ...params,
            start: params.start / 10,
            end: params.end / 10
        }
    }
    getParamName() {
        return 'blur';
    }

    getFilterClass(params) {
        return new fabric.Image.filters.Blur(params);
    }
}

class TintAnimation extends FilterAnimation {
    getParamName() {
        return 'alpha';
    }

    getFilterClass(params) {
        return new fabric.Image.filters.BlendColor({
            ...params,
            mode: 'tint'
        });
    }
}

class BrightnessAnimation extends FilterAnimation {
    getParamName() {
        return 'brightness';
    }
    getFilterClass(params) {
        return new fabric.Image.filters.Brightness(params);
    }
}
class ContrastAnimation extends FilterAnimation {
    getParamName() {
        return 'contrast';
    }
    getFilterClass(params) {
        return new fabric.Image.filters.Contrast(params);
    }
}
class SaturationAnimation extends FilterAnimation {
    getParamName() {
        return 'saturation';
    }
    getFilterClass(params) {
        return new fabric.Image.filters.Saturation(params);
    }
}
class HueAnimation extends FilterAnimation {
    getParamName() {
        return 'rotation';
    }
    getFilterClass(params) {
        return new fabric.Image.filters.HueRotation(params);
    }
}

export const classesMap = {
    'move_in': MoveInAnimation,
    'move_out': MoveOutAnimation,
    'scale_in': ScaleInAnimation,
    'scale_out': ScaleOutAnimation,
    'rotate': RotateAnimation,
    'transparency': TransparencyAnimation,
    'blur': BlurAnimation,
    'tint': TintAnimation,
    'brightness': BrightnessAnimation,
    'contrast': ContrastAnimation,
    'saturation': SaturationAnimation,
    'hue': HueAnimation,
    'glow': GlowAnimation
}
