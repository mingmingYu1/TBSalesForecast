import React from 'react'
import { Link } from 'react-router'
import DataTable from 'bfd-ui/lib/DataTable'
import message from 'bfd-ui/lib/message'
import env from '../../../env'
import regNum from 'public/regNum'
import xhr from 'bfd-ui/lib/xhr'
import './index.less'

const DETAIL = (env.basePath + '/detail').replace(/\/\//, '/')
const COMPARE = (env.basePath + '/compare').replace(/\/\//, '/')

export default React.createClass({

  getInitialState() {
    return {
      rowNums: [],
      tableUrl: '',
      spIds: '',
      sort: 'rlSaleNum',
      order: 'desc'
    }
  },

  handleDetailClick(item, e) {
    e.target.href = 'javascript:void(0)'
    xhr({
      type: 'get',
      url: 'checkSession',
      async: true,
      success() {
        e.target.href = DETAIL+"?spId="+item.spId 
      }
    })
  },
  
  getColumn(rowNums) {
    let column = [{
        title: '排行',
        key: 'rowNum',
        width: '7%',
        render: (text, item) => {
          if (Number(item.rlSaleRate) < 0) {
            return <span className="colorRed">{text}</span>
          }
          return text
        }
      },{
        title: '商品简称',
        key: 'spShortName',
        width: '35%',
        render: (text, item) => {
          if (Number(item.rlSaleRate) < 0) {
            return <span className="colorRed" title={text}>{text}</span>
          }
          return <span title={text}>{text}</span>
        }
      },{
        title: '历史累计销量',
        key: 'rlSaleNumAccum',
        order: true,
        width: '15%',
        render: (text, item) => {
          if (Number(item.rlSaleRate) < 0) {
            return <span className="colorRed">{text}</span>
          }
          return text
        }
      },{
        title: '上月实际销量',
        key: 'rlSaleNum',
        order: 'desc',
        width: '15%',
        render: (text, item) => {
          if (Number(item.rlSaleRate) < 0) {
            return <span className="colorRed">{regNum.formatNumber(text)}</span>
          }
          return regNum.formatNumber(text)
        }
      },{
        title: '环比(%)',
        key: 'rlSaleRate',
        width: '10%',
        render: (text, item) => {
          if (!text) {
            return <span className="empet">-</span>
          }
          if (Number(text) < 0) {
            return <span className="colorRed">{regNum.formatDecimal(text)}</span>
          }
          return regNum.formatDecimal(text)
        }
      },{
        title: '操作',
        /**
         * @param item  当前数据对象
         * @param component 当前
         * @returns {XML}  返回dom对象
         */
        width: '12%',
        render:(item, component) => {
          let bol = false
          if(rowNums.length >= 1) {
            rowNums.map((rowNum, i) => {
              if(rowNum === item.rowNum) {
                bol = true
                return 
              }
            })
          }
          return (
            <span>
              <a href='javascript:void(0)' target='_blank' onClick = {this.handleDetailClick.bind(this, item)}>详情&nbsp;&nbsp;</a>
              {
                bol ? <a href='javascript:void(0)' target='_blank' onClick = {this.handleComparedClick.bind(this, item)}>统计</a>
                  : <span className="ccc">统计</span>
              }
            </span>
          )
        },
        key: 'operation'//注：operation 指定为操作选项和数据库内字段毫无关联，其他key 都必须与数据库内一致
      }]

    return column
  },

  handleComparedClick(item, e) {
    e.target.href = 'javascript:void(0)'
    let spIds = this.state.spIds
    xhr({
      type: 'get',
      async: true,
      url: 'checkSession',
      success() {
        if (!spIds || !(spIds.split(',').length >= 2)) {
          message.danger('您必须选择两个或两个以上的商品！', 4)
        } else {
          e.target.href = COMPARE+"?spIds="+spIds
        }
      } 
    })
  },
  
  componentDidMount() {

  },

  componentWillReceiveProps(prevProps) {
    this.setState({
      spIds: '',
      rowNums: []
    })
  },

  handleCheckboxSelect(selectedRows, allSelectedRows) {
    let rowNums = []
    let spIdArr = []
    selectedRows.map((item, i) => {
      spIdArr.push(item.spId)
      rowNums.push(item.rowNum)
    })
    let spIds = spIdArr.join(',')
    this.setState({
      spIds, rowNums
    })
  },
  
  getTableUrl() {
    let sort = this.state.sort
    let order = this.state.order
    let tableUrl = this.state.tableUrl

    if (this.props.params && this.props.params.id !== "all") {
      tableUrl = 'forecast/queryCateTop10?spcId='+String(this.props.params.id)+'&sort='+sort+'&order='+order
    } else if (this.props.params && this.props.params.id === "all") {
      tableUrl = 'forecast/queryAllTop20?sort='+sort+'&order='+order
    }

    if (this.props.id && this.props.id !== 'all') {
      tableUrl = 'forecast/queryCateTop10?spcId='+String(this.props.id)+'&sort='+sort+'&order='+order
    } else if (this.props.id && this.props.id === 'all') {
      tableUrl = 'forecast/queryAllTop20?sort='+sort+'&order='+order                       
    }
    return tableUrl
  },
  
  handleOrder(sort, order) {
    this.setState({
      sort: sort,
      order: order
    })
  },

  render() {
    
    let tableUrl = this.getTableUrl()
    let column = this.getColumn(this.state.rowNums)
    
    let name = this.props.location && this.props.location.query.name ? this.props.location.query.name : this.props.name  || '全部分类(TOP20)'
    return (
      <div className="function-list">
        <div className="link">
          <Link to={env.basePath+'forecast'}>销量预测 </ Link> > <span>{name}</span>
        </div>
        <div className="tableContainer tableIop">
          <DataTable
            url={tableUrl}
            showPage="false"
            column= {column}
            onCheckboxSelect={this.handleCheckboxSelect}
            onOrder={this.handleOrder}
            />
        </div>
      </div>
    )
  }
})