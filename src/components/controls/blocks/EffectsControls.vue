<script>
    import {mapMutations, mapGetters, mapState} from 'vuex';
    import {availableEffects, controlsMap} from "@/effects";
    import {cloneAsImage} from "@/helpers/cloneAsImage";
    import Section from "@/components/layout/Section";
    import {addCommonMethods} from "@/helpers/addCommonMethods";
    export default {
        components: {Section},
        computed: {
            filteredEffects() {
                let alreadyUsed = this.effects.map(effect => effect.id);
                return this.availableEffects.filter(effect => {
                    return alreadyUsed.indexOf(effect.id) === -1;
                })
            },
            ...mapGetters('scenes', ['currentObject']),
            ...mapState('scenes', ['fabricObject']),
            ...mapState('canvas', ['canvas'])
        },
        mounted() {
            this.effects = JSON.parse(JSON.stringify(this.currentObject.effects))
        },
        data() {
            return {
                availableEffects,
                effects: []
            }
        },
        methods: {
            addNewEffect(e) {
                let effectToAdd = availableEffects.filter(effect => effect.name === e.target.value)[0];
                if (effectToAdd) {
                    this.effects = [
                        ...this.effects,
                        {
                            id: effectToAdd.id,
                            title: effectToAdd.name,
                            params: JSON.parse(JSON.stringify(effectToAdd.defaultParams))
                        }
                    ]
                    e.target.value = '';
                }

            },
            deleteEffect(effectToDelete) {
                this.effects = this.effects.filter(effect => effect !== effectToDelete);
                if(this.effects.length === 0) {
                    var origobj = this.fabricObject.origobj ? this.fabricObject.origobj :  this.fabricObject;
                    var imgclone = this.fabricObject.origobj ? this.fabricObject.origobj.imgclone : this.fabricObject.imgclone;
                    origobj.opacity = 1;
                    origobj.evented = true;
                    this.canvas.remove(imgclone);
                    this.canvas.setActiveObject(origobj);
                    this.canvas.renderAll();
                }
            },
            getEffectControlElement(effect) {
                return controlsMap[effect.id];
            },
            async apply() {
                if(this.effects.length === 0) return false;
                this.fabricObject.evented = false;
                this.fabricObject.origScaleX = this.fabricObject.scaleX;
                this.fabricObject.origScaleY = this.fabricObject.scaleY;
                this.fabricObject.scaleX = this.fabricObject.scaleY = 1;
                var imgclone = await cloneAsImage(this.fabricObject);
                this.fabricObject.scaleX = this.fabricObject.origScaleX;
                this.fabricObject.scaleY = this.fabricObject.origScaleY;
                imgclone.set({
                    originX: this.fabricObject.originX,
                    originY: this.fabricObject.originY, 
                    left: this.fabricObject.left,
                    top: this.fabricObject.top,
                    scaleX: this.fabricObject.scaleX,
                    scaleY: this.fabricObject.scaleY, 
                    id: this.fabricObject.id,
                });
                this.canvas.add(imgclone);
                imgclone.on('modified', (e) => {
                    var target = e.target;
                    target.setCoords();
                    if(target.origobj) {
                        target.origobj.left = target.left;
                        target.origobj.top = target.top;
                        target.origobj.scaleX = target.scaleX;
                        target.origobj.scaleY = target.scaleY;
                        target.origobj.setCoords();
                    }
                    this.canvas.renderAll();
                });
                imgclone.origobj = this.fabricObject;
                this.fabricObject.opacity = 0;
                this.fabricObject.evented = false;
                this.fabricObject.imgclone = imgclone;
                this.canvas.setActiveObject(imgclone);
                addCommonMethods(imgclone, this.canvas);
                this.setFabricObject(imgclone);
                this.canvas.renderAll();
                this.setObjectEffects(this.effects);
                setTimeout(()  => {
                    this.$emit('close');
                }, 200);
            },
            close() {
                this.$emit('close');
            },
            ...mapMutations('scenes', ['setObjectEffects', 'setFabricObject'])
        }
    }

</script>
<template>
<div class="effects-controls">
    <div class="modal__list">
        <Section v-for="(effect, index) in effects" :key="index" :isExpanded="true" class="modal__section">
            <div class="modal__section__title" slot="title">
                {{effect.title}}
                <a @click="deleteEffect(effect)" class="modal__section__delete">
                <svg enable-background="new 0 0 58 58"  viewBox="0 0 58 58"  xmlns="http://www.w3.org/2000/svg"><path d="m29 0c-16.016 0-29 12.984-29 29s12.984 29 29 29 29-12.984 29-29-12.984-29-29-29zm-24 29c0-13.233 10.767-24 24-24 5.846 0 11.208 2.103 15.375 5.589l-33.786 33.786c-3.486-4.167-5.589-9.53-5.589-15.375zm24 24c-5.59 0-10.736-1.927-14.82-5.144l33.676-33.677c3.217 4.085 5.144 9.231 5.144 14.821 0 13.233-10.767 24-24 24z" fill="#dd352e"/></svg>
                </a>
            </div>
            <div class="modal__section__content">
                <component :is="getEffectControlElement(effect)" v-model="effects[index]" />
            </div>
        </Section>
    </div>
    <div class="modal__select">
        <span class="modal__select__text">New Effect</span>
        <select @change="addNewEffect" class="select modal__select__el">
            <option value="">Select</option>
            <option v-for="(effect, index) in filteredEffects" :key="index" :value="effect.name">{{effect.name}}</option>
        </select>
    </div>
    <div class="modal__buttons">
        <a @click="apply" class="button">Apply</a>
        <a @click="close" class="button button--secondary">Cancel</a>
    </div>
</div>
</template>
<style lang="scss">
    .effects-controls {
    }
</style>
