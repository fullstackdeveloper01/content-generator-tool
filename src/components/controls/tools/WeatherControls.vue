<script>

    const axios = require('axios');
    import {mapGetters, mapState, mapMutations} from 'vuex';
    import Section from "@/components/layout/Section";
    import NumberInput from "../custom/NumberInput";
    import Colorpicker from "../custom/Colorpicker";
    import AlignControls from "../common/AlignControls";
    import SizeControls from "../common/SizeControls";
    import Modal from "../../layout/Modal";

    export default {
        computed: {
            ...mapGetters('scenes', ['params','currentObject']),
            ...mapState('scenes', ['fabricObject']),
            ...mapState('canvas', ['canvas']),
        },
        components: {SizeControls, AlignControls, Colorpicker, NumberInput, Section, Modal},
        data() {
            return {
            }
        },
        mounted() {
         
            this.getWeatherData();
            this.fabricObject.units = 'c';
            this.fabricObject.edition = 'flexible'; 
            this.fabricObject.weatherData = {
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
        },
        methods: {
           async getWeatherData(){
               await axios.get("https://mocki.io/v1/747e81d2-e404-4b14-8901-7ec77c158b52")
                    .then(response => {    
                        console.log("response.data",response.data);           
                        this.fabricObject.weatherData = response.data;
                    })
                    .catch(error => {
                        this.errors = error.response.data
                    })
            },
            onChange(e) {
                this.$emit('change', e);
                this.canvas.renderAll();
            },
            onChangeAlign() {
                this.onChange();
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
            <div slot="title">Parameters</div>            
            <div class="input-block input-block--line">
                <label class="input-block__title">WOEID</label>
                <input
                    v-model="fabricObject.woeid"
                    class="input-block__el"
                />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Units</label>
                <select class="select" v-model="fabricObject.units">
                    <option value="c">C</option>
                    <option value="f">F</option>
                </select>
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Edition</label>
                <select class="select" v-model="fabricObject.edition">
                    <option value="flexible">Flexible</option>
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                </select>
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Color</label>
                <Colorpicker v-model="fabricObject.fill" @change="() => onChange('fill')" />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">BG Color</label>
                <Colorpicker v-model="fabricObject.textBackgroundColor" @change="() => onChange('textBackgroundColor')" />
            </div>
            <div class="input-block input-block--line">
                <label class="input-block__title">Opacity</label>
                <NumberInput v-model="fabricObject.opacity" :min="0" :max="100" :step="1" :multiplier="100" @change="() => onChange('opacity')" textAfter="%" />
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
