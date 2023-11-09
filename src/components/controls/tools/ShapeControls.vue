<script>
    import {mapGetters, mapState, mapMutations} from 'vuex';
    import Section from "@/components/layout/Section";
    import Checkbox from "../custom/Checkbox";
    import NumberInput from "../custom/NumberInput";
    import Colorpicker from "../custom/Colorpicker";
    import AlignControls from "../common/AlignControls";
    import SizeControls from "../common/SizeControls";
    let timeouts = {};
    export default {
        computed: {
            ...mapGetters('scenes', ['params','currentObject']),
            ...mapState('scenes', ['fabricObject']),
        },
        components: {SizeControls, AlignControls, Colorpicker, NumberInput, Checkbox, Section},
        methods: {
            setEqualSized(state) {
                if (state) {
                    this.fabricObject.width = this.fabricObject.height;
                    this.fabricObject.scaleX = this.fabricObject.scaleY;
                    this.onChangeAlign();
                    this.fabricObject._proportion = 1;
                    this.fabricObject.proportionLocked = true;
                } else {
                    this.fabricObject._proportion = null;
                    this.fabricObject.proportionLocked = false;
                }
            },
            onChangeSlider(e) {
                clearTimeout(timeouts[e]);
                timeouts[e] = setTimeout(() => {
                    this.$emit('change', e);
                }, 250)

            },
            onChange(e) {
                this.$emit('change', e);
            },
            onChangeAlign() {
                this.setAlign(this.fabricObject.textAlign);
                this.setVerticalAlign(this.fabricObject.originY);
                this.onChange();
            },
            setAlign(align) {
                this.fabricObject.textAlign = align;
                this.onChange('textAlign');
            },
            setVerticalAlign(align) {
                this.onChange('originY');
                this.onChange('top');
            },

        }
    }

</script>
<template>
    <div class="shape-controls">
      <Checkbox title="Equal-sized" v-model="fabricObject.equalSized" @change="(e) => setEqualSized(e)" />
        <Section :is-expanded="true">
             <div slot="title">Fill</div>
            <div class="inputs-row">
                <div class="input-block input-block--line">
                    <Colorpicker v-model="fabricObject.fill" @change="() => onChangeSlider('fill')" :withOpacity="true" />
                </div>
            </div>
       </Section>
      <Section :is-expanded="true">
          <div slot="title">Line</div>
              <div class="input-block input-block--line">
                  <Colorpicker v-model="fabricObject.stroke" @change="() => onChangeSlider('stroke')" :withOpacity="true" />
              </div>
              <div class="input-block input-block--line">
                  <label class="input-block__title">Thickness</label>
                  <NumberInput v-model="fabricObject.strokeWidth" :min="0" :max="100" :step="1" @change="() => onChange('strokeWidth')"  />
              </div>
        </Section>
        <Section>
            <div slot="title">Size & position</div>
            <SizeControls @change="onChange" />
        </Section>
        <Section>
            <div slot="title">Align</div>
            <AlignControls @change="onChangeAlign" />
        </Section>
    </div>
</template>
<style lang="scss">
    .shape-controls {
        &__stroke-color {
             margin: 0 0 0 16px!important;
        }
    }
</style>
