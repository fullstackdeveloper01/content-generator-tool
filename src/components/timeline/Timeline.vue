<script>
    import {mapGetters, mapState, mapMutations} from 'vuex';

    const cellWidth = 21;
    const cellHeight = 24;

    export default {
        name: 'Timeline',
        data() {
            return {
                cellWidth,
                cellHeight,
            }
        },
        computed: {
            ...mapState('canvas', ['canvas']),
            ...mapState('scenes', ['currentObjectIndex','currentMultiObjectIndex']),
            ...mapGetters('scenes', ['params', 'currentScene'])
        },
        methods: {
            selectObjectByIndex(index) {
                var params = {index: index, canvas: this.canvas};
                this.selectObject(params);
            },
            onTableScroll(e) {
                this.$refs.topTable.style.left = -1 * e.target.scrollLeft + 'px';
                this.$refs.leftTable.style.top = -1 * e.target.scrollTop + 'px';
            },
            animationMove(e, animation) {
                const target = e.target;
                const block = target.parentElement;
                const blockWidth = block.clientWidth;
                const leftPosition = e.clientX;
                let animationDuration = animation.params.time_end - animation.params.time_start;
                const doDrag = (e) => {
                    let left = e.clientX - leftPosition + (cellWidth * animation.params.time_start);
                    let right = this.currentScene.duration * cellWidth - (left + blockWidth);
                    if (left < 0) {
                        left = 0;
                    }
                    if (right < 0) {
                        right = 0;
                        left = this.currentScene.duration * cellWidth - blockWidth;
                    }
                    if (right > this.currentScene.duration * cellWidth - blockWidth) {
                        right = this.currentScene.duration * cellWidth - blockWidth;
                    }
                    block.style.left = `${left}px`;
                    block.style.right = `${right}px`;
                }
                const stopDrag = (e) => {
                    let newStartTime = Math.ceil(parseInt(block.style.left) / cellWidth);
                    block.style.left = undefined;
                    block.style.right = undefined;
                    animation.params.time_start = newStartTime;
                    animation.params.time_end = newStartTime + animationDuration;
                    document.documentElement.removeEventListener('mousemove', doDrag, false);
                    document.documentElement.removeEventListener('mouseup', stopDrag, false);
                }
                document.documentElement.addEventListener('mousemove', doDrag, false);
                document.documentElement.addEventListener('mouseup', stopDrag, false);
            },
            animationResizeLeft(e, animation) {
                const target = e.target;
                const block = target.parentElement;
                const leftPosition = e.clientX;
                const doDrag = (e) => {
                    let left = e.clientX - leftPosition + (cellWidth * animation.params.time_start);
                    if (left < 0) {
                        left = 0;
                    }
                    if (left > cellWidth * animation.params.time_end) {
                        left = cellWidth * animation.params.time_end;
                    }
                    if (left > cellWidth * this.currentScene.duration) {
                        left = cellWidth * this.currentScene.duration;
                    }
                    block.style.left = `${left}px`;
                }
                const stopDrag = (e) => {
                    let newStartTime = Math.ceil(parseInt(block.style.left) / cellWidth);
                    block.style.left = undefined;
                    animation.params.time_start = newStartTime;
                    document.documentElement.removeEventListener('mousemove', doDrag, false);
                    document.documentElement.removeEventListener('mouseup', stopDrag, false);
                }
                document.documentElement.addEventListener('mousemove', doDrag, false);
                document.documentElement.addEventListener('mouseup', stopDrag, false);
            },
            animationResizeRight(e, animation) {
                const target = e.target;
                const block = target.parentElement;
                const leftPosition = e.clientX;
                const doDrag = (e) => {
                    let right = -1 * e.clientX  + (leftPosition + cellWidth * (this.currentScene.duration - animation.params.time_end));
                    if (right < 0) {
                        right = 0;
                    }
                    if (right < cellWidth * animation.params.time_start) {
                        right = cellWidth * animation.params.time_start;
                    }
                    if (right > cellWidth * this.currentScene.duration) {
                        right = cellWidth * this.currentScene.duration;
                    }
                    block.style.right = `${right}px`;
                }
                const stopDrag = (e) => {
                    let newEndTime = this.currentScene.duration - Math.ceil(parseInt(block.style.right) / cellWidth);
                    block.style.right = undefined;
                    animation.params.time_end = newEndTime;
                    document.documentElement.removeEventListener('mousemove', doDrag, false);
                    document.documentElement.removeEventListener('mouseup', stopDrag, false);
                }
                document.documentElement.addEventListener('mousemove', doDrag, false);
                document.documentElement.addEventListener('mouseup', stopDrag, false);
            },
            deleteObject(objectIndex) {
                let target = this.currentScene.objects[objectIndex].object;
                this.canvas.remove(target);
                if(target.clipPath) // for animation object
                    this.canvas.remove(target.clipPath);
                this.canvas.requestRenderAll();
                this.removeObjectFromScene(target);
            },
            setVisible(objectIndex) {
                this.toggleObjectVisibility(objectIndex);
                this.$nextTick(() => {
                    this.canvas.renderAll();
                })
            },
            setSelectable(objectIndex) {
                this.toggleObjectSelectable(objectIndex);
                if (objectIndex === this.currentObjectIndex) {
                    this.canvas.discardActiveObject();
                }
                this.$nextTick(() => {
                    this.canvas.renderAll();
                })
            },
            calculateAnimationBlockStyle(animation, index) {
                return {
                    left: `${animation.params.time_start  * cellWidth}px`,
                    right: `${(this.currentScene.duration - animation.params.time_end) * cellWidth}px`,
                    top: `${index * (cellHeight + 2)}px`
                };
            },
            ...mapMutations('scenes', ['selectObject', 'toggleObjectVisibility', 'toggleObjectSelectable', 'removeObjectFromScene'])
        }
    }
