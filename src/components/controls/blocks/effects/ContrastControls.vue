<script>
    import BaseEffectComponent from "./BaseEffectComponent";

    export default {
        extends: BaseEffectComponent
    }
</script>
<template>
    <div class="inputs-row">
        <div class="input-block input-block--full-size">
            <NumberInput :slider="true" v-model="effect.params.contrast" :min="-100" :max="100" :step="1" :multiplier="100" textAfter="%" />
        </div>
    </div>
</template>
