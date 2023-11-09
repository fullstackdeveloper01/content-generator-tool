import Vue from 'vue'
import Vuex from 'vuex'
import canvasModule from "./modules/canvas";
import scenesModule from "./modules/scenes";
import toolsModule from "./modules/tools";
import filepickerModule from "./modules/filepicker";

Vue.use(Vuex)


const store = new Vuex.Store({
    modules: {
       canvas: canvasModule,
       scenes: scenesModule,
       tools: toolsModule,
       filepicker: filepickerModule,
    }
});

export default store;
