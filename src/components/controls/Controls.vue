<script>
    import {mapState, mapGetters, mapMutations} from 'vuex';
    import TextControls from "./tools/TextControls";
    import DatetimeControls from "./tools/DatetimeControls";
    import AnalogDatetimeControls from "./tools/AnalogDatetimeControls";    
    import WeatherControls from "./tools/WeatherControls";    
    import HtmlembedControls from "./tools/HtmlembedControls";
    import MixedControls from "./tools/MixedControls";    
    import Modal from "../layout/Modal";
    import EffectsControls from "./blocks/EffectsControls";
    import AnimationsControls from "./blocks/AnimationsControls";
    import ShapeControls from "./tools/ShapeControls";
    import Section from "../layout/Section";
    import ParamsControls from "./common/ParamsControls";
    import PictureControls from "./tools/PictureControls";
    
    import PdfControls from "./tools/PdfControls";
    import VideoControls from "./tools/VideoControls";
    import ListControls from "./tools/ListControls";
    import getObjectFromToolName from "@/helpers/getObjectFromToolName";

    export default {
        components: {
          ListControls,
          VideoControls, PictureControls,PdfControls, ParamsControls, Section, ShapeControls, AnimationsControls, EffectsControls, Modal, TextControls, MixedControls, DatetimeControls, WeatherControls, HtmlembedControls, AnalogDatetimeControls},
        data() {
            return {
                animationPlaying: false,
            }
        },
        computed: {
            currentToolName() {
                if (this.currentTool === 'shape') {
                    return 'Drawings';
                } else {
                    return this.currentTool;
                }
            },
            ...mapState('tools', ['animateModalVisible', 'effectsModalVisible', 'currentTool', 'currentToolVariant']),
            ...mapState('canvas', ['canvas']),
            ...mapState('scenes', ['fabricObject', 'multiObjects', 'currentSceneIndex']),
            ...mapGetters('scenes', ['currentObject', 'params']),
        },
        mounted() {
            const canvas = this.canvas;
            canvas.on("selection:created", this.selectObject);
            canvas.on("selection:updated", this.selectObject);
            canvas.on('object:modified', this.selectObject);
            canvas.on('object:selected', this.selectObject);
            canvas.on("selection:cleared", (e) => {
                this.setFabricObject(null);
                this.setMultiObjects(null);
            });
        },
        methods: {
            ...mapMutations('scenes', ['setFabricObject', 'setMultiObjects', 'updateObjectName', 'updateObjectParam', 'addObjectToScene', 'removeObjectFromScene']),
            ...mapMutations('tools', ['setToolVariant', 'setAnimateModalVisible', 'setEffectsModalVisible', 'setTool']),
            selectObject(e) {
                if (e.action === 'drag') {
                    return;
                }
                if(e.target && e.target.custtype === 'selectcenter') {
                    return false;
                }
                // if(e.target && e.target.origobj) { //if its a animation object
                //     return false;
                // }
                const activeObjects = this.canvas.getActiveObjects();
                if (activeObjects.length > 1) {

                    this.setFabricObject(null);
                    this.setMultiObjects(activeObjects);
                    var objs = activeObjects.filter(obj => {
                        return obj.objectType === 'shape';
                    });
                    if(objs.length === activeObjects.length) {
                        this.setTool('shape');
                    } else {
                        this.setTool(null);
                    }
                } else {
                    this.setFabricObject(null);
                    this.setMultiObjects(null);
                    let target = e.target;
                    let targetId = target.id;
                    // if (target.isClone && target.group) {
                    //     target = target.group.getObjects()[0];
                    // }

                    // if (target.getObjects) {  // if it's a group
                    //     target = target.getObjects()[0];
                    // }

                    if(target && target.origobj) { //if its a animation object
                        target = target.origobj;
                    }

                    this.$nextTick(() => {
                        //target.id is getting null incase of text object so adding back to object.
                        //This is happening in Fabric's getObjects function
                        if(!target.id){
                            target.id = targetId;
                        }
                        this.setFabricObject(target);
                    });
                }
            },
            selectShape(shapetype) {
                this.setToolVariant(shapetype);
                if(this.fabricObject) {
                    this.changeShape(this.fabricObject);
                } else {
                    var multiObjects = this.multiObjects;
                    this.canvas.discardActiveObject();
                    multiObjects.map(obj => {
                        this.changeShape(obj);
                    });
                }
            },
            async changeShape(object) {
                if (object && object.objectType === 'shape' && object.toolVarient != this.currentToolVariant) {
                    this.canvas.remove(object);                        
                    this.removeObjectFromScene(object);
                    let positionParams = {
                        left: object.left,
                        top: object.top,
                        width: object.width,
                        height: object.height,
                    };
                    let data = await getObjectFromToolName(this.currentTool, this.currentToolVariant, {}, positionParams, this.canvas, false, this.currentSceneIndex);
                    if (data && data.object) {
                        data.object.selectable = true;

                        //copy props exclude the below props.
                        var nProps = ['id', 'rx', 'ry', 'dirty', 'getCountOfSameTypeObjs', 'initEffects', 'removeOldEffects', 'applyEffects', 'objectType']
                        Object.keys(object).forEach(function(key) {
                            if(!nProps.includes(key)) {
                                data.object[key] = object[key];
                            }
                        });

                        this.canvas.add(data.object);

                        if(!this.multiObjects) {
                            this.canvas.setActiveObject(data.object);
                            this.canvas.renderAll();
                        }
 
                        this.addObjectToScene(data);
                        return data.object;
                    }
                } else {
                    return object;
                }
            },
            onChange(prop) {
                if (prop) {
                    if(this.fabricObject) {
                        let propValue = this.fabricObject[prop];
                        this.fabricObject.set(prop, propValue);
                        this.updateObjectParam({key: prop, value: propValue});
                    }
                    if(this.multiObjects) {
                        var fObjPropValue = this.multiObjects[0][prop];
                        this.multiObjects.map(obj => {
                            obj.set(prop, fObjPropValue);
                        });
                    }
                 }
                this.canvas.renderAll();
            },
            changeName(e) {
                this.updateObjectName(e.target.value);
            },
        }
    }

