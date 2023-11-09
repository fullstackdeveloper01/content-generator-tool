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
                <NumberInput :slider="true" v-model="animation.params.x" :min="-100" :max="100" :step="1" :multiplier="100" textBefore="X" textAfter="%" />
            </div>
        </div>
        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="animation.params.y" :min="-100" :max="100" :step="1" :multiplier="100" textBefore="Y" textAfter="%" />
            </div>
        </div>
    </div>
</template>
