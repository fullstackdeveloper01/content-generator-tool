<template>
<div class="scenes">
    <Modal title="Delete Scene" v-model="deleteSceneModal.visible" v-if="scenes[deleteSceneModal.index]">
        <div class="modal__text">
          Are you sure you want to delete scene <strong>"{{scenes[deleteSceneModal.index].name}}"</strong>?
        </div>
        <div class="modal__buttons">
            <a @click="confirmDeleteScene()" class="button">Delete</a>
            <a @click="deleteSceneModal.visible = false" class="button button--secondary">Cancel</a>
        </div>
    </Modal>

    <perfect-scrollbar class="scenes__list" :class="{'scenes__list--no-add-button': !!list.current}">
        <a @click="() => setIndex(index)" v-for="(scene, index) in scenes" :key="index" class="scenes__item" :class="{'scenes__item--selected' : index === currentSceneIndex}">
            <div class="scenes__item__preview">
            <img v-if="scene.preview" :src="scene.preview"/>
            </div>
            <div class="scenes__item__name">{{scene.name}}</div>
            <div class="scenes__item__time" v-if="index === currentSceneIndex">
                <img class="scenes__item__time__clock" src="images/ic-timer.svg">
                <span class="scenes__item__time__value">{{scene.duration}}s</span>
                <div class="scenes__item__time__arrows">
                    <a @click="changeSceneDuration(1)" class="scenes__item__time__arrow scenes__item__time__arrow--up">
                        <svg viewBox="0 0 16 12"><path d="M3.41 4.295 8 8.875l4.59-4.58L14 5.705l-6 6-6-6 1.41-1.41z"></path></svg>
                    </a>
                    <a @click="changeSceneDuration(-1)" class="scenes__item__time__arrow scenes__item__time__arrow--down">
                        <svg viewBox="0 0 16 12"><path d="M3.41 4.295 8 8.875l4.59-4.58L14 5.705l-6 6-6-6 1.41-1.41z"></path></svg>
                    </a>
                </div>
            </div>
            <a @click="(e) => startDeleteScene(e, index)" class="scenes__item__delete" v-if="scenes.length > 1">
                <img src="images/ic-delete-blue.svg" />
            </a>
        </a>
    </perfect-scrollbar>
    <div v-if="!list.current" @click="addNewScene()" class="scenes__add">
        <div class="scenes__add__button">
            <img src="images/icon-add.svg">
        </div>
        <div  class="scenes__add__text">Add Scene</div>
    </div>
</div>
</template>
<script>
    import {mapState, mapGetters, mapMutations} from 'vuex';
    import Modal from "@/components/layout/Modal";
    export default {
      components: {Modal},
      computed: {
            ...mapGetters('scenes', ['currentScene', 'scenes']),
            ...mapState('scenes', ['list', 'currentSceneIndex']),
            ...mapState('canvas', ['canvas'])
        },
        name: 'Scenes',
        data() {
            return {
                deleteSceneModal: {
                    visible: false,
                    index: null
                }
            }
        },
        methods: {
            confirmDeleteScene() {
                this.deleteSceneModal.visible = false;
                let newIndex = this.currentSceneIndex;
                if (!this.scenes[this.currentSceneIndex + 1]) {
                    newIndex--;
                }
                this.deleteScene({index: this.deleteSceneModal.index, canvas: this.canvas});
                this.setIndex(newIndex);
            },
            startDeleteScene(e, index) {
                this.deleteSceneModal.index = index;
                this.deleteSceneModal.visible = true;
                e.preventDefault();
                e.stopPropagation();
            },
            changeSceneDuration(amount) {
                let duration = this.currentScene.duration;
                if (duration + amount > 0) {
                    this.setSceneParam({key: 'duration', val: duration + amount});
                }
            },
            setIndex(index) {
                var bgRect = this.canvas.backgroundRect;
                if(bgRect) {
                    this.setFabricObject(bgRect);
                    this.canvas.renderAll();
                }
                this.setSceneIndex(index);
                this.$nextTick(() => {
                    this.setFabricObject(null);
                    this.canvas.discardActiveObject().renderAll();
                })
            },
            addNewScene() {
                this.canvas.discardActiveObject().renderAll();
                this.addScene();
            },
            ...mapMutations('scenes', ['setSceneParam', 'setSceneIndex', 'addScene','deleteScene', 'updateScenePreview', 'setFabricObject'])
        }
    }
</script>
<style lang="scss" scoped>
    .scenes {
        display: flex;
        flex-direction: column;
        width: 240px;
        overflow: hidden;
        min-height: 185px;
        height: 100%;
        background-color: #1E2139;
        color: #fff;
        &__list {
            height: 160px;
            overflow: auto;
            background: #0F1127;
            overflow-x: hidden;
            direction: rtl;
            &--no-add-button {
                height: 209px;
            }
        }
        &__add {
            height: 49px;
            width: 100%;
            cursor: pointer;
            background: #171A33;
            box-shadow: 0 -4px 16px #000;
            z-index: 1;
            &__button {
                width: 40px;
                height: 24px;
                margin-top: 14px;
                margin-left: 40px;
                text-align: center;
                line-height: 24px;
                background-color: #4C5F8A;
                position: absolute;
            }

            &__text {
                margin-left: 90px;
                line-height: 52px;
                font-size: 12px;
            }
        }
        &__item {
            direction: ltr;
            cursor: pointer;
            height: 58px;
            line-height: 58px;
            background: #0F1127;
            border-bottom: 1px solid #1B1C2A;
            display: flex;
            align-items: center;

            &--selected {
                background: #1E2139;
            }

            &__name {
                margin: 0 0 0 8px;
                font-size: 12px;
                white-space: nowrap;
            }

            &__preview {
                width: 40px;
                height: 24px;
                margin-left: 25px;
                display: flex;
                justify-content: center;
                align-items: center;
                align-content: center;
                overflow: hidden;
                background-color: #33405b;
            }

            &__preview img {
                width: 40px;
                height: auto;
                background-color: transparent;
            }

            &__delete {
                cursor: pointer;
                margin-left: auto;
                margin-right: 8px;
                opacity: .5;
                padding: 4px 8px;
                &:hover {
                    opacity: 1;
                }
            }
            &__time {
                margin: 0 0 0 36px;
                display: flex;

                &__value {
                    color: #9AB1E1;
                    font-size: 12px;
                    margin: 0 4px;
                }

                &__arrows {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    top: -4px;
                }

                &__arrow {
                    fill: #4C5F8A;
                    display: inline-block;
                    width: 12px;
                    height: 6px;
                    margin: -1px 0 4px;

                    a.scenes__item__time__arrow svg {
                        width: 14px;
                        height: 9px;
                    }

                    &--up svg {
                        transform: rotate(180deg);
                        transform-origin: center;
                    }
                }
            }
        }
 }
</style>
