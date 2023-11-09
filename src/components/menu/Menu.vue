<template>
    <div class="menu">
        <MainMenu />
        <ToolsMenu />
        <RightMenu />
    </div>
</template>
<script>
    import ToolsMenu from "./ToolsMenu";
    import MainMenu from "./MainMenu";
    import RightMenu from "./RightMenu";
    export default {
        components: {RightMenu, MainMenu, ToolsMenu}
    }
</script>
<style lang="scss">
    .menu  {
        height: 66px;
        width: 100%;
        background-color: #6F91D9;
        display: flex;
        align-items: center;
        &__text-button {
          transition: background .2s;
          background: #afc9ff;
          display: inline-block;
          text-transform: uppercase;
          font-size: 14px;
          height: 20px;
          line-height: 20px;
          padding: 4px 14px;
          border-radius: 4px;
          margin: 7px 0;
          cursor: pointer;

          &:hover {
            background: #5977B8;
          }
        }
        &__button {
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            background: #6F91D9;
            color: #fff;
            text-transform: none;
            font-weight: normal;
            font-size: 13px;
            line-height: 40px;
            padding: 0 18px;
            text-decoration: none;
            transition-duration: 0.5s;
            @media screen and (max-width: 1366px) {
              padding: 0 14px;
            }
            @media screen and (max-width: 1200px) {
              padding: 0 10px;
            }
            &:hover {
                background: #5977B8;
                color: #fff;
            }
            &--selected {
                background: #5977B8;
            }
            &__icon {
                height: 36px;
                padding: 0;
                margin: 0 8px 0 0;
            }
        }
        &__vertical-line {
            border-left: 1px solid #5977B8;
            height: 40px;
            margin: 0 20px;
            &--no-margin-left {
                margin-left: 0;
            }
            &--no-margin-right {
                margin-right: 0;
            }
        }
    }
</style>
