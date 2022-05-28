<template>
  <div>
    <div class="home_container">
      <keep-alive>
        <!-- 二级路由页面 -->
      <router-view></router-view>
      </keep-alive>
    </div>
    <div>
      <van-tabbar v-model="active" route>
        <van-tabbar-item icon="home-o" to="/layout/home">首页</van-tabbar-item>
        <van-tabbar-item icon="setting-o" to="/layout/user"
          >我的</van-tabbar-item
        >
      </van-tabbar>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Layout',
  data () {
    return {
      active: 0
    }
  }
}
</script>

<style scoped lang="less">
.home_container {
  padding-bottom: 50px;
}
.van-tabbar {
  border-top: 1px solid #f8f8f8;
}
</style>
