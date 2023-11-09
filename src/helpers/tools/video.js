import {addCommonMethods} from "../addCommonMethods";
import {createVideoEl} from "../createVideoEl";

import {fabric} from "@/fabric";

export async function initVideo(id, toolVariant, initialParams, initialGroupParams, canvas, name = null) {

    let additionalParams = {
        url: ''
    };
    let groupParams = {
        id,
        ...initialGroupParams,
    }
    let videoParams = {
        id,
        objectType: 'video',
        ...additionalParams,
        originY: 'top',
        ...{
            top: 0,
            left: 0,
            width: initialGroupParams.width,
            height: initialGroupParams.height
        }
    }

    function httpGet(theUrl)
    {
        let xmlhttp;
        
        if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp=new XMLHttpRequest();
        } else { // code for IE6, IE5
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
         
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                return xmlhttp.responseText;
            }
        }
        xmlhttp.open("GET", theUrl, false);
        xmlhttp.send();
        console.log("xmlhttp.response===",xmlhttp.response);
        return xmlhttp.response;
    }
const html = `
<p>this
<p>is <span style="color:red; font-weight: bold;">not</span>
<p><i>xml</i>!
  
 

  <div class="position-relative js-header-wrapper ">
     
sasASAsS

</div>
      
<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABWElEQVQ4jZ2Tu07DQBBFz9jjvEAQqAlQ0CHxERQ0/AItBV9Ew8dQUNBQIho6qCFE4Nhex4u85OHdWAKxzfWsx0d3HpazdGITA4kROjl0ckFrnYJmQlJrKsQZxFOIMyEqIMpADGhSZpikB1hAGsovdxABGuepC/4L0U7xRTG/riG3J8fuvdifPKnmasXp5c2TB1HNPl24gNTnpeqsgmj1eFgayoHvRDWbLBOKJbn9WLGYflCCpmM/2a4Au6/PTjdH+z9lCJQ9vyeq0w/ve2kA3vaOnI6k4Pz+0Y24yP3Gapy+Bw6qdfsCRZfWSWgclCCVXTZu5LZFXKJJ2sepW2KYNCENB3U5pw93zLoDjNK6E7rTFcgbkGYJtiLckxCiw4W1OURsxUE5BokQiQj3JIToVtKwlhsurq+YDYbMBjuU/W3KtT3xIbrpAD7E60lwQohuaMtP8ldI0uMbGfC1r1zyWPUAAAAASUVORK5CYII=">`;
httpGet("https://example.org")
render_html_to_canvas(html, canvas, 0, 0, 300, 150);


function render_html_to_canvas(html, canvas, x, y, width, height) {
  var data = "data:image/svg+xml;charset=utf-8," + '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">' +
    '<foreignObject width="100%" height="100%">' +
    html_to_xml(html) +
    '</foreignObject>' +
    '</svg>';

  var img = new Image();
  img.onload = function() {
      
    let picture = new fabric.Image();
    picture.setSrc(data, () => {

        //clone and add in array for multiple image animations
        picture.clone(function(clone) {
            clone.opacity = 0;
            clone.selectable = false;
            canvas.add(clone);
            clone.setCoords();
            canvas.renderAll();
            canvas.bringToFront(picture); 
        });  
    }); 
  }
  img.src = data;
}

function html_to_xml(html) {
  var doc = document.implementation.createHTMLDocument('');
  doc.write(html);

  // You must manually set the xmlns if you intend to immediately serialize     
  // the HTML document to a string as opposed to appending it to a
  // <foreignObject> in the DOM
  doc.documentElement.setAttribute('xmlns', doc.documentElement.namespaceURI);

  // Get well-formed markup
  return html = (new XMLSerializer).serializeToString(doc.body);
}

    return {
        id,
        name: name ? name : 'Video',
        visible: true,
        selectable: true,
        groupParams,
        objectParams: videoParams,
        objectType: 'video',
        object: video,
        effects: [],
        animations: []
    };
}
