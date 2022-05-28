import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userPhoto: 'https://img2.baidu.com/it/u=180286244,263138673&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500', // 头像地址(默认)
    userName: `用户${Math.floor(Math.random() * 1000)}`
  },
  getters: {
  },
  mutations: {
    // 编码风格：mutations最好大写（区分）
    SET_USERPHOTO (state, value) {
      state.userPhoto = value
    },
    SET_USERNAME (state, value) {
      state.userName = value
    }
  },
  actions: {
  },
  modules: {
  }
})
