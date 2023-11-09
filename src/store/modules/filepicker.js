import Vue from 'vue';

const filepickerModule = {
    namespaced: true,
    state: {
        currentFolder: '/',
        selectedFolder: null,
        files: {},
        openedFolders: {},
    },
    mutations: {
        setCurrentFolder(state, folder) {
            state.currentFolder = folder;
        },
        setSelectedFolder(state, folder) {
            state.selectedFolder = folder;
        },
        setOpenedFolder(state, {folder, openedState}) {
            Vue.set(state.openedFolders, folder, openedState);
        },
        setFiles(state, files) {
            state.files = files;
        },
        setFolderContents(state, {folder, files}) {
            Vue.set(state.files, folder, files);
        },
    }
};

export default filepickerModule;
