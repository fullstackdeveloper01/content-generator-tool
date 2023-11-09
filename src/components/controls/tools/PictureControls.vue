<script>
  import {mapGetters, mapState, mapMutations} from 'vuex';
  import Section from "@/components/layout/Section";
  import Checkbox from "../custom/Checkbox";
  import NumberInput from "../custom/NumberInput";
  import Colorpicker from "../custom/Colorpicker";
  import AlignControls from "../common/AlignControls";
  import SizeControls from "../common/SizeControls";
  import FileInput from "@/components/controls/custom/FileInput";
  import Tooltip from "@/components/layout/Tooltip";
  import EventBus from "@/EventBus";

  export default {
    computed: {
      ...mapGetters('scenes', ['params','currentObject']),
      ...mapState('scenes', ['fabricObject']),
      ...mapState('canvas', ['canvas']),
    },
    components: {FileInput, SizeControls, AlignControls, Colorpicker, NumberInput, Checkbox, Section, Tooltip},
    data() {
        return {
          isScrolling: false,
          groupArr:[],
        }
    },
    mounted() {
      if(!this.fabricObject.transitionType) {
        this.fabricObject.transitionType = 'move';
      }
      if(!this.fabricObject.transitionEase) {
        this.fabricObject.transitionEase = 'linear';
      }      
      if(!this.fabricObject.easeDirection) {
        this.fabricObject.easeDirection = 'out';
      }
      if(!this.fabricObject.scrollStopTime) {
        this.fabricObject.scrollStopTime = 1;
      }      
    },
    methods: {
      showImgAtInterval() {
        var obj = this.fabricObject;
        if(obj.animTimeOut) {
          clearTimeout(obj.animTimeOut);
          obj.animTimeOut = null;
        }
        obj.animTimeOut = setTimeout(() => {    
          console.log(obj.interval);    
          console.log('obj==',obj);
          console.log(' obj.srcindex==', obj.srcindex);
          console.log(this.fabricObject.scrollStopTime);
          obj.opacity = 0;
          obj.animImgs[obj.srcindex].opacity = 0;
          obj.srcindex++;
          if(obj.srcindex >= obj.otherUrls.length)
            obj.srcindex = 0;
            obj.animImgs[obj.srcindex].opacity = 1;
            this.canvas.renderAll();
            this.showImgAtInterval();
        }, this.fabricObject.scrollStopTime * 1000);
      },
      animateImageNew() {
        var obj = this.fabricObject;
        obj.srcindex = 0;
        if(obj.transitionType === 'none') {
          this.showImgAtInterval();
        } else if(this.fabricObject.transitionType === 'move') {

        }
      },
      animateImage(obj, ov, sv, ev) {
        this.animateImageNew();
        return false;
          const groupParam = obj.scrollField === 'left' ? 'width' : 'height';
          const scaleParam = obj.scrollField === 'left' ? 'scaleX' : 'scaleY';
          if(!obj.isScrolling) return false;
          fabric.util.animate({
              startValue: sv,
              endValue: ev,
              duration: obj.scrollStopTime, //(obj[groupParam]*obj[scaleParam]) / obj.scrollStopTime,
              easing: function(t, b, c, d) { return c*t/d + b; },
              abort: () => {
                  return !obj.isScrolling;
              },
              onChange: (value) => {
                  obj[obj.scrollField] = ov + value;
                  //obj.height = obj.fixedHeight;
                  this.canvas.renderAll();
              },
              onComplete: () => {
                  
                  obj.srcindex++;

                  if(obj.srcindex >= obj.otherUrls.length)
                    obj.srcindex = 0;
                    
                  var url = obj.otherUrls[obj.srcindex];                
                  var newImg = new Image();
                  newImg.onload = (img) => {
                    obj.setElement(newImg);
                    this.canvas.renderAll();
                    
                    //if scroll stop time then stop animation for the specified time.
                    if(obj.interval > 0) {
                      if(obj.animTimeOut) {
                          clearTimeout(obj.animTimeOut);
                          obj.animTimeOut = null;
                      }
                      obj.animTimeOut = setTimeout(() => {            
                          this.animateImage(obj, ov, 0, obj.sv);
                      }, obj.interval * 1000);
                      obj[obj.scrollField] = ov;
                      this.canvas.renderAll();
                    } else {
                        this.animateImage(obj, ov, sv, ev);
                    }
                  };
                  newImg.src = url;
              }
          });
      },
      initScrollImageEvents(clipPath) {
          clipPath.on('modified', (e) => {
              var target = e.target;
              target.setCoords();
              if(target.origobj) {
                  target.origobj.left = target.left;
                  target.origobj.top = target.top;
                  target.origobj.scaleX = target.scaleX;
                  target.origobj.scaleY = target.scaleY;
                  target.origobj.setCoords();
                  target.origobj.animImgs.forEach(img => {
                      img.left = target.left;
                      img.top = target.top;
                      // img.scaleX = target.scaleX;
                      // img.scaleY = target.scaleY;
                      img.setCoords();
                  });
              }
              this.canvas.renderAll();
              target.origobj.originalScrollValue = target.origobj[target.origobj.scrollField];
              this.restoreImage(target.origobj);
              this.startStopScrollImage(target.origobj);
          });
      },
      restoreImage(object) {
        if(object.animTimeOut) {
            clearTimeout(object.animTimeOut);
            object.animTimeOut = null;
        }
        object.srcindex = 0;
        object.isScrolling = false;
        this.isScrolling = false;
        object.custtype = null;
        if(object.originalScrollValue)
            object[object.scrollField] = object.originalScrollValue;
        this.canvas.setActiveObject(object);
        var clipPath = object.clipPath;
        object.clipPath = null;
        this.canvas.remove(clipPath);
        this.canvas.renderAll();
      },
      startStopScrollImage(object) {
       
          if (!object.transitionDirection || object.transitionDirection === undefined) {
              //return;
            object.transitionDirection = 'right';
          }
          alert(object.transitionDirection);
          object.setCoords();
          //  alert(object.isScrolling);
          if (!object.isScrolling) {
            object.srcindex = 0;
            object.isScrolling = true;                    
            this.isScrolling = true;
            object.scrollField = object.transitionDirection === 'left' || object.transitionDirection === 'right' ? 'left' : 'top';
            object.originalScrollValue = object[object.scrollField];
          console.log( object.originalScrollValue);

            let clipPath = new fabric.Rect({
                originX: 'center',
                originY: 'center',
                left: object.left,
                top: object.top,
                width: object.width,
                height: object.height,
                scaleX: object.scaleX,
                scaleY: object.scaleY,
                absolutePositioned: true,
               fill: 'Transparent'
            });

            
            this.canvas.add(clipPath);
            var activeObject = this.canvas.getActiveObject();
            console.log('activeObject',activeObject);

        


            
            if(object.transitionDirection=='up'){
              this.moveUp(object);
            }
            if(object.transitionDirection=='down'){
              this.moveDown(object);
            }
           
            // clipPath.origobj = object;
            // object.custtype = 'animobj';
            // object.clipPath = clipPath;
            
            // const whParam = object.scrollField === 'left' ? 'width' : 'height';
            // const swh = object.scrollField === 'left' ? object.width : object.height; //image width height 
            // const scaleParam = object.scrollField === 'left' ? 'scaleX' : 'scaleY';
            // const reverse = object.transitionDirection === 'right' || object.transitionDirection === 'bottom';
            
            // var ov = object[object.scrollField];
            // var sv = - swh * object[scaleParam]; // start value
            
            // if(object.originX === 'center') {
            //     sv = sv/2 - object[whParam] * object[scaleParam] / 2;
            // }
            // // if(object.textAlign === 'right') {
            // //     sv = - object[whParam] * object[scaleParam];
            // // }
            // var ev = object[whParam] * object[scaleParam]; //end value
            // object.reverse = reverse;
            // if(reverse) {
            //     object.sv = sv;
            //     object.ev = ev;
            //     if(object.scrollStopTime > 0)
            //         sv = 0; // start value
            //     this.animateImage(object, ov, sv, ev);
            // } else {
            //     object.sv = sv;
            //     object.ev = ev;
            //     if(object.scrollStopTime > 0)
            //         sv = 0; // start value
            //     this.animateImage(object, ov, ev, sv);
            // }
            // this.initScrollImageEvents(clipPath);
            // //this.canvas.discardActiveObject();
            // this.canvas.setActiveObject(clipPath);
            // this.canvas.renderAll();
          } else {
            this.restoreImage(object);
          }
      },
      moveDown(object){
        let counter = 1;
        let top = object.top;
         clearInterval(intvl);
        const intvl = setInterval(() => {
          
            var activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                var a = activeObject.get('top') + 5;
                activeObject.set('top', a);
                this.canvas.renderAll();
            }
            if(object.height+top < activeObject.get('top')){  
              clearInterval(intvl);
            }

        },100)
      },
      moveUp(object){


            let imagesReady = 0;
            console.log(object.animImgs.length);
            const images = object.animImgs.map((src) => { 
              console.log("src===",src.src);
               imagesReady++;
                let image = new Image();
                image.src = src.src;
                image.onload = () => {
                    
                    fabric.Image.fromURL(src.src, (img) => {
                        img.set({
                          
                           originX: 'center',
                            originY: 'center',
                            left: object.left,
                            top: object.top,
                            width: object.width,
                            height: object.height,
                            scaleX: object.scaleX,
                            scaleY: object.scaleY,
                            absolutePositioned: true,
                            fill: 'Transparent'
                        });
                        console.log("img",img);
                        this.groupArr.push(img);
                        // var group = new fabric.Group(this.groupArr, { left: 50, top: object.height*imagesReady });
                         this.canvas.add(img)    
                        }, {
                            crossOrigin: 'anonymous'
                        });  
                    
                   
                     
                }

               
            });    
          // console.log("imagesReady====",imagesReady);
          // console.log("object.animImgs.length====",object.animImgs.length);
          // if(imagesReady==object.animImgs.length){
          //       console.log(this.groupArr);
          //       var group = new fabric.Group(this.groupArr, { left: 50, top: object.height*imagesReady });
          //       this.canvas.add(group)
          // }
         clearInterval(intvl);
        let counter = 1;
        let top = object.top;
        const intvl = setInterval(() => {
            var activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                var a = activeObject.get('top') - 5;
                activeObject.set('top', a);
                this.canvas.renderAll();
            }
            if(object.height+top < activeObject.get('top')){  
              clearInterval(intvl);
            }

        },100)
      },
      onChangeInterval() {
          console.log('time changes')
      },
      async setSource(e, index) {
        let source = e.target.value;
        if(this.fabricObject)
        await this.fabricObject.initPicture(source ? source : '', index);
        this.onChange('url');
      },
      setAutoSize(state) {
        if (state) {
          if (this.fabricObject.url === '') {
            return;
          }
          if(this.fabricObject.pictureWidth) {
            this.fabricObject.width = this.fabricObject.pictureWidth;
            this.fabricObject.height = this.fabricObject.pictureHeight;
            this.fabricObject.scaleX = 1;
            this.fabricObject.scaleY = 1;
          }
          this.fabricObject.autoSize = !this.fabricObject.autoSize;
          this.onChangeAlign();
        }
      },
      onChange(e) {
        this.$emit('change', e);
      },
      onChangeAlign() {
        this.onChange();
      },
      addFileInput(){
        this.fabricObject.otherUrls.push('');
        this.$nextTick(()=>{
          EventBus.$emit('ExpandContentSection');
        }, 100)
      },
    },
  }

