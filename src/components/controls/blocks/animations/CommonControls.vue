<script>
    import BaseAnimationComponent from "./BaseAnimationComponent";
    import {mapGetters} from "vuex";

    export default {
        extends: BaseAnimationComponent,
        computed: {
           ...mapGetters('scenes', ['currentScene'])
        },
    }
</script>
<template>
    <div class="common-controls">
        <div class="inputs-row">
            <div class="input-block input-block--line">
                <div class="input-block__title">Time</div>
                <div class="input-block__row">
                    <NumberInput v-model="animation.params.time_start" :min="0" :max="animation.params.time_end" :step="1" />
                    <NumberInput v-model="animation.params.time_end" :min="animation.params.time_start" :max="currentScene.duration" :step="1" textBefore="-" />
                </div>
            </div>
        </div>
        <div v-if="animation && animation.id !== 'play'" class="inputs-row">
            <div class="input-block input-block--line">
                <div class="input-block__title">Ease</div>
                <div class="input-block__row">
                    <select v-model="animation.params.ease" class="select">
                        <option value="linear">Linear</option>
                        <option value="smooth">Smooth</option>
                        <option value="smooth_x2">Smooth x2</option>
                        <option value="smooth_x4">Smooth x4</option>
                        <option value="elastic">Elastic</option>
                        <option value="backward">Backward</option>
                        <option value="bouncing">Bouncing</option>
                    </select>
                    <select v-model="animation.params.ease_direction" class="select" :disabled="animation.params.ease === 'linear'">
                        <option value="out">Out</option>
                        <option value="in">In</option>
                        <option value="in_out">In-Out</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>
