// 此文件->封装3个方法->专门用于操作token的
// 封装的目的：代码分层。更方便清晰，以后修改方便
const key = 'toutiao'

// 存储
export const setToken = (token) => {
  localStorage.setItem(key, token)
}

// 获取
export const getToken = () => localStorage.getItem(key)

// 删除
export const removeToken = () => {
  localStorage.removeItem(key)
}
