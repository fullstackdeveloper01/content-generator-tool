<template>
    <div class="menu__tools">
        <div class="menu__vertical-line menu__vertical-line--no-margin-left menu__vertical-line--no-margin-right"></div>
        <a class="menu__button" @click="showMediaLibrary()">
            <span class="menu__button__icon">
                <img src="images/ic-media-library.svg">
            </span>
            Media Library
        </a>
        <MediaLibrary v-if="mediaModal.visible"
            :icon="'images/ic-image.svg'"
            :canDelete="true"
            :extensions="['jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf']"
            @close="() => closeModal()"
        />
        <div class="menu__vertical-line menu__vertical-line--no-margin-left"></div>

        <a class="menu__button" :class="{'menu__button--selected': !currentTool}" @click="selectTool(null)">
            <img src="images/ic-object.svg">
        </a>
        <a class="menu__button" :class="{'menu__button--selected': currentTool === 'text'}" @click="selectTool('text')">
            <img src="images/ic-text.svg">
        </a>
        <a class="menu__button" :class="{'menu__button--selected': currentTool === 'picture'}" @click="selectTool('picture')">
            <img src="images/ic-image.svg">
        </a>
        <a class="menu__button" :class="{'menu__button--selected': currentTool === 'pdf'}" @click="selectTool('pdf')">
            <img src="images/icn-folder-source.svg">
        </a>
        <a class="menu__button" :class="{'menu__button--selected': currentTool === 'shape'}" @click="selectTool('shape')">
            <img src="images/ic-shape.svg">
        </a>
<!--
        <a class="menu__button" :class="{'menu__button--selected': currentTool === 'flash'}" @click="selectTool('flash')">
            <img src="images/ic-flash.svg">
        </a>
-->
        <a class="menu__button" :class="{'menu__button--selected': currentTool === 'video'}" @click="selectTool('video')">
            <img src="images/ic-video.svg">
        </a>

        <div class="menu__vertical-line"></div>

        <a v-show="!list.current" class="menu__button" :class="{'menu__button--selected': currentTool === 'datetime'}" @click="selectTool('datetime')">
            <img src="images/ic-clock.svg">
        </a>

        <a v-show="!list.current" class="menu__button" :class="{'menu__button--selected': currentTool === 'weather'}" @click="selectTool('weather')">
            <img src="images/ic-weather.svg">
        </a>
 
        <a v-show="!list.current" class="menu__button" :class="{'menu__button--selected': currentTool === 'htmlembed'}" @click="selectTool('htmlembed')">
            <img src="images/ic-embed.svg">
        </a> 
    <a v-show="!list.current" class="menu__button" :class="{'menu__button--selected': currentTool === 'list'}" @click="selectTool('list')">
            <img src="images/ic-list.svg">
        </a>

<!--
    
        <div v-show="!list.current" class="menu__vertical-line"></div>
-->
        <a @click="returnFromListMode()" v-if="list.current" class="menu__text-button">Save list</a>
    </div>
</template>
<script>
    import {mapState, mapMutations} from 'vuex';
    import store from "@/store";
    import MediaLibrary from '@/components/controls/blocks/MediaLibrary';
    export default {
        components: { MediaLibrary },
        data() {
            return {
                mediaModal: {
                    visible: false,
                }
            }
        },
        computed: {
          ...mapState('scenes', ['list']),
          ...mapState('canvas', ['canvas']),
          ...mapState('tools', ['currentTool'])
        },
        methods: {
            async returnFromListMode() {
                await this.exitListMode();
                await store.commit('tools/setShowTimeline', null);
                setTimeout(() => {
                    window._onCanvasResize();
                    window._onCanvasChangeZoom(null, .5);
                    this.$store.commit('canvas/setZoomValue', .5);

                }, 1)
            },
            closeModal() {
                this.mediaModal.visible = false;
            },
            showMediaLibrary() {
                this.mediaModal.visible = !this.mediaModal.visible;
            },
            selectTool(tool) {
                this.canvas.selection = !tool;
                this.canvas.getObjects().forEach(object => {
                  if (object.evented) {
                    object.selectable = !object.locked && !object._ungrouped;
                  }
                });
                this.setTool(tool);
                this.setFabricObject(null);
            },
            ...mapMutations('tools', ['setTool']),
            ...mapMutations('scenes', ['exitListMode','setFabricObject']),

        },
        name: 'ToolsMenu'
    }
</script>
<style lang="scss">
    .menu__tools {
        display: flex;
    }
</style>