</script>
<template>
    <perfect-scrollbar class="controls">
        <div id="controls">

            <div class="properties-block">

                <div v-if="currentObject && fabricObject">
                    <div class="properties-block__title">{{fabricObject.objectType}}</div>
                </div>
                <div v-if="multiObjects">
                    <div class="properties-block__title">Mixed</div>
                </div>
                <div v-if="currentTool === 'shape'">
                    <div class="input-block__title">Shape</div>
                    <div>
                        <a class="controls__tool-variant" :class="{'controls__tool-variant--active': currentToolVariant === 'rectangle'}" @click="selectShape('rectangle')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g transform="translate(-76 -138)"><path d="M-1397-934h-16v-16h16v16Zm-15.111-15.11v14.222h14.222v-14.222Z" transform="translate(1490 1089)"/><rect class="transparent-fill" width="14.222" height="14.222" transform="translate(77.889 139.889)"/><rect width="3" height="3" transform="translate(76 138)"/><rect width="3" height="3" transform="translate(76 153)"/><rect width="3" height="3" transform="translate(91 138)"/><rect width="3" height="3" transform="translate(91 153)"/></g></svg>
                        </a>
                        <a class="controls__tool-variant" :class="{'controls__tool-variant--active': currentToolVariant === 'circle'}" @click="selectShape('circle')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g transform="translate(-122 -138)"><path d="M-1405-934a8.009,8.009,0,0,1-8-8,8.009,8.009,0,0,1,8-8,8.009,8.009,0,0,1,8,8A8.009,8.009,0,0,1-1405-934Zm0-15a7.008,7.008,0,0,0-7,7,7.008,7.008,0,0,0,7,7,7.008,7.008,0,0,0,7-7A7.008,7.008,0,0,0-1405-949Z" transform="translate(1536 1089)"/><circle class="transparent-fill" cx="7" cy="7" r="7" transform="translate(124 140)"/><rect width="3" height="3" transform="translate(122 145)"/><rect width="3" height="3" transform="translate(129.5 156) rotate(-90)"/><rect  width="3" height="3" transform="translate(137 145)"/><rect width="3" height="3" transform="translate(129.5 141) rotate(-90)"/></g></svg>
                        </a>
                        <a class="controls__tool-variant" :class="{'controls__tool-variant--active': currentToolVariant === 'arrow'}" @click="selectShape('arrow')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12.936" height="16.217" viewBox="0 0 12.936 16.217"><path d="M-1405.038-977.413v-6.692h-4l6.468-9.525,6.467,9.525h-4v6.692Z" transform="translate(1409.038 993.63)"/></svg>
                        </a>
                    </div>
                </div>

                <div v-if="multiObjects">
                    <MixedControls @change="onChange" />
                </div>

                <div v-if="currentObject && fabricObject">
                    <div class="properties-block__top-inputs">
                        <div class="input-block">
                            <label class="input-block__title">Name</label>
                            <input class="input-block__el" :value="currentObject.name" @keyup="changeName" />
                        </div>
                    </div>
                </div>
                <ParamsControls v-if="!multiObjects && !fabricObject" />

                <div v-if="currentObject && fabricObject">

                    <TextControls v-if="currentObject.objectType === 'text'" @change="onChange" />
                    <ShapeControls v-if="currentObject.objectType === 'shape'" @change="onChange" />
                    <PictureControls v-if="currentObject.objectType === 'picture'" @change="onChange" />
                    
                    <PdfControls v-if="currentObject.objectType === 'pdf'" @change="onChange" />
                    <VideoControls v-if="currentObject.objectType === 'video'" @change="onChange" />
                    <ListControls v-if="currentObject.objectType === 'list'" @change="onChange" />
                    <DatetimeControls v-if="currentObject.objectType === 'datetime'" @change="onChange" />
                    <AnalogDatetimeControls v-if="currentObject.objectType === 'analogdatetime'" @change="onChange" />
                    <WeatherControls v-if="currentObject.objectType === 'weather'" @change="onChange" />
                    <HtmlembedControls v-if="currentObject.objectType === 'htmlembed'" @change="onChange" />                    

                    <a class="button controls__big-button" @click="setEffectsModalVisible(true)">Effects</a>
                    <Modal title="Effects" :isVisible="effectsModalVisible" @close="setEffectsModalVisible(false)">
                        <EffectsControls @close="setEffectsModalVisible(false)" @change="onChange" />
                    </Modal>

                    <a class="button controls__big-button" @click="animationPlaying = false; setAnimateModalVisible(true)">Animations</a>
                    <Modal :isVisible="animateModalVisible" :transparent="animationPlaying" title="Animations" @close="animationPlaying = false; setAnimateModalVisible(false)">
                        <AnimationsControls @animationStarted="animationPlaying = true" @animationEnded="animationPlaying = false"  @close="animationPlaying = false;setAnimateModalVisible(false)" @change="onChange" />
                    </Modal>
                </div>
        </div>

        </div>
    </perfect-scrollbar>
</template>
<style lang="scss">
    .controls {
        direction: rtl;
        width: 300px;
        height: 100%;
        overflow: auto;
        overflow-x: hidden;
        color: #787BA1;
        background-color: #0F1127;
        &__tool-variant {
            cursor: pointer;
            margin: 0 16px 0 4px;
            svg {
                fill: #fff;
                .transparent-fill {
                    opacity: .5;
                }
            }
            &--active svg, &:hover svg {
                fill: #6f91d9;
            }
        }
        &__big-button {
            background: #1e2139;
            margin: 4px 0!important;
            display: block!important;
            text-align: center;
        }
        &__buttons {
            display: flex;
            align-items: center;
            margin: 4px 0 12px;
            &__delimiter {
                flex: 1;
            }
            &__item {
                position: relative;
                cursor: pointer;
                margin: 4px 18px 4px 0;
                width: 16px;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                    height: 12px;
                    opacity: 1;
                }
                &:last-of-type {
                    margin-right: 0;
                }
                &--active {
                    img {
                        opacity: 1;
                    }
                }
            }


        }
    }



</style>
