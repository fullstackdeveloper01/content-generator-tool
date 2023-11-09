<script>
    export default {
        watch: {
            visible(isVisible) {
                this.$emit('input', isVisible);
            },
            value(newVal) {
                this.visible = newVal;
            }
        },
        methods: {
            hide() {
                this.visible = false;
                this.$emit('close');
            }
        },
        data() {
            return {
                visible: this.value
            }
        },
        props: {
            transparent: {
                type: Boolean,
                required: false,
                default: false
            },
            title: {
                type: String,
                required: false,
            },
            value: {
                type: Boolean,
                required: false,
                default: false
            },
            isVisible: {
                type: Boolean,
                required: false,
                default: false
            }
        }
    }
</script>
<template>
<div class="modal" :class="{'modal--transparent': transparent}" v-if="visible || isVisible">
    <div class="modal__background"></div>
    <div class="modal__window">
        <div class="modal__heading">
            {{title}}
            <a @click="hide()" class="modal__close">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                 viewBox="0 0 512.001 512.001" style="enable-background:new 0 0 512.001 512.001;" xml:space="preserve">
<g>
	<g>
		<path d="M284.286,256.002L506.143,34.144c7.811-7.811,7.811-20.475,0-28.285c-7.811-7.81-20.475-7.811-28.285,0L256,227.717
			L34.143,5.859c-7.811-7.811-20.475-7.811-28.285,0c-7.81,7.811-7.811,20.475,0,28.285l221.857,221.857L5.858,477.859
			c-7.811,7.811-7.811,20.475,0,28.285c3.905,3.905,9.024,5.857,14.143,5.857c5.119,0,10.237-1.952,14.143-5.857L256,284.287
			l221.857,221.857c3.905,3.905,9.024,5.857,14.143,5.857s10.237-1.952,14.143-5.857c7.811-7.811,7.811-20.475,0-28.285
			L284.286,256.002z"/>
	</g>
</g>
</svg>
            </a>
        </div>
        <div class="modal__content">
            <slot></slot>
        </div>
    </div>
</div>
</template>
<style lang="scss">
   .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0F1127;
        &--transparent {
            display: none;
        }
        &__files-list {
           max-height: 50vh;
           overflow: auto;
           &__item {
             cursor: pointer;
             border-bottom: 1px solid #ccc;
             padding: .5em;

             &:hover {
               background: #fafafa;
             }
           }
        }
        &__background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            background: rgba(30, 33, 57, 0.5);
        }

        &__window {
            min-width: 400px;
            background: #fff;
            position: relative;
            z-index: 10;
        }

        &__heading {
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: bold;
            border-bottom: 1px solid #ccc;
        }

        &__close {
            width: 20px;
            cursor: pointer;
        }

        &__content {
            padding: 16px;
        }
        &__buttons {
            margin: 24px 0 0;
            text-align: right;
        }
        &__list {
            max-height: 75vh;
            overflow: auto;
            overflow-x: hidden;
            background: #9ab1e1;
        }
        &__select {
            margin: 12px 0 0;
            display: flex;
            align-items: center;

            &__el {
                flex: 1;
                margin: 0 0 0 24px;
            }

            &__text {
                font-size: 14px;
            }
        }
        &__section {
            &__content {
                padding: 0 8px 8px;
            }
            &__title {
                display: flex;
                align-items: center;
                flex: 1;
            }
            &__delete {
                width: 16px;
                margin-left: auto;
                cursor: pointer;
            }
        }

        .select {
            margin: 0 4px;
            background: #fff;
            color: #0F1127;
        }
        .section__title {
            color: #fff!important;
            border-top: 1px solid #fff;
            border-bottom: none!important;
            padding-left: 8px;
            margin-bottom: 0;
        }

        .input-block__title {
            color: #0F1127;
        }
        .number-input__el, .input-block__el {
            color: #4C5F8A!important;
            background: #fff!important;
        }
    }

</style>
