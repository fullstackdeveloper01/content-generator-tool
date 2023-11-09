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
                <NumberInput :slider="true" v-model="effect.params.alpha" :min="0" :max="100" :step="1" :multiplier="100" textAfter="%" />
            </div>
        </div>
        <div class="inputs-row">
            <div class="input-block input-block--line">
                <NumberInput v-model="effect.params.pixels" :min="0" :max="32" :step="1" textBefore="Pixels" />
            </div>
        </div>
    </div>
</template>
