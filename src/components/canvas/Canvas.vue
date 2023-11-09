<script>
import { fabric } from "@/fabric";
import {mapGetters, mapState, mapMutations} from 'vuex';
import getObjectFromToolName from "@/helpers/getObjectFromToolName";

fabric.Object.prototype.set({
  objectCaching: false,
  transparentCorners: false,
  // borderColor: '#fff',
  cornerSize: 10,
  //cornerColor: '#fff',
  borderDashArray: [3, 2],
});

//For objects outline 
fabric.Object.prototype.render = (function (render) {
    
  return function(ctx) {
      render.apply(this, arguments);
      if(this.canvas && typeof this.canvas.getActiveObject === 'function') {
        var aObj = this.canvas.getActiveObject();
        if(aObj && aObj.type === 'activeSelection') {        
          var objs = aObj.getObjects().filter(obj => {
              return obj.name === this.name  && obj.id === this.id;
          });
          if(objs.length > 0) //if object is from the group selection
            return false;
        }
      }
      if(this.custtype != 'bgrect' && this.custtype != 'selectrect' && this.custtype != 'animobj' && this.evented && this.visible) {
        this.setCoords();
        ctx.strokeStyle = '#333';
        ctx.setLineDash([10, 10]);
        let coords = this.aCoords;
        ctx.beginPath();
        ctx.moveTo(coords.tl.x, coords.tl.y);
        ctx.lineTo(coords.tr.x, coords.tr.y);
        ctx.lineTo(coords.br.x, coords.br.y);
        ctx.lineTo(coords.bl.x, coords.bl.y);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }
}
})(fabric.Object.prototype.render)

const controls = fabric.Object.prototype.controls;
const rotateControls = controls.mtr;
rotateControls.visible = false;
//  fabric.Object.prototype.originX = "center";
//  fabric.Object.prototype.originY = "center";

