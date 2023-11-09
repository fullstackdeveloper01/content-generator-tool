<template>
  <div class="input-block file-input">
    <div>
      <label>Minutes Hand</label>
      <a @click="minutesModal.visible = true" class="file-input__button">
        <img :src="icon?icon:'images/ic-media-library.svg'" />
      </a>
    </div>
    <div class="file-input__hour-hand">
      <label>Hour Hand</label>
      <a @click="hourModal.visible = true" class="file-input__button">
        <img :src="icon?icon:'images/ic-media-library.svg'" />
      </a>
    </div>



    <Modal title="Clock Minutes Hand" v-model="minutesModal.visible">
      <div class="file-input__assets-list">
        <div class="file-input__asset" @click="goBack()" v-if="currentFolder !== '/'" >
          <img v src="/images/folder_back.svg" class="file-input__asset__icon" />
          <div class="file-input__asset__name">Back</div>
        </div>
        <div class="file-input__asset" @click="selectMinHandFile(asset)" v-for="(asset, $index) in filteredFiles" :key="$index">
          <img v-if="asset.is_dir" src="/images/folder.svg" class="file-input__asset__icon" />
          <img v-else-if="!isPicture(asset)" src="/images/file.svg" class="file-input__asset__icon" />
          <div v-else :style="{backgroundImage: `url(${asset.full_path_with_domain}`}" class="file-input__asset__picture"></div>
          <div class="file-input__asset__name text-ellipsis" :title="asset.file">{{asset.file}}</div>

        </div>
      </div>

      <div class="file-input__buttons">
        <a class="button file-input__upload-button" @click="$refs.fileinput.click()">Upload new file</a>
        <input type="file" ref="fileinput" @change="uploadMinHandFile" style="display: none"/>
        <div class="modal__buttons">
          <a class="button" @click="selectMinHandFile()">OK</a>
          <a @click="minutesModal.visible = false" class="button button--secondary">Cancel</a>
        </div>
      </div>
      <div class="file-input__progress" v-if="fileUpload.active">
        <div class="file-input__progress__bar" :style="{width: fileUpload.percent * 100 + '%'}">
          {{fileUpload.name}} ({{Math.round(fileUpload.percent * 100)}}%)
        </div>
      </div>
    </Modal>
    <Modal title="Clock Hour Hand" v-model="hourModal.visible">
      <div class="file-input__assets-list">
        <div class="file-input__asset" @click="goBack()" v-if="currentFolder !== '/'" >
          <img v src="/images/folder_back.svg" class="file-input__asset__icon" />
          <div class="file-input__asset__name">Back</div>
        </div>
        <div class="file-input__asset" @click="selectHourHandFile(asset)" v-for="(asset, $index) in filteredFiles" :key="$index">
          <img v-if="asset.is_dir" src="/images/folder.svg" class="file-input__asset__icon" />
          <img v-else-if="!isPicture(asset)" src="/images/file.svg" class="file-input__asset__icon" />
          <div v-else :style="{backgroundImage: `url(${asset.full_path_with_domain}`}" class="file-input__asset__picture"></div>
          <div class="file-input__asset__name text-ellipsis" :title="asset.file">{{asset.file}}</div>

        </div>
      </div>

      <div class="file-input__buttons">
        <a class="button file-input__upload-button" @click="$refs.fileinput.click()">Upload new file</a>
        <input type="file" ref="fileinput" @change="uploadHourHandFile" style="display: none"/>
        <div class="modal__buttons">
          <a class="button" @click="selectHourHandFile()">OK</a>
          <a @click="hourModal.visible = false" class="button button--secondary">Cancel</a>
        </div>
      </div>
      <div class="file-input__progress" v-if="fileUpload.active">
        <div class="file-input__progress__bar" :style="{width: fileUpload.percent * 100 + '%'}">
          {{fileUpload.name}} ({{Math.round(fileUpload.percent * 100)}}%)
        </div>
      </div>
    </Modal>
  </div>
