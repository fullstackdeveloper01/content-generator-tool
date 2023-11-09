const toolsModule = {
    namespaced: true,
    state: {
        currentTool: null,
        currentToolVariant: 'arrow',
        showTimeline: true,
        timelineWasVisible: null,
        animateModalVisible: false,
        effectsModalVisible: false,
    },
    mutations: {
        setShowTimeline(state, showTimeline) {
            if (showTimeline === null) {
                showTimeline = state.timelineWasVisible;
            } else {
                state.timelineWasVisible = state.showTimeline;
            }
            state.showTimeline = showTimeline;
        },
        setTool(state, tool) {
            state.currentTool = tool;
        },
        setToolVariant(state, toolVariant) {
            state.currentToolVariant = toolVariant;
        },
        setAnimateModalVisible(state, visible) {
            state.animateModalVisible = visible;
        },
        setEffectsModalVisible(state, visible) {
            state.effectsModalVisible = visible;
        }
    }
};

export default toolsModule;
