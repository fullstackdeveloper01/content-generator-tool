<script>
    import {mapGetters, mapState, mapMutations} from 'vuex';
    import Tooltip from "@/components/layout/Tooltip";
    import Checkbox from "../custom/Checkbox";
    export default {
      name: 'AlignControls',
      components: {Tooltip, Checkbox},
      computed: {
            ...mapState('canvas', ['canvas']),
            ...mapGetters('scenes', ['params','currentObject']),
            ...mapState('scenes', ['fabricObject', 'multiObjects']),
        },
        data() {
            return {
                isAlignToCanvas: false,
            }
        },
        methods: {
            setPosition(position, direction) {
                if(this.fabricObject) {
                    this.updatePosition(position, this.fabricObject, this.canvas.backgroundRect);
                } else if(this.multiObjects) {
                    this.groupAlign(position, direction);
                }
            },
            setAlignToCanvas() {
                this.isAlignToCanvas = !this.isAlignToCanvas;
            },
            groupItemsRefresh(group) {
                group.forEachObject(function(item) {
                    group.removeWithUpdate(item).addWithUpdate(item);
                });
                group.setCoords();
                this.canvas.renderAll();
            },
            groupAlign(position, direction) {

                var group = this.canvas.getActiveObject();

                if(this.isAlignToCanvas)
                this.updatePosition(position, group, this.canvas.backgroundRect);

                var groupWidth = group.getBoundingRect(true).width,
                    groupHeight = group.getBoundingRect(true).height,
                    scaleFactor = group.scaleX;

                group.forEachObject(function(item) {

                    var itemWidth = item.getBoundingRect().width * scaleFactor,
                        itemHeight = item.getBoundingRect().height * scaleFactor;

                    if (direction === 'left') {
                        item.set({
                            left: -groupWidth / 2 + itemWidth / 2
                        });
                    } else if (direction === 'top') {
                        item.set({
                            top: -groupHeight / 2 + itemHeight / 2
                        });
                    } else if (direction === 'right') {
                        item.set({
                            left: groupWidth / 2 - itemWidth / 2
                        });
                    } else if (direction === 'bottom') {
                        item.set({
                            top: groupHeight / 2 - itemHeight / 2
                        });
                    } else if (direction === 'centerX') {
                        item.set({
                            left: 0,
                        });
                    } else if (direction === 'centerY') {
                        item.set({
                            top: 0,
                        });
                    } else if (direction === 'stretchX') {                        
                        item.scaleX = group.width / item.width;
                        item.set({
                            left: 0,
                        });
                    } else if (direction === 'stretchY') {                        
                        item.scaleY = group.height / item.height;
                        item.set({
                            top: 0,
                        });
                    } else if (direction === 'stretchXY') {                 
                        item.scaleX = group.width / item.width;                 
                        item.scaleY = group.height / item.height;
                        item.set({
                            left: 0,
                            top: 0,
                        });
                    }
                });

                this.groupItemsRefresh(group);
            },
            updatePosition(position, object, alignToObj) {
                for (let key in position) {
                    let value = position[key];
                    let halfSize = key === 'left' ? alignToObj.aCoords.tl.x + (object.width*object.scaleX) / 2 : alignToObj.aCoords.tl.y + (object.height*object.scaleY) / 2;
                    
                    if(object.originX === 'left') //for group originX will be left.
                        halfSize = key === 'left' ? alignToObj.aCoords.tl.x : alignToObj.aCoords.tl.y;

                    if (value === 'center' || value === 'auto' || value === 'stretch') {
                        let prop = key === 'left' ? 'width' : 'height';
                        let scale = key === 'left' ? 'scaleX' : 'scaleY';
                        
                        let propVal = object[prop] * object[scale];

                        if (value === 'center') {
                            value = (this.params[prop] - propVal) / 2;
                        }
                        if (value === 'auto') {
                            value = (this.params[prop] - propVal);
                        }
                        if (value === 'stretch') {
                            object.proportionLocked = false;
                            value = alignToObj[prop] / 2;
                            halfSize = 0;
                            if(prop === 'width') {
                                object.scaleX = this.params[prop] / object[prop];
                            } else {
                                object.scaleY = this.params[prop] / object[prop];
                            }
                            //this.updateGroupParam({key: prop, value: this.params[prop]});
                        }
                    }
                    object[key] = value + halfSize;

                    if (position[key] === 'stretch') {
                        object.center();
                        object.setCoords();
                    }
                    if(typeof object.updateWidthHeight === 'function') {
                        object.updateWidthHeight();
                    }
                    this.canvas.renderAll();
                    this.updateObjectParam({key, value});
                    this.$emit('change');
                }
            },
            ...mapMutations('scenes', ['updateObjectParam'])
        }
    }
</script>
<template>
    <div>
        <div class="controls__buttons">
            <div @click="setPosition({left: 0}, 'left')"  class="controls__buttons__item">
                <Tooltip>Align left edge</Tooltip>
                <img src="images/align-left.svg"/>
            </div>
            <div @click="setPosition({left: 'center'}, 'centerX')" class="controls__buttons__item">
                <Tooltip>Align horizontal center</Tooltip>
                <img src="images/align-center-x.svg"/>
            </div>
            <div @click="setPosition({left: 'auto'}, 'right')"  class="controls__buttons__item">
                <Tooltip>Align right edge</Tooltip>
                <img src="images/align-right.svg"/>
            </div>
            <div class="controls__buttons__delimiter"></div>
            <div @click="setPosition({top: 0}, 'top')"  class="controls__buttons__item">
                <Tooltip :left="true">Align top edge</Tooltip>
                <img src="images/align-top.svg"/>
            </div>
            <div @click="setPosition({top: 'center'}, 'centerY')" class="controls__buttons__item">
                <Tooltip :left="true">Align vertical center</Tooltip>
                <img src="images/align-center-y.svg"/>
            </div>
            <div @click="setPosition({top: 'auto'}, 'bottom')"  class="controls__buttons__item">
                <Tooltip :left="true">Align bottom edge</Tooltip>
                <img src="images/align-bottom.svg"/>
            </div>
        </div>
        <div class="controls__buttons">
            <div @click="setPosition({left: 'stretch'}, 'stretchX')"  class="controls__buttons__item">
                <Tooltip>Stretch horizontally</Tooltip>
                <img src="images/align-between-y.svg"/>
            </div>
            <div @click="setPosition({top: 'stretch'}, 'stretchY')" class="controls__buttons__item">
                <Tooltip>Stretch vertically</Tooltip>
                <img src="images/align-between-x.svg"/>
            </div>
            <div @click="setPosition({left: 'stretch', top: 'stretch'}, 'stretchXY')"  class="controls__buttons__item">
                <Tooltip>Stretch</Tooltip>
                <img style='height:16px;' src="images/expand-fullscreen.svg"/>
            </div>
        </div>
        <Checkbox v-if="multiObjects" title="Align to Canvas" v-model="isAlignToCanvas" @change="()  => setAlignToCanvas()" />
    </div>

</template>
