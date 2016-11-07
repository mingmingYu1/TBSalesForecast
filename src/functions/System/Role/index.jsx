import React from 'react'
import ReactDOM from 'react-dom'
import Fetch from 'bfd-ui/lib/Fetch'
import { Link } from 'react-router'
import xhr from 'bfd-ui/lib/xhr'
import DataTable from 'bfd-ui/lib/DataTable'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import confirm from 'bfd-ui/lib/confirm'
import message from 'bfd-ui/lib/message'
import { Form, FormItem } from 'bfd-ui/lib/Form2'
import FormInput from 'bfd-ui/lib/FormInput'
import update from 'react-update'
import get from 'lodash/get'
import SelectTree from 'bfd-ui/lib/Tree/SelectTree'
import auth from 'public/auth'
import env from '../../../env'
import regNum from 'public/regNum'
import './index.less'

export default React.createClass({

  getInitialState() {

    this.update = update.bind(this)
    this.arrId = []
    const w = /^([\u4E00-\u9FFF]|[\w]|[\.])+$/

    //    验证
    this.rules ={
      roleName(str) {
        let v = str ? regNum.trim(String(str)) : null
        if(!v) {return '角色名称不可为空！'}
        if(v.length > 20) {return '角色名称不可大于20个字符！'}
        if(!w.test(v)) {return '角色名称不可含有特殊字符！'}
      },
      menus(v) {
        if(!v || v.length === 0) {return '权限不可为空！'}
      }
    }

    return {
      tableUrl: 'role/query',     
      column: [
        {
          title:'角色名称',
          key:'roleName',
          width: '15%',
          render: (text, item) => {
            return <span title={text}>{text}</span>
          }
        },{
          title:'拥有权限',
          key:'menus',
          width: '70%',
          render: (text, item) => {
            return <span title={text}>{text}</span>
          }
        },{
          title:'操作',
          width: '15%',
          render: (item, component) => {
            let roleIdList = auth.user.roleIdList || []
            let bol = false
            roleIdList.map((num, i) => {
              if(num === item.roleId) {
                bol = true
                return 
              }
            })
            if(item.roleId === 1) {
              return (
                <span>
                  { auth.user.type.ROLE_EDIT === 1 ? <span className="ccc">编辑&nbsp;&nbsp;</span> : null}
                  { auth.user.type.ROLE_DELETE=== 1 ? <span className="ccc">删除</span> : null}
                </span>
              )
            } else if(!bol) {
              return (
                <span>
                  { auth.user.type.ROLE_EDIT === 1 ? <a href = "javascript:void(0);" onClick = { () => {this.handleClickEdit(item)} }>编辑&nbsp;&nbsp;</a> : null
                  }
                  { auth.user.type.ROLE_DELETE=== 1 ? <a href = "javascript:void(0);" onClick = { () => {this.handleClickRemove(item)} }>删除</a> : null}
                  
                </span>
              )
            } else {
              return (
                <span>
                  { auth.user.type.ROLE_EDIT === 1 ? <span className="ccc">编辑&nbsp;&nbsp;</span> : null}
                  { auth.user.type.ROLE_DELETE=== 1 ? <span className="ccc">删除</span> : null}
                </span>
              )
            }
          },
          key: 'operation'
        }
      ],
      treeData: [],             
      formData: {
        //menus: this.arrId
      }
    }
  },

  //  增
  handleClickAdd() {
    this.refs.modal.open()
    this.setState({
      buttonText: '创建',
      text: '新增',
      treeUrl: 'menu/queryByRole',              
      treeData: [],
      formData: {}
    })
  },

  //  删
  handleClickRemove(item){
    confirm('您确认要删除 "'+item.roleName+'" 角色吗？', () => {
      this.removeAjax(item.roleId)
    })
  },

  //  删除请求
  removeAjax(roleId) {
    xhr({
      type: 'POST',    
      url: 'role/deleteRole',
      data: {roleId: roleId},
      success: this.handleRemoveSuccess
    })
  },

  //  删除成功回调
  handleRemoveSuccess(res) {
    if (res.code === 201) {
      message.success(res.message, 2)
      this.clearNumberInput()
      this.setState({tableUrl: 'role/query?pageSize=10&currentPage=1&time='+new Date()})        //     /role/query
    } else {
      message.danger(res.message, 4)
    }
  },

  //  改
  handleClickEdit(item) {
    this.refs.modal.open()
    this.setState({
      text: '编辑',
      buttonText: '保存',
      treeUrl: 'menu/queryByRole?roleId='+item.roleId,            
      treeData: [],
      formData: {
        roleName: item.roleName,
        roleId: String(item.roleId)
      }
    })
  },

  clearNumberInput() {
    let num = ReactDOM.findDOMNode(this.refs.table).querySelectorAll('.number')[0]
    num ? num.value = "" : null
  },

  //  表单改变
  handleFormChange() {},

  // 表单成功回调
  handleSuccess(res) {
    if (res.code === 201) {
      this.refs.modal.close()
      this.clearNumberInput()
      message.success(res.message, 2)
      this.setState({tableUrl: 'role/query?pageSize=10&currentPage=1&time='+new Date()})     //   //     /role/query
    } else {
      message.danger(res.message, 4)
    }
  },

  //  表单提交按钮
  handleSave() {
    this.refs.form.validate(this.state)
    this.refs.form.save()
  },

  //  取消按钮
  handleFormClose() {
    this.refs.modal.close()
  },

  //  获取选中tree的Id
  forTree(data) {
    let length = data.length
    for(let i = 0; i < length; i++) {
      if(data[i].checked) {
        this.arrId.push(data[i].menuId)
      }
      if (data[i].children && data[i].children.length > 0) {
        this.forTree(data[i].children)
      }
    }
  },

  updateChildren(item, path, checked, objTree) {
    if (!item || !item.children) {
      this.arrId = []
      this.forTree(objTree)
      return
    }
    path = path = [...path, 'children']
    if(!checked) {
      item.children.forEach((item, i) => {
        if (item.checked !== checked) {
          this.objTree = this.update('set', [...path, i, 'checked'], checked)
        }
        this.updateChildren(item, [...path, i], checked, this.objTree)
      })
    }
  },

  updateParent(data, path, checked, objTree) {
    if (path.length <= 1) {
      this.arrId = []
      this.forTree(objTree)
      return
    }
    const parent = get(data, path.slice(1))
    checked = parent.children.filter(item => item.checked).length > 0 || parent.checked
    data = this.update('set', [...path, 'checked'], checked)
    this.objTree = this.update('set', [...path, 'checked'], checked)
    this.updateParent(data, path.slice(0, -2), checked, this.objTree)
  },

  //  树复选框选择回调
  handleSelect(data, item, path, checked) {

    //   为了保存已修改之后的treeData
    this.objTree = data

    // 所有子级节点是否选中
    this.updateChildren(item, ['treeData', ...path], checked, this.objTree)

    // 所有父级节点是否选中
    this.updateParent(data, ['treeData', ...path.slice(0, -2)], checked, this.objTree)

    this.refs.tree.validate(this.arrId)
    const formData = this.state.formData
    formData.menus = this.arrId
    this.setState({formData})
  },

  //  tree加载成功回调
  handleTreeSuccess(treeData) {
    this.arrId = []
    this.forTree(treeData)
    const formData = this.state.formData
    formData.menus = this.arrId
    this.setState({treeData: treeData, formData: formData})
  },

  onPageChange(page) {
    this.setState({
      tableUrl: 'role/query?pageSize=10&currentPage='+page
    })
  },

  render() {
    return (
      <div className="function-role">
        <div className="link"><Link to={env.basePath+'system'}>系统管理</Link> > <span>角色管理</span></div>
        {
          auth.user.type.ROLE_ADD === 1 ?
            <button className='btn btn-primary marginTop' onClick={this.handleClickAdd}>
              <sapn className='glyphicon glyphicon-plus'></sapn>&nbsp;&nbsp;新增
            </button>
            : null
        }
        <div className='marginTop tableContainer'>
          <DataTable ref="table" url={this.state.tableUrl} onPageChange={this.onPageChange} showPage="true" column={this.state.column} howRow={10}></DataTable>
        </div>
        <Modal ref="modal">
          <ModalHeader>
            <h4 className="modal-title">{this.state.text}</h4>
          </ModalHeader>
          <ModalBody>
            <Form className="function-form" ref="form" action="role/operateRole" data={this.state.formData} rules={this.rules} onChange={this.handleFormChange} onSuccess={this.handleSuccess}>
              <FormItem style={{display: 'none'}} name="roleId">
                <FormInput></FormInput>
              </FormItem>
              <FormItem label="角色名称" required name="roleName" help="20个字以内">
                <FormInput style={{width: '350px'}}></FormInput>
              </FormItem>
              <FormItem ref="tree" label="权限" name="menus">
                <div className="treeContainer">
                  <Fetch  url={this.state.treeUrl} onSuccess={this.handleTreeSuccess}>
                    <SelectTree
                      data={this.state.treeData}
                      onChange={data => this.update('set', 'treeData', data)}
                      onSelect={this.handleSelect}
                      />
                  </Fetch>
                </div>
              </FormItem>
              <div style={{textAlign: 'center'}}>
                <button type="button" className="btn btn-primary" onClick={this.handleSave}>{this.state.buttonText}</button>
                <button type="button" style={{marginLeft: '20px'}} className="btn btn-default" onClick={this.handleFormClose}>取消</button>
              </div>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})