</script>
<template>
    <div class="timeline">
        <div class="timeline__tables-container">
            <table v-if="currentScene" ref="leftTable" cellspacing="0" class="timeline__left-table">
                <tr v-for="(data, index) in currentScene.objects" :key="index" class="timeline__layer" :style="{height: `${(data.animations.length > 0 ? data.animations.length : 1) * (cellHeight - 2)}px`}">
                    <td class="timeline__layer__heading" :class="{'timeline__layer__heading--active': (currentObjectIndex === index || (currentMultiObjectIndex.length > 0 &&  currentMultiObjectIndex.indexOf(parseInt(index)+1) >=0) ) }" :style="{height: `${(data.animations.length > 0 ? data.animations.length : 1) * (cellHeight)}px`}">
                        <div @click="selectObjectByIndex(index)" :title="data.name" class="timeline__layer__title">{{data.name}}
</div>
                        <a @click="setSelectable(index)" class="timeline__layer__icon">
                            <img :src="!data.locked ? 'images/ic-unlocked.svg' : 'images/ic-locked.svg'"  >
                        </a>
                        <a @click="setVisible(index)" class="timeline__layer__icon">
                            <img :src="data.visible ? 'images/ic-visible.svg' : 'images/ic-invisible.svg'" />
                        </a>
                        <a @click="deleteObject(index)" class="timeline__layer__icon">
                            <img src="images/ic-delete-blue.svg" />
                        </a>
                    </td>
                </tr>
                <tr class="timeline__layer" v-if="currentScene && currentScene.objects.length === 0">
                    <td class="timeline__no-elements">No elements added</td>
                </tr>
                <tr class="timeline__layer timeline__layer--back" :style="{height: `${160 - 24 *(currentScene.objects.length > 1 ? currentScene.objects.length : 1)}px`}">
                    <td class="timeline__empty"></td>
                </tr>
            </table>
            <div v-if="currentScene" class="timeline__main-table-container">
                <table ref="topTable" :style="{width: currentScene.duration * 21 + 'px'}" cellspacing="0" class="timeline__table timeline__table--top">
                    <thead>
                    <tr>
                        <td class="timeline__cell-number" v-for="i in currentScene.duration">{{i}}</td>
                    </tr>
                    </thead>
                </table>
                <perfect-scrollbar @scroll="onTableScroll" class="timeline__main-table-container__inner">
                    <table cellspacing="0" class="timeline__table">
                        <tbody>
                        <tr v-for="(data, index) in currentScene.objects" :key="index" class="timeline__layer" :style="{height: `${(data.animations.length > 0 ? data.animations.length : 1) * cellHeight}px`}">
                            <td v-for="i in currentScene.duration" class="timeline__cell"></td>
                            <div v-for="(animation, animationIndex) in data.animations" class="timeline__animation" :style="calculateAnimationBlockStyle(animation, index)">
                                <span class="timeline__animation__resize timeline__animation__resize--left" @mousedown="(e) => animationResizeLeft(e, animation)"></span>
                                <span class="timeline__animation__title" @mousedown="(e) => animationMove(e, animation)">{{animation.title}}</span>
                                <span class="timeline__animation__resize timeline__animation__resize--right" @mousedown="(e) => animationResizeRight(e, animation)"></span>
                            </div>
                        </tr>
                        <tr class="timeline__layer" v-if="currentScene && currentScene.objects.length === 0">
                            <td v-for="i in currentScene.duration" class="timeline__cell"></td>
                        </tr>
                        <tr v-if="currentScene && currentScene.objects.length < 7" class="timeline__layer timeline__layer--back" :style="{height: `${160 - 24 *(currentScene.objects.length > 1 ? currentScene.objects.length : 1)}px`}">
                            <td v-for="i in currentScene.duration" class="timeline__cell"></td>
                        </tr>
                        </tbody>
                    </table>
                </perfect-scrollbar>

            </div>
        </div>

    </div>
