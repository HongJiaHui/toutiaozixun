<template>
  <div>
    <!-- 有些一级路由页面无需缓存 -->
    <!-- include需要缓存的组件 exclude不需要缓存的组件 -->
    <keep-alive exclude="Search,SearchResult,Detail,UserEdit">
      <!-- 一级路由挂载点 -->
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>
