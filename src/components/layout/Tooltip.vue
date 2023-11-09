<script>
    export default {
      props: {
        offset: Object
      },
      beforeDestroy() {
        document.body.removeChild(this.$refs.tooltip);
      },
      name: 'Tooltip',
      data() {
        return {
          visible: false,
          x: 0,
          y: 0
        }
      },
      mounted() {
        let parent = this.$refs.tooltip.parentElement;
        parent.addEventListener('mouseenter', () => {
          let rect = parent.getBoundingClientRect();
          //this.x = this.left ? rect.left + 16 : rect.left - 16;
          this.x = rect.left + 16 + (this.offset && this.offset.x ? this.offset.x : 0);
          this.y = rect.top + 16  + (this.offset && this.offset.y ? this.offset.y : 0);
          this.visible = true;
        })
        parent.addEventListener('mouseleave', () => {
          this.visible = false;
        })
        document.body.appendChild(this.$refs.tooltip);
      },
    }
</script>
<template>
<div class="tooltip" :class="{'tooltip--visible': visible}" :style="{top: y + 'px', left: x + 'px'}" ref="tooltip">
  <slot></slot>
</div>
</template>
<style lang="scss">

.tooltip {
  pointer-events: none;
  position: absolute;
  font-size: 12px;
  white-space: nowrap;
  background: #F8FAFF 0% 0% no-repeat padding-box;
  box-shadow: 0px 1px 22px rgba(0, 0, 0, .8);
  color: #121426;
  padding: 6px 8px;
  border-radius: 2px;
  z-index: 1000000;
  display: none;
  &--visible {
    display: block;
  }
}

*:hover > .tooltip {
  opacity: 1;
}
</style>