</script>
<template>
  <div class="picture-controls">
    <Section :isExpanded="true">
      <div slot="title">Picture tools</div>
      <div class="inputs-row">
        <div class="input-block">
          <label class="input-block__title">Source</label>
          <div @click="addFileInput"  class="add_file_input">
                <Tooltip :left="true">Add</Tooltip>
                <img src="images/align-top.svg"/>
          </div>
          <div>
            <FileInput v-for="(url, index) in fabricObject.otherUrls" :index="index" :icon="'images/ic-image.svg'" :extensions="['jpg', 'jpeg', 'png', 'gif']" :value="url" @change="(e) => setSource(e, index)"  />
          </div>
        </div>
      </div>
      <div class="input-block input-block--line">
        <div class="input-block--line" v-if='this.fabricObject.otherUrls.length>1'>
        <label class="input-block__title">Interval</label>
        <NumberInput
            v-model="fabricObject.interval"
            :min="0"
            :max="1000"
            @change="() => onChangeInterval()"
            @focusout="() => onChangeInterval()"
        />
        </div>
        <Checkbox title="Auto-size" v-model="fabricObject.autoSize" @change="(e) => setAutoSize(e)" />
        <Checkbox title="Scale" v-model="fabricObject.autScale" @change="(e) => setAutoSize(e)" />
        <a v-if='this.fabricObject.otherUrls.length>1' @click="startStopScrollImage(fabricObject)" class="text-controls__scroll-preview" :class="{'text-controls__scroll-preview--disabled': !fabricObject.transitionDirection}">
            <img v-if="!isScrolling" src="images/ic-manage.svg"/>
            <img v-else src="images/ic-stop.svg"/>
        </a>
      </div>
      <div class="inputs-row" v-if='this.fabricObject.otherUrls.length>1'>
        <div class="input-block">
          <label class="input-block__title">Transition</label>
        </div>
      </div>
      <div class="inputs-row" v-if='this.fabricObject.otherUrls.length>1'>
          <label class="input-block__title">Type</label>          
          <select class="select text-controls__font-family" v-model="fabricObject.transitionType" @change="()  => onChange('transitionType')">
              <option value="none">None</option>
              <option value="transparent">Transparent</option>
              <option value="move">Move</option>
          </select>
          <select class="select text-controls__font-size" v-if='this.fabricObject.transitionType != "none"' v-model="fabricObject.transitionDirection" @change="()  => onChange('transitionDirection')">
              <option value="up">Up ==</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right" selected>Right</option> 
          </select>
      </div>
      <div class="input-block input-block--line" v-if='this.fabricObject.otherUrls.length>1'>
          <label class="input-block__title">Time ====</label>
          <input class="input-block__el" v-model="fabricObject.scrollStopTime"  @change="() => onChangeInterval()"/>
      </div>
      <div class="inputs-row" v-if='this.fabricObject.otherUrls.length>1'>
          <label class="input-block__title">Ease</label>          
          <select class="select text-controls__font-family" v-model="fabricObject.transitionEase" @change="()  => onChange('transitionEase')">
              <option selected value="none">None</option>
              <option value="linear">Linear</option>
              <option value="smooth">Smooth</option>
          </select>
          <select class="select text-controls__font-size" v-model="fabricObject.easeDirection" @change="()  => onChange('easeDirection')">
              <option value="in">In</option>
              <option value="out">Out</option>
              <option value="inout">In-Out</option>
          </select>
      </div>
    </Section>
    <Section>
      <div slot="title">Size & position</div>
      <SizeControls @change="onChange" />
    </Section>
    <Section>
      <div slot="title">Align</div>
      <AlignControls @change="onChangeAlign" />
    </Section>
  </div>
</template>
<style lang="scss">
  .input-block__title {
    width: 55px!important;
  }
  .picture-controls {
    margin-bottom: 20px;
  }
  .add_file_input{
    float:right;
    margin-top: 5px;
  }
  .text-controls {
      &__font-family {
          flex: 1;
          margin: 8px;
      }
  }
</style>
