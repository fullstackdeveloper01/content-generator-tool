import {fabric} from "@/fabric";
import BlurControls from "@/components/controls/blocks/effects/BlurControls";
import BrightnessControls from "@/components/controls/blocks/effects/BrightnessControls";
import ContrastControls from "@/components/controls/blocks/effects/ContrastControls";
import GlowControls from "@/components/controls/blocks/effects/GlowControls.vue";
import HueControls from "@/components/controls/blocks/effects/HueControls";
import PixelateControls from "@/components/controls/blocks/effects/PixelateControls";
import RotationControls from "@/components/controls/blocks/effects/RotationControls";
import SaturationControls from "@/components/controls/blocks/effects/SaturationControls";
import ShadowControls from "@/components/controls/blocks/effects/ShadowControls";
import TintControls from "@/components/controls/blocks/effects/TintControls";
import TransparencyControls from "@/components/controls/blocks/effects/TransparencyControls";
import ReflectionControls from "@/components/controls/blocks/effects/ReflectionControls";

import {
    glowFilter,
    pixelateFilter,
    reflectionFilter,
    rotationFilter,
    shadowFilter, shineFilter,
    transparencyFilter,
    wipeFilter
} from "./custom";
import WipeControls from "../components/controls/blocks/effects/WipeControls";
import ShineControls from "../components/controls/blocks/effects/ShineControls";

export const availableEffects = [
    {
        id: 'tint',
        name: 'Tint',
        defaultParams: {
            color: '#00ff00',
            alpha: .5,
            mode: 'tint'
        }
    },
    {
        id: 'blur',
        name: 'Blur',
        defaultParams: {
            blur: .5
        }
    },
    {
        id: 'brightness',
        name: 'Brightness',
        defaultParams: {
            brightness: .5
        }
    },
    {
        id: 'contrast',
        name: 'Contrast',
        defaultParams: {
            contrast: .5
        }
    },
    {
        id: 'saturation',
        name: 'Saturation',
        defaultParams: {
            saturation: .5
        }
    },
    {
        id: 'hue',
        name: 'Hue',
        defaultParams: {
            rotation: 0
        }
    },
    {
        id: 'rotation',
        name: 'Rotation',
        defaultParams: {
            rotation: 0
        }
    },
    {
        id: 'transparency',
        name: 'Transparency',
        defaultParams: {
            transparency: .5
        }
    },
    {
        id: 'glow',
        name: 'Glow',
        defaultParams: {
            color: '#00ff00',
            alpha: .5,
            blur: 5
        }
    },
    {
        id: 'pixelate',
        name: 'Pixelate',
        defaultParams: {
            alpha: .5,
            pixels: 10
        }
    },
    {
        id: 'shadow',
        name: 'Shadow',
        defaultParams: {
            color: '#333333',
            alpha: .5,
            distance: 4,
            angle: 45,
            blur: 5
        }
    },
    {
         id: 'reflection',
         name: 'Reflection',
         defaultParams: {
             distance: 0,
             top: 1,
             bottom: 0,
             scale: 1,
             length: 1
         }
     },
     {
         id: 'shine',
         name: 'Shine',
         defaultParams: {
             color: '#ffffff',
             alpha: .5,
             position: .5,
             angle: 0,
             blur: 8
         }
     },
     {
         id: 'wipe',
         name: 'Wipe',
         defaultParams: {
             position: .5,
             angle: 0,
             blur: 8
         }
     },
]

export const controlsMap = {
    'tint': TintControls,
    'blur': BlurControls,
    'brightness': BrightnessControls,
    'rotation': RotationControls,
    'contrast': ContrastControls,
    'saturation': SaturationControls,
    'hue': HueControls,
    'glow': GlowControls,
    'pixelate': PixelateControls,
    'shadow': ShadowControls,
    'transparency': TransparencyControls,
    'reflection': ReflectionControls,
    'wipe': WipeControls,
    'shine': ShineControls
}



export const filtersMap = {
    'tint': fabric.Image.filters.BlendColor,
    'blur': fabric.Image.filters.Blur,
    'brightness': fabric.Image.filters.Brightness,
    'contrast': fabric.Image.filters.Contrast,
    'saturation': fabric.Image.filters.Saturation,
    'hue': fabric.Image.filters.HueRotation,
    'rotation': rotationFilter,
    'transparency': transparencyFilter,
    'glow': glowFilter,
    'pixelate': pixelateFilter,
    'shadow': shadowFilter,
    'reflection': reflectionFilter,
    'wipe': wipeFilter,
    'shine': shineFilter
}
