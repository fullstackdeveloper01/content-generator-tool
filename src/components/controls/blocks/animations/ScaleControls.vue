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
                <NumberInput :slider="true" v-model="animation.params.x" :min="0" :max="10" :step=".1" textBefore="Scale X" />
            </div>
        </div>
        <div class="inputs-row">
            <div class="input-block input-block--line input-block--full-size">
                <NumberInput :slider="true" v-model="animation.params.y" :min="0" :max="10" :step=".1" textBefore="Scale Y" />
            </div>
        </div>
    </div>
</template>
