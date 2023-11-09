<script>
    export default {
        watch: {
            value(newValue) {
                this.val = newValue;
            },
            val(newVal) {
                this.$emit('change', newVal);
                this.$emit('input', newVal);
            }
        },
        data() {
            return {
                val: this.value,
            }
        },
        props: {
            title: {
                type: String,
                required: false,
            },
            value: {
                type: Boolean,
                required: false,
                default: false
            }
        }
    }
</script>
<template>
    <label class="checkbox">
        <input type="checkbox" v-model="val"  />
        <span class="checkbox__title">{{title}}</span>
    </label>
</template>
<style lang="scss">
    .checkbox {
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
