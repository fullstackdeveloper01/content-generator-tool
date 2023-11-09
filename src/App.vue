<template>
  <div class="app-box">
    <Menu v-if="canvas"  />
     <div class="app-box__main">
      <Controls v-if="canvas" />
      <Canvas />
      <ObjectTools />
    </div>
    <div class="app-box__bottom" v-show="showTimeline">
      <Scenes />
      <Timeline />
    </div>
    <notifications position="bottom right" group="main" />
    <portal-target name="main"></portal-target>
  </div>
</template>

<script>
import {mapState} from 'vuex';
import Menu from "./components/menu/Menu";
import Scenes from "./components/scenes/Scenes";
import Canvas from "./components/canvas/Canvas";
import Controls from "./components/controls/Controls";
import Timeline from "./components/timeline/Timeline";
import ObjectTools from "./components/object-tools/ObjectTools";
export default {
  name: 'App',
  components: {ObjectTools, Timeline, Controls, Canvas, Scenes, Menu},
  computed: {
    ...mapState('tools', ['showTimeline']),
    ...mapState('canvas', ['canvas']),
  }
}
</script>

<style lang="scss">
  @import "assets/styles/base";
  .app-box {
    height: 100%;
    background-color: #000;
    display: flex;
    flex-direction: column;
    &__main {
      flex: 1;
      display: flex;
      height: calc(100vh - 350px);
    }
    &__bottom {
      height: 210px;
      position: relative;
      z-index: 1;
      background: #1E2139;
      display: flex;
    }
  }
  .button {
    display: inline-block;
    background: #6F91D9;
    color: #fff;
    padding: 12px 28px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 2px;
    &:hover {
      filter: brightness(1.1);
    }
    &--disabled {
      cursor: default;
      background: #909db7;
      opacity: .75;
      &:hover {
        filter: brightness(1);
      }
    }
  }
  .button--secondary {
    background: #d8e0ef;
    color: #0F1127;
  }


  .debug {
    position: absolute;
    top: 70px;
    right: 10px;
    font-family: monospace;
    font-size: 12px;
    width: 35%;
    overflow: auto;
    overflow-x: hidden;
    word-break: break-all;
  }

</style>
