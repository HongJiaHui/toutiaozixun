<template>
  <div>
    <!-- 评论列表 -->
    <div
      class="cmt-list"
      :class="{
        'art-cmt-container-1': isShowCmtBox,
        'art-cmt-container-2': !isShowCmtBox,
      }"
    >
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多评论了，请发表最新评论！"
        @load="onLoad"
        :immediate-check="false"
      >
        <!-- 评论的 Item 项 -->
        <div class="cmt-item" v-for="obj in commentsArr" :key="obj.com_id">
          <!-- 头部区域 -->
          <div class="cmt-header">
            <!-- 头部左侧 -->
            <div class="cmt-header-left">
              <img :src="obj.aut_photo" alt="" class="avatar" />
              <span class="uname">{{ obj.aut_name }}</span>
            </div>
            <!-- 头部右侧 -->
            <div class="cmt-header-right">
              <van-icon
                name="like"
                size="16"
                color="red"
                v-if="obj.is_liking === true"
                @click="goodFn(true, obj)"
              />
              <van-icon
                name="like-o"
                size="16"
                color="gray"
                v-else
                @click="goodFn(false, obj)"
              />
            </div>
          </div>
          <!-- 主体区域 -->
          <div class="cmt-body">
            {{ obj.content }}
          </div>
          <!-- 尾部区域 -->
          <div class="cmt-footer">{{ timeAgo(obj.pubdate) }}</div>
        </div>
      </van-list>
    </div>

    <!-- 底部添加评论区域 - 1 -->
    <div class="add-cmt-box van-hairline--top" v-if="isShowCmtBox === true">
      <van-icon name="arrow-left" size="0.48rem" @click="$router.back()" />
      <div class="ipt-cmt-div" @click="showFn">发表评论</div>
      <div class="icon-box">
        <van-badge :content="totalCount === 0 ? '' : totalCount" max="99">
          <van-icon
            name="comment-o"
            size="0.53333334rem"
            @click="commentClickFn"
          />
        </van-badge>
        <van-icon name="star-o" size="0.53333334rem" />
        <van-icon name="share-o" size="0.53333334rem" />
      </div>
    </div>

    <!-- 底部添加评论区域 - 2 -->
    <div class="cmt-box van-hairline--top" v-else>
      <textarea
        placeholder="友善评论、理性发言、阳光心灵"
        v-fofo
        @blur="blurFn"
        v-model.trim="comText"
      ></textarea>
      <van-button
        type="default"
        :disabled="comText.length === 0"
        @click="sendFn"
        >发布</van-button
      >
    </div>
  </div>
</template>

