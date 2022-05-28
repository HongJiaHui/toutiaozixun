<template>
  <div>
    <!-- 头部导航
    fixed 可以让头部div带固定定位样式
    原理：给组件内props传入true/false，影响到组件内的动态样式：class
    -->
    <div>
      <van-nav-bar fixed>
        <template v-slot:left>
          <!--  width="33%" -->
          <img class="logo" src="@/assets/toutiao_logo.png" />
        </template>
        <template #right>
          <!-- 坑：postcss只能翻译style里css样式代码，标签内行内样式它无法转换px转rem，所以需要自己手动计算 -->
          <van-icon name="search" size="0.48rem" color="#fff" @click="moveSearchPageFn"/>
        </template>
      </van-nav-bar>
    </div>

    <!-- v-model关联的激活项的下标（双向绑定）
    tab栏+内容-->
    <!-- （重要）每个van-tab代表一个标签导航，中间夹着内容，对应的下属列表内容 -->
    <!-- （重要）每个van-tab都对应独立的字节的ArticleList(多次) -->
    <!-- 细节:van-tab循环了很多标签导航,与之一一对应的内容列表不是上来都创建的,默认创建当前激活导航对应列表组件
    第一次切换到对应频道时,才会创建下属的ArticleList组件 -> created方法
    第二次切换就是显示/隐藏-->
    <div class="main">
      <van-tabs v-model="channelId"
      @change="changelChangeFn"
      animated sticky offset-top="44">
        <!-- key提高更新性能 -->
        <van-tab
          :title="obj.name"
          v-for="obj in userChannelList"
          :key="obj.id"
          :name="obj.id"
        >
          <article-list :channelId="channelId" ></article-list>
        </van-tab>
      </van-tabs>
      <!-- 编辑频道图标 -->
      <van-icon name="plus" size="0.37333334rem" class="moreChannels" @click="showPopup"/>
    </div>
    <div>
      <!-- 设置挂载点，挡住整个屏幕 -->
      <van-popup class="channel_popup" v-model="show" get-container="body"><channel-edit :userList="userChannelList" :unList="unCheckChannelList"
      @addChannelEV="addChannelFn"
      @removeChannelEV="removeChannelFn"
      @closeEV="closeFn"
      v-model="channelId"
      ref="editRef"></channel-edit></van-popup>
    </div>
  </div>
</template>

<script>
import { getAllChannelsAPI, getUserChannelsAPI, updateChannelsAPI, removeTheChannelAPI } from '@/api'
import ArticleList from './components/ArticleList.vue'
import ChannelEdit from '@/views/Home/ChannelEdit.vue'

// 目标1：获取不同的文章列表，需要传递不同的频道ID
// 想法：让van-tabs的v-model关联频道ID

