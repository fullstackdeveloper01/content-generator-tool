<template>
  <div class="input-block file-input">
    <VueSimpleContextMenu
      element-id="rightclickmenu"
      :options="menuoptions"
      ref="vueSimpleContextMenu"
      @option-clicked="optionClicked"
    />
    <Modal title="Media Library" v-model="assetsModal.visible" @close="() => closeModal()">
      <input placeholder="Search..." class="input-block__el" v-model="searchInput" @input="onChangeSearchInput"  />
      <div @contextmenu.prevent.stop="handleClick($event);" class="file-input__assets-list">
        <div class="file-input__asset" @click="goBack()" v-if="currentFolder !== '/'" >
          <div class="file-input__asset__name text-ellipsis">Folder:/{{currentFolder}} </div>
          <img v src="/images/folder_back.svg" class="file-input__asset__icon" />
          <div class="file-input__asset__name text-ellipsis">Back</div>
        </div>
        <div @contextmenu.prevent.stop="selectedAsset=asset;handleClick($event);" class="file-input__asset" @click="selectFile(asset)" v-for="(asset, $index) in filteredFiles" :key="$index">
          <img v-if="asset.is_dir" src="/images/folder.svg" class="file-input__asset__icon" />
          <img v-else-if="!isPicture(asset)" src="/images/file.svg" class="file-input__asset__icon" />
          <div v-else :style="{backgroundImage: `url(${asset.full_path_with_domain}`}" class="file-input__asset__picture"></div>
          <div class="file-input__asset__name text-ellipsis" :title="asset.file">{{asset.file}}</div>          
        </div>
      </div>
      <Modal :title="'Confirm Delete'" v-model="showConfirmDelete.visible">
        <div class="inputs-row">
          <div class="input-block input-block--line">
            <label class="">Do you want to Delete?</label>
          </div>
        </div>
        <div class="modal__buttons ">
          <a @click="()=>{
                  this.showConfirmDelete.visible =false;
                  this.deleteFolder();
              }" class="button">Yes</a>
          <a @click="()=>{this.showConfirmDelete.visible=false}" class="button margin-left-10  button--secondary">No</a>
        </div>
      </Modal>
      <Modal :title="'Rename File/Folder'" v-model="renameFile.visible">
        <div class="inputs-row">
          <div class="input-block input-block--line">
            <label class="input-block__title">Folder Name</label>
            <input ref="fileName" class="input-block__el" v-model="renameFile.name" />
          </div>
        </div>
        <div class="modal__buttons">
          <a @click="renameFileFolder()" class="button">Rename</a>
          <a @click="renameFile.visible = false" class="button button--secondary">Cancel</a>
        </div>
      </Modal>
      <Modal :title="'Create New Folder'" v-model="newfolderName.visible">
        <div class="inputs-row">
          <div class="input-block input-block--line">
            <label class="input-block__title">Folder Name</label>
            <input ref="fileName" class="input-block__el" v-model="newfolderName.name" />
          </div>
        </div>
        <div class="modal__buttons">
          <a @click="createFolder()" class="button">Create</a>
          <a @click="newfolderName.visible = false" class="button button--secondary">Cancel</a>
        </div>
      </Modal>

      <div class="file-input__buttons">
        <div class="modal__buttons">
        <a class="button file-input__upload-button" @click="newfolderName.visible=true">Create Folder</a>
        <a class="button file-input__upload-button" @click="$refs.fileinput.click()">Upload File</a>
        <input type="file" ref="fileinput" @change="uploadFile" style="display: none"/>
        </div>
        <div class="modal__buttons">
          <a @click="closeModal()" class="button button--secondary">Cancel</a>
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

import VueSimpleContextMenu from 'vue-simple-context-menu';

import FileInputAsset from "@/components/controls/custom/FileInputAsset";

var apiUrl = window.appSettings.apiUrl;
const axios = require('axios');
const parser = new DOMParser();
const getAllAssets = apiUrl + 'admin/creation-tool/get-assets-list?json=1';
const uploadUrl = apiUrl + 'admin/creation-tool/upload-asset';
const createDir = apiUrl + 'admin/creation-tool/create-dir';
const deleteDir = apiUrl + 'admin/creation-tool/delete-dir';
const renameDir = apiUrl + 'admin/creation-tool/rename-dir';
const deleteFile = apiUrl + 'admin/creation-tool/delete-file';
 
