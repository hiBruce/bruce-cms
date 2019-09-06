<template>
    <div id="app" v-cloak style="height: 100%;background: #fff">
        <transition name="fade" mode="out-in">
            <router-view class="view" style="height: 100%"></router-view>
        </transition>
    </div>
</template>
<script>
    export default {
    };
</script>
<style lang="less">
</style>
