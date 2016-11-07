import React, { PropTypes } from 'react'
import { Form, FormItem } from 'bfd/Form2'
import FormInput from 'bfd/FormInput'
import { Checkbox } from 'bfd/Checkbox'
import message from 'bfd/message'
import xhr from 'bfd/xhr'
import auth from 'public/auth'
import Icon from 'bfd-ui/lib/Icon'
import './index.less'
import env from '../../env'

export default React.createClass({

  contextTypes: {
    history: PropTypes.object
  },

  getInitialState() {
    this.rules = {
      userName(v) {
        if (!v) return '请输入用户名'
      },
      password(v) {
        if (!v) return '请输入密码'
      }
    }
    return {
      user: {}
    }
  },

  componentWillMount() {
    if(auth.user && auth.user.isCAS) {
      this.context.history.replaceState(null, env.basePath)
    }
  },

  handleChange(user) {
    this.setState({ user })
  },

  handleLogin() {
    this.refs.form.save()
  },

  handleSuccess(user) {
    if(user.code === 201) {
      message.danger(user.message, 4)
      this.setState({user: {}})
      return false
    } 
    auth.register(user)
    let referrer = this.props.location.state && this.props.location.state.referrer || env.basePath
    this.context.history.push(referrer)
  },

  render() {
    return (
      <div className="login">
        <div className="body">
          <Form ref="form" action="loginCheck" onSuccess={this.handleSuccess} data={this.state.user} onChange={this.handleChange} labelWidth={0} rules={this.rules}>
            <div className="imgContainer">
              <img className="img-responsive" src={require('./nameAll.png')} alt="登录"/>
            </div>
            <div className="nameHeader"> 用户登录 </div>
            <FormItem name="userName">
              <span className="loginIcon"><Icon type="user" /></span>
              <FormInput />
            </FormItem>
            <FormItem name="password">
              <span className="loginIcon"><Icon type="lock" /></span>
              <FormInput type="password"></FormInput>
            </FormItem>
            <button type="submit" className="btn btn-primary" onClick={this.handleLogin}>登录</button>
          </Form>
        </div>
        <div className="footer">Copyright © 2016 All rights reserved. 前海云游版权所有</div>
      </div>
    )
  }
})