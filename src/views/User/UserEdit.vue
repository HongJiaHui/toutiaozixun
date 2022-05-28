<template>
  <div class="user-edit-container">
    <!-- Header 区域 -->
    <van-nav-bar
      title="编辑资料"
      left-arrow
      @click-left="$router.back()"
      fixed
    />

    <!-- 用户资料 -->
    <van-cell-group class="action-card">
      <van-cell title="头像" is-link center>
        <template #default>
          <van-image
            round
            class="avatar"
            :src="userObj.photo"
            @click="imageClickFn"
          />
          <!-- file 选择框 -->
          <!-- 视觉上隐藏，标签还在DOM树上，还可以触发功能 -->
          <input
            type="file"
            ref="iptFile"
            v-show="false"
            accept="image/*"
            @change="onFileChange"
          />
        </template>
      </van-cell>
      <van-cell
        title="名称"
        is-link
        :value="userObj.name"
        @click="nameClickFn"
      />
      <van-cell title="生日" is-link :value="userObj.birthday" @click="dateTimeShowFn"/>
    </van-cell-group>

    <!-- 姓名修改弹窗 -->
    <van-dialog
      v-model="show"
      title="标题"
      show-cancel-button
      :before-close="beforeCloseFn"
    >
      <input type="text" v-fofo v-model="inputUserName" />
    </van-dialog>

    <!-- 时间选择器 -->
    <!-- 组件可以自己搭配使用 -->
    <van-popup v-model="dateTimeShow" position="bottom" :style="{ height: '50%' }" round>
    <van-datetime-picker
      v-model="currentDate"
      type="date"
      title="选择年月日"
      :min-date="minDate"
      :max-date="maxDate"
      @cancel="dateCancelFn"
      @confirm="dateConfirmFn"
    />
    </van-popup>
  </div>
</template>

<script>
import {
  userProfileAPI,
  updateUserPhotoAPI,
  updateUserProfileAPI
} from '@/api'
import Notify from '@/Ui/Notify'
import { formatDate } from '@/utils/data'
import { mapMutations } from 'vuex'
export default {
  data () {
    return {
      userObj: {}, // 用户个人信息
      show: false, // 控制姓名输入框出现/隐藏
      inputUserName: '', // 修改名字 - 弹出框输入框绑定值
      minDate: new Date(1920, 0, 1), // 最小范围
      maxDate: new Date(), // 最大范围(默认获取系统日期-今日)
      currentDate: new Date(), // 当前时间
      dateTimeShow: false // 日期选择器-弹出层显示/隐藏
    }
  },
  name: 'UserEdit',
  async created () {
    const res = await userProfileAPI()
    // console.log(res)
    this.userObj = res.data.data
  },
  methods: {
    ...mapMutations(['SET_USERPHOTO', 'SET_USERNAME']),
    // 文件选择改变 - 事件
    async onFileChange (e) {
      if (e.target.files[0] === undefined) return // 用户可能没有选择图片文件，所有阻止代码往下执行

      // console.log(e.target.files[0]) // 数组其实是一个特殊的对象(用户选中的文件对象)
      // 创建FormData对象
      const theFd = new FormData()
      // FormData固定方法append()可以往表单对象里添加key:value
      theFd.append('photo', e.target.files[0]) // 请求体里加入一对参数名和值
      const res = await updateUserPhotoAPI(theFd)
      // console.log(res)
      this.userObj.photo = res.data.data.photo
      this.SET_USERPHOTO(res.data.data.photo) // 更新成功后，同步到vuex中
    },
    // 图片点击事件
    imageClickFn () {
      this.$refs.iptFile.click() // JS模拟标签的事件触发
    },
    // 姓名点击事件
    nameClickFn () {
      this.show = true
      this.inputUserName = this.userObj.name
    },
    // 姓名 - 确认框 - 关闭前回调函数
    beforeCloseFn (action, done) {
      if (action === 'confirm') {
        // 点击了确认
        const reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,7}$/
        if (reg.test(this.inputUserName) === true) {
          // 通过校验
          updateUserProfileAPI({
            name: this.inputUserName
          })
          this.userObj.name = this.inputUserName // 更新成功 - 回显到页面上
          this.SET_USERNAME(this.inputUserName)
          done()
        } else {
          // 给用户提示，没通过校验
          Notify({ type: 'warning', message: '用户名只能是1-7位中英数字组合' })
          done(false)
        }
      } else {
        // 点击了取消
        done() // 让弹窗关闭
      }
    },
    // 生日单元格 - 点击事件
    dateTimeShowFn () {
      this.dateTimeShow = true
      // 数据和页面显示 -> 年-月-日 格式的字符串
      this.currentDate = new Date(this.userObj.birthday)
    },
    // 日期选择器取消事件
    dateCancelFn () {
      this.dateTimeShow = false
    },
    // 日期选择器确认事件
    async dateConfirmFn () {
      // 日期选择器组件里currentDate是日期对象，而后端要的是年-月-日字符串
      await updateUserProfileAPI({
        birthday: formatDate(this.currentDate)
      })
      this.userObj.birthday = formatDate(this.currentDate) // 回显
      this.dateTimeShow = false
    }

  }
}
</script>

<style lang="less" scoped>
.user-edit-container {
  padding-top: 46px;
  .avatar {
    width: 50px;
    height: 50px;
  }
}
/deep/.van-dialog__content {
  text-align: center;
  input {
    padding: 0;
    outline: none;
    border: none;
    text-align: center;
  }
}
</style>
