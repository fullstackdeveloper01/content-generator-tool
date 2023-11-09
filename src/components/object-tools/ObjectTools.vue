<template>
    <div class="object-tools__container" ref="object_tools" v-if="fabricObject || multiObjects">
        <div class="object-tools__container__inner">
            <div v-show="fabricObject || multiObjects" class="object-tools object-tools--right" :class="{'object-tools--right-panel-mode': right.panelMode}" :style="{left: right.panelMode ? null : right.xOffset + 'px', top: right.panelMode ? null : right.yOffset + 'px'}">
                <div  class="object-tools__buttons-row">
                    <a v-show="!multiObjects" @click="setAnimateModalVisible(true)" class="object-tools__button">
                        <img src="images/ic-animate.svg" />
                        <Tooltip :offset="tooltipOffset">Add Animation</Tooltip>
                    </a>
                    <a v-show="!multiObjects" @click="setEffectsModalVisible(true)" class="object-tools__button">
                        <img src="images/ic-interaction.svg" />
                        <Tooltip :offset="tooltipOffset">Add Effect</Tooltip>
                    </a>
                </div>
                <div class="object-tools__buttons-row">
                    <a @click="setSelectedObjectIndex({index: 1, relative: true})" class="object-tools__button">
                        <img src="images/ic-forward.svg" />
                        <Tooltip :offset="tooltipOffset">Bring forward</Tooltip>
                    </a>
                    <a @click="setSelectedObjectIndex({index: -1, relative: true})" class="object-tools__button">
                        <img src="images/ic-backward.svg" />
                        <Tooltip :offset="tooltipOffset">Send backward</Tooltip>
                    </a>
                </div>
                <div class="object-tools__buttons-row">
                    <a @click="flipY()" class="object-tools__button">
                        <img src="images/ic-flipvertical.svg" />
                        <Tooltip :offset="tooltipOffset">Vertical flip</Tooltip>
                    </a>
                    <a @click="flipX()" class="object-tools__button">
                        <img src="images/ic-fliphorizontal.svg" />
                        <Tooltip :offset="tooltipOffset">Horizontal flip</Tooltip>
                    </a>
                </div>
                <div class="object-tools__buttons-row">
                    <!--
                        <a v-show="!multiObjects" class="object-tools__button">
                            <img src="images/icn-db-src.svg" />
                            <Tooltip :offset="tooltipOffset">Add from database</Tooltip>
                        </a>
                    -->
                    <div v-if="fabricObject && (fabricObject.objectType === 'video' || fabricObject.objectType === 'picture')" class="object-tools__button">                    
                        <FileInput v-if="fabricObject.objectType === 'video'" :icon="'images/ic-video.svg'" :simple=true :extensions="['mp4', 'webm']" v-model="fabricObject.url" @change="(e) => setVideoSource(e)"  />
                        <FileInput v-if="fabricObject.objectType === 'picture'"  :icon="'images/ic-image.svg'" :simple=true :extensions="['jpg', 'jpeg', 'png', 'gif']" v-model="fabricObject.url" @change="(e) => setPictureSource(e)"  />
                        
                        <FileInput v-if="fabricObject.objectType === 'pdf'"  :icon="'images/ic-image.svg'" :simple=true :extensions="['pdf']" v-model="fabricObject.url" @change="(e) => setPdfSource(e)"  />                    
                        <Tooltip :offset="tooltipOffset">Open Asset</Tooltip>
                    </div>
                    <a @click="alignToLeft()" class="object-tools__button"  v-show="multiObjects" >
                        <img src="images/ic-alignleft.svg" />
                        <Tooltip :offset="tooltipOffset">Align items to left</Tooltip>
                    </a>
                    <a @click="alignToRight()" class="object-tools__button"  v-show="multiObjects" >
                        <img src="images/align-right.svg" />
                        <Tooltip :offset="tooltipOffset">Align items to right</Tooltip>
                    </a>

                </div>
                <!--
                <div class="object-tools__buttons-row">
                    <a @click="copyPaste()" class="object-tools__button">
                        <img src="images/ic-clone.svg" />
                        <Tooltip :offset="tooltipOffset">Copy</Tooltip>
                    </a>
                    <a @click="deleteActiveObject()" class="object-tools__button">
                        <img src="images/ic-delete.svg" />
                        <Tooltip :offset="tooltipOffset">Delete</Tooltip>
                    </a>
                </div>
                -->
            </div>

          <!--
            <div v-show="fabricObject" class="object-tools object-tools--bottom" :style="{left: bottom.xOffset + 'px', top: bottom.yOffset + 'px'}">
                <div class="object-tools__buttons-row">
                    <a @click="setAnimateModalVisible(true)" class="object-tools__button">
                        <img src="images/ic-bg-rotate.svg" />
                        <Tooltip :offset="tooltipOffset">Animate</Tooltip>
                    </a>
                    <a class="object-tools__button">
                        <img src="images/ic-bg-flip.svg" />
                        <Tooltip :offset="tooltipOffset">Add interaction</Tooltip>
                    </a>
                    <a class="object-tools__button">
                        <img src="images/ic-clear-background.svg" />
                        <Tooltip :offset="tooltipOffset">Add interaction</Tooltip>
                    </a>
                </div>

            </div>
            -->
        </div>
    </div>