export default {
  watch: {
    zoomValue(newZoomValue) {
      this.onChangeZoom(null, newZoomValue);
    },
    showTimeline() {
      this.onResize();
    },
    currentScene(newScene) {
      if(this.canvas.backgroundRect && newScene)
        this.canvas.backgroundRect.opacity = newScene.opacity;
    }
  },
  computed: {
    ...mapGetters('scenes', ['currentScene', 'params']),
    ...mapState('tools', ['showTimeline', 'currentTool', 'currentToolVariant']),
    ...mapState('canvas', ['zoomValue','grid']),
    ...mapState('scenes', ['file', 'currentSceneIndex']),
  },
  methods: {
    ...mapMutations('scenes', ['addObjectToScene', 'updateScenePreview']),
    ...mapMutations('canvas', ['setZoomValue', 'setCanvas']),
    onChangeZoom(e = null, zoomValue = null) {
      const canvas = this.canvas;
      const zoom = zoomValue || this.zoom;

      e && e.preventDefault();
      e && e.stopPropagation();

      if(zoom != this.canvas.getZoom()) {        

        if(this.canvasHeight < this.wrapperHeight && this.canvasWidth < this.wrapperWidth) {
          canvas.setViewportTransform([1,0,0,1,0,0]);
        }
        //zoom to mouse point or zoom to center
        if (e && this.canvasHeight > this.wrapperHeight && this.canvasWidth > this.wrapperWidth) {
          canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
        } else {
          canvas.zoomToPoint({
              x: canvas.backgroundRect.left,
              y: canvas.backgroundRect.top
          }, zoom);
        }

        //this.wrapperWidth = canvas.wrapperEl.clientWidth;
        //this.wrapperHeight = canvas.wrapperEl.clientHeight - (this.showTimeline ? 276 : 66);
        this.wrapperWidth = canvas.width;
        this.wrapperHeight = canvas.height;
        this.canvasWidth = canvas.backgroundRect.width * zoom;
        this.canvasHeight = canvas.backgroundRect.height * zoom;

        //this.xOffset = (canvas.viewportTransform[4] / canvas.viewportTransform[0] * -1) - 10;
        let ltrack = this.$refs.left_track;
        this.xOffset = this.canvas.width/2 - ltrack.offsetWidth/2;
        let ttrack = this.$refs.top_track;
        //this.yOffset = (canvas.viewportTransform[5] / canvas.viewportTransform[0] * -1) - 10;
        this.yOffset = this.canvas.height/2 - ttrack.offsetHeight/2;
      }
    },
    onBeforeUnload(event) {
      event.returnValue = "message";
    },
    onResize() {
      const wrapper =  this.$refs.wrapper;
      const width = window.innerWidth - 300;
      const height = window.innerHeight - (this.showTimeline ? 276 : 66);
      this.canvas.setDimensions({width: width, height: height});
      this.canvas.calcOffset();     
      
      this.wrapperWidth = this.canvas.width;
      this.wrapperHeight = this.canvas.height;
      this.canvasWidth = this.canvas.width * this.canvas.getZoom();
      this.canvasHeight = this.canvas.height * this.canvas.getZoom();

      //Alt + T / resize should center align all the objects.
      this.canvas.discardActiveObject();
      var objs = this.canvas.getObjects();
      if(objs.length >= 1) {
        var sel = new fabric.ActiveSelection(objs, {
          canvas: this.canvas,
          custtype: 'selectcenter'
        });
        this.canvas.setActiveObject(sel);
        sel.center();
        this.canvas.requestRenderAll();
        this.canvas.discardActiveObject();
        if(this.canvas.backgroundRect) {          
          var z = this.canvas.getZoom();
          this.canvas.setViewportTransform([1,0,0,1,0,0]);
          this.canvas.zoomToPoint({
              x: this.canvas.backgroundRect.left,
              y: this.canvas.backgroundRect.top
          }, z * this.zoomPad);
        }
      }
    },
    updatePosForGrid(target) {
        var w = (target.width*target.scaleX)/2;
        var h = (target.height*target.scaleY)/2;
        var left = target.left - w - this.canvas.backgroundRect.aCoords.tl.x;
        var top = target.top - h - this.canvas.backgroundRect.aCoords.tl.y;
        target.set({
          left: Math.round(left / this.grid.width) * this.grid.width + w + this.canvas.backgroundRect.aCoords.tl.x,
          top: Math.round(top / this.grid.height) * this.grid.height + h + this.canvas.backgroundRect.aCoords.tl.y
        });
    },
    updateCanvasDimensions() {      
      var zwFactor = 1;
      var zhFactor = 1;
      var zFactor = 1;
      if(this.params.width > this.canvas.width) {
        zwFactor = this.canvas.width / this.params.width;
      }
      if(this.params.height > this.canvas.height) {
        zhFactor = this.canvas.height / this.params.height;
      }

      zFactor = zwFactor > zhFactor? zhFactor: zwFactor;
      
      //reset canvas zoom and pan.
      this.canvas.setViewportTransform([1,0,0,1,0,0]);
      this.canvas.zoomToPoint({ x: this.canvas.backgroundRect.left, y: this.canvas.backgroundRect.top }, zFactor * this.zoomPad);
      //this.canvas.setZoom(zFactor);

      //console.log(this.params.width, this.params.height, this.canvas.width, this.canvas.height, zwFactor, zhFactor, zFactor, this.canvas.getZoom());
      
      this.wrapperWidth = this.canvas.width;
      this.wrapperHeight = this.canvas.height;
      this.canvasWidth = this.canvas.backgroundRect.width * this.canvas.getZoom();
      this.canvasHeight = this.canvas.backgroundRect.height * this.canvas.getZoom();
    },
    moveCanvas(e, type) {
      const target = e.target;
      const initialValue = type === 'top' ? target.offsetTop : target.offsetLeft;
      const initialPosition = type === 'top' ? e.clientY : e.clientX;
      const doDrag = (e) => {
        let value = type === 'top' ? e.clientY : e.clientX;
        let newValue = initialValue - initialPosition + value;        
        if (type === 'top') {          
          var minH = -5;
          var maxH = this.canvas.height + 5;
          var newY = (((target.offsetTop/this.canvas.height) * this.params.height) + this.canvas.backgroundRect.aCoords.tr.y) * this.zoom;
          if(target.offsetTop > minH && target.offsetTop+target.offsetHeight < maxH) {
            target.style.top = newValue + 'px';
            this.canvas.absolutePan({x: this.canvas.vptCoords.tl.x * this.zoom, y: newY});
          } else if(target.offsetTop <= minH) {
            target.style.top = minH+1 + 'px';
          } else if(target.offsetTop+target.offsetHeight >= maxH) {
            target.style.top = maxH-target.offsetHeight-1 + 'px';
          }
        } else {
          var newX = (((target.offsetLeft/this.canvas.width) * this.params.width) + this.canvas.backgroundRect.aCoords.tl.x) * this.zoom;
          var minW = -5;
          var maxW = this.canvas.width + 5;          
          if(target.offsetLeft > minW && target.offsetLeft+target.offsetWidth < maxW) {
            target.style.left = newValue + 'px';
            this.canvas.absolutePan({x: newX, y: this.canvas.vptCoords.tl.y * this.zoom });
          } else if(target.offsetLeft <= minW) {
            target.style.left = minW+1 + 'px';
          } else if(target.offsetLeft+target.offsetWidth >= maxW) {
            target.style.left = maxW-target.offsetWidth-1 + 'px';
          }
        }
      }
      const stopDrag = (e) => {
        document.documentElement.removeEventListener('mousemove', doDrag, false);
        document.documentElement.removeEventListener('mouseup', stopDrag, false);
      }
      document.documentElement.addEventListener('mousemove', doDrag, false);
      document.documentElement.addEventListener('mouseup', stopDrag, false);
    },
  },
  data() {
    return {
      mouseX: 0,
      mouseY: 0,
      canvas: null,
      wrapperWidth: 1,
      wrapperHeight: 1,
      canvasWidth: 1,
      canvasHeight: 1,
      xOffset: 0,
      yOffset: 0,
      zoom: 1,
      zoomPad: 0.95, //on page load adjust zoom a bit that canvas  should show black space on top and bottom.
      objectHovered: false,
      creationLocked: false,
      objectSelectTime: 0,
    }
  },
  mounted() {
    window._onUpdateCanvasDimensions = this.updateCanvasDimensions;
    window._onCanvasResize = this.onResize;
    window._onCanvasChangeZoom = this.onChangeZoom;
    let canvas = new fabric.Canvas(this.$refs.canvasEl, {
      preserveObjectStacking: true,
      selection: false
    });
    canvas.getMouseCoords = () => {
      return {x: this.mouseX, y: this.mouseY};
    }

    this.canvas = canvas;
    let params = this.params;
    canvas.init = () => {
      this.onResize();
      // canvas.setWidth(this.$refs.wrapper.clientWidth);
      // canvas.setHeight(this.$refs.wrapper.clientHeight);
      //canvas.setWidth(params.width);
      //canvas.setHeight(params.height);
      //canvas.setDimensions({width: params.width, height: params.height});
      let backgroundRect = new fabric.Rect({
        originX: 'center',
        originY: 'center',
        left: canvas.width/2,
        top: canvas.height/2, 
        fill: params.backgroundColor,
        width: params.width,
        height: params.height,
        selectable: false,
        evented: false,
        custtype: 'bgrect',
      });
      canvas.backgroundRect = backgroundRect;
      canvas.add(backgroundRect);
      //backgroundRect.center();
      //canvas.centerObject(backgroundRect);
      canvas.sendToBack(backgroundRect);
      backgroundRect.setCoords();
      canvas.calcOffset();
      canvas.renderAll();
      
      this.updateCanvasDimensions();
    }
    canvas.init();

    canvas.on('mouse:wheel', (opt) =>  {
      if (!opt.e.ctrlKey && !opt.e.shiftKey) {
        if (this.canvasHeight > this.wrapperHeight) {
          let track = this.$refs.top_track;
          let newValue = track.offsetTop + 10 * (opt.e.deltaY > 0 ? 1 : -1);
          var newY = (((track.offsetTop/this.canvas.height) * this.params.height) + this.canvas.backgroundRect.aCoords.tr.y) * this.zoom;
          var minH = -5;
          var maxH = this.canvas.height + 5;
          
          if(track.offsetTop > minH && track.offsetTop+track.offsetHeight < maxH) {
            track.style.top = newValue + 'px';
            this.canvas.absolutePan({x: this.canvas.vptCoords.tl.x * this.zoom, y: newY });
          } else if(track.offsetTop <= minH) {
            track.style.top = minH+1 + 'px';
          } else if(track.offsetTop+track.offsetHeight >= maxH) {
            track.style.top = maxH-track.offsetHeight-1 + 'px';
          }
        }
        return;
      }
      if (opt.e.shiftKey) {
        if (this.canvasWidth > this.wrapperWidth) {
          let track = this.$refs.left_track;
          let newValue = track.offsetLeft + 20 * (opt.e.deltaY > 0 ? 1 : -1);
          var newX = (((track.offsetLeft/this.canvas.width) * this.params.width) + this.canvas.backgroundRect.aCoords.tl.x) * this.zoom;
          var minW = -5;
          var maxW = this.canvas.width + 5;
          
          if(track.offsetLeft > minW && track.offsetLeft+track.offsetWidth < maxW) {
            track.style.left = newValue + 'px';
            this.canvas.absolutePan({x: newX, y: this.canvas.vptCoords.tl.y * this.zoom });
          } else if(track.offsetLeft <= minW) {
            track.style.left = minW+1 + 'px';
          } else if(track.offsetLeft+track.offsetWidth >= maxW) {
            track.style.left = maxW-track.offsetWidth-1 + 'px';
          }
        }
        return;
      }
      let delta = opt.e.deltaY < 0 ? -100 : 100;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.1) zoom = 0.1;
      this.zoom = zoom;
      this.onChangeZoom(opt.e);
    });

    let selectRect = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    }

    let selectionVisibleRect = null;
    canvas.on('mouse:down', (opt) => {
      if (opt.e.shiftKey) {
        return;
      }
      selectRect = {
        x1: opt.absolutePointer.x,
        y1: opt.absolutePointer.y,
        x2: 0,
        y2: 0
      }

      let object = canvas.getActiveObject();


      // if (object) {
      //   this.lastActiveObject = object;
      //   object.lockMovementX = true;
      //   object.lockMovementY = true;
      // }

      canvas.forEachObject((canvasObject) =>{
        canvasObject.lockMovementX = true;
        canvasObject.lockMovementY = true;
      });

      //if (object && object.left < opt.absolutePointer.x < object.left + object.width && object.top < opt.absolutePointer.y < object.top + object.height) {
        if (object && this.objectSelectTime - new Date().getTime() < -10 || this.objectSelectTime - new Date().getTime() > 0) {
          this.creationLocked = true;
          object.lockMovementX = false;
          object.lockMovementY = false;
          return;
        }
      //}
      
      selectionVisibleRect = new fabric.Rect({
        left: opt.absolutePointer.x,
        top: opt.absolutePointer.y,
        stroke: '#6F91D9',
        fill: 'rgba(255, 255, 255, .1)',
        width: 1,
        height: 1,
        selectable: false,
        evented: false,
        custtype: 'selectrect'
      })
      canvas.add(selectionVisibleRect);
    });
    canvas.on("selection:updated", (opt) => {
      this.objectSelectTime = new Date().getTime();
      if(opt.target.objectType === 'text') {
        const {minHeight, height} = opt.target;
        if(minHeight != height){
          opt.target.minHeight = height;
          opt.target.setCoords();
        }
      }

    });

    canvas.on('mouse:move', async (opt) => {
      if (selectionVisibleRect) {
        selectionVisibleRect.width = opt.absolutePointer.x - selectionVisibleRect.left;
        selectionVisibleRect.height = opt.absolutePointer.y - selectionVisibleRect.top;

        if(this.grid.enabled) {
          selectionVisibleRect.width = Math.round(selectionVisibleRect.width / this.grid.width) * this.grid.width;
          selectionVisibleRect.height = Math.round(selectionVisibleRect.height / this.grid.height) * this.grid.height;
        }
        
        canvas.renderAll();
      }
      // if(opt.target && opt.target.updateWidthHeight) {
      //   opt.target.updateWidthHeight();
      // }
      var pointer = canvas.getPointer(opt.e);
      this.mouseX = pointer.x;
      this.mouseY = pointer.y;
    })
    canvas.on('mouse:up', async (opt) => {
      canvas.forEachObject(function(object){
        object.lockMovementX = true;
        object.lockMovementY = true;
      });

      //Do nothing when the target is in editing mode
      let editingOn = false
      canvas.forEachObject(function(obj) {
          if(opt.target && opt.target.intersectsWithObject(obj)){
              if(!editingOn && obj.isEditing){
                  editingOn = obj.isEditing
                  obj.setCursorByClick(opt)
              }
          }
        });
        if(editingOn)
        {
          return false
        }


      canvas.remove(selectionVisibleRect);
      selectionVisibleRect = null;
      selectRect.x2 = opt.absolutePointer.x;
      selectRect.y2 = opt.absolutePointer.y;
      if (Math.abs(selectRect.x1 - selectRect.x2) > 10 && Math.abs(selectRect.y1 - selectRect.y2) > 10 && !opt.e.shiftKey) {
        if (!this.creationLocked) {
          let positionParams = {
            left: selectRect.x1 < selectRect.x2 ? selectRect.x1 : selectRect.x2,
            top: selectRect.y1 < selectRect.y2 ? selectRect.y1 : selectRect.y2,
            width: Math.abs(selectRect.x2 - selectRect.x1),
            height: Math.abs(selectRect.y2 - selectRect.y1)
          };
          if (this.grid.enabled) {
            positionParams = {
              left: Math.round(positionParams.left / this.grid.width) * this.grid.width,
              top: Math.round(positionParams.top / this.grid.height) * this.grid.height,
              width: Math.round(positionParams.width / this.grid.width) * this.grid.width,
              height: Math.round(positionParams.height / this.grid.height) * this.grid.height,
            }
          }
          alert('asa');
          if (this.currentTool) {
            alert(this.currentTool);
            let data = await getObjectFromToolName(this.currentTool, this.currentToolVariant, {}, positionParams, canvas, false, this.currentSceneIndex);
            if (data && data.object) {
              data.object.selectable = true;
              canvas.add(data.object);
              if(data.object && data.object.updateWidthHeight) {
                data.object.updateWidthHeight();
              }
              canvas.setActiveObject(data.object);
              canvas.renderAll();
              this.addObjectToScene(data);
            }
          }
        }
      } else {
        if (opt.e.shiftKey) {
          this.canvas.getObjects().forEach(object => {
            if (object.evented) {
              object.selectable = !object.locked && !object._ungrouped;
            }
          });
        } else {
          // canvas.getObjects().forEach(object => {
          //   if (object.evented) {
          //     const left = object.left - object.width / 2;
          //     const top = object.top - object.height / 2;
          //     if (opt.absolutePointer.x > left && opt.absolutePointer.x < left + object.width
          //         && opt.absolutePointer.y > top && opt.absolutePointer.y < top + object.height) {
          //       if (!canvas.getActiveObject() || canvas.getActiveObject().id !== object.id) {
          //         if (!object.locked && !object._ungrouped) {
          //           object.selectable = true;
          //           canvas.setActiveObject(object);
          //         }
          //       }
          //     }
          //   }
          // })
        }
      }
      this.creationLocked = false;
    });
    canvas.on('text:changed', (e) => {
      e.target.updateWidthHeight();
    });
    canvas.on('object:modified', (e) => {
      if(e.target.objectType === 'text') {
        // e.target.minWidth = e.target.width;
        // e.target.minHeight = e.target.height;
        // e.target.updateWidthHeight();
      }
      if(e.target.objectType === 'text') {
        const {minHeight, height} = e.target;
        if(minHeight != height){
          e.target.height = minHeight;
          e.target.setCoords();
        }
      }

      this.updateScenePreview(canvas);
    });
    canvas.on('object:removed', (options) => {
      this.updateScenePreview(canvas);
      if(options.target.objectType === 'datetime') {
        options.target.removeDateTime();
      }
    });
    canvas.on('object:added', (options) => {
      if (this.grid.enabled && options.target.custtype != 'grid') {
        this.updatePosForGrid(options.target);
      }
      this.updateScenePreview(canvas);
    });
    canvas.on('object:moving', (options) => {
      if(options.target.objectType === 'text' && options.target.isEditing) {
        options.target.exitEditing();
      }
      if (this.grid.enabled) {
        this.updatePosForGrid(options.target);
      }
    });
    canvas.on('object:scaling', (options) => {
      if (options.target.objectType === 'text') {
        //avoid text stretch
        options.target.width = options.target.width * options.target.scaleX;
        options.target.height = options.target.height * options.target.scaleY;
        options.target.scaleX = 1;
        options.target.scaleY = 1;
        options.target.setCoords();
        options.target.minWidth = options.target.width;
        options.target.minHeight = options.target.height;
        options.target.updateWidthHeight();
      }
      if (options.target.proportionLocked) {
        let proportion = options.target._proportion;
        let action = options.transform.action;
        if (action === 'scaleX') {
          options.target.height = options.target.width / proportion;
        }
        if (action === 'scaleY') {
          options.target.width = options.target.height * proportion;
        }
      }
      if (this.grid.enabled) {
        //snap to grid on resize/scaling.
        //https://groups.google.com/g/fabricjs/c/XzlM3JkOU3M
        options.target.setCoords();
        
        var target = options.target,
            gridSize = this.grid.width,
            actualWidth = target.scaleX * target.width,
            actualHeight = target.scaleY * target.height,
            minSize = this.grid.width;

            target.set({
                scaleX: (actualWidth / gridSize>>0) / (target.width / gridSize>>0)
            });
            target.set({
                scaleY: (actualHeight / gridSize>>0) / (target.height / gridSize>>0)
            });
        
        //check min sizing
        if (actualWidth < minSize) {
            target.set({
                scaleX: minSize / target.width
            });
        }
        if (actualHeight < minSize) {
            target.set({
                scaleY: minSize / target.height
            });
        }
        canvas.renderAll();
      }
    });
    canvas.on('object:scaled', (options) => {
      if(options.target.objectType === 'text') {
        const {minHeight, height} = options.target;
        if(minHeight != height){
          options.target.minHeight = height;
        }
      }

      if (this.grid.enabled) {        
        this.updatePosForGrid(options.target);
      }
    });
    this.onResize();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('beforeunload', this.onBeforeUnload);

    canvas.on('mouse:down', (e) => {
      //Added timeout as it is getting executed before getActiveObject()
      setTimeout(() => {
        const object = canvas.getActiveObject();
        if(e.target == object) {
          this.objectHovered = !!e.target;
        }
      },250);

    });

    canvas.on('mouse:over', (e) => {
      const object = canvas.getActiveObject();
      //setting objectHovered to true only if hovered on active object
      if(e.target == object) {
        this.objectHovered = !!e.target;
      }
    });

    //double click will make object editable so move cursor is not needed
    canvas.on('mouse:dblclick', (e) => {
      this.objectHovered = false;
    });

    canvas.on('mouse:out', (e) => {
      this.objectHovered = false;
    });

    // const zoom = this.zoom;
    // let panX = ((canvas.getWidth() / zoom / 2) - (this.canvas.backgroundRect.aCoords.tl.x) - (this.params.width / 2)) * zoom
    // let panY = ((canvas.getHeight() / zoom / 2) - (this.canvas.backgroundRect.aCoords.tl.y) - (this.params.height / 2)) * zoom

    //canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY])

    let selection = canvas.selection;
    document.addEventListener('keydown', e => {
      if (e.shiftKey) {
        selection = canvas.selection;
        canvas.selection = true;
        this.canvas.getObjects().forEach(object => {
          if (object.evented) {
            object.selectable = !object.locked && !object._ungrouped;
          }
        });
      }
    })
    document.addEventListener('keyup', e => {
      if (e.shiftKey) {
        canvas.selection = selection;
        if (!selection) {
          this.canvas.getObjects().forEach(object => {
            if (object.evented) {
              object.selectable = false;
            }
          });
        }
      }
    })
        this.setCanvas(canvas);

  }
}
</script>
<template>
  <div class="canvas-wrapper" :class="'selected-tool--' + (objectHovered ? 'move' : currentTool)" ref="wrapper" >
    <canvas ref="canvasEl"></canvas>
    <div v-show="canvasWidth > wrapperWidth" class="canvas-wrapper__scrollbar canvas-wrapper__scrollbar--horizontal">
      <div ref="left_track" @mousedown="(e) => moveCanvas(e, 'left')" class="canvas-wrapper__scrollbar__track" :style="{width: wrapperWidth / canvasWidth * 100 + '%', left: xOffset + 'px'}"></div>
    </div>
    <div v-show="canvasHeight > wrapperHeight" class="canvas-wrapper__scrollbar canvas-wrapper__scrollbar--vertical">
      <div ref="top_track" @mousedown="(e) => moveCanvas(e, 'top')" class="canvas-wrapper__scrollbar__track" :style="{height: wrapperHeight / canvasHeight * 100 + '%', top: yOffset + 'px'}"></div>
    </div>
  </div>
