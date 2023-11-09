<script>
    import {mapState, mapGetters, mapMutations} from 'vuex';
    import NumberInput from "../custom/NumberInput";
    export default {
        components: {NumberInput},
        name: 'SizeControls',
        methods: {
            onChangeInput(prop) {
                let propValue = this.data[prop];
                if (this.actObj.proportionLocked) {
                    if (prop === 'width') {
                        this.actObj.height = propValue / this.proportion;
                        this.data = {
                            ...this.data,
                            height: propValue / this.proportion
                        }
                    }
                    if (prop === 'height') {
                        this.actObj.width =  propValue * this.proportion;
                        this.data = {
                            ...this.data,
                            width: propValue * this.proportion
                        }
                    }
                }

                if(prop === 'left') {                    
                    propValue = propValue + this.canvas.backgroundRect.aCoords.tl.x;
                    if(this.actObj.originX === 'center')
                        propValue += (this.actObj.width*this.actObj.scaleX)/2;
                }
                if(prop === 'top') {                    
                    propValue = propValue + this.canvas.backgroundRect.aCoords.tl.y;
                    if(this.actObj.originY === 'center')
                        propValue += (this.actObj.height*this.actObj.scaleY)/2;
                }

                this.actObj.set(prop, propValue);
                this.updateObjectParam({key: prop, value: propValue});
                this.$emit('change');
            },
            setProportion() {
                if (!this.actObj) {
                    return;
                }
                this.proportion = this.actObj.width / this.actObj.height;
                this.actObj._proportion = this.proportion;
            },
            setProportionLocked() {
                this.actObj.proportionLocked = !this.actObj.proportionLocked;
                if (this.actObj.proportionLocked) {
                    this.setProportion();
                }
                this.updateObjectParam({key: 'proportionLocked', value: this.actObj.proportionLocked});
            },
            setSizeInputs(scaled) {
                if (!this.actObj) {
                    return;
                }
                const object = this.actObj;
                var bgX = this.canvas.backgroundRect.aCoords.tl.x;
                var bgY = this.canvas.backgroundRect.aCoords.tl.y;

                this.data = {
                    width: object.width * object.scaleX,
                    height: object.height * object.scaleY,
                    left: (object.originX === 'center' ? object.left-(object.width*object.scaleX/2) : object.left) - bgX,
                    top: (object.originY === 'center' ? object.top-(object.height*object.scaleY/2) : object.top) - bgY
                }
                this.updateObjectParam({key: 'width', value: object.width});
            },
            ...mapMutations('scenes', ['updateObjectParam'])
        },
        mounted() {
            if(this.fabricObject) 
                this.actObj = this.fabricObject;
            else
                this.actObj = this.canvas.getActiveObject(); //for multiple object.

            if (this.actObj) {
                this.setProportion();
                this.actObj.on('scaled', () => this.setSizeInputs(true));
                this.actObj.on('moved', () => this.setSizeInputs(false));
                this.setSizeInputs();
            }
        },
        computed: {
            ...mapState('scenes', ['fabricObject', 'multiObjects']),
            ...mapGetters('scenes', ['params']),
            ...mapState('canvas', ['canvas']),
        },
        props: {
            hide: {
                type: Boolean,
                required: false
            }
        },
        data() {
            return {
                proportion: 1,
                actObj: null,
                data: {
                    width: 0,
                    height: 0,
                    top: 0,
                    left: 0
                }
            }
        }
    }
</script>
<template>
<div class="size-input">
    <div v-if="!hide">
        <div class="size-input__line">
            <NumberInput v-model="data.width" :min="0" :max="params.width" :step="10" @change="() => onChangeInput('width')" @blur="() => onChangeInput('width')" textBefore="W" textAfter="px" />
            <NumberInput v-model="data.height" :min="0" :max="params.height" :step="10" @change="() => onChangeInput('height')" @blur="() => onChangeInput('height')" textBefore="H" textAfter="px" />
        </div>

        <div class="size-input__lock" v-if="fabricObject">
            <div class="size-input__lock__first-line"></div>
            <div class="size-input__lock__second-line" @click="setProportionLocked">
                <img :src="`images/ic-${fabricObject.proportionLocked ? 'locked' : 'unlocked'}.svg`">
            </div>
            <div class="size-input__lock__third-line"></div>
        </div>

        <div class="size-input__line">
            <NumberInput v-model="data.left" :min="0" :max="params.width" :step="10" @change="() => onChangeInput('left')"  @blur="() => onChangeInput('left')"  textBefore="X" textAfter="px" />
            <NumberInput v-model="data.top" :min="0" :max="params.height" :step="10" @change="() => onChangeInput('top')" @blur="() => onChangeInput('top')" textBefore="Y" textAfter="px" />
        </div>
    </div>
</div>
</template>
<style lang="scss">
    .size-input {
        margin: 6px 0;
        &__line {
            width: calc(100% - 12px);
            display: flex;
            justify-content: space-between;
        }
        &__lock {
            &__first-line {
                height: 10px;
                width: 42px;
                float: left;
                margin: 4px 0 20px 45px;
                border-bottom: 1px solid;
                border-left: 1px solid;
            }
            &__second-line {
                width: 10px;
                float: left;
                cursor: pointer;
                margin: 6px 4px 0 4px;
            }
            &__third-line {
                height: 10px;
                width: 42px;
                float: left;
                margin: 4px 0 20px 0;
                border-bottom: 1px solid;
                border-right: 1px solid;
            }
        }
    }
</style>
