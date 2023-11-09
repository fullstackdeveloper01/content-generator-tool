<script>
    import RangeSlider from '@/components/external/vue-range-slider.js';

    import {mapState, mapMutations, mapGetters} from 'vuex';
    import {
      exportJson,
      importJson,
      loadFileFromServer, loadFilesList, loadDraftFromServer,
      parseFileData,
      saveFileToServer
    } from '@/helpers/importExport';

    import { preview } from '@/helpers/preview';
    import Modal from "../layout/Modal";
    import Colorpicker from "../controls/custom/Colorpicker";
    import NumberInput from "../controls/custom/NumberInput";

    const defaultNewFileValues = {
                    name:"Untitled",
                    type:'composite',
                    visible:false,
                    cellColor:null,
                    opacity: 100,
                    backgroundColor: '#fff',
                    width: 1280,
                    height: 720,
                    size:'1280X720'
                };

    function isDescendant(parent, child) {
        let node = child.parentNode;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    export default {
        name: 'MainMenu',
        components: {NumberInput, Colorpicker, Modal,RangeSlider},

        data() {
            return {
                existingRecentFiles:[],
                menuVisible: true,
                gridModalVisible: false,
                gridParams: null,
                fileNameModal: {
                    visible: false,
                  //  open: true,
                    name: ''
                },
                showDesignTool:{
                    visible:false,
                },
                showConfirmSave:{
                    visible:false,
                },
                openNewFileModal:this.resetFileModalValue(),
                openFileModal: {
                    visible: false,
                    list: {},
                },
            }
        },
        computed: {
            ...mapState('canvas', ['canvas', 'zoomValue', 'grid']),
            ...mapState('tools', ['showTimeline']),
            ...mapState('scenes', ['list', 'file', 'params','currentSceneIndex']),
            ...mapGetters('scenes', ['currentScene','scenes'])
        },
        methods: {
            ...mapMutations('scenes', ['initStateManager', 'undo','redo','setFile','setFileName', 'removeObjectFromScene', 'setSelectedObjectIndex', 'copyObject', 'cutObject', 'pasteObject','setFileParam','deleteScene','deleteAllScene','addScene','setSceneIndex','setSceneParam', 'updateScenePreview']),
            ...mapMutations('tools', ['setShowTimeline']),
            ...mapMutations('canvas', ['setZoomValue', 'setGridEnabled', 'setGridParams']),
            loadFile(path, name) {

                function removeDuplicates(data, key) {

                return [
                    ...new Map(data.map(item => [key(item), item])).values()
                ]

                }
                if(!localStorage.getItem('farecentOpenedFiles')){
                    this.existingRecentFiles.push({path,name})
                    localStorage.setItem('farecentOpenedFiles',JSON.stringify([{path,name}]))
                }else{
                    let existing = JSON.parse(localStorage.getItem('farecentOpenedFiles'))
                    existing = removeDuplicates(existing, item=> item.name)
                    const found = existing.filter(item=> item.name == name)
                    if(found.length == 0 ){
                        existing.push({path,name})
                        this.existingRecentFiles.push({path,name})

                    }else{
                        // check if existing file is there
                        let foundIndex = -1
                        this.existingRecentFiles.map((item,i)=>{
                            if(item.name == found[0].name){
                                foundIndex = i;

                            }
                        })
                        if(foundIndex!= -1){
                            this.existingRecentFiles.splice(foundIndex, 1);
                            existing.splice(foundIndex, 1);
                            existing.push(found[0])
                            this.existingRecentFiles.push(found[0])
                        }

                        if(existing.length > 5) {
                            existing.length = 5;
                            this.existingRecentFiles.length = 5;
                        }
                    }
                    localStorage.setItem('farecentOpenedFiles',JSON.stringify(existing))

                }

                loadFileFromServer({path}).then(data => {
                    parseFileData(data, this.canvas, this.setFile);
                    this.setFileName({name:data.name});
                    this.openFileModal.visible = false;
                })
            },
            deleteAllScenes(){
                return new Promise ((resolve, reject)=>{
                    try{
                        if(this.scenes && this.scenes.length > 0 ){
                            this.canvas.discardActiveObject().renderAll();
                            this.deleteAllScene(this.canvas);  
                            resolve()                          
                        }else{
                            resolve()
                        }
                    }catch(e){
                        reject(e)
                    }
                })

            },
            createNewFile(){

                this.deleteAllScenes().then(()=>{

                     setTimeout(()=>{
                        //this method creates new file with given width, height and background color
                        const width = parseInt(this.openNewFileModal.width)
                        const height = parseInt(this.openNewFileModal.height)
                        //this.setFileName({name: this.openNewFileModal.name})
                        this.setFileName({name: ''});

                        if(width){
                            this.setFileParam({key:'width', val: width})
                            this.canvas.backgroundRect.width = width;
                        }
                        if(height){
                            this.setFileParam({key:'height', val:height})
                            this.canvas.backgroundRect.height = height;
                        }
                        this.canvas.backgroundRect.opacity = this.openNewFileModal.opacity * 0.01

                        this.canvas.backgroundRect.fill = this.openNewFileModal.backgroundColor;
                        this.setFileParam({key:'backgroundColor', val:this.openNewFileModal.backgroundColor})

                        //reset the background image
                        this.canvas.backgroundImage = null;
                        this.canvas.backgroundRect.visible = true;

                         if (this.openNewFileModal.opacity) {
                            this.canvas.renderAll()
                            this.setSceneParam({ key:'opacity', val: this.openNewFileModal.opacity })

                        }
                        
                        window._onUpdateCanvasDimensions();

                        this.openNewFileModal.visible = false;

                        if(this.grid.enabled) {
                            this.setGridEnabled(this.grid.enabled);
                        }
                        
                        this.canvas.renderAll();
                        this.updateScenePreview(this.canvas);

                        //if you want start saved
                        // this.save().then((filename)=>{

                        //     this.addFileNameIndex();
                        //     this.openNewFileModal = this.resetFileModalValue();
                        // })

                     },600)
                })


            },
            addFileNameIndex(){
                 if(!localStorage.getItem('fileNameIndex')){
                    localStorage.setItem('fileNameIndex',1)
                }else{
                    localStorage.setItem('fileNameIndex', parseInt(localStorage.getItem('fileNameIndex'))+1)
                }
            },
            resetFileModalValue(){

              let index = ''
               if(localStorage.getItem('fileNameIndex') && parseInt(localStorage.getItem('fileNameIndex')) >0){
                   index = ' '+  localStorage.getItem('fileNameIndex')
               }
               defaultNewFileValues.name = 'Untitled' +index
               return  JSON.parse(JSON.stringify( defaultNewFileValues))
            },
            newFileOk(e=null){
                // if(typeof this.fileNameModal.name  == 'undefined' || this.fileNameModal.name == '' ){
                //     this.openNewFileModal = this.resetFileModalValue()
                //     this.fileNameModal.name = this.resetFileModalValue().name
                // }
                if(e)
                    e.preventDefault();
                if(this.file.name && this.file.name != null){
                    this.openNewFileModal.visible = false;
                    this.showDesignTool.visible = true;
                }else{
                    this.showConfirmSave.visible = true;
                }
            },
            updateFileName() {
                this.setFileName({name: this.fileNameModal.name});
            },
            save() {
               return new Promise((resolve, reject ) => {
                    saveFileToServer({file: this.file, name: this.file.name, bgRect: this.canvas.backgroundRect, isDraft: false}).then(() => {
                        this.fileNameModal.visible = false;
                        this.$notify({
                        group: 'main',
                        type: 'success',
                        title: 'Success',
                        text: 'File successfully saved'
                        });
                        resolve(resolve)
                    })
                })
            },
            saveFile() {
                if (!this.file.name) {
                    this.saveFileAs();
                } else {
                    this.save();
                    this.menuVisible = false;
                }
            },
            saveFileAs() {
                this.fileNameModal.visible = true;
                this.$nextTick(() => {
                    this.$refs.fileName.focus();
                })
                //this.fileNameModal.open = false;
            },
            openNewFile(){
                //this.openNewFileModal.visible = true;
                this.newFileOk();
            },
            openFile() {
                this.openFileModal.visible = true;
                loadFilesList().then((data) => {
                    if(!data) return false;
                    //sort
                    const ordereddata = Object.keys(data).sort(function(a, b) {
                        //sort based on case insensitive
                        return a.toLowerCase().localeCompare(
                            b.toLowerCase()
                        );
                    }).reduce(
                        (obj, key) => { 
                            obj[key] = data[key]; 
                            return obj;
                        }, 
                        {}
                    );
                    this.openFileModal.list = ordereddata;
                });
                //this.fileNameModal.open = true;
            },
            exportFile() {
                exportJson(this.file, this.canvas.backgroundRect);
            },
            importFile() {
                this.$refs.fileInput.click()
                this.$refs.fileInput.onchange = (e) => {
                    if (e.target.files[0]) {
                        importJson(e.target.files[0], this.canvas, this.setFile);
                    }
                }
            },
            moveObject(keycode, step) {
                const target = this.canvas.getActiveObject();
                if(!target) return false;
                switch(keycode) {
                    case 'ArrowLeft':
                        target.left -= step;
                        break;
                    case 'ArrowRight':
                        target.left += step;
                        break;
                    case 'ArrowUp':
                        target.top -= step;
                        break;
                    case 'ArrowDown':
                        target.top += step;
                        break;
                }
                this.canvas.renderAll();
            },
            selectAll() {
                this.canvas.discardActiveObject();
                this.canvas.renderAll();
                console.log('objects', this.canvas.getObjects().map(item=> item.selectable))
                let sel = new fabric.ActiveSelection(this.canvas.getObjects().filter(object =>
                {
                    return (object.selectable )
                } ), {
                    canvas: this.canvas,
                });
                this.canvas.setActiveObject(sel);
                this.canvas.renderAll();
            },
            deselectAll() {
                this.canvas.discardActiveObject();
                this.canvas.renderAll();
            },
            deleteActiveObject() {
                const target = this.canvas.getActiveObject();
                if (target && !target.id && target._objects) {
                  target._objects.forEach(object => {
                    this.canvas.remove(object);
                    this.canvas.requestRenderAll();
                    this.removeObjectFromScene(object);
                  })
                  this.canvas.discardActiveObject();
                  return;
                }
                if (target && target.origobj) {
                    this.canvas.remove(target);
                    this.canvas.remove(target.origobj);
                    this.canvas.requestRenderAll();
                    this.removeObjectFromScene(target.origobj);
                } else if (target && !target.isEditing) {
                    this.canvas.remove(target);
                    this.canvas.requestRenderAll();
                    this.removeObjectFromScene(target);
                }
            },
            preview() {
                preview(this.file);
            },
            toggleTimeline() {
                this.setShowTimeline(!this.showTimeline);
                this.$nextTick(() => {
                  window._onCanvasChangeZoom();
                })
            },
            setZoom(zoom) {
                this.canvas.zoomToPoint({ x: this.canvas.width / 2, y: this.canvas.height / 2 }, zoom);
                this.setZoomValue(zoom);
            },
            toggleGrid() {
                this.setGridEnabled(!this.grid.enabled);
            },
            saveGridParams() {
                this.setGridParams(this.gridParams);
                this.gridModalVisible = false;
            },
            sizeDropdownChange(e){
                const [width , height] =  e.target.value.split('X')
                this.openNewFileModal.width = width
                this.openNewFileModal.height = height
            }
        },
        mounted() {
            let existing = JSON.parse(localStorage.getItem('farecentOpenedFiles'));
            if(existing && existing.length > 5) existing.length = 5;
            this.existingRecentFiles = existing || [];
            this.initStateManager(this.canvas);
            this.gridParams = this.grid;
            document.onkeydown = (e) => {
                
                // https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/

                if (document.activeElement && isDescendant(document.getElementById('controls'), document.activeElement)) {
                    return;
                }
                if(e.altKey && e.key == 'n'){
                    e.preventDefault();
                    this.openNewFileModal.visible =true
                }

                // for desect selected objects
                if(e.key == 'Escape'){
                    this.deselectAll();
                }
                
                var STEP = 1;
                if(e.shiftKey)
                    STEP = 10;

                switch(e.code) {
                    case 'ArrowLeft':
                    case 'ArrowRight':
                    case 'ArrowUp':
                    case 'ArrowDown':
                        this.moveObject(e.code, STEP);
                    break;
                }               

                if (e.ctrlKey) {
                    // for Ctrl + Shift + key
                    if(e.shiftKey ){
                        switch(e.code){
                            case 'KeyV':
                            this.pasteObject({canvas:this.canvas, toCenter: false})
                            break;
                        }
                        return
                    }
                    // for Ctrl + key
                    switch (e.code) {
                        case 'KeyX':
                            this.cutObject(this.canvas);
                            break;
                        case 'KeyC':
                            this.copyObject(this.canvas);
                            break;
                        case 'KeyV':
                            this.pasteObject({canvas: this.canvas, toCenter: !e.shiftKey});
                            break;
                        case 'KeyZ':
                            this.undo();
                            break;
                        case 'KeyY':
                            this.redo();
                            break;
                        default:
                            console.log(e.code);
                            break;
                    }
                } else if (e.altKey) {
                    // for Alt + Shift + key
                    if(e.shiftKey ){
                        switch(e.code){
                            case 'KeyS':
                              e.preventDefault();
                                this.saveFileAs();
                            break
                            case 'KeyG':
                                e.preventDefault();
                                this.gridModalVisible = true;
                                break;
                        }
                        return
                    }
                    // for Alt + key
                    switch (e.code) {
                        case 'KeyS':
                            e.preventDefault();
                            this.saveFile();
                            break;
                        case 'KeyN':
                            e.preventDefault();
                            this.openNewFileModal.visible =true
                            break;
                        case 'KeyO':
                            this.openFile();
                            e.preventDefault()
                            break;
                        case 'KeyE':
                            this.exportFile();
                            break;
                        case 'KeyI':
                            this.importFile();
                            break;
                        case 'KeyA':
                            e.preventDefault();
                            if (!e.shiftKey)
                             {
                                this.selectAll();
                            } else {
                                this.deselectAll();
                            }
                            break;
                        case 'ArrowUp':
                            if (e.shiftKey) {
                                this.setSelectedObjectIndex({index: this.currentScene.objects.length - 1});
                            } else {
                                this.setSelectedObjectIndex({index: -1, relative: false});
                            }
                            break;
                        case 'ArrowDown':
                            if (e.shiftKey) {
                                this.setSelectedObjectIndex({index: 0});
                            } else {
                                this.setSelectedObjectIndex({index: -1, relative: false});
                            }
                            break;
                        case 'KeyP':
                            this.preview();
                            break;
                        case 'KeyT':
                            if (!this.list.current) {
                            this.toggleTimeline();
                            }
                            e.preventDefault();
                            break;
                        case 'Equal':
                             e.preventDefault();
                            this.setZoom(this.zoomValue + .125);
                            break;
                        case 'Minus':
                            this.setZoom(this.zoomValue - .125);
                             e.preventDefault();
                            break;
                        case 'Numpad1':
                        case 'Digit1':
                            this.setZoom(1);
                            break;
                        case 'Numpad2':
                        case 'Digit2':
                            if (e.shiftKey) {
                                this.setZoom(.5);
                            } else {
                                this.setZoom(2);
                            }
                            break;
                        case 'Numpad4':
                        case 'Digit4':
                            if (e.shiftKey) {
                                this.setZoom(.25);
                            } else {
                                this.setZoom(4);
                            }
                            break;
                        case 'Numpad8':
                        case 'Digit8':
                            this.setZoom(8);
                            break;
                        case 'KeyG':
                            if (e.shiftKey) {
                                this.gridModalVisible = true;
                            } else {
                                this.toggleGrid();
                                }
                            break;
                        default:
                            console.log(e.code);
                            break;
                    };

                } else {
                    switch (e.code) {
                        case 'Delete':
                            this.deleteActiveObject();
                            break;
                        default:

                            break;
                    };
                }
                //e.preventDefault();
                //e.stopPropagation();
            }
            //Enable below code if new File popup need to open on page load
            // if (!this.file.name) {
            //       this.openNewFile()
            // }
    
            loadDraftFromServer().then(data => {
                if(!data) return false;
                var path = data.draft;
                loadFileFromServer({path}).then(indata => {
                    parseFileData(indata, this.canvas, this.setFile);
                    this.setFileName({name:indata.name});
                    this.openFileModal.visible = false;
                })
            })
        }
    }
</script>
<template>
    <ul class="menu__main">
        <input type="file" ref="fileInput" style="display: none" />
        <Modal title="Grid Settings" v-model="gridModalVisible" v-if="gridParams && canvas">
            <div class="inputs-row">
                <div class="input-block input-block--line">
                    <label class="input-block__title">Color</label>
                    <Colorpicker v-model="gridParams.cellColor" />
                </div>
                <div class="input-block input-block--line">
                    <label class="input-block__title">Dot width</label>
                    <NumberInput v-model="gridParams.cellSize" :min="1" :max="10" />
                </div>
            </div>

            <div class="input-block input-block--line">
                <label class="input-block__title">Cell width</label>
                <NumberInput v-model="gridParams.width" :min="1" :max="canvas.width" />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Cell height</label>
                <NumberInput v-model="gridParams.height" :min="1" :max="canvas.height" />
            </div>
            <div class="modal__buttons">
                <a @click="saveGridParams()" class="button">Apply</a>
                <a @click="gridModalVisible = false" class="button button--secondary">Cancel</a>
            </div>
        </Modal>

      <Modal :title="'Open file'" v-model="openFileModal.visible">
        <div class="modal__files-list">
          <div class="modal__files-list__item" v-for="(path, name) in openFileModal.list" @click="loadFile(path, name)" :key="name">
            {{name}}
          </div>
        </div>
      </Modal>

        <Modal :title="'Design Tool'" v-model="showConfirmSave.visible">
          <div class="inputs-row">
            <div class="input-block input-block--line">
              <label class="">Do you want to Save Changes?</label>
            </div>
           </div>
           <div class="modal__buttons ">
            <a @click="()=>{
                    this.showConfirmSave.visible =false;
                    this.saveFile();
                }" class="button">Yes</a>
            <a @click="()=>{
                this.createNewFile()
                 this.showConfirmSave.visible =false
                }" class="button margin-left-10  button--secondary">No</a>
            <a @click="showConfirmSave.visible = false" class="button button--secondary margin-left-10">Cancel</a>
          </div>
        </Modal>

        <Modal :title="'Design Tool'" v-model="showDesignTool.visible">
          <div class="inputs-row">
            <div class="input-block input-block--line">
              <label class="">Save changes to {{file.name}}.json?</label>
            </div>
           </div>
           <div class="modal__buttons ">
            <a @click="()=>{
                  this.fileNameModal.name = this.fileNameModal.name

                    this.save().then(()=>{
                        this.createNewFile()
                        this.showDesignTool.visible =false
                    })

                }" class="button">Yes</a>
            <a @click="()=>{
                this.createNewFile()
                 this.showDesignTool.visible =false
                }" class="button margin-left-10  button--secondary">No</a>
            <a @click="showDesignTool.visible = false" class="button button--secondary margin-left-10">Cancel</a>

          </div>
        </Modal>

        <Modal :title="'New Document'" v-model="openNewFileModal.visible">
            <form @submit="newFileOk">
                <div class="inputs-row">
                    <div class="input-block input-block--line">
                        <label class="input-block__title">Name</label>
                        <input class="input-block__el"  style="margin-left:10px" v-model="openNewFileModal.name" required/>
                    </div>
                </div>
                <div class="inputs-row">
                    <div class="input-block input-block--line">
                        <label class="input-block__title">Type</label>
                        <select class="input-block__el" style="margin-left:10px" v-model="openNewFileModal.type">
                            <option  value="composite">Composite </option>
                        </select>
                    </div>
                </div>
                <div class="inputs-row">
                    <div class="input-block input-block--line">
                        <label class="input-block__title" >Size</label>

                    </div>
                    <div class="input-block input-block--line">
                        <label class ="input-block__title"> </label>
                        <input type="number" placeholder="Width" style="margin-right:10px" class="input-block__el"  v-model="openNewFileModal.width " />
                    </div>
                    X
                    <div class="input-block input-block--line">
                        <label class="input-block__title" > </label>
                        <input  type="number" placeholder="Height" class="input-block__el"   v-model="openNewFileModal.height"/>
                        <select placeholder="Size" class="input-block__el" style="margin-left:10px" v-model="openNewFileModal.size"  @change="sizeDropdownChange" >
                            <option value="1920X1080">1920X1080</option>
                            <option value="1366X768" >1366X768</option>
                            <option value="1280X720" >1280X720</option>
                            <option value="768X576" >768X576</option>
                            <option value="720X576" >720X576</option>
                            <option value="704X576" >704X576</option>
                            <option value="544X576" >544X576</option>
                            <option value="480X576" >480X576</option>
                            <option value="852X480" >852X480</option>
                            <option value="720X480" >720X480</option>
                            <option value="704X480" >704X480</option>
                            <option value="640X480" >640X480</option>
                        </select>

                    </div>
                    </div>
                <div class="inputs-row">
                    <div class="input-block input-block--line">
                        <label class="input-block__title">Color</label>
                        <Colorpicker v-model="openNewFileModal.backgroundColor" />
                         <RangeSlider tooltip="hover" style="margin-right:15px" :min="0" :max="100" v-model="openNewFileModal.opacity" :step="1"/>
                        <NumberInput v-model="openNewFileModal.opacity" :min="0" :max="100" :step="1"   textAfter="%" />
                    </div>
                    </div>
                <div class="modal__buttons">
                    <button type="submit" style="margin-right:20px"  class="button ">Ok</button>
                    <button @click="openNewFileModal.visible = false"  class="button button--secondary">Cancel</button>

                </div>
            </form>
      </Modal>

        <Modal :title="'Save file'" v-model="fileNameModal.visible">
          <div class="inputs-row">
            <div class="input-block input-block--line">
              <label class="input-block__title">File name</label>
              <input ref="fileName" class="input-block__el" v-model="fileNameModal.name" />
            </div>
          </div>
          <div class="modal__buttons">
            <a @click="updateFileName();save()" class="button">{{ fileNameModal.open ? 'Open' : 'Save' }}</a>
            <a @click="fileNameModal.visible = false" class="button button--secondary">Cancel</a>
          </div>
        </Modal>

        <li @mouseenter="menuVisible = true" class="menu__main__item">
            <a id="menu_file" href="#" class="menu__button">File</a>
            <div class="menu__main__nav">
                <ul class="menu__main__nav__sub" v-show="menuVisible">
                    <li class="menu__main__nav__item"><a  @click="openNewFile()">New...  <span class="menu__main__nav__shortkey">(Alt + N)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="openFile()">Open... <span class="menu__main__nav__shortkey">(Alt + O)</span></a></li>

                    <li class="menu__main__nav__item"><a @click="importFile()">Import... <span class="menu__main__nav__shortkey">(Alt + I)</span></a></li>
                     <li class="menu__main__nav__item">
                        <a href="#">
                            Recent Files
                            <img class="menu__main__nav__arrow" src="images/ic-preview.svg">
                        </a>
                        <ul class="menu__main__nav__submenu">
                            <li   v-for="(obj) in existingRecentFiles.slice(-5).reverse()" @click="loadFile(obj.path, obj.name)" :key="obj.name" class="menu__main__nav__item"><a >{{obj.name}}</a></li>
                            <li  v-if="!existingRecentFiles || existingRecentFiles.length == 0"   class="menu__main__nav__item"><a >No recent files</a></li>

                        </ul>
                    </li>
                    <li class="menu__main__nav__item"><a @click="saveFile()">Save <span class="menu__main__nav__shortkey">(Alt + S)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="saveFileAs()">Save As... <span class="menu__main__nav__shortkey">(Alt + Shift + S)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="exportFile()">Export... <span class="menu__main__nav__shortkey">(Alt + E)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="window.close()">Close <span class="menu__main__nav__shortkey">(Alt + W)</span></a></li>

                </ul>
            </div>
        </li>
        <li @mouseenter="menuVisible = true" class="menu__main__item">
            <a id="menu_edit" href="#" class="menu__button">Edit</a>
            <div class="menu__main__nav">
                <ul class="menu__main__nav__sub" v-show="menuVisible">
                    <li class="menu__main__nav__item"><a @click="undo()">Undo <span class="menu__main__nav__shortkey">(Ctrl + Z)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="redo()">Redo <span class="menu__main__nav__shortkey">(Ctrl + Y)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="cutObject(canvas)">Cut  <span class="menu__main__nav__shortkey">(Ctrl + X)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="copyObject(canvas)">Copy <span class="menu__main__nav__shortkey">(Ctrl + C)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="pasteObject({canvas, toCenter: true})">Paste in Center <span class="menu__main__nav__shortkey">(Ctrl + V)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="pasteObject({canvas, toCenter: false})">Paste in Place <span class="menu__main__nav__shortkey">(Ctrl + Shift + V)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="deleteActiveObject()">Delete <span class="menu__main__nav__shortkey">(Delete)</span></a></li>
                    <li class="menu__main__nav__item">
                        <a href="#">
                            Arrange
                            <img class="menu__main__nav__arrow" src="images/ic-preview.svg">
                        </a>
                        <ul class="menu__main__nav__submenu">
                            <li class="menu__main__nav__item"><a @click="setSelectedObjectIndex({index: currentScene.objects.length + 1})">Bring to Front <span class="menu__main__nav__shortkey">(Alt + Shift + Up)</span></a></li>
                            <li class="menu__main__nav__item"><a @click="setSelectedObjectIndex({index: 1, relative: true})">Bring Forward <span class="menu__main__nav__shortkey">(Alt + Up)</span></a></li>
                            <li class="menu__main__nav__item"><a @click="setSelectedObjectIndex({index: -1, relative: true})">Send Backward <span class="menu__main__nav__shortkey">(Alt + Down)</span></a></li>
                            <li class="menu__main__nav__item"><a @click="setSelectedObjectIndex({index: 0})">Send to Back <span class="menu__main__nav__shortkey">(Alt + Shift + Down)</span></a></li>
                        </ul>
                    </li>
                    <li class="menu__main__nav__item"><a @click="selectAll()">Select All <span class="menu__main__nav__shortkey">(Alt + A)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="deselectAll()">Deselect All <span class="menu__main__nav__shortkey">(Esc)</span></a></li>
                </ul>
            </div>
        </li>
        <li @mouseenter="menuVisible = true" class="menu__main__item">
            <a id="menu_view" href="#" class="menu__button">View</a>
            <div class="menu__main__nav">
                <ul class="menu__main__nav__sub" v-show="menuVisible">
                    <li v-show="!list.current" class="menu__main__nav__item"><a @click="toggleTimeline()">
                        <img class="menu__main__nav__check" src="images/ic-check.svg" v-if="showTimeline" />
                        Timeline <span class="menu__main__nav__shortkey">(Alt + T)</span></a>
                    </li>
                    <li class="menu__main__nav__item"><a @click="preview()">Preview <span class="menu__main__nav__shortkey">(Alt + P)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="setZoom(zoomValue + .125)">Zoom In  <span class="menu__main__nav__shortkey">(Alt + =)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="setZoom(zoomValue - .125)">Zoom Out <span class="menu__main__nav__shortkey">(Alt + -)</span></a></li>
                    <li class="menu__main__nav__item">
                        <a href="#">
                            Magnification
                            <img class="menu__main__nav__arrow" src="images/ic-preview.svg">
                        </a>
                         <ul class="menu__main__nav__submenu">
                            <li class="menu__main__nav__item"><a @click="setZoom(.25)">25% <span class="menu__main__nav__shortkey">(Alt + Shift + 4)</span></a></li>
                            <li class="menu__main__nav__item"><a @click="setZoom(.5)">50% <span class="menu__main__nav__shortkey">(Alt + Shift + 2)</span></a></li>
                            <li class="menu__main__nav__item"><a @click="setZoom(1)">100% <span class="menu__main__nav__shortkey">(Alt + 1)</span></a></li>
                            <li class="menu__main__nav__item"><a @click="setZoom(2)">200% <span class="menu__main__nav__shortkey">(Alt + 2)</span></a></li>
                            <li class="menu__main__nav__item"><a @click="setZoom(4)">400% <span class="menu__main__nav__shortkey">(Alt + 4)</span></a></li>
                            <li class="menu__main__nav__item"><a @click="setZoom(8)">800% <span class="menu__main__nav__shortkey">(Alt + 8)</span></a></li>
                        </ul>
                    </li>
                    <li class="menu__main__nav__item"><a @click="toggleGrid()">
                        <img class="menu__main__nav__check" src="images/ic-check.svg" v-if="grid.enabled" />
                        Snap to Grid <span class="menu__main__nav__shortkey">(Alt + G)</span></a></li>
                    <li class="menu__main__nav__item"><a @click="gridModalVisible = true">Grid Settings... <span class="menu__main__nav__shortkey">(Alt + Shift + G)</span></a></li>
                </ul>
            </div>
        </li>
        <li @mouseenter="menuVisible = true" class="menu__main__item">
            <a id="menu_help" href="#" class="menu__button">Help</a>
            <div class="menu__main__nav">
                <ul class="menu__main__nav__sub" v-show="menuVisible">
                    <li class="menu__main__nav__item"><a href="#">Keyboard Shortcuts</a></li>
                    <li class="menu__main__nav__item"><a href="#">About</a></li>
                </ul>
            </div>
        </li>
    </ul>