import Modal from "@/components/layout/Modal"


export default {
  components: {FileInputAsset, Modal, VueSimpleContextMenu},
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
    'assetsModal.visible'(isVisible) {
        if (isVisible) {
          this.getAllAssets();
        }
    },
    url(newUrl) {
      this.$emit('input', newUrl);
    }
  },
  mounted() {
    this.defaultmenuoptions = this.menuoptions;
    this.getAllAssets();
  },
  methods: {
    onChangeSearchInput() {
      var keyword = this.searchInput;
      var filteredFiles = this.tempFilesInFolders;
      var tempFiles = {};
      Object.keys(filteredFiles).forEach(folder => {
        tempFiles[folder] = filteredFiles[folder].filter(file => {
          if (file.file.indexOf(keyword) != -1)
            return true;
          else
            return false;
        })
      })
      this.setFiles(tempFiles);
    },
    handleClick(event) {
      if(this.selectedAsset) {
        this.menuoptions = this.defaultmenuoptions;
      } else {
        this.menuoptions = this.createmenuoptions;
      }
      this.$refs.vueSimpleContextMenu.showMenu(event);
    },
    optionClicked(event) {
      if(!event) return false;
      switch(event.option.slug) {
        case 'createfolder': 
          this.newfolderName.name = '';
          this.newfolderName.visible = true;
          break;
        case 'delete':       
          this.showConfirmDelete.visible = true;
          break;
        case 'uploadfile':       
          this.$refs.fileinput.click();
          break;
        case 'rename':
          if(this.selectedAsset) {
            this.renameFile.visible = true;
            this.renameFile.name = this.selectedAsset.file;
          }
          break;
        default:
          break;   
      }
    },
    goBack() {
      this.selectedAsset = null;
      this.searchInput = '';
      let folder = this.currentFolder.split('/');
      folder.pop();
      folder = folder.join('/');
      if (!folder || folder === '') {
        folder = '/';
      }
      this.setCurrentFolder(folder);
      this.getAllAssets();
    },
    isPicture(file) {
      let extension = file.file.split('.').pop();
      return ['png','jpg','jpeg','webp','bmp','gif','svg'].indexOf(extension) !== -1;
    },
    uploadFile(e) {
      let file = e.target.files[0];
      if (file) {
        var path = this.currentFolder;
        if(path === '/')
          path = "";
        const data = new FormData();
        data.append('Filedata', file);
        data.append('Location', 'assets');
        data.append('Sublocation', this.currentFolder);
        data.append('Filename', file.name);
        data.append('Path', path);
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
          if(xmlDoc.getElementsByTagName("File")[0]) {
            const fullPath = xmlDoc.getElementsByTagName("File")[0].getAttribute('url');
            this.selectFile({
              full_path_with_domain: fullPath
            });
            res = {};
            res.status = true;
            res.message = 'File Uploaded Successfully.';
          }
          this.processResult(res);
          this.getAllAssets();
        })
      }
    },
    closeModal() {
      this.assetsModal.visible = false;
      this.$emit('close');
    },
    renameFileFolder() {
      if(!this.selectedAsset) return false;
      const data = new FormData();
      var path = this.currentFolder;
      if(path !== '/')
        path = "/" + path;
      data.append('path', path);
      data.append('oldFileName', this.selectedAsset.file);
      data.append('newFileName', this.renameFile.name);
      axios.request({
        method: 'POST',
        url: renameDir,
        data: data
      }).then (res => res.data).then(res => {
        this.processResult(res);
        this.getAllAssets();
        this.renameFile.visible = false;
      })
    },
    deleteFolder() {
      if(!this.selectedAsset) return false;
      const data = new FormData();
      var path = this.currentFolder;
      if(path !== '/')
        path = "/" + path;
      data.append('path', path);
      if(this.selectedAsset.is_dir)
        data.append('dirName', this.selectedAsset.file);
      else
        data.append('fileName', this.selectedAsset.file);
      axios.request({
        method: 'POST',
        url: this.selectedAsset.is_dir ? deleteDir : deleteFile,
        data: data
      }).then (res => res.data).then(res => {
        this.processResult(res);
        this.getAllAssets();
      })
    },
    processResult(res) {
      if(res.status) {
        this.$notify({
          group: 'main',
          type: 'success',
          title: 'Success',
          text: res.message
        });          
      } else {
        this.$notify({
          group: 'main',
          type: 'error',
          title: 'Error',
          text: res.message
        });
      }
    },
    createFolder() {      
      if(!this.newfolderName.name) return false;
      const data = new FormData();
      data.append('path', "/" + this.currentFolder);
      data.append('dirName', this.newfolderName.name);
      axios.request({
        method: 'POST',
        url: createDir,
        data: data
      }).then (res => res.data).then(res => {
        this.newfolderName.visible = false;        
        this.processResult(res);
        this.getAllAssets();
      })
    },
    selectFile(file) {
      this.selectedAsset = null;
      this.searchInput = '';
      if (file.is_dir) {
        this.setCurrentFolder(file.full_path);        
        this.getAllAssets();
      } else {
        this.url = file.full_path_with_domain;
        //this.assetsModal.visible = false;
        this.$emit('change', {
          target: {
            value: this.url
          }
        });
      }
    },
    getAllAssets() {
      var path = this.currentFolder;
      if(path !== '/')
        path = "/" + path;
      axios.get(getAllAssets + '&path=' + path).then(res => res.data).then(res => {
        let filesInFolders = {};
        res.files.forEach(file => {
          file.full_path_with_domain = file.full_path_with_domain.replace('174files', '174/files');
          file.full_path = file.full_path.replace('files/company_1/files', '');
          if (file.is_dir) {
            if (file.full_path.startsWith('/')) {
              file.full_path = file.full_path.substring(1);
            }
            if (file.full_path.endsWith('/')) {
              file.full_path = file.full_path.substring(0, file.full_path.length - 1);
            }
          }
          let folder = this.currentFolder;
          if (!filesInFolders[folder]) {
            filesInFolders[folder] = [];
          }
          filesInFolders[folder].push(file);
        })
        Object.keys(filesInFolders).forEach(folder => {
          filesInFolders[folder] = filesInFolders[folder].sort((a, b) => {
            const isdir = b.is_dir - a.is_dir;
            const filename = a.file.localeCompare(b.file);
            return isdir || filename;
          })
        })
        this.tempFilesInFolders = filesInFolders;
        this.setFiles(filesInFolders);
      })
    },
    ...mapMutations('filepicker', ['setFiles', 'setCurrentFolder','setFolderContents'])
  },    
  data() {
    return {
      defaultmenuoptions: [],
      createmenuoptions: [
        {
          name: 'Create Folder',
          slug: 'createfolder',
        },
        {
          name: 'Upload File',
          slug: 'uploadfile',
        },
      ],
      menuoptions: [
        {
          name: 'Create Folder',
          slug: 'createfolder',
        },
        {
          name: 'Upload File',
          slug: 'uploadfile',
        },
        {
          type: 'divider',
        },
        {
          name: 'Rename',
          slug: 'rename',
        },
        {
          name: '<em>Delete</em>',
          slug: 'delete',
        },
      ],
      viewMenu: false,
      top: '0px',
      left: '0px',
      url: this.value,
      fileUpload: {
        active: false,
        percent: 0,
        name: '',
      },
      newfolderName: {
        visible: false,
        name: '',
      },
      assetsModal: {
        visible: true,
        selected: null,
      },
      renameFile: {
        visible: false,
        name: '',
      },
      showConfirmDelete: {
        visible: false,
      },
      tempFilesInFolders: {},
      selectedAsset: null,
      searchInput: null
    }
  }
}
</script>
<style lang="scss">
  .vue-simple-context-menu {
    &--active {
    }

    &__item {
      &:hover {
      }
    }

    &__divider {
    }
  }
</style>