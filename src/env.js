/**
 * 开发环境、线上环境的不同配置
 */

var env = {}
//   process.env.NODE_ENV === 'production'
//   process.argv.slice(2)[0] === '-p'
if (process.env.NODE_ENV === 'production') {

  /**
   * 线上环境
   */

  // 数据接口基础 URL
  env.baseUrl = '/salesforecasting'

  // 页面根路径
  env.basePath = '/salesforecasting/'
  
} else {

  /**
   * 开发环境
   */
  
  // 数据接口基础 URL
  // env.baseUrl = 'http://localhost:9000/data'
  //env.baseUrl = 'http://172.17.128.32:8080/salesforecasting'   //  生产服务器2
  //env.baseUrl = 'http://salesforecasting.yodata.com.cn/salesforecasting'   //  生产服务器1
  //env.baseUrl = 'http://10.12.5.194:80/salesforecasting'     //   慧娜
  env.baseUrl = 'http://10.12.5.158:80/salesforecasting'     //  本地
  //env.baseUrl = 'http://10.12.7.150:9443/salesforecasting'       //  文礼
  //env.baseUrl = '/salesforecasting'                            //   线上环境
  
  // 页面根路径
  env.basePath = '/'
  //env.basePath = '/salesforecasting/'
}

module.exports = env