<script>
    import NumberInput from "@/components/controls/custom/NumberInput";
    import Colorpicker from "@/components/controls/custom/Colorpicker";
    export default {
        components: {NumberInput, Colorpicker},
        watch: {
            "effect.params": {
                handler() {
                    this.$emit('input', this.effect);
                },
                deep: true
            }
        },
        data() {
            return {
                effect: this.value
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

