import React from 'react'
import ReactDOM from 'react-dom'
import Fetch from 'bfd-ui/lib/Fetch'
import xhr from 'bfd-ui/lib/xhr'
import { Link } from 'react-router'
import DataTable from 'bfd-ui/lib/DataTable'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import confirm from 'bfd-ui/lib/confirm'
import message from 'bfd-ui/lib/message'
import Button from 'bfd-ui/lib/Button'
import { Form, FormItem } from 'bfd-ui/lib/Form2'
import FormInput from 'bfd-ui/lib/FormInput'
import { Select, Option } from 'bfd-ui/lib/Select2'
import ClearableInput from 'bfd-ui/lib/ClearableInput'
import { CheckboxGroup, Checkbox } from 'bfd-ui/lib/Checkbox'
import { RadioGroup, Radio } from 'bfd-ui/lib/Radio'
import auth from 'public/auth'
import env from '../../../env'
import regNum from 'public/regNum'
import './index.less'

export default React.createClass({

  getInitialState() {
    const regPassword = /^(?!\d+$)(?![a-zA-Z]+$)[0-9A-Za-z]+$/
    const regUserName = /^[0-9A-Za-z][0-9A-Za-z\.]*$/
    const w = /^([\u4E00-\u9FFF]|[\w]|[\.])+$/

    //    验证
    this.rules ={
      realName(str) {
        let v = str ? regNum.trim(String(str)) : null
        if(!v) { return '姓名不可为空！'}
        if(v.length > 20) {return '姓名长度不可大于20字符！'}
        if(!w.test(v)) {return '姓名不可含有特殊字符！'}
      },
      userNameObj(data) {
        if(typeof data === "string") {
          data = JSON.parse(data)
        }
        if(!data || !data.userName) {return '用户名不可为空！'}
        let v = data.userName
        if(!regUserName.test(v)) {return '用户名必须为字母（大小写都可）或数字或" . "且不可以" . "开头！'}
        if(v.length > 20) {return '用户名长度不可大于20字符！'}
        if(data.text === "新增") {
          if(v === data.password) { return '用户名和密码不能相同！' }
        }
      },
      passwordObj(data) {
        if(typeof data === "string") {
          data = JSON.parse(data)
        }
        if(!data || !data.password) {return '密码不可为空！'}
        let v = data.password
        if(!regPassword.test(v)) {return '密码必须为字母（大小写都可）和数字的组合！'}
        if(v.length > 16 || v.length < 8) {return '密码的长度必须在8-16之间 ！'}
        if(data.text === "新增") {
          if(v === data.userName) { return '用户名和密码不能相同！' }
        }
      },
      deptId(v) {
        if(!v) {return '部门不可为空！'}
      },
      roles(v) {
        if(!v || v.length === 0) {return '角色不能为空！'}
      }
    }

    return {
      tableUrl: 'user/query?queryType=0&currentPage=1&pageSize=10',
      column: [
        {
          title:'姓名',
          key:'realName',
          width: '10%',
          render: (text) => {
            return (
              <span title={text}>{text}</span>
            )
          }
        },{
          title:'账号',
          key:'userName',
          width: '10%',
          render: (text) => {
            return (
              <span title={text}>{text}</span>
            )
          }
        },{
          title:'所属部门',
          key:'deptName',
          width: '16%',
          render: (text) => {
            return (
              <span title={text}>{text}</span>
            )
          }
        },{
          title:'所属角色',
          key:'roles',
          width: '44%',
          render: (text) => {
            return (
              <span title={text}>{text}</span>
            )
          }
        },{
          title:'操作',
          width: '20%',
          render:(item, component)=> {
            return (
              <span>
                {
                  auth.user.type.RESET_PASSWORD === 1 ? 
                    item.userName.toLowerCase() === auth.user.userId.toLowerCase() || item.userId === 1 ? 
                      <span className="color">重置密码&nbsp;&nbsp;</span> : <a href = "javascript:void(0);" onClick = { () => {this.handleClickResetPassword(item)} }>重置密码&nbsp;&nbsp;</a>
                    : null
                }
                {
                  auth.user.type.USER_EDIT === 1 ? 
                    auth.user.userId.toLowerCase() === item.userName.toLowerCase() || item.userId === 1 ? <span className="color">编辑&nbsp;&nbsp;</span>
                      : <a href = "javascript:void(0);" onClick = { () => {this.handleClickEdit(item)} }>编辑&nbsp;&nbsp;</a>
                    : null
                }
                {
                  auth.user.type.USER_DELETE === 1 ?
                    auth.user.userId.toLowerCase() === item.userName.toLowerCase() || item.userId === 1 ? <span className="color">删除</span>
                      : <a href = "javascript:void(0);" onClick = { () => {this.handleClickRemove(item)} }>删除</a>
                    : null
                 }
              </span>
            )
          },
          key: 'operation'
        }
      ],
      queryType: '0',
      value: '',
      page: 1,
      userBig: false,
      userId: '',
      checkData: [],
      formData: {}
    }
  },
  
  //   重置密码
  handleClickResetPassword(item) {
    let userId = Number(item.userId)
    confirm('您确认要重置 "'+item.realName+'" 用户的密码吗？', () => {
      xhr({
        type: 'get',
        url: 'user/resetPassword?userId='+userId,
        success: this.handleResetPasswordSuccess
      })
    })
  },
  
  handleResetPasswordSuccess(res) {
    if (res.code === 201) {
      message.success(res.message || '密码重置yodata88成功！', 2)
    } else {
      message.danger(res.message, 4)
    }
  },

  //  增
  handleClickAdd() {
    this.refs.modal.open()
    this.setState({
      buttonText: '创建',
      text: '新增',
      edit: false,
      userBig: false,
      radioBrand: '1',
      formData: {
        deptId: '',
        status: '1',
        roles: []
      }
    })
  },

  //  删
  handleClickRemove(item){
    confirm('您确认要删除 "'+item.realName+'" 用户吗？', () => {
      this.removeAjax(item.userId)
    })
  },

  //   删除请求
  removeAjax(userId) {
    xhr({
      type: 'POST',
      url: 'user/deleteUser',
      data: {userId: userId},
      success: this.handleRemoveSuccess
    })
  },

  //  删除成功回调
  handleRemoveSuccess(res) {
    if (res.code === 201) {
      this.clearInputNumber()
      message.success(res.message, 2)
      this.setState({tableUrl: 'user/query?pageSize=10&currentPage=1&queryType=0&time='+new Date()})
    } else {
      message.danger(res.message, 4)
    }
  },

  //  改
  handleClickEdit(item) {
    this.refs.modal.open()
    let roles = []
    if (item.roleIds) {
      item.roleIds.split(",").map((item) => {
        roles.push(Number(item))
      })
    }
    this.setState({
      text: '编辑',
      buttonText: '保存',
      edit: true,
      userBig: item.userId === 1,
      userName: item.userName,
      formData: {
        userId: String(item.userId),
        realName: item.realName,
        userName: item.userName,
        //   用于封装验证
        userNameObj: {
          userName: item.userName
        },
        //   用于封装验证
        passwordObj: {
          password: 'ssuu1278'
        },
        deptId: item.deptId,
        status: item.status,
        roles: roles
      }
    })
  },

  //  查
  handleInquire() {
    let { queryType, value, page } = this.state
    this.clearInputNumber()
    this.setState({
      tableUrl: 'user/query?queryType='+queryType+'&value='+regNum.trim(String(value))+'&currentPage='+page+'&pageSize=10'
    })
  },

  // 重置
  handleReset() {
    this.clearInputNumber()
    this.setState({
      tableUrl: 'user/query?queryType=0&currentPage=1&pageSize=10',
      queryType: '0',
      page: 1,
      value: ''
    })
  },

  clearInputNumber() {
    let num = ReactDOM.findDOMNode(this.refs.table).querySelectorAll('.number')[0]
    num ? num.value = "" : null
    return num
  },

  //  查询下拉
  handleSelect(queryType) {
    this.setState({queryType: queryType})
  },
  
  //  查询input
  handleInput(value) {
    this.setState({value: value})
  },

  //用户名
  handleUserName(userName) {
    let userNameObj = {
      userName: userName,
      text: this.state.text,
      password: this.state.formData.password
    }
    this.refs.userNameInput.validate(userNameObj)
    const formData = this.state.formData
    formData.userNameObj = userNameObj
    formData.userName = userName
    this.setState({formData})
  },

  //  密码
  handlePassword(password) {
    let passwordObj = {
      password: password,
      text: this.state.text,
      userName: this.state.formData.userName
    }
    this.refs.passwordInput.validate(passwordObj)
    const formData = this.state.formData
    formData.passwordObj = passwordObj
    formData.password = password
    this.setState({formData})
  },

  //  表单下拉
  handleFormSelect(deptId) {
    this.refs.selectItem.validate(deptId)
    const formData = this.state.formData
    formData.deptId = deptId
    this.setState({formData})
  },

  //   多选框成功回调
  handleCheckSuccess(checkData) {
    this.setState({checkData})
  },

  //  表单多选择框
  handleFormCheckBox(roles) {
    this.refs.checkBoxItem.validate(roles)
    const formData = this.state.formData
    formData.roles = roles
    this.setState({formData})
  },

  //  表单单选
  handleFormRadio(status) {
    const formData = this.state.formData
    formData.status = status
    this.setState({formData})
  },

  //  表单改变
  handleFormChange(formData) {
    //this.setState({ formData })
  },

  //  表单提交按钮
  handleFormSave() {
    this.refs.form.validate(this.state.formData)
    this.refs.form.save()
  },

  //  表单成功回调
  handleFormSuccess(res) {
    console.log(res)
    if (res.code === 201) {
      this.refs.modal.close();
      this.clearInputNumber()
      message.success(res.message, 2)
      this.setState({
        tableUrl: 'user/query?pageSize=10&currentPage=1&queryType=0&time='+new Date(),
        queryType: '0',
        value: ''
      })
    } else {
      message.danger(res.message, 4)
    }
  },

  //  表单取消按钮
  handleFormClose() {
    this.refs.modal.close();
  },

  onPageChange(page) {
    let { queryType, value} = this.state
    this.setState({
      tableUrl: 'user/query?queryType='+queryType+'&value='+regNum.trim(String(value))+'&currentPage='+page+'&pageSize=10'
    })
  },

  render() {

    const styleInput = {}
    const styleRadio = {}
    styleInput.display = this.state.edit ? 'none' : 'block'
    styleRadio.display = this.state.edit ? 'block' : 'none'
    const render = item => <Option value={item.deptId}>{item.deptName}</Option>

    return (
      <div className="function-user">
        <div className="link"><Link to={env.basePath+'system'}>系统管理</Link> > <span>用户管理</span></div>
        <div className="marginTop selectText">
          <div className="inlineBlock">
            <span>类别：</span>
            <Select value={this.state.queryType} onChange={this.handleSelect}>
              <Option value="0">全部</Option>
              <Option value="1">按部门</Option>
              <Option value="2">按角色</Option>
              <Option value="3">按姓名</Option>
            </Select>
          </div>
          <div className="inlineBlock">
            <span>关键字：</span>
            <ClearableInput type="text" maxLength="20" placeholder="请输入关键字" inline={true} value={this.state.value} onChange={this.handleInput}/>
          </div>
          <div className="inlineBlock">
            <Button type="primary" onClick={this.handleInquire}>查询</Button>
            <Button type="primary" onClick={this.handleReset}>重置</Button>
          </div>
        </div>
        {
          auth.user.type.USER_ADD === 1 ?
            <button className='btn btn-primary marginTop' onClick={this.handleClickAdd}>
              <sapn className='glyphicon glyphicon-plus'></sapn>&nbsp;&nbsp;新增
            </button> : null
        }
        <div className='marginTop tableContainer'>
          <DataTable
            ref = "table"
            url={this.state.tableUrl}
            onPageChange={this.onPageChange}
            showPage="true"
            column={this.state.column}
            howRow={10}>
          </DataTable>
        </div>
        <Modal ref="modal">
          <ModalHeader>
            <h4 className="modal-title">{this.state.text}</h4>
          </ModalHeader>
          <ModalBody>
            <Form className="form function-form" ref="form" action="user/operateUser" data={this.state.formData}
                  rules={this.rules} onChange={this.handleFormChange} onSuccess={this.handleFormSuccess}>
              <FormItem style={{display: 'none'}} name="userId">
                <FormInput></FormInput>
              </FormItem>
              <FormItem label="姓名" required name="realName" help="20个字以内">
                <FormInput style={{width: '350px'}}></FormInput>
              </FormItem>
              <FormItem ref="userNameInput" label="用户名" required name="userNameObj" help="20个字以内">
                <ClearableInput
                  className="marginInput"
                  disabled={this.state.edit}
                  inline={true}
                  value={this.state.formData.userName}
                  style={{width: '350px'}}
                  onChange={this.handleUserName}/>
              </FormItem>
              <FormItem ref="passwordInput" label="密码" required name="passwordObj" help="8~16个字符" style={styleInput}>
                <ClearableInput
                  className="marginInput"
                  type="password"
                  inline={true}
                  value={this.state.formData.password}
                  style={{width: '350px'}}
                  onChange={this.handlePassword}/>
              </FormItem>
              <FormItem ref="selectItem" label="部门" required name="deptId">
                <Select className="marginInput" value={this.state.formData.deptId} url="dept/getDeptIdName"
                        defaultOption={<Option value="">请选择</Option>} render={render}
                        onChange={this.handleFormSelect}/>
              </FormItem>
              <FormItem style={{overflow: 'hidden'}} ref="checkBoxItem" label="角色" required name="roles" multiple>
                <Fetch  url="role/getRoleIdName" onSuccess={this.handleCheckSuccess}>
                  <CheckboxGroup selects={eval(this.state.formData.roles)} onChange={this.handleFormCheckBox}>
                    {
                      this.state.checkData.length > 0 ?
                        this.state.checkData.map(
                          (item, i) => {
                            if (this.state.userBig) {
                             return  <Checkbox key={i} value={item.roleId}>{item.roleName}</Checkbox>
                            } else {
                              return item.roleId !== 1 ? <Checkbox key={i} value={item.roleId}>{item.roleName}</Checkbox> : null
                            }
                          }) : null
                    }
                  </CheckboxGroup>
                </Fetch>
              </FormItem>
              <FormItem label="状态" required name="status" style={styleRadio}>
                <RadioGroup value={this.state.formData.status} onChange={this.handleFormRadio}>
                  <Radio value="0">冻结</Radio>
                  <Radio value="1">激活</Radio>
                </RadioGroup>
              </FormItem>
              <div style={{textAlign: 'center'}}>
                <button type="button" className="btn btn-primary" onClick={this.handleFormSave}>{this.state.buttonText}</button>
                <button type="button" style={{marginLeft: '20px'}} className="btn btn-default" onClick={this.handleFormClose}>取消</button>
              </div>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})