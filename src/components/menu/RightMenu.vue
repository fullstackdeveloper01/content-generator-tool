<template>
    <div class="menu__right">
        <!-- <a @click="preview()" class="menu__button">
            <span class="menu__button__icon"><img src="images/ic-preview.svg"></span>
            Preview
        </a> -->
        <a class="menu__button" @click="exportFile()"> 
            <span class="menu__button__icon"><img src="images/folder.svg"></span>
            Export
        </a>
        <span class="menu__version">{{version}}</span>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import { preview } from '@/helpers/preview';
    import { exportJson } from '@/helpers/importExport';

    export default {
        name: 'RightMenu',
        data() {
            return {
                version: window.appSettings.version,
            }        
        },
        methods: {
            preview() {
                preview(this.file);
            },
            exportFile() {
                exportJson(this.file, this.canvas.backgroundRect);
            },
        },
        computed: {
            ...mapState('scenes', ['file']),
            ...mapState('canvas', ['canvas'])
        }
    }
</script>
<style lang="scss">
    .menu {
      &__right {
        margin-left: auto;
        margin-right: 16px;
      }
      &__version {
        margin-left: 16px;
        font-weight: bold;
      }
    }
</style>
