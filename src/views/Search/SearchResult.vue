<template>
  <div>
    <!-- 搜索结果页-头部导航 -->
    <div class="search-result-container">
      <!-- 点击实现后退效果 -->
      <van-nav-bar
        title="搜索结果"
        left-arrow
        @click-left="$router.go(-1)"
        fixed
      />
    </div>
    <!-- 文章列表 -->
    <div>
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :immediate-check="false"
      >
        <ArticleItem
          v-for="obj in articleList"
          :key="obj.art_id"
          :artObj="obj"
          :isShow="false"
          @click.native="itemClickFn(obj.art_id)"
        ></ArticleItem>
      </van-list>
    </div>
  </div>
</template>

<script>
// 事件修饰符.native -> 给组件内根标签，绑定原生click点击事件
import ArticleItem from '@/views/Home/components/ArticleItem.vue'
import { searchResultAPI } from '@/api'
export default {
  name: 'SearchResult',
  data () {
    return {
      page: 1, // 页码
      articleList: [], // 文章列表
      loading: false, // 加载状态
      finished: false // 是否全部加载完成
    }
  },
  async created () {
    const res = await searchResultAPI({
      page: this.page,
      // kw来自路由路径里传参的参数名 来源于router/index.js你定义的动态路由参数名
      q: this.$route.params.kw
    })
    // console.log(res)
    this.articleList = res.data.data.results
  },
  components: {
    ArticleItem
  },
  methods: {
    async onLoad () {
      if (this.articleList.length > 0) {
        this.page++
        const res = await searchResultAPI({
          page: this.page,
          // kw来自路由路径里传参的参数名 来源于router/index.js你定义的动态路由参数名
          q: this.$route.params.kw
        })
        if (res.data.data.results.length === 0) {
          // 没有更多数据
          this.finished = true
          return
        }
        // console.log(res)
        this.articleList = [...this.articleList, ...res.data.data.results]
        this.loading = false
      }
    },
    // 跳转到详情
    itemClickFn (id) {
      this.$router.push({ path: `/detail?art_id=${id}` })
    }
  }
}
</script>

<style lang="less" scoped>
.search-result-container {
  padding-top: 46px;
}
</style>
