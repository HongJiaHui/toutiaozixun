<template>
  <div>
    <!-- 搜索页面头部 -->
    <div class="search-header">
      <!-- 后退按钮 -->
      <van-icon
        name="arrow-left"
        color="white"
        size="0.48rem"
        class="goback"
        @click="$router.back()"
      />
      <!-- 搜索组件 -->
      <van-search
        placeholder="请输入搜索关键词"
        background="#007BFF"
        shape="round"
        v-fofo
        action-text
        @input="inputFn"
        v-model.trim="kw"
        @search="searchFn"
      />
    </div>
    <!-- 搜索建议列表 -->
    <div class="sugg-list" v-if="kw.length>0?true:false">
      <div
        class="sugg-item"
        v-for="(obj, index) in searchList"
        :key="index"
        v-html="lightFn(obj, kw)"
        @click="suggestClickFn(obj)"
      >
        <!-- {{lightFn(obj,kw)}} 错误！ 需要v-html -->
      </div>
    </div>
    <!-- 搜索历史 -->
    <div class="search-history" v-else>
      <!-- 标题 -->
      <van-cell title="搜索历史">
        <!-- 使用 right-icon 插槽来自定义右侧图标 -->
        <template #right-icon>
          <van-icon name="delete" class="search-icon" @click="clearFn"/>
        </template>
      </van-cell>

      <!-- 历史列表 -->
      <div class="history-list">
        <span class="history-item" v-for="(obj,index) in history" :key="index"
        @click="historyClickFn(obj)">{{obj}}</span>
      </div>
    </div>
  </div>
</template>

<script>
// 目标1：跳转到搜索结果页面
// 1.输入框回车 -> 输入框文字 -> 搜索结果页面
// 2.点击联想菜单 -> 点击文字 -> 搜索结果页面
// 3.点击历史记录 -> 点击文字 -> 搜索结果页面
import { suggestListAPI } from '@/api'
import { setStorage, getStorage } from '@/utils/storage'
export default {
  name: 'Search',
  data () {
    return {
      kw: '', // 搜索关键字
      timer: null, // 防抖定时器
      searchList: [], // 联想建议列表文字数组
      history: JSON.parse(getStorage('his')) || [] // 搜索历史
    }
  },
  methods: {
    // 输入框 - 内容实时改变触发事件方法
    inputFn () {
      clearTimeout(this.timer)
      // 防抖：延时执行逻辑代码，事件再次触发时，清除上一个定时器
      if (this.kw.length === 0) {
        this.searchList = []
      } else {
        this.timer = setTimeout(async () => {
          const res = await suggestListAPI({
            keywords: this.kw
          })
          this.searchList = res.data.data.options
          // console.log(res)
          console.log(this.kw)
        }, 300)
      }
    },
    // 处理字符串高亮关键字
    // originStr：原来字符串   target：关键字
    // 字符串：replace() -> 替换第一个符合条件
    // 字符串：replaceAll() -> 替换全部
    // 字符串.replace() 作用：替换字符串
    // 返回值：替换后的完整字符串

    lightFn (originStr, target) {
      // 如果要使用变量，作为正则的匹配条件，不能用语法糖简化写法
      const reg = new RegExp(target, 'ig') // i：忽略大小写，g：全局都匹配
      // 替换后的值不能用target
      return originStr.replace(reg, (match) => {
        // match就是匹配中是，原字符串里的字符，只不过我们给个颜色而已
        return `<span style='color:red;'>${match}</span>`
      })
    },
    moveFn (obj) {
      // 坑：路由跳转，在watch之前执行，所有我们要让路由跳转，来一个定时器包裹，让跳转最后执行
      setTimeout(() => {
        this.$router.push({ path: `/search_result/${obj}` })
      }, 0)
    },
    // 输入框搜索事件
    searchFn () {
      // this.$router.push({ path: `/search_result/${this.kw}` })
      if (this.kw.length > 0) {
        this.history.push(this.kw)
        this.moveFn(this.kw)
      }
    },
    // 联想菜单 - 点击事件
    suggestClickFn (obj) {
      // this.$router.push({ path: `/search_result/${obj}` })
      this.moveFn(obj)
      this.history.push(obj)
    },
    // 搜索历史 - 点击事件
    historyClickFn (obj) {
      // this.$router.push({ path: `/search_result/${obj}` })
      this.moveFn(obj)
    },
    // 清除历史记录
    clearFn () {
      this.history = []
    }
  },
  // watch侦听器使用
  watch: {
    history: { // 侦听历史记录数组的改变
      deep: true,
      handler () {
        // 记得转换为字符串
        // ES6新增了2种引用类型（以前 array object），（新增:Set,Map）
        // Set：无序不允许重复的value集合体（无下角标）
        // 特点：如果你传入的数组类型有重复元素，会自动清理掉重复元素，返回无重复的set对象
        // 注意：如果值是对象比较的是对象的内存地址
        const theSet = new Set(this.history)
        // Set类型对象->转回->array数组类型
        const arr = Array.from(theSet)
        setStorage('his', JSON.stringify(arr))
      }
    }
  }
}
</script>

<style scoped lang="less">
.search-header {
  height: 46px;
  display: flex;
  align-items: center;
  background-color: #007bff;
  overflow: hidden;
  /*后退按钮*/
  .goback {
    padding-left: 14px;
  }
  /*搜索组件*/
  .van-search {
    flex: 1;
  }
}
/*搜索建议列表样式 */
.sugg-list {
  .sugg-item {
    padding: 0 15px;
    border-bottom: 1px solid #f8f8f8;
    font-size: 14px;
    line-height: 50px;
    // 实现省略号的三行代码
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
/**搜索历史 */
.search-icon {
  font-size: 16px;
  line-height: inherit;
}

.history-list {
  padding: 0 10px;
  .history-item {
    display: inline-block;
    font-size: 12px;
    padding: 8px 14px;
    background-color: #efefef;
    margin: 10px 8px 0px 8px;
    border-radius: 10px;
  }
}
</style>
