<script>
import {mapGetters, mapState, mapMutations} from 'vuex';
import Section from "@/components/layout/Section";
import NumberInput from "../custom/NumberInput";
import Colorpicker from "../custom/Colorpicker";
import Radio from "../custom/Radio";
import AlignControls from "../common/AlignControls";
import SizeControls from "../common/SizeControls";
import Tooltip from "@/components/layout/Tooltip";
import Modal from "../../layout/Modal";
import getObjectFromToolName from "@/helpers/getObjectFromToolName";
import Checkbox from '@/components/controls/custom/Checkbox';
import ClockHandInput from "../custom/ClockHandInput";

export default {
  computed: {
    ...mapGetters('scenes', ['params','currentObject']),
    ...mapState('scenes', ['fabricObject', 'currentSceneIndex']),
    ...mapState('canvas', ['canvas']),
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
  components: {Tooltip, SizeControls, AlignControls, Colorpicker, NumberInput, Section, Modal, Radio, Checkbox, ClockHandInput},
  data() {
    return {
      extensions:"['jpg', 'jpeg', 'png', 'gif']",
      clockType: 'clock',
      handType: '1',
      minutesModal: {
        visible: false,
        selected: null,
      },
      hourModal: {
        visible: false,
        selected: null,
      },
      minutesImageSrc: null,
      hourImageSrc: null,
      sceneData:null
    }
  },
  mounted() {
    if(this.fabricObject && this.fabricObject.clockFaceNeed === 'undefined')
      this.fabricObject.clockFaceNeed = true;
    this.sceneData = this.currentScene;
  },
  methods: {
    ...mapMutations('scenes', ['addObjectToScene', 'removeObjectFromScene','currentScene']),
    async setHandType(e, minSrc=null, hourSrc=null) {
      if(minSrc || hourSrc){
        this.fabricObject.changeHandType(null, minSrc, hourSrc);
      }
      else this.fabricObject.changeHandType(this.handType);

    },
    async setTimeType(e) {
      var object = this.fabricObject;
      if (object && object.objectType === 'analogdatetime' && e === 'digital') {
        this.removeObjectFromScene(object);
        let positionParams = {
          left: object.left,
          top: object.top,
          width: object.width,
          height: object.height,
        };
        this.canvas.remove(object);
        let data = await getObjectFromToolName('datetime', false, {}, positionParams, this.canvas, false, this.currentSceneIndex);
        if (data && data.object) {
          data.object.selectable = true;

          //copy props inclue the below props.
          var nProps = ['left', 'top', 'originX', 'originY'];
          Object.keys(object).forEach(function(key) {
            if(nProps.includes(key)) {
              console.log(key, object[key]);
              data.object[key] = object[key];
            }
          });

          this.canvas.add(data.object);

          this.canvas.setActiveObject(data.object);
          this.canvas.renderAll();

          this.addObjectToScene(data);
        }
      }
    },
    onChange(e) {
      this.$emit('change', e);
      this.canvas.renderAll();
    },
    onChangeAlign() {
      this.onChange();
    },
    selectHourImage(src){
      this.hourImageSrc = src;

    },
    selectMinutesImage(src){
      this.minutesImageSrc = src;
    },
    selectFile(){
      this.setHandType(null, this.minutesImageSrc, this.hourImageSrc);
      this.hourModal.visible = false;
      this.minutesModal.visible = false;
    },
    minHandChange(e){e
      this.minutesImageSrc = e;
      this.setHandType(null, this.minutesImageSrc, this.hourImageSrc);
    },
    hourHandChange(e){
      this.hourImageSrc = e;
      this.setHandType(null, this.minutesImageSrc, this.hourImageSrc);
    },
  },
}

</script>

<template>
  <div class="text-controls" v-if="currentObject && fabricObject">
    <Section>
      <div slot="title">Size & position</div>
      <SizeControls @change="onChange" />
    </Section>
    <Section>
      <div slot="title">Align</div>
      <AlignControls @change="onChangeAlign" />
    </Section>
    <Section>
      <div slot="title">Type</div>
      <div class="inputs-row">
        <Radio title="Digital" name='timetype' value='digital' v-model="clockType" @change="(e) => setTimeType(e)" />
        <Radio title="Clock" name='timetype' value='clock' v-model="clockType" @change="(e) => setTimeType(e)" />

      </div>
      <Checkbox
          title="Show Default Clock"
          v-model="fabricObject.clockFaceNeed"
      />
      <ClockHandInput
          :icon="'images/ic-image.svg'"
          :canDelete="true"
          :extensions="['jpg', 'jpeg', 'png', 'gif']"
          @minHandChange="minHandChange"
          @hourHandChange="hourHandChange"
      />
    </Section>
  </div>
</template>
<style scoped>
.selectedImg{
  background: rgb(76 95 138 / 10%);
}
</style>
<style lang="scss">
.text-controls {
  &__font-family {
    flex: 1;
    margin-right: 8px;
  }
  &__scroll-direction {
    width: 20px;
    height: 20px;
    display: inline-block;
    text-align: center;
    margin: 0 4px 0 6px;
    cursor: pointer;

    &--active {
      background: #33405B;
    }
  }
  &__scroll-preview {
    display: inline-block;
    margin: 5px 0;
    cursor: pointer;
    &--disabled {
      cursor: default;
      opacity: .5;
    }
  }

}
</style>