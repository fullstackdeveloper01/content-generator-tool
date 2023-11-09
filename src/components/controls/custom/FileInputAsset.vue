<template>
  <div class="file-input__asset" :class="{'file-input__asset--opened': openedFolders[data.full_path]}">
    <div class="file-input__asset__outer" :class="{'file-input__asset__outer--selected': selectedFolder === data.full_path}" v-if="showFile" @click="onFileClick">
      <div @click.prevent="loadChildren" v-if="data.is_dir" class="file-input__asset__inner file-input__asset__inner--folder">
        <svg class="file-input__asset__open" viewBox="0 0 8 6"><polygon points="0,1 8,1 4,6" style="fill: rgb(76, 95, 138);"></polygon></svg>
        <img src="/images/folder.svg" class="file-input__asset__icon" />
        {{data.file}}
      </div>
      <div v-else class="file-input__asset__inner">
        {{data.file}}
      </div>
    </div>
    <div class="file-input__asset__children" v-show="openedFolders[data.full_path]">
      <FileInputAsset v-if="files[data.full_path]" @select="select" v-for="(child, $index) in files[data.full_path]" :key="$index" :data="child"  :allowedExtensions="allowedExtensions" />
    </div>
  </div>
</template>
<script>
import {mapMutations, mapState} from "vuex";

const axios = require('axios');
const apiUrl = 'http://flash.webcraft.company/storage/index.php';
export default {
  name: 'FileInputAsset',
  methods: {
    onFileClick() {
      if (this.data.is_dir) {
        if (this.selectedFolder === this.data.full_path) {
          this.setSelectedFolder(null);
        } else {
          this.setSelectedFolder(this.data.full_path)
        }
      } else {
        this.select(this.data);
      }
    },
    select(file) {
      this.$emit('select', file || this.data);
    },
    loadChildren(e) {
      e.stopPropagation();
      e.preventDefault();
      this.setOpenedFolder({folder: this.data.full_path, openedState: !this.openedFolders[this.data.full_path]});
      if (!this.loaded) {
        axios.get(apiUrl + '?dir=' + this.data.full_path).then(res => res.data).then(res => {
          this.setFolderContents({folder: this.data.full_path, files: res})
          this.loaded = true;
        })
      }
    },
    ...mapMutations('filepicker', ['setOpenedFolder', 'setSelectedFolder', 'setFolderContents'])
  },
  data() {
    return {
      loaded: false,
    }
  },
  computed: {
    ...mapState('filepicker', ['openedFolders', 'selectedFolder', 'files']),
    showFile() {
      if (this.data.is_dir) {
        return true;
      }
      let extension = this.data.file.split('.');
      extension = extension[extension.length - 1];
      return this.allowedExtensions.indexOf(extension) !== -1;
    }
  },
  props: {
    allowedExtensions: {
      type: Array,
      required: false,
      default: () => {
        return []
      }
    },
    data: {
      type: Object,
      required: true
    }
  }
}
</script>
