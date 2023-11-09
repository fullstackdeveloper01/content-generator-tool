import {cloneCanvas} from "./importExport";

export function preview(scenesList) {
    let file = JSON.stringify(cloneCanvas(scenesList));
    const form = document.createElement('form');
    form.target = "_blank";
    form.method = "POST";
    form.action = document.location.host === 'flash.webcraft.company' ? 'http://flash.webcraft.company/preview/' : 'http://localhost:9999/';
    const params = {
        'file': file
    }
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = params[key];

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}
