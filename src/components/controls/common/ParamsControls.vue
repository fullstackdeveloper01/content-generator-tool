<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import NumberInput from '../custom/NumberInput'
import Colorpicker from '../custom/Colorpicker'
import FileInput from '@/components/controls/custom/FileInput'
import Checkbox from '@/components/controls/custom/Checkbox'

export default {
    name: 'ParamsControls',
    components: { Checkbox, FileInput, Colorpicker, NumberInput },
    data() {
        return {
            data: null,
            sceneData: null,
            zoom: 0.5,
            updating: false,
        }
    },
    computed: {
        ...mapState('canvas', ['canvas', 'zoomValue']),
        ...mapState('tools', ['currentTool']),
        ...mapState('scenes', ['file']),
        ...mapGetters('scenes', ['params', 'currentScene']),
    },
    watch: {
        '$store.scenes.file.params': function(newParams) {
            console.log('newParams', newParams)
        },
        params(newParams) {
            // this.updating = true
            // this.data = JSON.parse(JSON.stringify(newParams))
            // this.$nextTick(() => {
            //     this.updating = false
            // })
        },
        zoom(newZoom) {
            this.setZoomValue(newZoom)
        },
        zoomValue(newZoomValue) {
            this.zoom = newZoomValue
        },
        currentScene() {
            if (this.currentScene && this.currentScene.opacity === undefined) {
                this.currentScene.opacity = 1
            }
        },
    },
    mounted() {
        // this is to watch scene file params when it changes in new file modal
         this.$store.watch(
            function (state) {
                return state.scenes.file.params;
            },
            (val) => {
                // //something changed do something
                // this.updating = true
                // this.data = JSON.parse(JSON.stringify(val))
                // this.$nextTick(() => {
                //     this.updating = false
                // })
            },
            {
                deep: true,
            }
        )

        this.$store.watch(
            function (state) {
                return state.scenes.file.params;
            },
            (val) => {
                // //something changed do something
                // this.updating = true
                // this.data = JSON.parse(JSON.stringify(val))
                // this.$nextTick(() => {
                //     this.updating = false
                // })
            },
            {
                deep: true,
            }
        )
        this.data = JSON.parse(JSON.stringify(this.params))
        if (this.currentScene && this.currentScene.opacity === undefined) {
            this.currentScene.opacity = 1
        }
        this.sceneData = this.currentScene;
        this.onChangeSceneParam('backgroundColor', null, true);
        this.onChangeSceneParam('backgroundImage', null, true);

        const canvas = this.canvas
        this.setZoomValue(canvas.getZoom())

        canvas.on('mouse:wheel', (opt) => {
            this.$nextTick(() => {
                this.setZoomValue(canvas.getZoom())
            })
        })
    },
    methods: {
        setLoop() {
            this.sceneData.loop = !this.sceneData.loop
            this.setSceneParam({ key: 'loop', val: this.sceneData.loop })
        },
        setZoom(newZoom) {
            this.setZoomValue(newZoom)
        },
        onChangeSceneParam(key, e=null, isWhenMonunt=false) {
            if(!this.canvas || !this.sceneData)
                return false;
            if (key === 'opacity') {
                this.canvas.backgroundRect.opacity = this.sceneData.opacity
                this.canvas.renderAll()
            }
            if (key === 'backgroundColor') {
                this.canvas.backgroundRect.fill = this.sceneData.backgroundColor
                this.canvas.renderAll()
            }
            if (key === 'hideBackground') {
                //this.canvas.backgroundRect.visible = !this.data.backgroundImage;
                if (this.canvas.backgroundImage) {
                    this.canvas.backgroundRect.visible = !this.sceneData.hideBackground;
                    this.canvas.backgroundImage.visible = this.sceneData.hideBackground;
                }

                this.canvas.renderAll();
            }
            if (key === 'backgroundImage') {
                if(e) {                    
                    if(e.target.value === 'n')
                        this.sceneData[key] = '';
                    else
                        this.sceneData[key] = e.target.value;
                }
                if (this.sceneData.backgroundImage) {
                    this.canvas.backgroundRect.visible = false
                    fabric.Image.fromURL(
                        this.sceneData.backgroundImage,
                        (img) => {
                            img.crossOrigin = "anonymous";  
                            this.canvas.setBackgroundImage(
                                img,
                                this.canvas.renderAll.bind(this.canvas),
                                {
                                    left: this.canvas.backgroundRect.aCoords.tl.x,
                                    top: this.canvas.backgroundRect.aCoords.tl.y,
                                    originX: 'left',
                                    originY: 'top',
                                    scaleX:
                                        this.canvas.backgroundRect.width /
                                        img.width,
                                    scaleY:
                                        this.canvas.backgroundRect.height /
                                        img.height,
                                    backgroundImageStretch: true,
                                    custtype: 'bgrect',
                                    crossOrigin: 'anonymous'
                                }
                            )
                            if (this.sceneData.hideBackground) {
                                this.canvas.backgroundImage.visible = false
                            }
                            console.log(this.canvas.backgroundImage)
                            this.canvas.renderAll();
                            this.updateObjectParam({key, val: this.sceneData[key]});
                            this.setSceneParam({ key, val: this.sceneData[key] })
                            this.updateScenePreview(this.canvas);
                        },
                        {
                            crossOrigin: 'anonymous'
                        }
                    )
                } else {
                    this.canvas.setBackgroundImage(null, this.canvas.renderAll.bind(this.canvas));
                    this.canvas.backgroundImage = null;
                    this.canvas.backgroundRect.visible = true;
                    this.canvas.renderAll()
                }
            }
            
            if(!isWhenMonunt) //during mount updating object param affects undo/redo
                this.updateObjectParam({key, val: this.sceneData[key]});

            this.setSceneParam({ key, val: this.sceneData[key] })
            this.updateScenePreview(this.canvas);
        },
        onFocusOut(key) {
            this.$nextTick(() => {
                if (key === 'width' || key === 'height') {
                    this.setFileParam({ key, val: this.data[key] })
                }
            });
        },
        onChangeParam(key) {
            this.$nextTick(() => {
                if (key === 'width') {
                    this.canvas.backgroundRect.width = this.data.width;
                    this.canvas.renderAll();
                    //this.canvas.setWidth(this.data.width);
                    //this.canvas.calcOffset();
                }
                if (key === 'height') {
                    this.canvas.backgroundRect.height = this.data.height;
                    this.canvas.renderAll();
                    // this.canvas.setHeight(this.data.height);
                    // this.canvas.calcOffset();
                }
                this.updateObjectParam({key, val: this.data[key]});
            })
        },
        ...mapMutations('scenes', ['setSceneParam', 'setFileParam', 'updateObjectParam', 'updateScenePreview']),
        ...mapMutations('canvas', ['setZoomValue']),
    },
}
</script>
<template>
    <div class="params-controls" v-if="data && !updating && currentTool !== 'shape'">
        <div class="properties-block__title">Canvas <span v-if="file.name">({{file.name}})</span></div>
        <div class="properties-block__content">
            <div class="input-block ">
                <label class="input-block__title">Scene name</label>
                <input
                    v-model="sceneData.name"
                    class="input-block__el"
                    @change="() => onChangeSceneParam('name')"
                />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Width</label>
                <NumberInput
                    v-model="data.width"
                    :min="1"
                    :max="10000"
                    @change="() => onChangeParam('width')"
                    @focusout="() => onFocusOut('width')"
                    textAfter="px"
                />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Height</label>
                <NumberInput
                    v-model="data.height"
                    :min="1"
                    :max="10000"
                    @change="() => onChangeParam('height')"
                    @focusout="() => onFocusOut('height')"
                    textAfter="px"
                />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Color</label>
                <Colorpicker
                    v-model="sceneData.backgroundColor"
                    @change="() => onChangeSceneParam('backgroundColor')"
                />
            </div>
            <div
                v-show="!sceneData.hideBackground"
                class="input-block input-block--line"
            >
                <label class="input-block__title">Background</label>
                <FileInput
                    :icon="'images/ic-image.svg'"
                    :canDelete="true"
                    :extensions="['jpg', 'jpeg', 'png', 'gif']"
                    v-model="sceneData.backgroundImage"
                    @change="(e) => onChangeSceneParam('backgroundImage', e)"
                />
            </div>
            <div class="input-block input-block--line">
                <Checkbox
                    title="Hide background"
                    v-model="sceneData.hideBackground"
                    @change="() => onChangeSceneParam('hideBackground')"
                />
            </div>
            <br />
            <div class="input-block input-block--line">
                <label class="input-block__title">Opacity</label>
                <NumberInput
                    v-model="sceneData.opacity"
                    :min="0"
                    :max="100"
                    :step="1"
                    :multiplier="100"
                    @change="() => onChangeSceneParam('opacity')"
                    textAfter="%"
                />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Duration</label>
                <NumberInput
                    v-model="sceneData.duration"
                    :min="1"
                    :max="1000"
                    @change="() => onChangeSceneParam('duration')"
                />
                <div
                    class="params-controls__loop"
                    @click="setLoop()"
                    :class="{ 'params-controls__loop--active': sceneData.loop }"
                >
                    <img src="images/ic-loop.svg" />
                    Loop
                </div>
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Zoom</label>
                <NumberInput
                    :slider="true"
                    v-model="zoom"
                    :min="10"
                    :max="1000"
                    :multiplier="100"
                    textAfter="%"
                    @change="setZoom"
                />
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.params-controls {
    &__loop {
        margin: 0 0 0 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        letter-spacing: 1.1px;
        color: #d8e0ef;
        font-size: 11px;
        opacity: 0.5;
        &--active {
            opacity: 1;
        }
        img {
            margin: 0 6px 0 0;
        }
    }
}
</style>
