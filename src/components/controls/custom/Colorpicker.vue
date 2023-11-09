<script>
    import { Chrome } from 'vue-color'
    import NumberInput from "@/components/controls/custom/NumberInput";


    let componentToHex = (c) => {
        let hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    let rgbToHex = (r, g, b, a) => {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + (a ? componentToHex(a) : '');
    }

    export default  {
        name: 'Colorpicker',
        beforeDestroy() {
            this.$refs.colorpickerEl.parentElement.removeChild(this.$refs.colorpickerEl);
        },
        components: {
            NumberInput,
            Chrome
        },
        mounted() {
            if (this.val && this.val.startsWith('rgba')) {
                let rgba = this.val.replace('rgba(', '').replace(')', '').split(',').map(num => parseFloat(num));
                this.val = {r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3]}
                this.opacity = rgba[3] * 100;
            } else {
                if (this.val && this.val.startsWith('rgb')) {
                    let rgb = this.val.replace('rgb(', '').replace(')', '').split(',').map(num => parseInt(num));
                    this.val = {r: rgb[0], g: rgb[1], b: rgb[2]}
                    this.opacity = 255;
                }
            }
            window.addEventListener('click', (e) => {
                if (this.$refs.colorpickerEl && !this.$refs.colorpickerEl.contains(e.target)) {
                    this.$refs.colorpickerEl.style.display = 'none';
                    this.visible = false;
                }
            });
        },
        methods: {
            onChangeVal() {
                let newVal = this.val;
                if (typeof newVal === 'string' ) {
                    newVal = newVal.slice(0,7);
                    let opacityHex = componentToHex(Math.floor(this.opacity / 100 * 255));
                    newVal = `${newVal}${opacityHex}`;
                    this.$emit('input', newVal);
                    this.$emit('change', newVal);
                }
            },

            toggle() {
                if (this.$refs.colorpickerEl) {
                    this.$refs.colorpickerEl.style.display = 'none';
                }
                this.visible = !this.visible;
                if (this.visible) {
                    setTimeout(() => {
                        document.body.appendChild(this.$refs.colorpickerEl);
                        let rect = this.$refs.colorpickerBlockEl.getBoundingClientRect();
                        this.$refs.colorpickerEl.style.top = rect.top + 'px';
                        this.$refs.colorpickerEl.style.left = (rect.left + 24) + 'px';
                        this.$refs.colorpickerEl.style.display = 'block';
                    }, 1)
                }
            },
            // colorCallback({detail}) {
            //      this.val = rgbToHex(detail.r, detail.g, detail.b);
            //  }
        },
        data() {
            return {
                val: this.value,
                colorpickerVal: this.value,
                opacity: 100,
                visible: false,
            }
        },
        props: {
            value: {
                type: String,
                required: false
            },
            withOpacity: {
                type: Boolean,
                required: false
            }
        },
        watch: {
            colorpickerVal(newColorpickerVal) {
               //if (newColorpickerVal.hex8) {
                //    this.val = newColorpickerVal.hex8;
               // } else {
                    if (newColorpickerVal.hex) {
                        this.val = newColorpickerVal.hex;
                    }
               // }
            },
            value(newValue) {
                this.colorpickerVal = newValue;
                this.val = newValue;
            },
            val(newVal) {
               this.onChangeVal();
            }
        },
    }


</script>
<template>
    <div class="colorpicker" :class="{'colorpicker--with-opacity-slider': withOpacity}">
        <div class="colorpicker__block" ref="colorpickerBlockEl" @click="toggle">
            <div class="colorpicker__block__inner" :style="{'background-color': val}"></div>
        </div>
        <div v-show="visible" ref="colorpickerEl" class="colorpicker__el">
            <Chrome v-model="colorpickerVal"/>
        </div>
        <div v-if="withOpacity" class="colorpicker__opacity">
            <NumberInput :slider="true" :sliderBefore="true" v-model="opacity" @change="onChangeVal" :min="0" :max="100" :step="1"  textAfter="%" />
        </div>
    </div>
</template>
<style lang="scss">
    .colorpicker {
        position: relative;
        display: flex;
        margin: 0 4px;
        &--with-opacity-slider {
          flex: 1;
        }
        &__opacity {
            flex: 1;
        }
        &__block {
            width: 24px;
            height: 24px;
            border: 1px solid #2C406B;
            &__inner {
                width: 18px;
                height: 18px;
                border-radius: 4px;
                margin: 3px;
            }
        }
        &__el {
            z-index: 1000000000;
            position: absolute;
            top: 0;
            left: 120px;
            .vc-chrome-alpha-wrap {
              display: none;
            }

            .vc-chrome-hue-wrap {
              margin-top: 10px;
            }
        }

    }

</style>