</template>
<style lang="scss">
.text-ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space:nowrap;
}
.file-input {
  display: flex;
  align-items: center;
  &__hour-hand{
    margin-left:48px;
  }
  label{
    font-size: 12px;
    color: #fff;
    margin: 0 0 0 4px;
    display: inline-block;
    position: relative;
    top: -1px;
  }
  &__button {
    margin: 0 0 0 1em;
    cursor: pointer;
    &:hover {
      opacity: .75;
    }
    img {
      height: 14px;
    }
  }
  &__asset {
    width: 25%;
    text-align: center;
    word-break: break-all;
    cursor: pointer;
    padding: .5em 0;
    &:hover {
      background: rgb(76 95 138 / 10%);
    }

    &__icon {
      height: 4em;
    }

    &__name {
      width: calc(100% - 1em);
      margin: 0 auto;
      font-size: .875em;
    }

    &__picture {
      height: 4.25em;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }
  }


  &__assets-list {
    max-height: 50vh;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
    width: 36em;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__upload-button {
    background: #343a71!important;
    margin: 24px 0 0;
  }
  &__progress {
    margin: 1em 0 0;
    background: #eee;

    &__bar {
      text-align: center;
      background: #6f91d9;
      padding: .25em;
      color: #fff;
      transition: all .25s;
      white-space: nowrap;
      overflow: hidden;
    }
  }
}
</style>
<script>

import {mapState, mapMutations} from 'vuex';

import FileInputAsset from "@/components/controls/custom/FileInputAsset";

var apiUrl = window.appSettings.apiUrl;
const axios = require('axios');
const parser = new DOMParser();
const getUrl = apiUrl + 'admin/creation-tool/get-assets-list?json=1';
const uploadUrl = apiUrl + 'admin/creation-tool/upload-asset';
import Modal from "@/components/layout/Modal"


export default {
  components: {FileInputAsset, Modal},
  props: ['value', 'extensions','icon', 'simple'],
  computed: {
    filteredFiles() {
      return this.files[this.currentFolder] ? this.files[this.currentFolder].filter(file => {
        if (file.is_dir) {
          return true;
        }
        let extension = file.file.split('.');
        extension = extension[extension.length - 1];
        return this.extensions.indexOf(extension) !== -1;
      }) : [];
    },
    ...mapState('filepicker', ['currentFolder', 'files'])
  },
  watch: {
    'minutesModal.visible'(isVisible) {
      if (isVisible) {
        this.load();
      }
    },
    'hourModal.visible'(isVisible) {
      if (isVisible) {
        this.load();
      }
    },

    url(newUrl) {
      this.$emit('input', newUrl);
    }
  },
  methods: {
    setNoFile() {
      this.url = '';
      this.$nextTick(() => {
        this.$emit('change', {
          target: {
            value: 'n'
          }
        });
      })


    },
    goBack() {
      let folder = this.currentFolder.split('/');
      folder.pop();
      folder = folder.join('/');
      if (!folder || folder === '') {
        folder = '/';
      }
      this.setCurrentFolder(folder);
    },
    isPicture(file) {
      let extension = file.file.split('.').pop();
      return ['png','jpg','jpeg','webp','bmp','gif','svg'].indexOf(extension) !== -1;
    },
    uploadMinHandFile(e) {
      let file = e.target.files[0];
      if (file) {
        const data = new FormData();
        data.append('Filedata', file);
        data.append('Location', 'assets');
        data.append('Sublocation', this.currentFolder);
        data.append('Filename', file.name);
        this.fileUpload.active = true;
        this.fileUpload.percent = 0;
        this.fileUpload.name = file.name;
        axios.request({
          method: 'POST',
          url: uploadUrl,
          data: data,
          onUploadProgress: (e) => {
            this.fileUpload.percent = e.loaded / e.total;
          }
        }).then (res => res.data).then(res => {
          this.fileUpload.active = false;
          const xmlDoc = parser.parseFromString(res, "text/xml");
          const fullPath = xmlDoc.getElementsByTagName("File")[0].getAttribute('url');
          this.selectMinHandFile({
            full_path_with_domain: fullPath
          });
          this.load();
        })
      }
    },
    uploadHourHandFile(e) {
      let file = e.target.files[0];
      if (file) {
        const data = new FormData();
        data.append('Filedata', file);
        data.append('Location', 'assets');
        data.append('Sublocation', this.currentFolder);
        data.append('Filename', file.name);
        this.fileUpload.active = true;
        this.fileUpload.percent = 0;
        this.fileUpload.name = file.name;
        axios.request({
          method: 'POST',
          url: uploadUrl,
          data: data,
          onUploadProgress: (e) => {
            this.fileUpload.percent = e.loaded / e.total;
          }
        }).then (res => res.data).then(res => {
          this.fileUpload.active = false;
          const xmlDoc = parser.parseFromString(res, "text/xml");
          const fullPath = xmlDoc.getElementsByTagName("File")[0].getAttribute('url');
          this.selectHourHandFile({
            full_path_with_domain: fullPath
          });
          this.load();
        })
      }
    },
    selectMinHandFile(file) {
      this.url = file.full_path_with_domain;
      //this.assetsModal.selected = null;
      this.minutesModal.visible = false;
      this.hourModal.visible = false;
      this.$emit('minHandChange', this.url);
    },
    selectHourHandFile(file) {
      this.url = file.full_path_with_domain;
      //this.assetsModal.selected = null;
      this.minutesModal.visible = false;
      this.hourModal.visible = false;
      this.$emit('hourHandChange', this.url);
    },
    load() {
      axios.get(getUrl).then(res => res.data).then(res => {
        let filesInFolders = {};
        res.files.forEach(file => {
          file.is_dir = file.is_dir === 'true';
          file.full_path_with_domain = file.full_path_with_domain.replace('174files', '174/files');
          file.full_path = file.full_path.replace('files/company_1/files', '');
          let folderInfo = file.full_path.split('/');
          folderInfo.pop();
          if (file.is_dir) {
            folderInfo.pop();
            if (file.full_path.startsWith('/')) {
              file.full_path = file.full_path.substring(1);
            }
            if (file.full_path.endsWith('/')) {
              file.full_path = file.full_path.substring(0, file.full_path.length - 1);
            }
          }
          let folder = folderInfo.join('/');
          if (!folder) {
            folder = '/';
          } else {
            if (folder.startsWith('/')) {
              folder = folder.substring(1);
            }
          }
          if (folder === '/' && file.file === 'files' && file.is_dir) {

          } else {
            if (!filesInFolders[folder]) {
              filesInFolders[folder] = [];
            }
            filesInFolders[folder].push(file);
          }
        })
        Object.keys(filesInFolders).forEach(folder => {
          filesInFolders[folder] = filesInFolders[folder].sort((a, b) => {
            return b.is_dir - a.is_dir;
          })
        })
        this.setFiles(filesInFolders);
      })
    },
    onChange(e) {
      this.$emit('change', e);
    },
    ...mapMutations('filepicker', ['setFiles', 'setCurrentFolder','setFolderContents'])
  },

  data() {
    return {
      url: this.value,
      fileUpload: {
        active: false,
        percent: 0,
        name: '',
      },
      minutesModal: {
        visible: false,
        selected: null,
      },
      hourModal: {
        visible: false,
        selected: null,
      }
    }
  }
}
</script>
