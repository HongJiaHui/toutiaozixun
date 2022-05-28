<template>
  <div>
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :immediate-check="false"
        offset="50"
      >
        <Articleltem
          v-for="obj in list"
          :key="obj.art_id"
          :artObj="obj"
          @disLikeEV="disLikeFn"
          @reports='reportsFn'
          @click.native="itemClickFn(obj.art_id)"
        ></Articleltem>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import Notify from '@/Ui/Notify'
import Articleltem from './ArticleItem.vue'
// 每一个list都对应自己的ArticleItem，所有自己的孩子要自己管
import { getAllArticleListAPI, dislikeArticleAPI, reportsAPI } from '@/api'

// 问题1：网页刚打开时，created里请求和onLoad里请求同时发送，请求的都说最新数据
// onLoad中，2次一样的数据合并，数据重复，key重复了
// 原因：van-list组件，组件挂载时，默认就会判定一次是否触底
// 第一页数据也是网络请求回来的，标签先挂载了，数据回来更新DOM，所以标签没有高度，list的load事件上来就触发
export default {
  props: {
    // 文章列表数组
    // list: Array
    channelId: Number // 频道ID
  },
  data () {
    return {
      list: [], // 文章列表数组
      loading: false, // 底部加载状态
      finished: false, // 底部是否完成状态
      theTime: new Date().getTime(), // 默认为系统时间，用于分页
      isLoading: false // 顶部加载状态
    }
  },
  components: {
    Articleltem
  },
  async created () {
    this.getArticleListFn()
  },
  methods: {
    // 专门负责发送请求
    async getArticleListFn () {
      const res = await getAllArticleListAPI({
        channel_id: this.channelId,
        timestamp: this.theTime
      })
      // pre_timestamp
      // 下一段开头的那篇文章时间戳
      // 第一次 系统时间(timestamp) -> 后台返回0-9条数据 -> 携带第10条pre_timestamp值返回
      // 第二次（timestamp）-上一次pre_timestamp（代表告诉后台，从指定的时间戳再往后找10个）10-19条数据，第20条pre_timestamp返回 以此类推
      this.list = [...this.list, ...res.data.data.results]
      this.theTime = res.data.data.pre_timestamp

      this.loading = false
      // 判断：如果本次prt_timestamp为空，证明没有数据了 那么就不执行触底
      if (res.data.data.pre_timestamp === null) {
        this.finished = true
      }

      // 顶部的加载状态要改为false
      this.isLoading = false
    },
    // 底部加载事件方法
    async onLoad () {
      if (this.list.length === 0) {
        return // 如果页面没有数据，没有高度，让本次onLoad逻辑代码不往下执行
      }
      this.getArticleListFn()
      // const res = await getAllArticleListAPI({
      //   channel_id: this.channelId,
      //   timestamp: this.theTime
      // })
      // // pre_timestamp
      // // 下一段开头的那篇文章时间戳
      // // 第一次 系统时间(timestamp) -> 后台返回0-9条数据 -> 携带第10条pre_timestamp值返回
      // // 第二次（timestamp）-上一次pre_timestamp（代表告诉后台，从指定的时间戳再往后找10个）10-19条数据，第20条pre_timestamp返回 以此类推
      // // 解决方案1：list组件添加 :immediate-check="false" 上来初始化时不要判定
      // // 解决方案2：onLoad第一行，写数组长度的判断

      // this.list = [...this.list, ...res.data.data.results]
      // this.theTime = res.data.data.pre_timestamp
      // 记得把加载状态关闭,否则底部一直是加载中的状态，下次触底不会再出发onLoad
      // this.loading = false
      // // 判断：如果本次prt_timestamp为空，证明没有数据了 那么就不执行触底
      // if (res.data.data.pre_timestamp === null) {
      //   this.finished = true
      // }
    },
    // 顶部-刷新数据事件方法
    async onRefresh () {
      // 目标：list数组清空，来一份新的数据
      this.list = [] // list数组清空
      this.theTime = new Date().getTime() // 分页页码回到当前系统时间
      this.getArticleListFn()
      // const res = await getAllArticleListAPI({
      //   channel_id: this.channelId,
      //   timestamp: this.theTime
      // })
      // this.list = [...this.list, ...res.data.data.results]
      // this.theTime = res.data.data.pre_timestamp

      // // 顶部的加载状态要改为false
      // this.isLoading = false
    },
    // 反馈 - 不感兴趣
    async disLikeFn (id) {
      await dislikeArticleAPI({ artId: id })
      Notify({ type: 'success', message: '反馈成功' })
    },
    // 反馈 - 举报
    async reportsFn (id, value) {
      // 实参得对应index.js里的参数值
      await reportsAPI({ artId: id, type: value })
      Notify({ type: 'success', message: '举报成功!' })
    },
    // 文章单元格-点击事件
    itemClickFn (id) {
      this.$router.push({ path: `/detail?art_id=${id}` })
    }
  }
}
</script>

<style>
</style>
