<script>
    import RangeSlider from '@/components/external/vue-range-slider.js';
    import 'vue-range-component/dist/vue-range-slider.css'
    export default {
        name: 'NumberInput',
        data() {
            return {
                val: this.value * this.multiplier,
            }
        },
        props: {
            min: {
                type: Number,
                required: false,
                default: 1,
            },
            max: {
                type: Number,
                required: false,
                default: 100,
            },
            value: {
                type: Number,
                required: true
            },
            multiplier: {
                type: Number,
                required: false,
                default: 1,
            },
            step: {
                type: Number,
                required: false,
                default: 1,
            },
            textBefore: {
                type: String,
                required: false,
                default: '',
            },
            textAfter: {
                type: String,
                required: false,
                default: '',
            },
            slider: {
                type: Boolean,
                required: false,
                default: false,
            },
            sliderBefore: {
                type: Boolean,
                required: false,
                default: false,
            },
        },
        watch: {
            value(newValue) {
                this.val = Math.round(newValue * this.multiplier);
             },
        },
        methods: {
            onSlideEnd(newVal) {
                this.val = newVal / this.multiplier;

                this.$emit('input', this.val);
                this.$emit('change', this.val);
            },
            onFocusOut() {
                this.$emit('focusout', this.val);
            },
            onChangeVal(newVal, fromInput = true) {
                newVal = parseInt(newVal);
                if (newVal < this.min) {
                    newVal = this.min;
                }
                if (newVal > this.max) {
                    newVal = this.max;
                }
                this.val = newVal;
                if (fromInput) {
                  //  this.val = newVal / this.multiplier;
                }
                this.$emit('input', newVal / this.multiplier);
                this.$emit('change', newVal / this.multiplier);
            },
            change (dir) {
                let changeAmount = dir * this.step;
                if (this.val + changeAmount >= this.min && this.val + changeAmount <= this.max) {
                    this.val+= changeAmount;
                    this.onChangeVal(this.val, false);
                }
            }
        },
        components: {
            RangeSlider
        }
    }

</script>
<template>
    <div class="number-input" :class="{'number-input--slider-before': sliderBefore}">
        <span class="number-input__text number-input__text--before">{{textBefore}}</span>
        <div class="number-input__inner" >
            <input onkeypress="return event.charCode >= 44 && event.charCode <= 57" :step="step" class="number-input__el" v-model="val" @focusout="(e) => onFocusOut()" @keyup="(e) => onChangeVal(e.target.value)" type="number" />
            <div class="number-input__arrows">
                <a @click="() => change(1)" class="number-input__arrow number-input__arrow--up">
                <svg viewBox="0 0 16 12"><path d="M3.41 4.295 8 8.875l4.59-4.58L14 5.705l-6 6-6-6 1.41-1.41z"></path></svg>
                </a>
                <a @click="() => change(-1)" class="number-input__arrow number-input__arrow--down">
                    <svg viewBox="0 0 16 12" ><path d="M3.41 4.295 8 8.875l4.59-4.58L14 5.705l-6 6-6-6 1.41-1.41z"></path></svg>
                </a>
            </div>
        </div>
        <span class="number-input__text number-input__text--after">{{textAfter}}</span>
      <RangeSlider tooltip="hover" @slide-end="onSlideEnd" v-if="slider" :min="min" :max="max" v-model="val" :step="step" />

    </div>
</template>
<style lang="scss">
    .number-input {
        position: relative;
        height: 26px;
        display: flex;
        align-items: center;
        flex: 1;
        &--slider-before .slider-component {
            order: -1;
        }
        &__inner {
            position: relative;
        }
        &__text {
            color: #D8E0EF;
            font-size: 11px;
            &--before {
                margin: 0 6px 0 0;
            }
            &--after {
                margin: 0 0 0 6px;
            }

        }
        &__el {
            background: none;
            border: 1px solid #4C5F8A;
            border-radius: 2px;
            color: #D8E0EF;
            padding: 0 8px;
            letter-spacing: .5px;
            width: 51px;
            height: 28px;
            font: inherit;
            font-size: 11px;
            box-sizing: border-box;
            -moz-appearance: textfield;
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
                -webkit-appearance: none;
            }
        }
        &__arrows {
            user-select: none;
            position: absolute;
            top: -1px;
            right: 4px;
            display: flex;
            flex-direction: column;
        }

        &__arrow {
            width: 12px;
            height: 8px;
            fill: #4C5F8A;
            display: inline-block;
            cursor: pointer;

            svg {
                height: 8px;
            }

            &--up svg {
                transform: rotate(180deg);
                transform-origin: center;
            }
        }
        .slider-component {
            flex: 1;
            margin: 0 0 0 12px;
            .slider {
                background: #6f91d9;
            }
        }
    }
</style>
