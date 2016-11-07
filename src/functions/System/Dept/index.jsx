import React from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'
import xhr from 'bfd-ui/lib/xhr'
import DataTable from 'bfd-ui/lib/DataTable'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import confirm from 'bfd-ui/lib/confirm'
import message from 'bfd-ui/lib/message'
import { Form, FormItem } from 'bfd-ui/lib/Form2'
import FormInput from 'bfd-ui/lib/FormInput'
import { FormSelect, FormOption } from 'bfd-ui/lib/FormSelect'
import { Select, Option } from 'bfd-ui/lib/Select2'
import auth from 'public/auth'
import env from '../../../env'
import regNum from 'public/regNum'
import './index.less'

export default React.createClass({

  getInitialState() {

    //    验证
    const w = /^([\u4E00-\u9FFF]|[\w]|[\.])+$/
    this.rules ={
      deptName(str) {
        let v = str ? regNum.trim(String(str)) : null
        if(!v) {return '部门名称不可为空！'}
        if(v.length > 20) {return '部门名称长度不可大于20字符！！'}
        if(!w.test(v)) {return '部门名称不可含有特殊字符！'}
      },
      parentId(v) {
        if(!v) {return '上级部门不可为空！'}
      }
    }

    return {
      tableUrl: 'dept/query',
      column: [
        {
          title:'部门名称',
          key:'deptName'
        },{
          title:'上级部门',
          key:'parentName'
        },{
          title:'操作',
          render:(item, component)=> {
            return (
              <span>
                {
                  auth.user.type.DEPT_EDIT === 1 ? 
                    auth.user.deptId === item.deptId || !item.parentId ? 
                      <span className='ccc'>编辑&nbsp;&nbsp;</span> : <a href = "javascript:void(0);" onClick = { () => {this.handleClickEdit(item)} }>编辑&nbsp;&nbsp;</a>
                    : null
                }
                {
                  auth.user.type.DEPT_DELETE === 1 ? 
                    auth.user.deptId === item.deptId || !item.parentId ? 
                      <span className='ccc'>删除&nbsp;&nbsp;</span> : <a href = "javascript:void(0);" onClick = { () => {this.handleClickRemove(item)} }>删除</a>
                    : null
                }
              </span>
            )
          },
          key: 'operation'
        }
      ],
      selectUrl: 'dept/getDeptIdName',
      formData: {
        parentId: ''
      }
    }
  },

  //   增
  handleClickAdd() {
    this.refs.modal.open()
    this.setState({
      text: '新增',
      buttonText: '创建',
      formData: {
        parentId: ""
      }
    })
  },

  //  删
  handleClickRemove(item) {
    confirm('您确认要删除 "'+item.deptName+'" 部门吗？', () => {
      this.removeAjax(item.deptId)
    })
  },

  //  删除请求
  removeAjax(deptId) {
    xhr({
      type: 'POST',
      url: 'dept/deleteDept',
      data: {deptId: deptId},
      success: this.handleRemoveSuccess
    })
  },

  //  删除成功回调
  handleRemoveSuccess(res) {
    if (res.code === 201) {
      message.success(res.message, 2)
      let num = ReactDOM.findDOMNode(this.refs.table).querySelectorAll('.number')[0]
      num ? num.value = "" : null
      this.setState({tableUrl: 'dept/query?pageSize=10&currentPage=1&time='+new Date()})
    }else {
      message.danger(res.message, 4)
    }
  },

  //   改
  handleClickEdit(item) {
    this.refs.modal.open()
    if (!item.parentId) {
      item.parentId = ""
    }
    this.setState({
      text: '编辑',
      buttonText: '保存',
      formData: {
        deptName: item.deptName,
        parentId: item.parentId,
        deptId: String(item.deptId)
      }
    })
  },

  //  表单成功回调
  handleSuccess(res) {
    if (res.code === 201) {
      this.refs.modal.close();
      let num = ReactDOM.findDOMNode(this.refs.table).querySelectorAll('.number')[0]
      num ? num.value = "" : null
      message.success(res.message, 2)
      this.setState({tableUrl: 'dept/query?pageSize=10&currentPage=1&time='+new Date()})
    } else {
      message.danger(res.message, 4)
    }
  },

  //  表单下拉框选择
  handleFormSelect(parentId) {
    this.refs.selectItem.validate(parentId)
    const formData = this.state.formData
    formData.parentId = parentId
    this.setState({ formData })
  },

  //  表单改变
  handleFormChange(formData) {},

  //  表单提交按钮
  handleSave() {
    if(this.state.formData.deptId == this.state.formData.parentId) {
      message.danger("上级部门不能是部门本身！", 4)
      return
    }
    this.refs.form.validate(this.state)
    this.refs.form.save()
  },

  //   取消按钮
  handleFormClose() {
    this.refs.modal.close();
  },

  onPageChange(page) {
    this.setState({tableUrl: 'dept/query?pageSize=10&currentPage='+page})
  },

  render() {
    const render = item => <Option value={item.deptId}>{item.deptName}</Option>
    return (
      <div className="function-dept">
        <div className="link"><Link to={env.basePath+'system'}>系统管理</Link> > <span>部门管理</span></div>
        {
          auth.user.type.DEPT_ADD === 1 ? <button className='btn btn-primary marginTop' onClick={this.handleClickAdd}><sapn className='glyphicon glyphicon-plus'></sapn>&nbsp;&nbsp;新增</button> : null
        }
        <div className='marginTop tableContainer'>
          <DataTable ref="table" url={this.state.tableUrl} onPageChange={this.onPageChange} showPage="true" column={this.state.column} howRow={10}></DataTable>
        </div>
        <Modal ref="modal">
          <ModalHeader>
            <h4 className="modal-title">{this.state.text}</h4>
          </ModalHeader>
          <ModalBody>
            <Form className="function-form" ref="form" action="dept/operateDept" data={this.state.formData} rules={this.rules} onChange={this.handleFormChange} onSuccess={this.handleSuccess}>
              <FormItem style={{display: 'none'}} name="deptId">
                <FormInput></FormInput>
              </FormItem>
              <FormItem label="部门名称" required name="deptName" help="20个字以内">
                <FormInput style={{width: '350px'}}></FormInput>
              </FormItem>
              <FormItem ref="selectItem" label="上级部门" name="parentId">
                <Select value={this.state.formData.parentId} url={this.state.selectUrl} defaultOption={<Option value="">请选择</Option>} render={render} onChange={this.handleFormSelect}/>
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