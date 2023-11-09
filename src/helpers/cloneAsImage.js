export const cloneAsImage = (object) => {
    return new Promise(resolve => {
        object.cloneAsImage(function(clone) {
            resolve(clone);
        });
    })
}
