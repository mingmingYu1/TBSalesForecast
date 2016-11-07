import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { Nav, NavItem } from 'bfd/Nav'
import xhr from 'bfd/xhr'
import auth from 'public/auth'
import NotPermission from 'public/NotPermission'
import confirm from 'bfd-ui/lib/confirm'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Form, FormItem } from 'bfd-ui/lib/Form'
import ClearableInput from 'bfd-ui/lib/ClearableInput'
import message from 'bfd-ui/lib/message'
import env from './env'
import './App.less'

const LOGIN_PATH = (env.basePath + '/login').replace(/\/\//, '/')
const FORECAST_PATH = (env.basePath + '/forecast').replace(/\/\//, '/')
const HISTORY_PATH = (env.basePath + '/history').replace(/\/\//, '/')
const SYSTEM_PATH = (env.basePath + '/system').replace(/\/\//, '/')

const App = React.createClass({

  contextTypes: {
    history: PropTypes.object
  },
  
  getChildContext() {
    return {
      app: this
    }
  },

  getInitialState() {
    const regPassword = /^(?!\d+$)(?![a-zA-Z]+$)[0-9A-Za-z]+$/

    this.rules ={
      oldPasswordObj(data) {
        if(typeof data === "string") {
          data = JSON.parse(data)
        }
        if(!data || !data.oldPassword) {return '密码不可为空！'}
        let v = data.oldPassword
        if(v === data.newPassword || v === data.newPassword2) { return '原始密码与新密码不能相同！' }
      },
      newPasswordObj(data) {
        if(typeof data === "string") {
          data = JSON.parse(data)
        }
        if(!data || !data.newPassword) {return '密码不可为空！'}
        let v = data.newPassword
        if(!regPassword.test(v)) {return '密码必须为字母（大小写都可）和数字的组合！'}
        if(v.length > 16 || v.length < 8) {return '密码的长度必须在8-16之间 ！'}
        if(v === data.oldPassword) { return '原始密码与新密码不能相同！' }
        //if(v !== data.newPassword2) { return '两次密码输入不一致！' }
      },
      newPasswordObj2(data) {
        if(typeof data === "string") {
          data = JSON.parse(data)
        }
        if(!data || !data.newPassword2) {return '密码不可为空！'}
        let v = data.newPassword2
        if(!regPassword.test(v)) {return '密码必须为字母（大小写都可）和数字的组合！'}
        if(v.length > 16 || v.length < 8) {return '密码的长度必须在8-16之间 ！'}
        if(v === data.oldPassword) { return '原始密码与新密码不能相同！' }
        if(v !== data.newPassword) { return '两次密码输入不一致！' }
      }
    }
    return {
      // 用户是否登录
      loggedIn: auth.isLoggedIn(),
      block: true,
      formData: {
        oldPasswordObj: {},
        newPasswordObj: {},
        newPasswordObj2: {}
      }
    }
  },

  componentWillMount() {
    // 页面加载后判断是否需要跳转到登录页
    if (!this.state.loggedIn && !this.isInLogin()) {
      this.login()
    }
  },
  
  componentWillReceiveProps() {
    this.setState({
      loggedIn: auth.isLoggedIn(),
      block: true
    })
  },
  
  // 当前 URL 是否处于登录页
  isInLogin() {
    return this.props.location.pathname === LOGIN_PATH
  },

  // 权限判断
  hasPermission() {
    // ...根据业务具体判断
    if ( auth.user.type.SALES_FORECAST !== 1  && this.props.location.pathname === FORECAST_PATH ) {
      return false
    }
    if ( auth.user.type.SALES_HISTORY !== 1  && this.props.location.pathname === HISTORY_PATH ) {
      return false
    }
    if ( auth.user.type.SYS_MANAGER !== 1  && this.props.location.pathname === SYSTEM_PATH ) {
      return false
    }
    return true
  },

  // 跳转到登录页
  login() {
    //this.context.history.replaceState({
    //  referrer: this.props.location.pathname
    //}, LOGIN_PATH)
    this.context.history.replaceState(null, LOGIN_PATH)
  },

  // 安全退出
  handleLogout(e) {
    e.preventDefault()
    confirm('您确认退出吗？', () => {
      xhr({
        url: 'logout',
        success: (data) => {
          auth.destroy()
          if(data.isCAS) {
            //   CAS模式
            window.location.replace("http://172.16.13.178:8088/CAS/logout")
          } else {
            //   正常模式
            this.login()
          }
        }
      })
    })
  },
  
  //   原始密码
  handleOldPassword(oldPassword) {
    let oldPasswordObj = {
      oldPassword: oldPassword,
      newPassword: this.state.formData.newPassword,
      newPassword2: this.state.formData.newPassword2
    }
    this.refs.oldPasswordInput.validate(oldPasswordObj)
    const formData = this.state.formData
    formData.oldPasswordObj = oldPasswordObj
    formData.oldPassword = oldPassword
    this.setState({formData})
  },
  
  //  新密码
  handleNewPassword(newPassword) {
    let newPasswordObj = {
      oldPassword: this.state.formData.oldPassword,
      newPassword: newPassword,
      newPassword2: this.state.formData.newPassword2
    }
    
    let newPasswordObj2 = this.state.formData.newPasswordObj2
    if(typeof newPasswordObj2 === "string") {
      newPasswordObj2 = JSON.parse(newPasswordObj2)
    }
    newPasswordObj2 ? newPasswordObj2.newPassword = newPassword : null
 
    this.refs.newPasswordInput.validate(newPasswordObj)
    if(this.state.formData.newPassword2) {
      this.refs.newPasswordInput2.validate(newPasswordObj2)
    }
    const formData = this.state.formData
    formData.newPasswordObj = newPasswordObj
    formData.newPassword = newPassword
    this.setState({formData})
  },
  
  //  确认密码
  handleNewPassword2(newPassword2) {
    let newPasswordObj2 = {
      oldPassword: this.state.formData.oldPassword,
      newPassword: this.state.formData.newPassword,
      newPassword2: newPassword2
    }

    let newPasswordObj = this.state.formData.newPasswordObj
    if(typeof newPasswordObj === "string") {
      newPasswordObj = JSON.parse(newPasswordObj)
    }
    newPasswordObj ? newPasswordObj.newPassword2 = newPassword2 : null

    this.refs.newPasswordInput2.validate(newPasswordObj2)
    //this.refs.newPasswordInput.validate(newPasswordObj)

    const formData = this.state.formData
    formData.newPasswordObj2 = newPasswordObj2
    formData.newPassword2 = newPassword2
    this.setState({formData})
  },
  
  //  保存
  handleSave() {
    this.refs.form.validate(this.state.formData)
    this.refs.form.save()
  },
  
  //  取消
  handleFormClose() {
    this.refs.modal.close()
  },

  //  修改密码
  handleResetPassword(e) {
    e.preventDefault()
    this.refs.modal.open()
    this.setState({
      formData: {
        oldPassword: '',
        newPassword: '',
        newPassword2: ''
      }
    })
  },
  //  保存成功
  handleFormSuccess(res) {
    if (res.code === 201) {
      this.refs.modal.close();
      message.success(res.message, 2)
    } else {
      message.danger(res.message, 4)
    }
  },
  render() {

    let Children = this.props.children

    // 当前 URL 属于登录页时，不管是否登录，直接渲染登录页
    if (this.isInLogin()) return Children

    if (this.state.loggedIn) {

      if (!this.hasPermission()) {
        Children = <NotPermission />
      }
      return (
        <div id="wrapper">
          {Children}
          <div id="header">
            <div className="logo pull-left">
              <img src={require('public/logo.png')} />
            </div>
            {
              this.state.block ? 
              <div>
                <Nav href={env.basePath} className="headerNav pull-left">
                  {auth.user.type.SALES_FORECAST === 1 ? <NavItem href="forecast" title="销量预测" /> : null}
                  {auth.user.type.SALES_HISTORY === 1 ? <NavItem href="history" title="辅助管理" /> : null}
                  {auth.user.type.SYS_MANAGER === 1 ? <NavItem href="system" title="系统管理" /> : null}
                </Nav>
                <div className="pull-right headerList">
                  欢迎您，{auth.user.name} &nbsp;|&nbsp;&nbsp;
                  <a href="" onClick={this.handleResetPassword}>修改密码</a>&nbsp;&nbsp;
                  <a href="" onClick={this.handleLogout}>安全退出</a>
                </div>
              </div> : null
            }
          </div>
          <Modal ref="modal" className="updatePassword">
            <ModalHeader>
              <h4>修改密码</h4>
            </ModalHeader>
            <ModalBody>
              <Form ref="form" action="updatePassword" data={this.state.formData} rules={this.rules} onSuccess={this.handleFormSuccess}>
                <FormItem ref="oldPasswordInput" label="原始密码" required name="oldPasswordObj">
                  <ClearableInput
                    className="marginInput"
                    type="password"
                    inline={true}
                    value={this.state.formData.oldPassword}
                    style={{width: '350px'}}
                    onChange={this.handleOldPassword}/>
                </FormItem>
                <FormItem ref="newPasswordInput" label="新密码" required name="newPasswordObj" help="8~16个字符">
                  <ClearableInput
                    className="marginInput"
                    type="password"
                    inline={true}
                    value={this.state.formData.newPassword}
                    style={{width: '350px'}}
                    onChange={this.handleNewPassword}/>
                </FormItem>
                <FormItem ref="newPasswordInput2" label="确认密码" required name="newPasswordObj2" help="8~16个字符">
                  <ClearableInput
                    className="marginInput"
                    type="password"
                    inline={true}
                    value={this.state.formData.newPassword2}
                    style={{width: '350px'}}
                    onChange={this.handleNewPassword2}/>
                </FormItem>
                <div style={{textAlign: 'center'}}>
                  <button type="button" className="btn btn-primary" onClick={this.handleSave}>保存</button>
                  <button type="button" style={{marginLeft: '20px'}} className="btn btn-default" onClick={this.handleFormClose}>取消</button>
                </div>
              </Form>
            </ModalBody>
          </Modal>
          <div id="footer"> Copyright © 2016 All rights reserved. 前海云游版权所有 </div>
        </div>
      )
    } else {
      return null
    }
  }
})

App.childContextTypes = {
  app: PropTypes.instanceOf(App)
}

export default App