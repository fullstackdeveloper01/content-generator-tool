<script>
    import BaseAnimationComponent from "./BaseAnimationComponent";

    export default {
        extends: BaseAnimationComponent
    }
</script>
<template>
    <div>
        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="animation.params.start" :min="0" :max="100" :step="1"  :multiplier="100" textBefore="Start" textAfter="%" />
            </div>
        </div>
        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="animation.params.end" :min="0" :max="100" :step="1"   :multiplier="100" textBefore="End" textAfter="%" />
            </div>
        </div>
    </div>
</template>
