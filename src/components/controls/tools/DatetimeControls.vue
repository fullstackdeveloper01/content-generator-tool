<script>
    import {mapGetters, mapState, mapMutations} from 'vuex';
    import Section from "@/components/layout/Section";
    import NumberInput from "../custom/NumberInput";
    import Colorpicker from "../custom/Colorpicker";
    import Radio from "../custom/Radio";
    import AlignControls from "../common/AlignControls";
    import SizeControls from "../common/SizeControls";
    import Tooltip from "@/components/layout/Tooltip";
    import Modal from "../../layout/Modal";
    import getObjectFromToolName from "@/helpers/getObjectFromToolName";

    const fonts = ['Arial','Arial Black','Calibri','Calibri Light','Cambria','Cambria Math','Candara','Candara Light','Comic sans ms','consolas','Constantia','Corbel','Corbel Light','Courier new','Cursive','Fantasy','Gabriola','Gadugi','Georgia','Impact','Ink free','Javanese Text','Leelawadee ui','Leelawadee ui light','Lucida console','Lucida sans unicode','MS Gothic','MS PGothic','MS UI Gothic','MV Boli','Malgun Gothic','Malgun Gothic Light','Microsoft Himalaya','Microsoft Sans Serif','MingLiU-ExtB','Mongolian Baiti','Monospace','Myanmar Text','NSimsun','Nirmala UI','Nirmala UI Light','PMingLiU-ExtB','Palatino Linotype','Sans-serif','Segoe Print','Segoe Script','Segoe UI','Segoe UI Black','Segoe UI Historic','Segoe UI Light','Segoe UI SemiBold','Segoe UI Symbol','SimSun','SimSun-ExtB','Sitka Banner','Sitka Display','Sitka Heading','Sitka Small','Sitka Subheading','Sitka Text','Sylfaen','Tahoma','Teamviewer15','Times New Roman','Trebuchet MS','Verdana','Yu Gothic','Yu Gothic Light','Yu Gothic Medium','Yu Gothic UI Light','Yu Gothic UI Semibold'];
    let timeouts = {};

    export default {
        computed: {
            ...mapGetters('scenes', ['params','currentObject']),
            ...mapState('scenes', ['fabricObject', 'currentSceneIndex']),
            ...mapState('canvas', ['canvas']),
        },
        components: {Tooltip, SizeControls, AlignControls, Colorpicker, NumberInput, Section, Modal, Radio},
        data() {
            return {
                patterns: [
                    {format:'YY',desc:'Two-digit year'},
                    {format:'YYYY',desc:'Four-digit year'},
                    {format:'M',desc:'Month (1-12)'},
                    {format:'MM',desc:'Month (01-12)'},
                    {format:'mmm',desc:'Month (jan-dec)'},
                    {format:'Mmm',desc:'Month (Jan-Dec)'},
                    {format:'MMM',desc:'Month (JAN-DEC)'},
                    {format:'mmmm',desc:'Month january-december)'},
                    {format:'Mmmm',desc:'Month (January-December)'},
                    {format:'MMMM',desc:'Month (JANUARY-DECEMBER)'},
                    {format:'D d',desc:'Day of month (1-31)'},
                    {format:'DD. dd',desc:'Day of month (01-31)'},
                    {format:'E. e',desc:'Day of week (1-7)'},
                    {format:'EE ee',desc:'Day of week (01-07)'},
                    {format:'ddd, eee',desc:'Day of week (mon-sun)'},
                    {format:'Ddd, Eee',desc:'Day of week (Mon-Sun)'},
                    {format:'DDD. FEE',desc:'Day of week (MON-SUN)'},
                    {format:'dodd, eeee',desc:'Day of week (monday-sunday)'},
                    {format:'Dddd. Eeee',desc:'Day of week (Monday-Sunday)'},
                    {format:'DDDD. EEEE',desc:'Day of week (MONDAY-SUNDAY)'},
                    {format:'a',desc:'am/pm'},
                    {format:'A',desc:'AM/PM'},
                    {format:'J',desc:'Hour in day (0-23)'},
                    {format:'JJ',desc:'Hour in day (00-23)'},
                    {format:'H',desc:'Hour in day (1-24)'},
                    {format:'HH',desc:'Hour in day (01-24)'},
                    {format:'K',desc:'Hour in day (0-11)'},
                    {format:'KK',desc:'Hour in day (00-11)'},
                    {format:'L.h',desc:'Hour in day (1-12)'},
                    {format:'LL. hh',desc:'Hour in day (01-12)'},
                    {format:'N, m',desc:'Minute in hour (0-59)'},
                    {format:'NN. mm',desc:'Minute in hour (00-59)'},
                    {format:'S. s',desc:'Second in minute (0-59)'},
                    {format:'SS. sS',desc:'Second in minute (00-59)'}
                ],
                fonts,
                helpModal: {
                    visible: false
                },
                clockType: 'digital',
            }
        },
        methods: {
            ...mapMutations('scenes', ['addObjectToScene', 'removeObjectFromScene']),
            onChangeSlider(e) {
                clearTimeout(timeouts[e]);
                timeouts[e] = setTimeout(() => {
                    this.$emit('change', e);
                }, 250)

            },
            async setTimeType(e) {
                var object = this.fabricObject;
                if (object && object.objectType === 'datetime' && e === 'clock') {
                    this.canvas.remove(object);                        
                    this.removeObjectFromScene(object);
                    let positionParams = {
                        left: object.left,
                        top: object.top,
                        width: 300,
                        height: 300,
                    };
                    let data = await getObjectFromToolName('analogdatetime', false, {}, positionParams, this.canvas, false, this.currentSceneIndex);
                    if (data && data.object) {
                        data.object.selectable = true;

                        //copy props inclue the below props.
                        var nProps = ['left', 'top', 'originX', 'originY'];
                        Object.keys(object).forEach(function(key) {
                            if(nProps.includes(key)) {
                                console.log(key, object[key]);
                                data.object[key] = object[key];
                            }
                        });

                        this.canvas.add(data.object);

                        this.canvas.setActiveObject(data.object);
                        this.canvas.renderAll();
 
                        this.addObjectToScene(data);
                        // return data.object;
                    }
                }
            },
            onChange(e) {
                this.$emit('change', e);
                this.canvas.renderAll();
            },
            onChangeAlign() {
                this.onChange();
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
        },
    }

</script>
<template>
    <div class="text-controls" v-if="currentObject && fabricObject">
        <Section>
            <div slot="title">Size & position</div>
            <SizeControls @change="onChange" />
        </Section>
        <Section>
            <div slot="title">Align</div>
            <AlignControls @change="onChangeAlign" />
        </Section>         
        <Section>
            <div slot="title">Type</div>
            <div class="inputs-row">
                <Radio title="Digital" name='timetype' value='digital' v-model="clockType" @change="(e) => setTimeType(e)" />
                <Radio title="Clock" name='timetype' value='clock' v-model="clockType" @change="(e) => setTimeType(e)" />
            </div>
        </Section>
        <div v-if="clockType === 'digital'">
            <Section>
                <div slot="title">Text Format</div>
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
            </Section>
            <Section>
                <div slot="title">Parameters</div>            
                <div class="input-block input-block--line">
                    <label class="input-block__title">Pattern</label>
                    <input
                        v-model="fabricObject.pattern"
                        class="input-block__el"
                    />
                    <a @click="helpModal.visible = true" class="file-input__button">
                    <img :src="'images/ic-cursor-list.svg'" />
                    </a>
                </div>
            </Section>
            <Section :is-expanded="true">
                <div slot="title">Color</div>
                <div class="inputs-row">
                    <div class="input-block input-block--line">
                        <Colorpicker v-model="fabricObject.fill" @change="() => onChangeSlider('fill')" :withOpacity="true" />
                    </div>
                </div>
            </Section>       
            <Section :is-expanded="true">
                <div slot="title">BG Color</div>
                <div class="inputs-row">
                    <div class="input-block input-block--line">
                        <Colorpicker v-model="fabricObject.textBackgroundColor" @change="() => onChangeSlider('textBackgroundColor')" :withOpacity="true" />
                    </div>
                </div>
            </Section>
        </div>
        <Modal title="Time Patterns" v-model="helpModal.visible" v-if="helpModal.visible">
            <div class="helpcontainer">
                <table class="table-help">
                    <thead>
                        <tr>
                            <th>Pattern</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="pattern in patterns" :key="pattern.id">
                            <td>{{pattern.format}}</td>
                            <td>{{pattern.desc}}</td>
                        </tr>
                    </tbody>
                </table>
            </div> 
            <div class="modal__buttons">
                <a @click="helpModal.visible = false" class="button button--secondary">OK</a>
            </div>
        </Modal>

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
