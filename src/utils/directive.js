// 对Vue的全局指令，进行封装
// 封装中间件函数插件
const directiveObj = {
  install (Vue) {
    Vue.directive('fofo', {
      // 指令所在标签，被插入到真实DOM时才触发，如果标签用display:none隐藏再出现，不会触发inserted的
      inserted (el) {
        // 指令所在van-search组件
        // 组件根标签是div，input在内部
        // 以上都是原生标签对象
        // console.log(el)
        // 搜索页面 el是dive
        // 文章评论 el是textarea
        // 以后el还可能是input
        // 知识点:原生DOM.nodeName 拿到标签名字(注意：大写的字符串)
        if (el.nodeName === 'TEXTAREA' || el.nodeName === 'INPUT') {
          el.focus()
        } else {
          // el本身不是输入框，尝试往里获取一下
          const theInput = el.querySelector('input')
          const theTextArea = el.querySelector('textarea')
          // 判断：不一定能获取得到，需要加判断，有值再执行.focus()才不会报错
          if (theInput) theInput.focus()
          if (theTextArea) theTextArea.focus()
        }
        // const theInput = el.querySelector('input')
        // theInput.focus()
      },
      // 标签所在标签被更新时触发
      update (el) {
        if (el.nodeName === 'TEXTAREA' || el.nodeName === 'INPUT') {
          el.focus()
        } else {
          // el本身不是输入框，尝试往里获取一下
          const theInput = el.querySelector('input')
          const theTextArea = el.querySelector('textarea')
          // 判断：不一定能获取得到，需要加判断，有值再执行.focus()才不会报错
          if (theInput) theInput.focus()
          if (theTextArea) theTextArea.focus()
        }
      }
    })
  }
}

export default directiveObj
