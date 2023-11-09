<script>
    import {mapMutations, mapGetters, mapState} from 'vuex';
    import {availableAnimations, controlsMap, classesMap, defaultCommonAnimationParams} from "@/animations";
    import Section from "@/components/layout/Section";
    import CommonControls from "./animations/CommonControls";
    if (!window._previewActive) {
      window._previewActive = {};
    }
    export default {
        components: {CommonControls, Section},
        computed: {
            ...mapGetters('scenes', ['currentObject']),
            ...mapState('scenes', ['fabricObject']),
            ...mapState('canvas', ['canvas'])
        },
        mounted() {
            this.animations = JSON.parse(JSON.stringify(this.currentObject.animations))
        },
        data() {
            return {
                previewActive: window._previewActive,
                availableAnimations,
                animations: []
            }
        },
        methods: {
            previewAnimation(index) {
                if (!this.previewActive[index]) {
                  this.$set(this.previewActive, index, true);
                  let animation = this.animations[index];
                  let animationClass = new classesMap[animation.id](this.fabricObject, animation.params, this.canvas);
                  animationClass.start();
                  this.$emit('animationStarted');
                  setTimeout(() => {
                    this.previewActive[index] = false;
                    this.$emit('animationEnded');
                  }, (animation.params.time_end - animation.params.time_start) * 1000)
                }
            },
            addNewAnimation(e) {
                let animationToAdd = availableAnimations.filter(animation => animation.name === e.target.value)[0];
                if (animationToAdd) {
                    this.animations = [
                        ...this.animations,
                        {
                            id: animationToAdd.id,
                            title: animationToAdd.name,
                            params: JSON.parse(JSON.stringify({...defaultCommonAnimationParams, ...animationToAdd.defaultParams}))
                        }
                    ]
                }
            },
            deleteAnimation(animationToDelete, e) {
              e.preventDefault();
              e.stopPropagation();
              setTimeout(() => {
                this.animations = this.animations.filter(animation => animation !== animationToDelete);
              }, 10)
            },
            getAnimationControlElement(animation) {
                return controlsMap[animation.id];
            },
            apply() {
                this.setObjectAnimations(this.animations);
                this.$emit('close');
            },
            close() {
                this.$emit('close');
            },
            ...mapMutations('scenes', ['setObjectAnimations'])
        }
    }

</script>
<template>
<div class="animations-controls">
    <div class="modal__list">
        <Section v-for="(animation, index) in animations" :key="animation.id" :isExpanded="true" class="modal__section">
            <div class="modal__section__title" slot="title">
                {{animation.title}}
                <a @click="e => deleteAnimation(animation, e)" class="modal__section__delete">
                <svg enable-background="new 0 0 58 58"  viewBox="0 0 58 58"  xmlns="http://www.w3.org/2000/svg"><path d="m29 0c-16.016 0-29 12.984-29 29s12.984 29 29 29 29-12.984 29-29-12.984-29-29-29zm-24 29c0-13.233 10.767-24 24-24 5.846 0 11.208 2.103 15.375 5.589l-33.786 33.786c-3.486-4.167-5.589-9.53-5.589-15.375zm24 24c-5.59 0-10.736-1.927-14.82-5.144l33.676-33.677c3.217 4.085 5.144 9.231 5.144 14.821 0 13.233-10.767 24-24 24z" fill="#dd352e"/></svg>
                </a>
            </div>
            <div class="modal__section__content">
                <CommonControls v-model="animations[index]" />
                <component :is="getAnimationControlElement(animation)" v-model="animations[index]" />
                <a @click="previewAnimation(index)" class="button" :class="{'button--disabled': previewActive[index]}">Preview</a>
            </div>
        </Section>
    </div>
    <div class="modal__select">
        <span class="modal__select__text">New Animation</span>
        <select @change="addNewAnimation" class="select modal__select__el">
            <option value="">Select</option>
            <option v-for="(animation, index) in availableAnimations" :key="index" :value="animation.name">{{animation.name}}</option>
        </select>
    </div>
    <div class="modal__buttons">
        <a @click="apply" class="button">Apply</a>
        <a @click="close" class="button button--secondary">Cancel</a>
    </div>
</div>
</template>
<style lang="scss">
    .animations-controls {
    }
</style>