</template>
<style lang="scss">
.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  &__scrollbar {
    position: absolute;
    z-index: 10000;
    &--vertical {
      top: 1px;
      right: 1px;
      height: 100%;
    }
    &--horizontal {
      bottom: 1px;
      left: 1px;
      width: 100%;
    }

    &__track {
      position: relative;
      background: #33405B;
      border-radius: 24px;
    }
    &--vertical &__track {
      width: 6px;
    }
    &--vertical &__track:hover {
      width: 10px;
      cursor: pointer;
    }
    &--horizontal &__track {
      height: 6px;
    }
    &--horizontal &__track:hover {
      height: 10px;
      cursor: pointer;
    }
  }
}
.selected-tool {
  &--text canvas {
    cursor: url('/images/ic-cursor-text.svg'), auto!important;
  }
  &--picture canvas {
    cursor: url('/images/ic-cursor-image.svg'), auto!important;
  }
  &--shape canvas {
    cursor: url('/images/ic-cursor-shape.svg'), auto!important;
  }
  &--list canvas {
    cursor: url('/images/ic-cursor-list.svg'), auto!important;
  }
  &--video canvas {
    cursor: url('/images/ic-cursor-video.svg'), auto!important;
  }
  &--datetime canvas {
    cursor: url('/images/ic-cursor-clock.svg'), auto!important;
  }  
  &--analogdatetime canvas {
    cursor: url('/images/ic-cursor-clock.svg'), auto!important;
  }  
}

</style>