</template>
<style lang="scss">
    .timeline {
        width: calc(100% - 240px);
        .ps__rail-x {
            bottom: 0!important;
        }

        &__table {
            margin: 0;
            position: relative;
            border: 0;
            &--top {
                margin: 0 0 0 1px;
            }
        }
        &__tables-container {
            max-height: 192px;
            overflow: hidden;
            overflow-x: visible;
        }
        &__main-table-container {
            overflow: hidden;
            &__inner {
                overflow: auto;
                max-height: 180px;
                position: relative;
            }
        }
        &__left-table {
            position: relative;
            margin: 20px 0 0;
            border-collapse: collapse;
            border-spacing: 0;
        }
        &__tables-container {
            display: flex;
            margin: 12px 0 12px 12px;
        }

        &__no-elements {
            white-space: nowrap;
        }

        &__top-left {
            height: 20px;
        }

        &__cell-number {
            width: 18px;
            line-height: 20px;
            text-align: center;
            font-size: 10px;
            background-color: #2C406B;
            border-right: solid 1px #000000;
        }

        &__cell {
            min-width: 18px;
            max-width: 21px;
            line-height: 23px;
            border-bottom: solid 1px #2C406B;
            border-right: solid 1px #000;
            height: 23px;
            &:first-of-type {
                border-left: solid 1px #000;
            }
        }

        &__no-elements {
            font-size: 12px;
            padding: 5px 24px 5px 10px;
            width: 156px;
            box-sizing: border-box;
            color: #4C5F8A;
        }

        &__layer {
            height: 24px;
            &__heading {
                display: flex;

                &--active {
                    background: #2c406b;
                }
            }

            &__title {
                cursor: pointer;
                width: 90px;
                line-height: 23px;
                font-size: 12px;
                padding: 0 0 0 10px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }


            &__icon {
                display: inline-block;
                cursor: pointer;
                margin-top: 2px;
                width: 18px;
                height: 24px;
            }

        }

        &__animation {
            cursor: pointer;
            height: 23px;
            line-height: 24px;
            position: absolute;
            font-size: 10px;
            text-transform: uppercase;
            margin-top: 1px;
            background: #2b3751;
            text-align: center;
            color: #8297c3;
            display: flex;
            justify-content: center;

            &__title {
                white-space: nowrap;
                flex: 1;
                text-align: center;
            }

            &__resize {
                width: 12px;
                height: 100%;
                display: inline-block;
                cursor: e-resize;
            }
        }

    }
</style>
