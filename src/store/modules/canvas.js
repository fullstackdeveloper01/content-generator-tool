import {drawGrid} from "../../helpers/grid";

const canvasModule = {
    namespaced: true,
    state: {
        canvas: null,
        zoomValue: .5,
        grid: {
            enabled: false,
            width: 50,
             height: 50,
            cellSize: 2,
            cellColor: '#ccc',
            group: null
        }
    },
    mutations: {
        setZoomValue(state, zoomValue) {
            state.zoomValue = zoomValue;
        },
        setCanvas(state, canvas) {
            state.canvas = canvas;
        },
        setGridEnabled(state, gridEnabled) {
            if (state.grid.group) {
                state.canvas.remove(state.grid.group);
            }
            if (gridEnabled) {
                state.grid.group = drawGrid(state.canvas, state.grid, null);
            }
            state.grid.enabled = gridEnabled;
        },
        setGridParams(state, params) {
            state.grid = params;
            if (state.grid.group) {
                state.canvas.remove(state.grid.group);
            }
            if (state.grid.enabled) {
                state.grid.group = drawGrid(state.canvas, state.grid, state.grid.group);
            }
        }
    }
};

export default canvasModule;