// 目标2：点击tab标签页@change触发，重新发送请求，拿到新的数据
// 问题：每次切换tab拿到的数据都是新的不一样
// 即使使用keep-alive也没用(防止组件被销毁,而你的组件没有被销毁,是在点击切换数据)
// 分析：外面现在用的是同一个数组切换数据（多个articleList用的是同一个存放数据的数组，切换会影响到别人）
// 解决：文章列表数据，请求，数组，分别放入到ArticleList内部（自己请求自己的数据） 外面只负责传入当前激活的频道ID
export default {
  data () {
    return {
      channelId: 0, // tab导航-激活时的频道ID（默认频道ID为0，页面刚打开时推荐频道高亮-对应文章数据）
      userChannelList: [], // 用户选择的频道列表
      // articleList: [] // 文章列表
      allChannelList: [], // 所有频道列表
      show: false, // 频道弹出层显示/隐藏
      channelScrollTObj: {} // 保存每个频道的滚动位置
      // 值样子构想：{推荐频道ID：滚动距离,html频道ID：滚动距离}
    }
  },
  async created () {
    // 频道列表
    const res = await getUserChannelsAPI()
    this.userChannelList = res.data.data.channels
    // this.channelChangeFn()
    // 所有频道列表
    const res2 = await getAllChannelsAPI()
    this.allChannelList = res2.data.data.channels
  },
  components: {
    ArticleList,
    ChannelEdit
  },
  methods: {
    // tabs切换的事件 -> 获取文章列表数据
    changelChangeFn () {
      // // 文章列表
      // const res2 = await getAllArticleListAPI(
      //   { channel_id: this.channelId, timestamp: (new Date()).getTime() }
      // )
      // // console.log(res2)
      // this.articleList = res2.data.data.results

      // tab切换以后，设置滚动条位置
      // tab切换时，这个组建内部，会把切走的容器height设置为0，滚动条因为没有高度回到了顶部。
      // 切回来的一瞬间，没有高度，滚动事件从底下上来也被触发了，所以才把数据里设置为0
      // 切回来的一瞬间，高度为0，设置滚动位置也无用
      this.$nextTick(() => {
        document.documentElement.scrollTop = this.channelScrollTObj[this.channelId]
        document.body.scrollTop = this.channelScrollTObj[this.channelId]
      })
    },
    showPopup () {
      this.show = true
    },
    // 添加频道
    async addChannelFn (channelObj) {
      this.userChannelList.push(channelObj)
      // 问题：为何只需要push，不需要从下面数组里移除
      // 因为：userChannelList是计算属性
      // 注意：还要把最新的数组发送给后台
      // 推荐频道不能传递-筛选出不是推荐频道剩下的频道对象
      // const newArr = this.userChannelList.filter(obj => obj.id !== 0)
      // newArr.forEach((obj, index) => {
      // delete 对象.属性 可以删除键值对
      //   delete obj.name
      //   obj.seq = index
      // })
      // const res = await updateChannelsAPI({ channels: newArr }
      // )
      // console.log(res)

      // 上面的代码出了问题，新增时，名字被删除了
      // 原因:所有数组里的对象,都是同一个内存地址,影响到ChannelEdit.vue中对象
      // 解决方法 拷贝一个新的对象(浅拷贝)
      const newArr = this.userChannelList.filter(obj => obj.id !== 0)
      const theNewArr = newArr.map((obj, index) => {
        const newObj = { ...obj }
        delete newObj.name
        newObj.seq = index
        return newObj // 让map方法把新对象收集起来形成一个新数组
      })
      const res = await updateChannelsAPI({ channels: theNewArr }
      )
      console.log(res)
    },
    // 删除频道
    async removeChannelFn (channelObj) {
      const index = this.userChannelList.findIndex(obj => obj.id === channelObj.id)
      this.userChannelList.splice(index, 1)

      // 第一种方式：把现在用户数据的数据，再覆盖式发给后台
      // 需要把上面的更新数组过程，封装一个函数，add和remove里调用（笔记里有）

      // 第二种方式：只调用删除的接口
      console.log(channelObj)
      const res = await removeTheChannelAPI({
        channelId: channelObj.id
      })
      console.log(res)
      // 删除接口返回状态码204(Not Content) 无返回内容
    },
    // 关闭弹出层
    closeFn () {
      this.show = false
      // 让内部的编辑状态回归false
      this.$refs.editRef.isEdit = false
    },
    // 首页-右上角放大镜点击事件 -> 跳转搜索页面
    moveSearchPageFn () {
      this.$router.push('/search')
    },
    // 监听网页滚动事件
    scrollFn () {
      // 谷歌浏览器内核，和安卓手机内置浏览器的内核不是同一个
      // 获取scrollTop方式不同
      // 谷歌浏览器用的html的scrollTop
      // 其他浏览器用的body的scrollTop
      this.$route.meta.scrollT = document.documentElement.scrollTop || document.body.scrollTop
      // 同时保存当前频道的滚动距离
      // 频道Id和对应的滚动位置
      this.channelScrollTObj[this.channelId] = document.documentElement.scrollTop || document.body.scrollTop
      // console.log(this.channelScrollTObj)
    }
  },
  // 计算属性
  // 目标：把所有频道数组挨个对象取出，去用户已选频道数组里查找，如果找不到，则让filter方法收集到一个新的数组里
  computed: {
    unCheckChannelList () {
      const newArr = this.allChannelList.filter(allObj => {
        const index = this.userChannelList.findIndex(userObj => {
          return userObj.id === allObj.id
        })
        if (index > -1) {
          return false
        } else {
          return true
        }
      })
      return newArr
    }

    // 极简写法（不推荐）
    //   return this.allChannelList.filter(allObj => (this.userChannelList.findIndex(userObj => userObj.id === allObj.id) === -1))
    // }
  },
  activated () {
    console.log(this.$route)
    window.addEventListener('scroll', this.scrollFn)
    // window和document，监听网页滚动事件
    // html标签获取scrollTop，滚动的距离，和设置滚动的位置
    // 立刻设置滚动条位置
    document.documentElement.scrollTop = this.$route.meta.scrollT
  },
  // 全局的资源要在他失焦后移除
  deactivated () {
    window.removeEventListener('scroll', this.scollFn)
  }
}
</script>

<style scoped lang='less'>
.logo {
  width: 100px;
  height: 30px;
}
.main {
  padding-top: 44px;
  /*底部在Layout/index.vue-给二级路由挂载点容器上给了一个padding-bottom  */
}
/*  设置 tabs 容器的样式 */
/deep/ .van-tabs__wrap {
  padding-right: 30px;
  background-color: #fff;
}

/* 设置小图标的样式 */
.moreChannels {
  position: fixed;
  top: 58px;
  right: 8px;
  z-index: 999;
}
// vw和vh是css3新出的单位，参考浏览器窗口的百分比
.channel_popup{
  width: 100vw;
  height: 100vh;
}
</style>
