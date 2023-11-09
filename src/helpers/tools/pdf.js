import {addCommonMethods} from "../addCommonMethods";
import EventBus from "@/EventBus";
import * as PDFJS from "@/pdf";
PDFJS.GlobalWorkerOptions.workerSrc = "//mozilla.github.io/pdf.js/build/pdf.worker.js";
 
export async function initPdf(id, toolVariant, initialParams, initialGroupParams, canvas, name = null) {
    const reader = new FileReader();
 
    let additionalParams = {
        url: ''
    };
    let groupParams = {
        id,
        ...initialGroupParams,
    }
    let pdfParams = {
        id,
        objectType: 'pdf',
        ...additionalParams,
        originY: 'top',
        ...{
            top: 0,
            left: 0,
            width: initialGroupParams.width,
            height: initialGroupParams.height
        }
    }
     
    //let videoEl = createVideoEl();

    let pdf = new fabric.Image();
    pdf.otherUrls = [''];
    pdf.objectType = pdfParams.objectType;
     
    pdf.initPdf = (url, index=-1) => {
        const noPdf = url === 'n';
        if (!url) {
            url = pdf.url;
        } else {
            pdf.url = url;
        }
 
        let fullUrl = `${url}`;
        const verifyIndex = index !=-1 && pdf.otherUrls.length > index;
        verifyIndex && (pdf.otherUrls[index] = fullUrl)
        if (noPdf) {
            fullUrl = '/images/blank.png';
            if(verifyIndex){
                picture.otherUrls.splice(index, 1)
                setTimeout(()=>{
                    EventBus.$emit('ExpandContentSection');
                },100)
            }
        }
        return new Promise((resolve, reject) => {

            
            if(!pdf.animImgs) {
                pdf.animImgs = [];
            }

             // Asynchronous download of PDF
            var loadingTask = PDFJS.getDocument(url);
            
            console.log("loadingTask===",loadingTask)
            loadingTask.promise.then(function(pdfVal) {
              console.log('PDF loaded');
              
              // Fetch the first page
              var pageNumber = 1;
              pdfVal.getPage(pageNumber).then(function(page) {
                console.log('Page loaded');
                
                var scale = 1.5;
                var viewport = page.getViewport({scale: scale});
                 // Prepare canvas using PDF page dimensions 
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                // Render PDF page into canvas context
                var renderContext = {
                  canvasContext: context,
                  viewport: viewport
                }; 
                
                page.render(renderContext).promise.then(function () {
                    
                    var bg = canvas.toDataURL("image/png");
   
                            fabric.Image.fromURL(bg,() => {
                                canvas.renderAll();
                                 canvas.bringToFront(pdf);
                            },{
                                     crossOrigin: 'anonymous'
                            });


                            // fabric.Image.fromURL(bg, () => {

                            //     //clone and add in array for multiple image animations
                            //     pdf.clone(function(clone) {
                            //         clone.opacity = 0;
                            //         clone.selectable = false;
                            //         canvas.add(clone);
                            //         clone.setCoords();
                            //         canvas.renderAll();
                            //         canvas.bringToFront(pdf);
                            //         pdf.animImgs.push(clone);
                            //     });  

                            //     // if (noPicture) {
                            //     //     setTimeout(() => {
                            //     //         pdf.url = '';
                            //     //     }, 1)
                            //     // }
                            //     // resolve();
                            // }, {
                            //     crossOrigin: 'anonymous'
                            // });         
                        

                        // pdf.fromURL(bg, function(img) {
                        //      canvas.setBackgroundImage(img);
                        // });
                        // canvas.renderAll();
                });
              });
            }, function (reason) {
              // PDF loading error
              console.error(reason);
            });
        })
    }

    if (initialParams.url) {
       await pdf.initPdf(initialParams.url);
    }
    let width = pdf.pdfWidth || 400;
    let height = pdf.pdfHeight || 400;

    pdf.set({
        id,
        left: groupParams.left,
        top: groupParams.top,
        width: width,
        height: height,
        scaleX: groupParams.width / width,
        scaleY: groupParams.height / height,
        originX: groupParams.originX,
        originY: groupParams.originY,
        interval: 0,
    });
    addCommonMethods(pdf, canvas);
    return {
        id,
        name: name ? name : 'pdf',
        visible: true,
        selectable: true,
        groupParams,
        objectParams: pdfParams,
        objectType: 'pdf',
        object: pdf,
        effects: [],
        animations: []
    };
}
