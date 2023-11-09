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
        mounted() {
            if(this.multiObjects) {
                
                var type = 'mixed';
                
                var objs = this.multiObjects.filter(obj => {
                    return obj.objectType === 'shape';
                });
                if(objs.length === this.multiObjects.length)
                    type = 'shape';
                
                objs = this.multiObjects.filter(obj => {
                    return obj.objectType === 'text';
                });
                if(objs.length === this.multiObjects.length)
                    type = 'text';

                this.multiObjectsType = type;

                if(!this.multiObjects[0].valign)
                    this.multiObjects[0].valign = 'top';
            }
        },
        computed: {
            getMultipleObjectType() {
            },
            ...mapGetters('scenes', ['params','currentObject']),
            ...mapState('scenes', ['multiObjects']),
            ...mapState('canvas', ['canvas']),
        },
        components: {Tooltip, SizeControls, AlignControls, Colorpicker, NumberInput, Checkbox, Section},
        data() {
            return {
                fonts,
                multiObjectsType: 'mixed'
            }
        },
        methods: {
            onChangeSlider(e) {
                this.$emit('change', e);
            },
            setEqualSized(state) {                
                this.multiObjects.map(obj => {
                    if (state) {
                        obj.width = obj.height;
                        obj.scaleX = obj.scaleY;
                        this.onChangeAlign();
                        obj._proportion = 1;
                        obj.proportionLocked = true;
                    } else {
                        obj._proportion = null;
                        obj.proportionLocked = false;
                    }
                });
                var objs = this.multiObjects;
                this.canvas.discardActiveObject();
                var sel = new fabric.ActiveSelection(objs, {
                    canvas: this.canvas,
                });
                this.canvas.setActiveObject(sel);
                this.canvas.renderAll();
            },
            onChange(e) {
                this.$emit('change', e);
                
                this.multiObjects.map(obj => {
                    obj.updateWidthHeight();
                });

                this.canvas.renderAll();
            },
            onChangeAlign() {
                this.onChange();
            },
            setAlign(align) {
                this.multiObjects.map(obj => {obj.textAlign = align});
                this.onChange('textAlign');
            },
            setVerticalAlign(align) {
                
                this.multiObjects.map(obj => {

                    var text = obj.text;
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
                    var lineheight = obj.fontSize * obj.lineHeight * obj._fontSizeMult
                    var totallines = Math.floor(obj.height / lineheight);
                    var remlines = totallines - curlines;              

                    if(align === 'bottom') {
                        var finalText = '';
                        for (var i = 0; i < remlines; i++) {
                            finalText += "\n";
                        }
                        finalText += origText;
                        obj.text = finalText;
                    }
                    if(align === 'top') {
                        obj.text = origText;
                    }
                    if(align === 'center') {      
                        var finalText = '';
                        for (var i = 0; i < remlines/2; i++) {
                            finalText += "\n";
                        }         
                        finalText += origText;
                        obj.text = finalText;
                    }
                    this.canvas.renderAll();
                    obj.updateWidthHeight();
                    obj.valign = align;
                });
                this.onChange('valign');
                this.canvas.renderAll();
            },
            setBold() {
                var fW = this.multiObjects[0].fontWeight;
                this.multiObjects.map(obj => {
                    obj.fontWeight = fW === 'bold' ? 'normal' : 'bold';
                });
                this.onChange('fontWeight');
            },
            setItalic() {
                var fS = this.multiObjects[0].fontStyle;
                this.multiObjects.map(obj => {
                    obj.fontStyle = fS === 'italic' ? 'normal' : 'italic';
                });
                this.onChange('fontStyle');
            },
            setUnderline() {
                var fU = this.multiObjects[0].underline;
                this.multiObjects.map(obj => {
                    obj.underline = !fU;
                });
                this.onChange('underline');
            },
            setAutoSize() {
                if (this.multiObjects[0].autoSize) {
                    const rect = this.multiObjects[0].getBoundingRect();
                    if (this.multiObjects[0].textAlign === 'left' || this.multiObjects[0].textAlign === 'center') {
                        let maxLeft = Math.max.apply(null, [].concat.apply([], this.multiObjects[0].__charBounds).map(char => char.left + char.width));
                        this.multiObjects[0].width = maxLeft;
                        this.updateObjectParam({key: 'width', value: maxLeft});
                        if (this.multiObjects[0].textAlign === 'center') {
                            this.multiObjects[0].left+= maxLeft * 2;
                            this.updateObjectParam({key: 'left', value: this.multiObjects[0].left});
                        }
                    }
                    this.multiObjects[0].height = rect.height;
                    this.updateObjectParam({key: 'height', value: rect.height});
                    this.onChange();
                }
            },
            ...mapMutations('scenes', ['updateObjectParam'])
        },
    }