<script>
import {
  commentsListAPI,
  commentDisLikingAPI,
  commentLikingAPI,
  commentSendAPI
} from '@/api'
import { timeAgo } from '@/utils/data'
export default {
  data () {
    return {
      offset: null, // 偏移量评论ID
      commentsArr: [], // 评论列表
      totalCount: 0, // 评论总数量（必须后台返回）
      isShowCmtBox: true, // 底部显示小/大的评论容器
      comText: '', // 评论内容
      loading: false,
      finished: false,
      lastId: null // 分页
    }
  },
  async created () {
    const res = await commentsListAPI({
      id: this.$route.query.art_id // 文章id
    })
    // console.log(res)
    this.commentsArr = res.data.data.results
    this.totalCount = res.data.data.total_count // 评论总数量
    this.lastId = res.data.data.last_id // 分页

    // 网页打开没有评论，res结果空数组
    if (res.data.data.results.length === 0) {
      this.finished = true
    }
  },
  methods: {
    timeAgo,
    // 评论点赞/取消点赞
    async goodFn (bool, comObj) {
      if (bool === true) {
        comObj.is_liking = false
        await commentDisLikingAPI({
          comId: comObj.com_id
        })
      } else {
        comObj.is_liking = true
        await commentLikingAPI({
          comId: comObj.com_id
        })
      }
    },
    // 底部评论容器
    showFn () {
      this.isShowCmtBox = false
    },
    // 评论按钮点击事件，把第一条评论滑动到最上面
    commentClickFn () {
      // 只要设置window.scrollTo(0.文章内容高度)
      //  JS代码是在html+css运行后，真实DOM已经在网页上了，从document往下获取标签是ok的
      //   const articleHeight = document.querySelector('.article-container').scrollHeight
      //   //   console.log(articleHeight)
      //   //   window.scrollTo() 使网页进行滚动，设置相应的坐标，就可以让网页滚动到屏幕的最顶端。
      //   //   如果底下没有内容了，则不再滚动
      //   window.scrollTo(0, articleHeight)

      //   css可以做动画：例如轮播图，css3位移，旋转，动画（必须修改css属性才能触发css动画）
      // 使用：animation（配合帧动画），transition（过渡动画）
      //  js也可以做动画：滚动条滚动……
      // 使用：计时器间隔时间，修改目标状态（像动画片）
      //   动画实现的JS原生代码，在配套资料扩展->txt文档里

      //   比较方便的方法（既能滚动也能带动画）
      //   原生标签.scrollIntoView(),让原生的标签滚动到屏幕的最上面
      //   为何选择like-box不选择第一条评论，因为头部导航会挡住
      //   注意：有的电脑不支持这个方法，没有滑动的效果，所以只能用原生JS写（兼容性好）
      document.querySelector('.like-box').scrollIntoView({
        behavior: 'smooth'.scrollIntoView({
          behavior: 'smooth'
        })
      })
    },
    // 发布评论
    async sendFn () {
      // console.log(this.comText)
      const res = await commentSendAPI({
        id: this.$route.query.art_id,
        content: this.comText
      })
      this.commentsArr.unshift(res.data.data.new_obj)
      this.totalCount++
      this.comText = ''
      this.commentClickFn() // 让第一条评论滚到到屏幕上
    },
    // 输入框 - 失去焦点
    blurFn () {
      // 问题：点击发布按钮，发现点击事件不执行
      // 原因：大的评论容器-在页面点击发布一瞬间，输入框失去了焦点，被v-if和v-else移除了整个标签
      // 导致电机事件没来得及执行
      // 解决：失去焦点时，变量值，在最后再执行
      // this.$nextTick() DOM更新（数据变化）
      setTimeout(() => {
        this.isShowCmtBox = true
      }, 0)
    },
    // 底部评论加载更多
    async onLoad () {
      if (this.commentsArr.length > 0) {
      // 请求下一页数据
        const res = await commentsListAPI({
          id: this.$route.query.art_id, // 文章id
          offset: this.lastId
        })
        // console.log(res)
        this.commentsArr = [...this.commentsArr, ...res.data.data.results]
        this.totalCount = res.data.data.total_count // 评论总数量
        this.lastId = res.data.data.last_id // 分页

        if (res.data.data.last_id === null) {
        // 没有下一页了
          this.finished = true
        }
        this.loading = false
      } else {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped lang="less">
.cmt-list {
  padding: 10px;
  .cmt-item {
    padding: 15px 0;
    + .cmt-item {
      border-top: 1px solid #f8f8f8;
    }
    .cmt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .cmt-header-left {
        display: flex;
        align-items: center;
        .avatar {
          width: 40px;
          height: 40px;
          background-color: #f8f8f8;
          border-radius: 50%;
          margin-right: 15px;
        }
        .uname {
          font-size: 12px;
        }
      }
    }
    .cmt-body {
      font-size: 14px;
      line-height: 28px;
      text-indent: 2em;
      margin-top: 6px;
      word-break: break-all;
    }
    .cmt-footer {
      font-size: 12px;
      color: gray;
      margin-top: 10px;
    }
  }
}
/*美化 - 文章详情 - 底部的评论页面 */
// 外层容器
.art-cmt-container-1 {
  padding-bottom: 46px;
}
.art-cmt-container-2 {
  padding-bottom: 80px;
}

// 发布评论的盒子 - 1
.add-cmt-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 46px;
  line-height: 46px;
  padding-left: 10px;
  .ipt-cmt-div {
    flex: 1;
    border: 1px solid #efefef;
    border-radius: 15px;
    height: 30px;
    font-size: 12px;
    line-height: 30px;
    padding-left: 15px;
    margin-left: 10px;
    background-color: #f8f8f8;
  }
  .icon-box {
    width: 40%;
    display: flex;
    justify-content: space-evenly;
    line-height: 0;
  }
}

.child {
  width: 20px;
  height: 20px;
  background: #f2f3f5;
}

// 发布评论的盒子 - 2
.cmt-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding-left: 10px;
  box-sizing: border-box;
  background-color: white;
  textarea {
    flex: 1;
    height: 66%;
    border: 1px solid #efefef;
    background-color: #f8f8f8;
    resize: none;
    border-radius: 6px;
    padding: 5px;
  }
  .van-button {
    height: 100%;
    border: none;
  }
}
</style>
