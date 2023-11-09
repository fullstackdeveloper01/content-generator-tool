<script>
    import EventBus from "@/EventBus";
    export default {
        props: {
            isExpanded: {
                type: Boolean,
                required: false,
            }
        },
        data() {
            return {
                expanded: this.isExpanded || false,
            }
        },
        mounted() {
            if (this.isExpanded) {
                this.expanded = true;
                setTimeout(() => {
                    this.expand();
                }, 1)
            }
            EventBus.$on('ExpandContentSection', this.expand);
        },
        methods: {
            toggle() {
                if (!this.expanded) {
                    this.expanded = true;
                    setTimeout(() => {
                        this.expand();
                    }, 1)
                } else {
                    const contentEl = this.$refs.contentEl;
                    if (contentEl) {
                        contentEl.style.height = '0px';
                        contentEl.addEventListener('transitionend', () => {
                            this.expanded = false;
                        }, {
                            once: true
                        });
                    }
                }
            },
            expand() {
                const contentEl = this.$refs.contentEl;
                if(contentEl){
                    contentEl.style.opacity = 0;
                    contentEl.style.height = 'auto';
                    let height = contentEl.clientHeight + 'px';
                    contentEl.style.height = '0px';
                    setTimeout(function () {
                        contentEl.style.height = height;
                        contentEl.style.opacity = 1;
                    }, 0);
                }
            }
        },
        beforeDestroy() {
          EventBus.$off('ExpandContentSection');
        }
    }




</script>
<template>
<div class="section">
    <div class="section__title" @click="toggle">
        <slot name="title"></slot>
        <div class="section__arrow" :class="{'section__arrow--active': expanded}"><svg viewBox="0 0 8 6" ><polygon points="0,1 8,1 4,6" style="fill:#4C5F8A;"></polygon></svg></div>
    </div>
    <div class="section__content" :style="!expanded ? 'display:none' : ''" ref="contentEl">
        <slot></slot>
    </div>
</div>
</template>
<style lang="scss">

    .section {
        &__content {
            width: calc(100% - 6px);
            transition: all 0.35s ease-in-out;
            overflow: hidden;
        }
        &__title {
            width: calc(100% - 6px);
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            color: #D8E0EF;
            font-size: 11px;
            height: 32px;
            margin-bottom: 8px;
            border-bottom: 1px solid #1E2139;
        }

        &__arrow {
            width: 10px;
            height: 10px;
            margin: 0 5px 4px 0;
            padding: 10px;
            svg {
                transform: rotate(0deg);
                transform-origin: center;
                transition: transform .25s;
            }
            &--active svg {
                transform: rotate(180deg);
            }
        }
    }
</style>