</template>
<script>
    import {mapState, mapGetters, mapMutations} from 'vuex';
    import Tooltip from "@/components/layout/Tooltip";
    import FileInput from "@/components/controls/custom/FileInput";
    export default {
        name: 'ObjectTools',
      components: {Tooltip, FileInput},
      methods: {
            async setVideoSource(e) {
                let source = e.target.value;
                var object = this.fabricObject;
                if(!object) return false;
                object.url = source;
                await object.initVideo(source);
                this.onChange('url');
            },
            async setPictureSource(e) {
                let source = e.target.value;
                if(this.fabricObject)
                await this.fabricObject.initPicture(source ? source : '');
                this.onChange('url');
            },
             async setPdfSource(e) {
                let source = e.target.value;
                if(this.fabricObject)
                await this.fabricObject.initPdf(source ? source : '');
                this.onChange('url');
            },
            onChange(e) {
                this.$emit('change', e);
            },
            copyPaste() {
                if(this.multiObjects != null){
                    this.copyMultiple(this.canvas)
                }else{
                    this.copyObject(this.canvas);
                    
                }

            },
            flipX() {
                if(this.multiObjects != null ){
                    this.multiObjects.map(singleObject => {
                        let flipX = !singleObject.flipX;
                        singleObject.flipX = flipX;
                        //singleObject.clone.flipX = flipX;
                        this.canvas.renderAll();
                        this.updateObjectParam({key: 'flipX', value: flipX});
                    }) 
                }else{
                    let flipX = !this.fabricObject.flipX;
                    this.fabricObject.flipX = flipX;
                    //this.fabricObject.clone.flipX = flipX;
                    this.canvas.renderAll();
                    this.updateObjectParam({key: 'flipX', value: flipX});
                }
            },
            flipY() {
                 if(this.multiObjects != null ){
                     this.multiObjects.map(singleObject => {
                        let flipY = !singleObject.flipY;
                        singleObject.flipY = flipY;
                        //singleObject.clone.flipY = flipY;

                        this.canvas.renderAll();
                        this.updateObjectParam({key: 'flipY', value: flipY});
                     })
                 }else{
                    let flipY = !this.fabricObject.flipY;
                    this.fabricObject.flipY = flipY;
                    //this.fabricObject.clone.flipY = flipY;

                    this.canvas.renderAll();

                    this.updateObjectParam({key: 'flipY', value: flipY});
                 }
                
            },
            // to bring multiple object to right 
            alignToRight() {
                if(this.multiObjects != null){
                    this.groupAlign('right');
                }else{
                    this.fabricObject.left = this.canvas.backgroundRect.aCoords.tr.x - (this.fabricObject.width * this.fabricObject.scaleX)/ 2;
                    this.canvas.renderAll();
                }
            },
            // this is to bring multiple objects to left 
            alignToLeft() {
                if(this.multiObjects != null){
                    this.groupAlign('left');
                }else{
                    this.fabricObject.left = this.canvas.backgroundRect.aCoords.tl.x + (this.fabricObject.width * this.fabricObject.scaleX) / 2;
                    this.canvas.renderAll();
                }
             },
            groupItemsRefresh(group) {
                group.forEachObject(function(item) {
                    group.removeWithUpdate(item).addWithUpdate(item);
                });
                group.setCoords();
                this.canvas.renderAll();
            },
            groupAlign(direction) {

                var group = this.canvas.getActiveObject();

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
                    } else if (direction === 'center') {
                        item.set({
                            left: 0,
                            top: 0
                        });
                    }
                });

                this.groupItemsRefresh(group);
            },
            setPosition() {
              let xOffset = -85; //(navigator.userAgent.indexOf("Yowser") !== -1 ? 0 : 0); //yandex browser has a bar on the left
              let yOffset = 0;
                this.right.xOffset = this.canvas.backgroundRect.lineCoords.tr.x + xOffset;
                this.right.yOffset = this.canvas.backgroundRect.lineCoords.tr.y + yOffset;
                this.right.panelMode = ((this.right.xOffset < 0 || this.right.xOffset > this.canvas.getWidth()) || (this.right.yOffset < 0 || this.right.yOffset > this.canvas.getHeight()));
                // this.bottom.xOffset = this.canvas.backgroundRect.lineCoords.bl.x + xOffset;
                // this.bottom.yOffset = this.canvas.backgroundRect.lineCoords.bl.y + yOffset;
            },
            // deleteActiveObject() {
            //      if(this.multiObjects != null ){
            //          this.multiObjects.map(singleObject => {
                        
            //             if (singleObject && !singleObject.isEditing) {
            //                 this.canvas.remove(singleObject);
            //                 this.canvas.requestRenderAll();
            //                 this.removeObjectFromScene(singleObject);
            //             }
            //          })
            //          this.canvas.discardActiveObject().renderAll();

            //      }else{
            //         const target = this.canvas.getActiveObject();
            //         if (target && !target.isEditing) {
            //             this.canvas.remove(target);
            //             this.canvas.requestRenderAll();
            //             this.removeObjectFromScene(target);
            //         }
            //      }
                
            // },
            ...mapMutations('tools', ['setAnimateModalVisible', 'setEffectsModalVisible']),
            ...mapMutations('scenes', ['updateObjectParam','removeObjectFromScene', 'setSelectedObjectIndex', 'copyObject', 'pasteObject','copyMultiple']),
        },
        data() {
            return {

                bottom: {
                    xOffset: 0,
                    yOffset: 0
                },
                right: {
                    panelMode: false,
                    xOffset: 0,
                    yOffset: 0
                },
            }
        },
        computed: {
            tooltipOffset() {
                return {
                    x: this.right.panelMode ? -64 : 16,
                    y: 16
                }
            },
            ...mapState('canvas', ['canvas', 'zoomValue']),
            ...mapState('scenes', ['multiObjects','fabricObject']),
        },
        watch: {
            fabricObject(object) {
                if (object) {
                    this.$nextTick(() => {
                        const container = document.getElementsByClassName('canvas-container')[0];
                        container.appendChild(this.$refs.object_tools);
                    })

                }
            },
            zoomValue() {
                this.setPosition();
            },
        },
        mounted() {
          this.setPosition();
        }
    }
</script>
<style lang="scss">
    .object-tools {
        position: absolute;
        background: #1E2139;
        pointer-events: all;
        &__container {
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            &__inner {
                position: relative;
                width: 100%;
                height: 100%;
            }
        }
        &--right {
            margin-left: 87px;
            border-top-right-radius: 10px;
            border-bottom-right-radius: 10px;
            &-panel-mode {
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
                right: 0;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                flex-wrap: wrap;
            }

        }
        &--bottom {
            margin-left: 85px;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
        }

        &__button {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            padding: 14px;
            text-align: center;
            position: relative;
            cursor: pointer;
            .tooltip {
                top: 34px;
            }
        }

       &__buttons-row {
           border-bottom: 1px solid #33405B;
           display: flex;
           align-items: center;

           &:last-of-type {
               border-bottom: 0;
           }
       }
    }
</style>
