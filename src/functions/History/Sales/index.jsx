import React, { PropTypes }from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'
import Fetch from 'bfd-ui/lib/Fetch'
import DataTable from 'bfd-ui/lib/DataTable'
import { Select, Option } from 'bfd-ui/lib/Select'
import Icon from 'bfd-ui/lib/Icon'
import Button from 'bfd-ui/lib/Button'
import message from 'bfd-ui/lib/message'
import echarts from 'echarts'
import EchartsDom from '../EchartsDom'
import regNum from 'public/regNum'
import handleDate from 'public/handleDate'
import env from '../../../env'
import './index.less'

const Sales = React.createClass({

  contextTypes:{
    index: PropTypes.object
  },

  getChildContext() {
    return {
      parent: this
    }
  },

  getInitialState() {
    return {
      aActive: true,
      selectDate: '1',
      selectCategory: '',
      selectProduct: '',
      page  :1,
      chartData: null,
      column: [
        {
          title:'序号',
          key:'rowNum'
        },{
          title:'时间',
          key:'rlStatDate'
        },{
          title:'累计销量',
          key:'rlSaleNumAccum',
          render: (text, item) => {
            return regNum.formatNumber(text)
          }
        },{
          title:'当期销量',
          key:'rlSaleNum',
          render: (text, item) => {
            return regNum.formatNumber(text)
          }
        },{
          title:'累计销售额',
          key:'rlSaleAmtAccum',
          render: (text, item) => {
            return regNum.formatDecimal(text)
          }
        },{
          title:'当期销售额',
          key:'rlSaleAmt',
          render: (text, item) => {
            return regNum.formatDecimal(text)
          }
        }
      ],
      chartUrl: 'history/queryHistorySalesChart?dateDim=1&topCate=&proSupplier=',
      tableUrl: 'history/queryHistorySalesTable?currentPage=1&pageSize=10&dateDim=1',
      startValue: handleDate.getDayDate(),
      selected: {
        '当期销量': false,
        '累计销量': true,
        '当期金额': false,
        '累计金额': true
      }
    }
  },

  componentDidMount() {

  },

  handleSelectDate(selectDate) {
    this.setState({selectDate})
  },

  handleSelectCategory(selectCategory) {
    this.setState({selectCategory})
  },

  handleSelectProduct(selectProduct) {
    this.setState({selectProduct})
  },

  clearInputNum() {
    let num = ReactDOM.findDOMNode(this.refs.table).querySelectorAll('.number')[0]
    num ? num.value = "" : null
  },

  handleClick() {

    let { selectDate, selectCategory, selectProduct, page, aActive} = this.state

     if (aActive) {
       this.setState({
         chartUrl: 'history/queryHistorySalesChart?dateDim='+selectDate+'&topCate='+selectCategory+'&proSupplier='+selectProduct
       })
     } else {
       this.clearInputNum()
       this.setState({
         tableUrl: 'history/queryHistorySalesTable?dateDim='+selectDate+'&topCate='+selectCategory+'&proSupplier='+selectProduct+'&currentPage='+page+'&pageSize=10'
       })
     }
  },

  handleClickResize() {

    this.clearInputNum()

    this.setState({
      selectDate: '1',
      selectCategory: '',
      selectProduct: '',
      page: 1,
      chartUrl: 'history/queryHistorySalesChart?dateDim=1&topCate=&proSupplier=',
      tableUrl: 'history/queryHistorySalesTable?currentPage=1&pageSize=10&dateDim=1'
    })
  },

  handleSuccess(chartData) {

    if(!chartData || !chartData.xAxisData) {
      message.danger('根据您的查询条件，查询结果为空！', 4)
      chartData = null
    }
    let selectDate = this.state.selectDate
    let startValue
    if (selectDate == 1) {
      startValue = handleDate.getDayDate()
    } else if (selectDate == 2) {
      startValue = handleDate.getWeek(180)
    } else if (selectDate == 3) {
      startValue = handleDate.getMonthDate()
    }
    this.setState({
      chartData,
      startValue
    })
  },

  handleChart(e) {
    e.preventDefault()
    let { selectDate, selectCategory, selectProduct} = this.state
    this.setState({
      aActive: true,
      chartUrl: 'history/queryHistorySalesChart?dateDim='+selectDate+'&topCate='+selectCategory+'&proSupplier='+selectProduct
    })
  },

  handleTable(e) {
    e.preventDefault()
    let { selectDate, selectCategory, selectProduct, page} = this.state
    this.setState({
      aActive: false,
      tableUrl: 'history/queryHistorySalesTable?dateDim='+selectDate+'&topCate='+selectCategory+'&proSupplier='+selectProduct+'&currentPage='+page+'&pageSize=10'
    })
  },

  componentWillUpdate() {},

  onPageChange(page) {

    let {selectDate, selectCategory, selectProduct} = this.state
    this.setState({
      tableUrl: 'history/queryHistorySalesTable?currentPage='+page+'&pageSize=10&dateDim='+selectDate+'&topCate='+selectCategory+'&proSupplier='+selectProduct
    })
  },

  render() {

    const renderDate = item => <Option value={item.dictValue}>{item.dictText}</Option>

    const renderCategory = item => <Option value={item.spcId}>{item.spcName}</Option>

    const renderProduct = item => <Option value={item.spsId}>{item.spsName}</Option>

    let chartActive, tableActive

    let styleChart = {
      display: 'block'
    }

    let styleTable = {
      display: 'none'
    }

    if (this.state.aActive) {
      chartActive = 'active'
      styleChart = {
        display: 'block'
      }
      styleTable = {
        display: 'none'
      }
    } else {
      tableActive = 'active'
      styleChart = {
        display: 'none'
      }
      styleTable = {
        display: 'block'
      }
    }

    return (
      <div className="function-sales">
        <div className="link">
          <Link to={env.basePath+'history'}>辅助管理</ Link> > <span>历史销量统计查询</span>
        </div>
        <div className="firstSelect">
          <div className="inlineBlock">
            <span>时间维度：</span>
            <Select url="common/queryDateDim" render={renderDate}
                    value={this.state.selectDate} onChange={this.handleSelectDate}/>
          </div>
          <div className="inlineBlock">
            <span>商品分类：</span>
            <Select url="common/queryTopCategory" render={renderCategory} value={this.state.selectCategory}
                    defaultOption={<Option value="">全部</Option>} onChange={this.handleSelectCategory}/>
          </div>
          <div className="inlineBlock">
            <span>供应商：</span>
            <Select ref="searchSelect" searchable url="common/queryProductSuppliers" render={renderProduct} value={this.state.selectProduct}
                    defaultOption={<Option value="">全部</Option>} onChange={this.handleSelectProduct}/>
          </div>
          <div className="inlineBlock">
            <Button type="primary" onClick={this.handleClick}>查询</Button>
            <Button type="primary" onClick={this.handleClickResize}>重置</Button>
          </div>
        </div>
        <div className="over">
          <div className="pull-right aBtn">
            <a className={chartActive} title='折线图' href="javascript: void(0)" onClick={this.handleChart}><Icon type="area-chart"/></a>
            <a style={{marginLeft: 10}} title='数据表' className={tableActive} href="javascript: void(0)" onClick={this.handleTable}><Icon type="list"/></a>
          </div>
        </div>
        <div style={{marginTop: 10}}>
          <div style={styleChart} className="chartContainer">
            <Fetch url={this.state.chartUrl} onSuccess={this.handleSuccess}></Fetch>
            <EchartsDom active={this.state.aActive} chartData={this.state.chartData} startValue={this.state.startValue}/>
          </div>
          <div className="tableContainer" style={styleTable}>
            <DataTable
              url={this.state.tableUrl}
              onPageChange={this.onPageChange}
              showPage="true"
              column={this.state.column}
              howRow={10}
              ref = 'table'
              >
            </DataTable>
          </div>
        </div>
      </div>
    )
  }
})

Sales.childContextTypes = {
  parent: PropTypes.instanceOf(Sales)
}

export default Sales