</template>
<style lang="scss">

    .menu__main {
        list-style-type: none;
        margin: 0;
        padding: 0 0 0 10px;
        display: flex;
        &--slider-before .slider-component {
            order: -1;
        }
        &__inner {
            position: relative;
        }
        &__item {
            position: relative;
        }

        &__nav {
            position: absolute;
            margin-top: -16px;
            left: 0px;
            display: none;
            width: 220px;
            padding: 16px 0;
            z-index: -1;

            &__sub {
                width: 220px;
                float: left;
                position: relative;
                z-index: 1;
                list-style: none;
                padding: 0;
                margin: 0;
            }

            &__item {
                float: left;
                width: 235px;
                position: relative;
                &:last-child {
                    border-bottom: 1px solid #13125C;
                }

                a {
                    cursor: pointer;
                    float: left;
                    width: 220px;
                    line-height: 34px;
                    padding: 0 0 0 15px;
                    font-size: 13px;
                    color: #fff;
                    background: #6F91D9;
                    text-decoration: none;
                    &:hover {
                        background: #3c5491;
                        transition-duration: inherit;
                    }
                }

                & + li {
                    border-top: 1px solid #13125c;
                }
            }
            &__check {
                width: 12px;
                display: inline-block;
                position: relative;
                top: 2px;
                margin: 0 4px 0 0;
            }
            &__arrow {
                width: 12px;
                margin: 10px 12px 0 0;
                display: block;
                float: right;
            }
            &__submenu {
                display: none;
                list-style-type: none;
                margin: 0;
                padding: 0;
                position: absolute;
                left: 235px;
                border-left: 1px solid #13125c;
            }
            &__item:hover &__submenu, &__submenu:hover {
                display: block;
            }
        }
        &__item:hover &__nav {
            display: block;
            z-index: 100;
        }
        &__arrows {
            user-select: none;
            position: absolute;
            top: -1px;
            right: 4px;
            display: flex;
            flex-direction: column;
        }

        &__arrow {
            width: 12px;
            height: 8px;
            fill: #4C5F8A;
            display: inline-block;
            cursor: pointer;

            svg {
                height: 8px;
            }

            &--up svg {
                transform: rotate(180deg);
                transform-origin: center;
            }
        }
         .slider-component {
            flex: 1;
            margin: 0 0 0 12px;
            .slider {
                background: gray;
            }
        }
        .margin-left-10{
            margin-left: 10px;
        }

    }


</style>
