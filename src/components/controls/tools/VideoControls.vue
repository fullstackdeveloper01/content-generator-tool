<script>
  import {mapGetters, mapState, mapMutations} from 'vuex';
  import Section from "@/components/layout/Section";
  import Checkbox from "../custom/Checkbox";
  import NumberInput from "../custom/NumberInput";
  import Colorpicker from "../custom/Colorpicker";
  import AlignControls from "../common/AlignControls";
  import SizeControls from "../common/SizeControls";
  import {fabric} from "@/fabric";
  import FileInput from "@/components/controls/custom/FileInput";

  export default {
    computed: {
      ...mapState('canvas', ['canvas']),
      ...mapGetters('scenes', ['params','currentObject']),
      ...mapState('scenes', ['fabricObject']),
    },
    data() {
      return {
        isPlaying: false,
        request: null,
      }
    },
    components: {FileInput, SizeControls, AlignControls, Colorpicker, NumberInput, Checkbox, Section},
    mounted() {
      this.isPlaying = !this.fabricObject.getElement().paused;
    },
    methods: {
      render() {
        this.canvas.renderAll();
        if (this.fabricObject.getElement() && this.fabricObject.getElement().paused) {
          cancelAnimationFrame(this.request);
        } else {
          this.request = fabric.util.requestAnimFrame(this.render);
        }
      },
      startStopVideo() {
          if (this.fabricObject.getElement().paused) {
            this.isPlaying = true;
            if(this.fabricObject.getElement()) {
              this.fabricObject.getElement().play();
              fabric.util.requestAnimFrame(this.render);
            }
          } else {
            this.isPlaying = false;
            this.fabricObject.getElement().pause();
          }
      },
      async setSource(e) {
          let source = e.target.value;
          var object = this.fabricObject;
          if(!object) return false;
          object.url = source;
          await object.initVideo(source);
          if(object.autoSize)
            this.setAutoSize();
          this.onChange('url');
      },
      setAutoSize(e=null) {
        if(this.fabricObject.videoWidth) {
          this.fabricObject.width = this.fabricObject.videoWidth;
          this.fabricObject.height = this.fabricObject.videoHeight;
          this.fabricObject.scaleX = 1;
          this.fabricObject.scaleY = 1;
        }
        if(e)
        this.fabricObject.autoSize = !this.fabricObject.autoSize;
        this.onChangeAlign();
      },
      onChange(e) {
        this.$emit('change', e);
      },
      onChangeAlign() {
        this.setAlign(this.fabricObject.textAlign);
        this.setVerticalAlign(this.fabricObject.originY);
        this.onChange();
      },
      setAlign(align) {
        this.fabricObject.textAlign = align;
        this.onChange('textAlign');
      },
      setVerticalAlign(align) {
        this.onChange('originY');
        this.onChange('top');
      },

    }
  }

</script>
<template>
  <div class="video-controls">

    <Section :isExpanded="true">
      <div slot="title">Video tools</div>
      <div class="inputs-row">
        <div class="input-block">
          <label class="input-block__title">Source</label>
          <FileInput  :icon="'images/ic-video.svg'"  :extensions="['mp4', 'webm']" v-model="fabricObject.url" @change="(e) => setSource(e)"  />
        </div>
      </div>
      <Checkbox title="Auto-size" v-model="fabricObject.autoSize" @change="(e) => setAutoSize(e)" />
      <a @click="startStopVideo()" class="video-controls__preview">
        <img v-if="!isPlaying" src="images/ic-manage.svg"/>
        <img v-else src="images/ic-stop.svg"/>
      </a>
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
  .video-controls {
    &__preview {
      display: inline-block;
      margin: 5px 0;
      cursor: pointer;
    }
  }
</style>
