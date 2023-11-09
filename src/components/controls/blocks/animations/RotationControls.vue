<script>
    import BaseAnimationComponent from "./BaseAnimationComponent";

    export default {
        extends: BaseAnimationComponent
    }
</script>
<template>
    <div>
        <div>
            <div class="inputs-row">
                <div class="input-block input-block--full-size">
                    <NumberInput :slider="true" v-model="animation.params.start" :min="-180" :max="180" :step="1" textBefore="Start" textAfter="°" />
                </div>
            </div>
            <div class="inputs-row">
                <div class="input-block input-block--full-size">
                    <NumberInput :slider="true" v-model="animation.params.end" :min="-180" :max="180" :step="1" textBefore="End" textAfter="°" />
                </div>
            </div>
            <div class="inputs-row">
                <div class="input-block input-block--line">
                    <NumberInput v-model="animation.params.loops" :min="0" :max="10" :step="1" textBefore="Loops" />
                </div>
                <div class="input-block input-block--line">
                    <select class="select" v-model="animation.params.direction">
                        <option value="cw">CW</option>
                        <option value="ccw">CCW</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>
