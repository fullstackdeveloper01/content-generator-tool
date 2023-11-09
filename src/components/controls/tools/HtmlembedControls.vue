<script>
    import {mapGetters, mapState, mapMutations} from 'vuex';
    import FileInput from "@/components/controls/custom/FileInput";
    import Section from "@/components/layout/Section";
    import AlignControls from "../common/AlignControls";
    import SizeControls from "../common/SizeControls";

    export default {
        computed: {
            ...mapGetters('scenes', ['params','currentObject']),
            ...mapState('scenes', ['fabricObject']),
            ...mapState('canvas', ['canvas']),
        },
        components: {SizeControls, AlignControls, Section, FileInput},
        data() {
            return {
            }
        },
        mounted() {
        },
        methods: {
            setHtmlSource(e) {

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
            <div slot="title">Source</div>            
            <div class="input-block input-block--line">
                <FileInput :extensions="['html']" v-model="fabricObject.url" @change="(e) => setHtmlSource(e)"  />                        
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
