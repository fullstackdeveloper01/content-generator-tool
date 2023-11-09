<script>
    import BaseEffectComponent from "./BaseEffectComponent";

    export default {
        extends: BaseEffectComponent
    }
</script>
<template>
    <div>
        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="effect.params.distance" :min="0" :max="100" :step="1" textBefore="Distance" textAfter="px" />
            </div>
        </div>
        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="effect.params.top" :min="0" :max="100" :step="1" :multiplier="100" textBefore="Top" textAfter="%" />
            </div>
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="effect.params.bottom" :min="0" :max="100" :step="1" :multiplier="100" textBefore="Bottom" textAfter="%" />
            </div>
        </div>

        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="effect.params.scale" :min="0" :max="10" :step="1" textBefore="Scale" />
            </div>
        </div>
        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="effect.params.length" :min="0" :max="100" :step="1" :multiplier="100" textBefore="Length" textAfter="%" />
            </div>
        </div>
    </div>
</template>
