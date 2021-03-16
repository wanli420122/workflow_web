<template>
  <div id="thome">
    <nav-menu></nav-menu>
    <router-view />
  </div>
</template>

<script>
import navMenu from "./navMenu.vue";
export default {
  name: "thome",
  data: function() {
    return {};
  },
  components: {
    navMenu, // 导航栏
  },

};
</script>

<style>

</style>

