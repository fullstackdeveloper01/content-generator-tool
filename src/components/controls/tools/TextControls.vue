<script>
    import {mapGetters, mapState, mapMutations} from 'vuex';
    import Section from "@/components/layout/Section";
    import Checkbox from "../custom/Checkbox";
    import NumberInput from "../custom/NumberInput";
    import Colorpicker from "../custom/Colorpicker";
    import AlignControls from "../common/AlignControls";
    import SizeControls from "../common/SizeControls";
    import Tooltip from "@/components/layout/Tooltip";

    const fonts = ['Arial','Arial Black','Calibri','Calibri Light','Cambria','Cambria Math','Candara','Candara Light','Comic sans ms','consolas','Constantia','Corbel','Corbel Light','Courier new','Cursive','Fantasy','Gabriola','Gadugi','Georgia','Impact','Ink free','Javanese Text','Leelawadee ui','Leelawadee ui light','Lucida console','Lucida sans unicode','MS Gothic','MS PGothic','MS UI Gothic','MV Boli','Malgun Gothic','Malgun Gothic Light','Microsoft Himalaya','Microsoft Sans Serif','MingLiU-ExtB','Mongolian Baiti','Monospace','Myanmar Text','NSimsun','Nirmala UI','Nirmala UI Light','PMingLiU-ExtB','Palatino Linotype','Sans-serif','Segoe Print','Segoe Script','Segoe UI','Segoe UI Black','Segoe UI Historic','Segoe UI Light','Segoe UI SemiBold','Segoe UI Symbol','SimSun','SimSun-ExtB','Sitka Banner','Sitka Display','Sitka Heading','Sitka Small','Sitka Subheading','Sitka Text','Sylfaen','Tahoma','Teamviewer15','Times New Roman','Trebuchet MS','Verdana','Yu Gothic','Yu Gothic Light','Yu Gothic Medium','Yu Gothic UI Light','Yu Gothic UI Semibold'];

    export default {
        computed: {
            ...mapGetters('scenes', ['params','currentObject']),
            ...mapState('scenes', ['fabricObject']),
            ...mapState('canvas', ['canvas']),
        },
        components: {Tooltip, SizeControls, AlignControls, Colorpicker, NumberInput, Checkbox, Section},
        data() {
            return {
                fonts,
                isScrolling: false,
                tempObject: null,
            }
        },
        mounted() {
            if(this.fabricObject) {
                if(this.fabricObject.direction === 'rtl' && this.fabricObject.textAlign === 'right')
                    this.fabricObject.rtl = true;
                this.tempObject = this.fabricObject;
                if(!this.fabricObject.topnewscount)
                    this.fabricObject.topnewscount = 10;
                this.isScrolling = this.fabricObject.isScrolling;
                if(!this.fabricObject.valign)
                    this.fabricObject.valign = 'top';                
                // this.canvas.on('text:changed', (e) => {
                //     this.updateTextProp();
                // });
            }
            this.updateTextProp();
        },
        methods: {
            updateTextProp() {
                if(this.fabricObject.text) {
                    var textString = this.fabricObject.text.replace(/^\s*[\r\n]/gm,""); //get only text without line breaks
                    this.fabricObject.origText = textString;
                    // var textAlign = this.fabricObject.textAlign;
                    // this.setAlign('');
                    // this.setAlign(textAlign);
                }
            },
            stopTextScrolling() {            
                this.restoreText(this.fabricObject);
            },
            customSplit(str, maxLength) { 
                if(str.length <= maxLength)
                    return str;
                var reg = new RegExp(".{1," + maxLength + "}","g");
                var parts = str.match(reg);
                return parts.join('\r\n');
            },
            onChange(e) {
                if((e === 'rssurl' || e === 'topnewscount') && this.tempObject) {
                    
                    if(!this.tempObject.rssurl) return;

                    //https://rss2json.com/rss-to-json-api-javascript-example
                    var xhr = new XMLHttpRequest();

                    xhr.onreadystatechange = () => {
                        if (xhr.readyState==4 && xhr.status==200)
                        {
                            var data = JSON.parse(xhr.responseText);

                            if(data.status == 'ok'){
                                var count = this.tempObject.topnewscount;
                                if(!count || count > data.items.length)
                                    count = data.items.length;
                                this.tempObject.text = '';

                                var width = this.tempObject.width;
                                var fs = this.tempObject.fontSize;
                                var fc = 2.5;
                                var cpl = Math.floor(width / (fs / fc));//calculate number of characters fit in the width area.
                                console.log(data.items);
                                var rssarray = [];
                                for( var i=0; i < count ; i++){
                                    var item = data.items[i];
                                    var text = `${item.title} \n ${item.description}`;
                                    //rssarray.push(this.customSplit(text, cpl));
                                    rssarray.push(text);
                                }
                                this.tempObject.text = rssarray[0];
                                this.tempObject.rssarrayidx = -1;
                                this.tempObject.rssarray = rssarray;
                                this.canvas.renderAll();
                                this.tempObject.updateWidthHeight();
                                this.canvas.renderAll();
                            }
                        }
                    };
                    xhr.open(
                        'GET',
                        'https://api.rss2json.com/v1/api.json?rss_url='+this.tempObject.rssurl,
                        true
                    );
                    xhr.send();
                } else if(e === 'origText') {
                    var textString = this.fabricObject.text.replace(/^\s*[\r\n]/gm,""); //get only text without line breaks
                    this.fabricObject.text = this.fabricObject.text.replace(textString, this.fabricObject.origText);
                    this.setVerticalAlign(this.fabricObject.valign);
                } else if(e === 'rtl') {
                    if(this.fabricObject.rtl) {
                        this.fabricObject.textAlign = 'left';
                        this.fabricObject.direction = 'ltr';
                    } else {
                        this.fabricObject.textAlign = 'right';
                        this.fabricObject.direction = 'rtl';
                    }
                    this.$emit('change', e);
                } else {
                    this.$emit('change', e);
                }
                if(this.fabricObject) {                    
                    this.fabricObject.updateWidthHeight();
                }
                this.canvas.renderAll();
            },
            onChangeAlign() {
                this.onChange();
            },
            setAlign(align) {
                this.fabricObject.textAlign = align;
                this.onChange('textAlign');
            },
            setVerticalAlign(align) {
                var text = this.fabricObject.text;
                //extract lines without line break
                var multiline = text.split(/\n\r|\n|\r/);
                var origText = '';
                for (var i = 0; i < multiline.length; i++) {         
                    if(multiline[i].trim() != '' && multiline[i].trim() != '\n') {
                        if(i > 0 && origText != '')
                        origText += '\n';
                        origText += multiline[i];
                    }
                }
                //add line breaks based on alignment.
                multiline = origText.split(/\n\r|\n|\r/);
                var curlines = multiline.length;
                //var lineheight = this.fabricObject.calcTextHeight();
                var lineheight = this.fabricObject.fontSize * this.fabricObject.lineHeight * this.fabricObject._fontSizeMult
                var totallines = Math.floor(this.fabricObject.height / lineheight);
                var remlines = totallines - curlines;              

                if(align === 'bottom') {      
                    var finalText = '';
                    for (var i = 0; i < remlines; i++) {
                        finalText += "\n";
                    }         
                    finalText += origText;
                    this.fabricObject.text = finalText;
                }
                if(align === 'top') {
                    this.fabricObject.text = origText;
                }
                if(align === 'center') {      
                    var finalText = '';
                    for (var i = 0; i < remlines/2; i++) {
                        finalText += "\n";
                    }         
                    finalText += origText;
                    this.fabricObject.text = finalText;
                }

                this.fabricObject.valign = align;
                this.fabricObject.setCoords();
                this.canvas.renderAll();
                this.onChange('valign');
                var textAlign = this.fabricObject.textAlign;
                this.setAlign('');
                this.setAlign(textAlign);
            },

            setBold() {
                this.fabricObject.fontWeight = this.fabricObject.fontWeight === 'bold' ? 'normal' : 'bold';
                this.onChange('fontWeight');
            },
            setItalic() {
                this.fabricObject.fontStyle = this.fabricObject.fontStyle === 'italic' ? 'normal' : 'italic';
                this.onChange('fontStyle');
            },
            setUnderline() {
                this.fabricObject.underline = !this.fabricObject.underline;
                this.onChange('underline');
            },

            async setAutoSize() {
                await this.$nextTick();
                if (this.fabricObject.autoSize) {
                    const rect = this.fabricObject.getBoundingRect();
                    if (this.fabricObject.textAlign === 'left' || this.fabricObject.textAlign === 'center') {
                        let maxLeft = Math.max.apply(null, [].concat.apply([], this.fabricObject.__charBounds).map(char => char.left + char.width));
                        this.fabricObject.width = maxLeft;
                        this.updateObjectParam({key: 'width', value: maxLeft});
                        if (this.fabricObject.textAlign === 'center') {
                            this.fabricObject.left+= maxLeft * 2;
                            this.updateObjectParam({key: 'left', value: this.fabricObject.left});
                        }
                    }
                    this.fabricObject.height = rect.height;
                    this.updateObjectParam({key: 'height', value: rect.height});
                    this.onChange();
                }
            },
            setScrollDirection(scrollDirection) {
                if (this.fabricObject.scrollDirection !== scrollDirection) {
                    this.fabricObject.scrollDirection = scrollDirection;
                } else {
                    this.fabricObject.scrollDirection = null;
                }
                this.stopTextScrolling();
                this.onChange('scrollDirection');
            },
            animateText(obj, ov, sv, ev) {
                const groupParam = obj.scrollField === 'left' ? 'width' : 'height';
                if(!obj.isScrolling) return false;
                if(obj.rssarray) {
                    obj.rssarrayidx++;
                    if(obj.rssarrayidx >= obj.rssarray.length)
                        obj.rssarrayidx = 0;
                    obj.text = obj.rssarray[obj.rssarrayidx];
                    console.log('text'+obj.text);
                }
                fabric.util.animate({
                    startValue: sv,
                    endValue: ev,
                    duration: obj[groupParam] / obj.scrollSpeed * 1000,
                    //easing: function(t, b, c, d) { return c*t/d + b; },
                    abort: () => {
                        return !obj.isScrolling;
                    },
                    onChange: (value) => {
                        obj[obj.scrollField] = ov + value;
                        obj.height = obj.fixedHeight;
                        this.canvas.renderAll();
                    },
                    onComplete: () => {
                        //if scroll stop time then stop animation for the specified time.
                        if(obj.scrollStopTime > 0) {

                            if(obj.reverse) {
                                if(obj.secanim) {
                                    obj.secanim = false;

                                    if(obj.animTimeOut) {
                                        clearTimeout(obj.animTimeOut);
                                        obj.animTimeOut = null;
                                    }

                                    obj.animTimeOut = setTimeout(() => {                                
                                        this.animateText(obj, ov, 0, obj.ev);
                                    }, obj.scrollStopTime * 1000);
                                    obj[obj.scrollField] = ov;
                                    this.canvas.renderAll();
                                } else {
                                    obj.secanim = true;
                                    this.animateText(obj, ov, obj.sv, 0);
                                }       
                            } else {
                                if(!obj.secanim) {
                                    obj.secanim = true;

                                    if(obj.animTimeOut) {
                                        clearTimeout(obj.animTimeOut);
                                        obj.animTimeOut = null;
                                    }

                                    obj.animTimeOut = setTimeout(() => {            
                                        this.animateText(obj, ov, 0, obj.sv);
                                    }, obj.scrollStopTime * 1000);
                                    obj[obj.scrollField] = ov;
                                    this.canvas.renderAll();
                                } else {
                                    obj.secanim = false;  
                                    this.animateText(obj, ov, obj.ev, 0);
                                }    
                            }
                        } else {
                            this.animateText(obj, ov, sv, ev);
                        }
                    }
                });

            },
            startStopScrollText(object) {
                if (!object.scrollDirection) {
                    return;
                }
                object.setCoords();
                if (!object.isScrolling) {
                    object.isScrolling = true;                    
                    this.isScrolling = true;
                    object.scrollField = object.scrollDirection === 'left' || object.scrollDirection === 'right' ? 'left' : 'top';
                    object.originalScrollValue = object[object.scrollField];

                    let clipPath = new fabric.Rect({
                        originX: 'center',
                        originY: 'center',
                        left: object.left,
                        top: object.top,
                        width: object.width,
                        height: object.height,
                        scaleX: object.scaleX,
                        scaleY: object.scaleY,
                        absolutePositioned: true,
                        fill: 'Transparent'
                    });
                    this.canvas.add(clipPath);
                    clipPath.origobj = object;
                    object.custtype = 'animobj';
                    object.clipPath = clipPath;
                    
                    const whParam = object.scrollField === 'left' ? 'width' : 'height';
                    const swh = object.scrollField === 'left' ? object.calcTextWidth() : object.calcTextHeight(); //text width height 
                    const scaleParam = object.scrollField === 'left' ? 'scaleX' : 'scaleY';
                    const reverse = object.scrollDirection === 'right' || object.scrollDirection === 'bottom';
                    
                    var ov = object[object.scrollField];
                    var sv = - swh * object[scaleParam]; // start value
                    if(object.textAlign === 'center') {
                        sv = sv/2 - object[whParam] * object[scaleParam] / 2;
                    }
                    if(object.textAlign === 'right') {
                        sv = - object[whParam] * object[scaleParam];
                    }
                    var ev = object[whParam] * object[scaleParam]; //end value
                    object.reverse = reverse;
                    
                    if(reverse) {
                        object.sv = sv;
                        object.ev = ev;
                        if(object.scrollStopTime > 0)
                            sv = 0; // start value
                        this.animateText(object, ov, sv, ev);
                    } else {
                        object.sv = sv;
                        object.ev = ev;
                        if(object.scrollStopTime > 0)
                            sv = 0; // start value
                        this.animateText(object, ov, ev, sv);
                    }
                    this.initScrollTextEvents(clipPath);
                    //this.canvas.discardActiveObject();
                    this.canvas.setActiveObject(clipPath);
                    this.canvas.renderAll();
                } else {
                    this.restoreText(object);
                }
            },
            initScrollTextEvents(clipPath) {
                clipPath.on('modified', (e) => {
                    var target = e.target;
                    target.setCoords();
                    if(target.origobj) {
                        target.origobj.left = target.left;
                        target.origobj.top = target.top;
                        target.origobj.scaleX = target.scaleX;
                        target.origobj.scaleY = target.scaleY;
                        target.origobj.setCoords();
                    }
                    this.canvas.renderAll();
                    target.origobj.originalScrollValue = target.origobj[target.origobj.scrollField];
                    this.restoreText(target.origobj);
                    this.startStopScrollText(target.origobj);
                });
            },
            restoreText(object) {
                if(object.animTimeOut) {
                    clearTimeout(object.animTimeOut);
                    object.animTimeOut = null;
                }
                object.isScrolling = false;
                object.secanim = false;
                this.isScrolling = false;
                object.custtype = null;
                if(object.originalScrollValue)
                    object[object.scrollField] = object.originalScrollValue;
                this.canvas.setActiveObject(object);
                var clipPath = object.clipPath;
                object.clipPath = null;
                this.canvas.remove(clipPath);
                this.canvas.renderAll();
            },
            ...mapMutations('scenes', ['updateObjectParam'])
        },
    }

