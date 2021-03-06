var express = require('express')
var path = require('path')
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var WebpackConfig = require('./webpack.config.js')

debugger
var app = express()

app.use(express.static(__dirname))

app.use(webpackDevMiddleware(webpack(WebpackConfig), {
  publicPath: '/build/',
  stats: {
    colors: true
  }
}))

app.set('views', path.join(__dirname))
app.set('view engine', 'ejs')

app.get('/data/:name.json', function(req, res) {
  res.sendFile(path.join(__dirname, 'data/' + req.params.name + '.json'))
})
  
app.get('*', function(req, res) {
  res.render('index', {
    user: JSON.stringify({
      name: '管理员',
      type: {
        SALES_FORECAST: 1,
        SALES_HISTORY: 1,
        SYS_MANAGER: 1,
        SALES_FORECAST_ALL: 1,
        SALES_FORECAST_CATE: 1,
        SALES_HISTORY_COUNT: 1,
        SALES_HISTORY_SINGLE: 1,
        DEPT_MANAGER: 1,
        ROLE_MANAGER: 1,
        USER_MANAGER: 1,
        RESET_PASSWORD: 1
      }
    }),
    now: Date.now()
  })
})
  
var port = process.argv.slice(2)[0] || 9000

app.listen(port, function () {
  console.log('Server listening on http://localhost:' + port + ', Ctrl+C to stop')
})
