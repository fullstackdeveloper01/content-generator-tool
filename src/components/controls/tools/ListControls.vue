<script>
  import {mapGetters, mapState, mapMutations} from 'vuex';
  import Section from "@/components/layout/Section";
   import AlignControls from "../common/AlignControls";
  import SizeControls from "../common/SizeControls";

  export default {
    computed: {
      ...mapGetters('scenes', ['params','currentObject']),
      ...mapState('scenes', ['fabricObject']),
    },
    components: {SizeControls, AlignControls, Section},
    methods: {
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
  <div class="list-controls">
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
  .list-controls {

  }
</style>