</script>
<template>
    <div class="text-controls" v-if="currentObject && fabricObject">
        <Section>
            <div slot="title">Text tools</div>
            <div class="input-block">
                <textarea class="input-block__el input-block__el--textarea" :style="{'text-align':fabricObject.textAlign}" v-model="fabricObject.origText" @keyup="() => onChange('origText')" @blur="() => onChange('text')"></textarea>
            </div>
            <div class="inputs-row">
                <select class="select text-controls__font-family" v-model="fabricObject.fontFamily" @change="() => onChange('fontFamily')" >
                    <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
                </select>
                <select class="select text-controls__font-size" v-model="fabricObject.fontSize" @change="()  => onChange('fontSize')">
                    <option>8</option>
                    <option>9</option>
                    <option>10</option>
                    <option>11</option>
                    <option>12</option>
                    <option>14</option>
                    <option>16</option>
                    <option>18</option>
                    <option>20</option>
                    <option>22</option>
                    <option>24</option>
                    <option>26</option>
                    <option>28</option>
                    <option>36</option>
                    <option>48</option>
                    <option>72</option>
                </select>
            </div>
            <div class="controls__buttons">
                <div @click="setBold" class="controls__buttons__item" :class="{'controls__buttons__item--active' : fabricObject.fontWeight === 'bold'}">
                    <Tooltip>Bold</Tooltip>
                    <img src="images/icn-text-bold.svg">
                </div>
                <div @click="setItalic" class="controls__buttons__item" :class="{'controls__buttons__item--active' : fabricObject.fontStyle === 'italic'}">
                    <Tooltip>Italic</Tooltip>
                    <img src="images/icn-text-italic.svg">
                </div>
                <div @click="setUnderline" class="controls__buttons__item" :class="{'controls__buttons__item--active' : fabricObject.underline}">
                    <Tooltip>Underline</Tooltip>
                     <img src="images/icn-text-underline.svg">
                </div>
            </div>
            <div class="controls__buttons">
                <div @click="setAlign('left')" class="controls__buttons__item " :class="{'controls__buttons__item--active': fabricObject.textAlign === 'left'}">
                    <Tooltip>Align left</Tooltip>
                    <img src="images/icn-text-left.svg">
                </div>
                <div @click="setAlign('center')" class="controls__buttons__item " :class="{'controls__buttons__item--active': fabricObject.textAlign === 'center'}">
                    <Tooltip>Align center</Tooltip>
                    <img src="images/icn-text-center.svg">
                </div>
                <div @click="setAlign('right')" class="controls__buttons__item " :class="{'controls__buttons__item--active': fabricObject.textAlign === 'right'}">
                    <Tooltip>Align right</Tooltip>
                    <img src="images/icn-text-right.svg">
                </div>
                <div class="controls__buttons__delimiter"></div>
                <div @click="setVerticalAlign('top')" class="controls__buttons__item " :class="{'controls__buttons__item--active': fabricObject.valign === 'top'}">
                    <Tooltip>Align top</Tooltip>
                    <img src="images/icn-text-top.svg">
                </div>
                <div @click="setVerticalAlign('center')" class="controls__buttons__item " :class="{'controls__buttons__item--active': fabricObject.valign === 'center'}">
                    <Tooltip :left="true">Align middle</Tooltip>
                    <img src="images/icn-text-middle.svg">
                </div>
                <div @click="setVerticalAlign('bottom')" class="controls__buttons__item " :class="{'controls__buttons__item--active': fabricObject.valign === 'bottom'}">
                    <Tooltip :left="true">Align bottom</Tooltip>
                    <img src="images/icn-text-bottom.svg">
                </div>
            </div>
            <div class="inputs-row">
            <Checkbox title="Word wrap" v-model="fabricObject.splitByGrapheme" @change="()  => onChange('splitByGrapheme')" />
            <Checkbox title="RTL" v-model="fabricObject.rtl" @change="()  => onChange('rtl')" />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Color</label>
                <Colorpicker v-model="fabricObject.fill" @change="() => onChange('fill')" />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Opacity</label>
                <NumberInput v-model="fabricObject.opacity" :min="0" :max="100" :step="1" :multiplier="100" @change="() => onChange('opacity')" textAfter="%" />
            </div>
            <Checkbox title="Auto-size" v-model="fabricObject.autoSize" @change="() => setAutoSize()" />
        </Section>
        <Section>
            <div slot="title">Size & position</div>
            <SizeControls @change="onChange" />
        </Section>
        <Section>
            <div slot="title">Align</div>
            <AlignControls @change="onChangeAlign" />
        </Section>
        <Section>
            <div slot="title">RSS Feed</div>
            <div class="input-block input-block--line">
                <label class="input-block__title">URL</label>
                <input class="input-block__el" v-model="fabricObject.rssurl"  @change="() => onChange('rssurl')"/>
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Top News</label>
                <NumberInput v-model="fabricObject.topnewscount" :min="1" :max="100" :step="1" @change="() => onChange('topnewscount')" />
            </div>
        </Section>
        <Section :isExpanded="true">
            <div slot="title">Scrolling</div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Direction</label>
                <div class="text-controls__scroll-directions">
                    <a class="text-controls__scroll-direction" :class="{'text-controls__scroll-direction--active': fabricObject.scrollDirection === 'right'}" @click="setScrollDirection('right')">
                        <img src="images/icn-direction-right.svg" />
                    </a>
                    <a class="text-controls__scroll-direction" :class="{'text-controls__scroll-direction--active': fabricObject.scrollDirection === 'left'}" @click="setScrollDirection('left')">
                        <img src="images/icn-direction-left.svg" />
                    </a>
                    <a class="text-controls__scroll-direction" :class="{'text-controls__scroll-direction--active': fabricObject.scrollDirection === 'top'}" @click="setScrollDirection('top')">
                        <img src="images/icn-direction-top.svg" />
                    </a>
                    <a class="text-controls__scroll-direction" :class="{'text-controls__scroll-direction--active': fabricObject.scrollDirection === 'bottom'}" @click="setScrollDirection('bottom')">
                        <img src="images/icn-direction-bottom.svg" />
                    </a>
                </div>
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Speed</label>
                <NumberInput v-model="fabricObject.scrollSpeed" :min="1" :max="1000" :step="1" @change="() => onChange('scrollSpeed')" @focusout="() => stopTextScrolling()" textAfter="px/s" />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Stop time</label>
                <NumberInput v-model="fabricObject.scrollStopTime" :min="0" :max="1000" :step="1" @change="() => onChange('scrollStopTime')"  @focusout="() => stopTextScrolling()"/>
            </div>
            <a @click="startStopScrollText(fabricObject)" class="text-controls__scroll-preview" :class="{'text-controls__scroll-preview--disabled': !fabricObject.scrollDirection}">
                <img v-if="!isScrolling" src="images/ic-manage.svg"/>
                <img v-else src="images/ic-stop.svg"/>
            </a>
        </Section>
    </div>
</template>
<style lang="scss">
    .text-controls {
        &__font-family {
            flex: 1;
            margin-right: 8px;
        }
        &__scroll-direction {
            width: 20px;
            height: 20px;
            display: inline-block;
            text-align: center;
            margin: 0 4px 0 6px;
            cursor: pointer;

            &--active {
                background: #33405B;
            }
        }
        &__scroll-preview {
            display: inline-block;
            margin: 5px 0;
            cursor: pointer;
            &--disabled {
                cursor: default;
                opacity: .5;
            }
        }

    }
</style>
