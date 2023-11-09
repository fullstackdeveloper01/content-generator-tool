<script>
    import NumberInput from "@/components/controls/custom/NumberInput";
    import Colorpicker from "@/components/controls/custom/Colorpicker";
    export default {
        components: {NumberInput, Colorpicker},
        watch: {
            "animation.params": {
                handler() {
                    this.$emit('input', this.animation);
                },
                deep: true
            }
        },
        data() {
            return {
                animation: this.value
            }
        },
        props: {
            value: {
                type: Object,
                required: true
            }
        }
    }
</script>
<template>
    <div></div>
</template>

