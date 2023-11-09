import {addCommonMethods} from "../addCommonMethods";

export async function initWeather(id, toolVariant, initialParams, initialGroupParams, canvas, name = null) {
    let additionalParams = {
        fontSize: 36,
        fontStyle: 'normal',
        fontWeight: 'normal',
        textAlign: 'left',
        text: 'MM DD YYYY h:mm:ss',
        fill: '#111111',
    };
    let groupParams = {
        id,
        ...initialGroupParams,
    }
    let weatherParams = {
        id,
        objectType: 'weather',
        pattern: 'MM DD YYYY h:mm:ss',
        ...additionalParams,
        ...{
            top: 0,
            left: 0,
            width: initialGroupParams.width,
            height: initialGroupParams.height
        },
        ...initialParams
    }
	
	let weatherbox = new fabric.Image();
    weatherbox.objectType = weatherbox.objectType;
	weatherbox.weatherData =    {
        "current": {
            "icon": "https://i.picsum.photos/id/932/200/200.jpg?hmac=Qjhen49LkgtGGE52_mEJghx6A2xQoCVv1eTsAVG14-c",
            "high": 66,
            "low": 32
        },
        "today": {
            "high": 77,
            "icon": "https://i.picsum.photos/id/893/200/200.jpg?hmac=MKUqbcyRrvAYoTmgHo74fEI3o9V4CH2kBrvWfmHkr7U",
            "low": 35
        },
        "tomorrow": {
            "high": 80,
            "icon": "https://i.picsum.photos/id/308/200/200.jpg?hmac=gCyOH3yDZDvlNeCodWo0et9Vw3peGSCuMsQBRNqgHJQ",
            "low": 34
        }
    }
	weatherbox.initWeather = (width, index=-1) => {
	 
		return new Promise((resolve, reject) => {
            var currentLowleftText = -groupParams.width/6*1; 
            var todayLowleftText = groupParams.width/14*2;
            let currentParam = weatherbox.weatherData.current;
            console.log("currentParam",currentParam.high);
            let todayParam = weatherbox.weatherData.today;
            let tomorrowParam = weatherbox.weatherData.tomorrow;

            var currentLow = new fabric.IText((currentParam.low).toString(),{
				top:groupParams.height/3,
				left:currentLowleftText,
				width: groupParams.width/6, 
				fontSize: groupParams.height/8,
				stroke: 'black',
				fill: 'black' 
			},weatherParams);
			
			 var todayLow = new fabric.Text((todayParam.low).toString(),{
                top:groupParams.height/3,
				left:todayLowleftText, 
				width: groupParams.width/6, 
				fontSize: groupParams.height/8,
				stroke: 'black',
				fill: 'black'  
			},weatherParams);

			var tomorrowLow = new fabric.Text((tomorrowParam.low).toString(),{
                top:groupParams.height/3,
				left:groupParams.width/6*3, 
				width: groupParams.width/6, 
				fontSize: groupParams.height/8,
				stroke: 'black',
				fill: 'black'
			},weatherParams);



            var currentHigh = new fabric.IText('Low:'+(currentParam.low).toString(),{
				top:groupParams.height/2,
				left:currentLowleftText,
				width: groupParams.width/6, 
				fontSize: groupParams.height/12,
				stroke: 'black',
				fill: 'black' 
			},weatherParams);
			
			 var todayHigh = new fabric.Text('Low:'+(todayParam.low).toString(),{
                top:groupParams.height/2,
				left:todayLowleftText, 
				width: groupParams.width/6, 
				fontSize: groupParams.height/12,
				stroke: 'black',
				fill: 'black'  
			},weatherParams);

			var tomorrowHigh = new fabric.Text('Low:'+(tomorrowParam.low).toString(),{
                top:groupParams.height/2,
				left:groupParams.width/6*3, 
				width: groupParams.width/6, 
				fontSize: groupParams.height/12,
				stroke: 'black',
				fill: 'black'
			},weatherParams);
		 
			fabric.Image.fromURL(currentParam.icon, function(imgobj1) {
				imgobj1.set({
		 			left:-groupParams.width/6*2, 
					width: groupParams.width/6,
					height: groupParams.height/2,
                    top:groupParams.height/4,
                    bottom:groupParams.height/2,
		 		});
				groupParams.imgobj1 = imgobj1;
				fabric.Image.fromURL(todayParam.icon, function(imgobj2) {
					imgobj2.set({
		 				left:-groupParams.width/90*3, 
						width: groupParams.width/6,
						height: groupParams.height/2,
                        top:groupParams.height/4,
                        bottom:groupParams.height/2,
		 			});
                    groupParams.imgobj2 = imgobj2;
                    fabric.Image.fromURL(tomorrowParam.icon, function(imgobj3) {
                    imgobj3.set({
                        left:groupParams.width/6*2, 
                        width: groupParams.width/6,
                        height: groupParams.height/2,
                        top:groupParams.height/4,
                        bottom:groupParams.height/2,
		 			});
					groupParams.imgobj3 = imgobj3;
					weatherbox = new fabric.Group([groupParams.imgobj1,currentLow,currentHigh,groupParams.imgobj2,todayLow,todayHigh,groupParams.imgobj3,tomorrowLow,tomorrowHigh],weatherParams);
					 
					canvas.add(weatherbox); 
                    resolve();
                        },{
					    crossOrigin: 'anonymous'
					    });
					},{
					crossOrigin: 'anonymous'
					});
				},{
				crossOrigin: 'anonymous'
			});

        })

	}
    console.log("weatherParams.url",canvas);
    //if (initialParams.url) {
       await weatherbox.initWeather(initialGroupParams.width);
    //}  
	 
    weatherbox.set({
        left: groupParams.left,
        top: groupParams.top,
        editable: false,
        originX: groupParams.originX,
        originY: groupParams.originY,
       
    });
    addCommonMethods(weatherbox, canvas);
    weatherbox.scaleX = groupParams.width/weatherbox.width;
    weatherbox.scaleY = groupParams.height/weatherbox.height; 
    
    return {
         id,
         name: name ? name : 'Weather',
         visible: true,
         selectable: true,
         groupParams, 
         objectParams: weatherParams,
         objectType: 'weather',
         object: weatherbox,
         effects: [],
         animations: []
    };

    
}
