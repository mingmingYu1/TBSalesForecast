import React from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'
import { Select, Option } from 'bfd-ui/lib/Select'
import { DateRange } from 'bfd-ui/lib/DatePicker'
import Button from 'bfd-ui/lib/Button'
import DataTable from 'bfd-ui/lib/DataTable'
import message from 'bfd-ui/lib/message'
import regNum from 'public/regNum'
import env from '../../../env'
import './index.less'

export default React.createClass({

  getInitialState() {
    let date = new Date().valueOf()-24*3600*1000
    return {
      selectCategory: "",
      selectProduct: "",
      date: 'day',
      page: 1,
      max: date,
      start: date,
      end: date,
      column: [
        {
        title:'排名',
        key:'sequence'
      }, {
        title: '商品简称',
        key: 'spShortName'
      }, {
        title: '合计销量',
        key: 'rlSaleNum',
        render: (text, item) => {
          return regNum.formatNumber(text)
        }
      }, {
        title: '合计销售额（元）',
        key: 'rlSaleAmt',
        render: (text, item) => {
          return regNum.formatDecimal(text)
        }
      }
      ],
      tableUrl: 'history/queryHistorySingleSales?currentPage=1&pageSize=10&startDate='+date+'&endDate='+date
    }
  },

  handleSelectCategory(selectCategory) {
    this.setState({selectCategory})
  },

  handleSelectProduct(selectProduct) {
    this.setState({selectProduct})
  },

  handleSelectDateRange(start, end) {
    this.setState({start: start, end: end})
  },

  /*handleSelectDate(date) {
    if (date === "day") {
      this.setState({
        start: new Date().valueOf()-24*3600*1000,
        end: new Date().valueOf()-24*3600*1000,
        date
      })
      return
    }
    if (date === "week") {
      this.setState({
        start: new Date().valueOf()-7*24*3600*1000,
        end: new Date().valueOf()-24*3600*1000,
        date
      })
      return
    }
    if (date === "month") {
      let thisDate = new Date()
      let newDate = new Date(thisDate.valueOf()-thisDate.getDate()* 24 * 60 * 60 * 1000 )
      let thisDay = thisDate.getDate()
      let newDay = newDate.getDate()
      let retDay = new Date(thisDate.setMonth((thisDate.getMonth()-1)))
      let start
      if (thisDay > newDay) {
        start = newDate.valueOf()
      } else {
        start = retDay.valueOf()
      }
      this.setState({
        start: start,
        end: new Date().valueOf()-24*3600*1000,
        date
      })
    }
  }, */

  handleClickResize() {
    let num = ReactDOM.findDOMNode(this.refs.table).querySelectorAll('.number')[0]
    num ? num.value = "" : null
    let date = new Date().valueOf()-24*3600*1000

    this.setState({
      selectCategory: "",
      selectProduct: "",
      // date: 'day',
      page: 1,
      start: date,
      end: date,
      tableUrl: 'history/queryHistorySingleSales?currentPage=1&pageSize=10&startDate='+date+'&endDate='+date
    })
  },

  //   查询
  handleClick() {
    let { start, end, selectCategory, selectProduct, page } = this.state
    if (!start) {
      message.danger('起始时间不可为空！', 4)
      return
    }
    if (!end) {
      message.danger('结束时间不可为空！', 4)
      return
    }
    this.setState({
      tableUrl: 'history/queryHistorySingleSales?currentPage='+page+'&pageSize=10&startDate='+start+'&endDate='+end+'&topCate='+selectCategory+'&proSupplier='+selectProduct
    })
  },

  onPageChange(page) {
    let {start, end, selectCategory, selectProduct} = this.state
    this.setState({
      tableUrl: 'history/queryHistorySingleSales?currentPage='+page+'&pageSize=10&startDate='+start+'&endDate='+end+'&topCate='+selectCategory+'&proSupplier='+selectProduct
    })
  },

  render() {

    const renderCategory = item => <Option value={item.spcId}>{item.spcName}</Option>

    const renderProduct = item => <Option value={item.spsId}>{item.spsName}</Option>

    return (
      <div className="function-single">
        <div className="link">
          <Link to={env.basePath+'history'}>辅助管理</ Link> > <span>单品历史销量排行</span>
        </div>
        <div className="firstSelect">
          <div className="inlineBlock">
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
          </div>
          <div className="inlineBlock">
            <div className="inlineBlock">
              <span>选择时间：</span>
              <DateRange
                onSelect={this.handleSelectDateRange}
                max={this.state.max}
                start={this.state.start}
                end={this.state.end}
                />
            </div>
          </div>
          <div className="inlineBlock">
            <Button type="primary" onClick={this.handleClick}>查询</Button>
            <Button type="primary" onClick={this.handleClickResize}>重置</Button>
          </div>
        </div>
        <div className="tableContainer">
          <DataTable
            ref = "table"
            url={this.state.tableUrl}
            onPageChange={this.onPageChange}
            showPage="true"
            column={this.state.column}
            howRow={10} >
          </DataTable>
        </div>
      </div>
    )
  }
})