
<script>
    import BaseEffectComponent from "./BaseEffectComponent";

    export default {
        extends: BaseEffectComponent
    }
</script>
<template>
    <div class="inputs-row">
        <div class="input-block input-block--full-size">
            <NumberInput :slider="true" v-model="effect.params.rotation" :min="-180" :max="180" :step="1" textAfter="°" />
        </div>
    </div>
</template>