</script>
<template>
    <div class="shape-controls" v-if="multiObjectsType === 'mixed'">
        <Section>
            <div slot="title">Size & position</div>
            <SizeControls @change="onChange" />
        </Section>
        <Section>
            <div slot="title">Align</div>
            <AlignControls @change="onChangeAlign" />
        </Section>        
    </div>
    <div class="text-controls" v-else-if="multiObjectsType === 'text'">
        <Section>
            <div slot="title">Size & position</div>
            <SizeControls @change="onChange" />
        </Section>
        <Section>
            <div slot="title">Align</div>
            <AlignControls @change="onChangeAlign" />
        </Section>
        <Section>
            <div slot="title">Text tools</div>
            <div class="inputs-row">
                <select class="select text-controls__font-family" v-model="multiObjects[0].fontFamily" @change="() => onChange('fontFamily')" >
                    <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
                </select>
                <select class="select text-controls__font-size" v-model="multiObjects[0].fontSize" @change="()  => onChange('fontSize')">
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
                <div @click="setBold" class="controls__buttons__item" :class="{'controls__buttons__item--active' : multiObjects[0].fontWeight === 'bold'}">
                    <Tooltip>Bold</Tooltip>
                    <img src="images/icn-text-bold.svg">
                </div>
                <div @click="setItalic" class="controls__buttons__item" :class="{'controls__buttons__item--active' : multiObjects[0].fontStyle === 'italic'}">
                    <Tooltip>Italic</Tooltip>
                    <img src="images/icn-text-italic.svg">
                </div>
                <div @click="setUnderline" class="controls__buttons__item" :class="{'controls__buttons__item--active' : multiObjects[0].underline}">
                    <Tooltip>Underline</Tooltip>
                     <img src="images/icn-text-underline.svg">
                </div>
            </div>
            <div class="controls__buttons">
                <div @click="setAlign('left')" class="controls__buttons__item " :class="{'controls__buttons__item--active': multiObjects[0].textAlign === 'left'}">
                    <Tooltip>Align left</Tooltip>
                    <img src="images/icn-text-left.svg">
                </div>
                <div @click="setAlign('center')" class="controls__buttons__item " :class="{'controls__buttons__item--active': multiObjects[0].textAlign === 'center'}">
                    <Tooltip>Align center</Tooltip>
                    <img src="images/icn-text-center.svg">
                </div>
                <div @click="setAlign('right')" class="controls__buttons__item " :class="{'controls__buttons__item--active': multiObjects[0].textAlign === 'right'}">
                    <Tooltip>Align right</Tooltip>
                    <img src="images/icn-text-right.svg">
                </div>
                <div class="controls__buttons__delimiter"></div>
                <div @click="setVerticalAlign('top')" class="controls__buttons__item " :class="{'controls__buttons__item--active': multiObjects[0].valign === 'top'}">
                    <Tooltip>Align top</Tooltip>
                    <img src="images/icn-text-top.svg">
                </div>
                <div @click="setVerticalAlign('center')" class="controls__buttons__item " :class="{'controls__buttons__item--active': multiObjects[0].valign === 'center'}">
                    <Tooltip :left="true">Align middle</Tooltip>
                    <img src="images/icn-text-middle.svg">
                </div>
                <div @click="setVerticalAlign('bottom')" class="controls__buttons__item " :class="{'controls__buttons__item--active': multiObjects[0].valign === 'bottom'}">
                    <Tooltip :left="true">Align bottom</Tooltip>
                    <img src="images/icn-text-bottom.svg">
                </div>
            </div>
            <Checkbox title="Word wrap" v-model="multiObjects[0].splitByGrapheme" @change="()  => onChange('splitByGrapheme')" />
            <div class="input-block input-block--line">
                <label class="input-block__title">Color</label>
                <Colorpicker v-model="multiObjects[0].fill" @change="() => onChange('fill')" />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Opacity</label>
                <NumberInput v-model="multiObjects[0].opacity" :min="0" :max="100" :step="1" :multiplier="100" @change="() => onChange('opacity')" textAfter="%" />
            </div>
            <Checkbox title="Auto-size" v-model="multiObjects[0].autoSize" @change="() => setAutoSize()" />
        </Section>
    </div>
    <div class="shape-controls" v-else-if="multiObjectsType === 'shape'">
        <Section>
            <div slot="title">Size & position</div>
            <SizeControls @change="onChange" />
        </Section>
        <Section>
            <div slot="title">Align</div>
            <AlignControls @change="onChangeAlign" />
        </Section>
        <Checkbox title="Equal-sized" v-model="multiObjects[0].equalSized" @change="(e) => setEqualSized(e)" />
        <Section :is-expanded="true">
             <div slot="title">Fill</div>
            <div class="inputs-row">
                <div class="input-block input-block--line">
                    <Colorpicker v-model="multiObjects[0].fill" @change="() => onChangeSlider('fill')" :withOpacity="true" />
                </div>
            </div>
       </Section>
      <Section :is-expanded="true">
          <div slot="title">Line</div>
              <div class="input-block input-block--line">
                  <Colorpicker v-model="multiObjects[0].stroke" @change="() => onChangeSlider('stroke')" :withOpacity="true" />
              </div>
              <div class="input-block input-block--line">
                  <label class="input-block__title">Thickness</label>
                  <NumberInput v-model="multiObjects[0].strokeWidth" :min="0" :max="100" :step="1" @change="() => onChange('strokeWidth')"  />
              </div>
        </Section>
    </div>
</template>
<style lang="scss">
    .text-controls {
        &__font-family {
            flex: 1;
            margin-right: 8px;
        }
    }
</style>
