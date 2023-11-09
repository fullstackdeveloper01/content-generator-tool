<script>
    import BaseEffectComponent from "./BaseEffectComponent";

    export default {
        extends: BaseEffectComponent
    }
</script>
<template>
    <div>
        <div class="inputs-row">
            <div class="input-block input-block--line">
                <Colorpicker v-model="effect.params.color" />
            </div>
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="effect.params.alpha" :min="0" :max="100" :step="1" :multiplier="100" textAfter="%" />
            </div>
        </div>
        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="effect.params.position" :min="0" :max="100"  :multiplier="100" :step="1" textBefore="Position" textAfter="%" />
            </div>
        </div>
        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="effect.params.angle" :min="-180" :max="180" :step="1" textBefore="Angle" textAfter="°" />
            </div>
        </div>
        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="effect.params.blur" :min="0" :max="100" :step="1" textBefore="Blur" textAfter="px" />
            </div>
        </div>
    </div>
</template>
