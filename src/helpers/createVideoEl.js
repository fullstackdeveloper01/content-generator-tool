export function createVideoEl(url=null) {
    var videoEl = document.createElement('iframe');    
    // videoEl.style.display = 'none';
    // videoEl.setAttribute('loop', true);
    videoEl.setAttribute('width', 2000);
    videoEl.setAttribute('height', 2000);
    videoEl.setAttribute("src", "https://mycourses.w3schools.com/");
    //videoEl.muted = true;
    //videoEl.crossOrigin = "anonymous";
     if(url) {
    //     var source = document.createElement('source');
    videoEl.src = url;
    //     source.type = 'video/mp4';
    //     videoEl.appendChild(source);
     }
     console.log("videoEl=====",videoEl);
    document.body.appendChild(videoEl);
    return videoEl;
}