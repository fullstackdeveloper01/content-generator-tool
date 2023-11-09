<script>
    //https://gist.github.com/Jonarod/8553d88b1b0d1e1898ff1b5c951b00cc
    export default {
        model: {
            prop: 'modelValue',
            event: 'change'
        },
        computed: {
            isChecked() {
                return this.modelValue == this.value;
            }
        },
        props: {
            title: {
                type: String,
                required: false,
            },
            name: { type: String, default: undefined },
            modelValue: { default: "" },
            value: { type: String, default: undefined }
        }
    }
</script>
<template>
    <label class="radio">
        <input type="radio" :name="name" :checked="isChecked" :value="value" @change="$emit('change', $event.target.value)" />
        <span class="radio__title">{{title}}</span>
    </label>
</template>
<style lang="scss">
    .radio {
        display: block;
        padding: 4px 0;
        cursor: pointer;
        &__el {
            display: none;
        }
        &__square {
            width: 12px;
            height: 12px;
            background: #fff;
            display: inline-block;
            cursor: pointer;
            position: relative;
        }
        &__title {
            font-size: 12px;
            color: #fff;
            margin: 0 0 0 4px;
            display: inline-block;
            position: relative;
            top: -1px;
        }
        &__el:checked + &__square:before {
            content: "";
            display: block;
            position: absolute;
            top: 3px;
            left: 3px;
            background: #0e1025;
            width: 6px;
            height: 6px;
        }
    }
</style>
