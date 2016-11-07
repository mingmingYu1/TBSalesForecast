/**
 * 整个应用的入口，所有资源的根源
 */

import xhr from 'bfd/xhr'
import message from 'bfd/message'
import auth from 'public/auth'
import router from './router'
import env from './env'
import pace from './pace'
import './pace.less'

pace.start()

/**
 * AJAX 全局配置，比如请求失败、会话过期的全局处理。参考 bfd-ui AJAX 请求组件
 */

//   修改源码，跨域访问携带cookie信息  request.withCredentials = true


const LOGIN_PATH = (env.basePath + '/login').replace(/\/\//, '/')
//const CAS_PATH = 'http://172.16.13.178:8088/CAS/logout'


function clearBody() {
  let body = document.getElementsByTagName("body")[0]
  if(!!body.className.match( new RegExp( '(\\s|^)bfd-modal--open(\\s|$)') )) {
    body.style.paddingRight = 0
    body.className = body.className.replace( new RegExp( '(\\s|^)modal-open(\\s|$)' ), '')
  }
}

xhr.baseUrl = env.baseUrl + '/'

//  添加一个userId
xhr.url = option => {
  let userId = auth.user ? auth.user.userId : ''
  let url = option.url
  if(option.type.toUpperCase() === 'GET') {
    if(url.indexOf("?") === -1) {
      url = url+'?sessionUserName='+userId
    } else {
      url = url+'&sessionUserName='+userId
    }
  }
  return url
}

xhr.data = option => {
  let userId = auth.user ? auth.user.userId : ''
  let data = option.data
  if(option.type.toUpperCase() === 'POST') {
    Object.assign(data, {sessionUserName: userId})
  }
  return data
}
xhr.success = (res, option) => {
  if (typeof res !== 'object') {
    option.error && option.error()
    message.danger(option.url + ': 响应数据必须为JSON！', 4)
    return
  }
  if (!res.code) {
    option.error && option.error()
    message.danger(res.message || '未知错误', 4)
    return
  }
  switch (res.code) {
    case 200:
      option.success && option.success(res.data)
      break
    case 2001:
      message.danger(res.message || '算法出错，未能计算出商品的预测销量', 4)
      option.success && option.success(res.data)
      break
    case 101:
      message.danger(res.message || '用户未登录或登录超时', 4)
      clearBody()
      auth.destroy()
      if(res.isCAS){
        //   CAS模式
        window.location.replace(LOGIN_PATH)
      } else {
        //   正常模式
        // let pathname
        // if(router.state.location.search) {
        //   pathname = router.state.location.pathname+router.state.location.search
        // } else {
        //   pathname = router.state.location.pathname
        // }
        // router.history.replaceState({
        //   referrer: pathname
        // }, LOGIN_PATH)
        router.history.replaceState(null, LOGIN_PATH)
      }
      break
    case 501:
      option.error && option.error()
      message.danger(res.message || '传入的参数不正确', 4)
      break
    case 502:
      option.error && option.error()
      message.danger(res.message || '发生未知异常，请稍后再试', 4)
      break
    default:
      option.success && option.success(res)
  }
}

xhr.error = (res, option) => {
  option.error && option.error()
  message.danger('请求失败或服务器未及时响应，请稍后再试！', 4)
}