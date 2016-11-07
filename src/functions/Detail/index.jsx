import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import Fetch from 'bfd-ui/lib/Fetch'
import DataTable from 'bfd-ui/lib/DataTable'
import Button from 'bfd-ui/lib/Button'
import Icon from 'bfd-ui/lib/Icon'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import Echarts from 'public/Echarts'
import message from 'bfd-ui/lib/message'
import regNum from 'public/regNum'
import handleDate from 'public/handleDate'
import './index.less'

export default React.createClass({
  
  contextTypes:{
    app: PropTypes.object
  },
  
  getInitialState() {
    // 获得传递过来的参数
    const query = window.location.search.substring(1)
    const values= query.split("&")
    const param = {}
    for(let i = 0; i < values.length; i++) {
      let pos = values[i].indexOf('=')
      if (pos == -1) continue
      let paramName = values[i].substring(0, pos)
      param[paramName] = values[i].substring(pos+1)
    }
    return {
      param: param,
      activeIndex: 0,
      aActive: true,
      startValue: handleDate.getDayDate(),
      page: 1,
      start: null,
      end: 100,
      data: {},
      selected: {
        '实际销量': true,
        '预测销量': true
      },
      chartData: {xAxisData: [], realSaleData: [], forecastSaleData: []},
      column: [
        {
        title:'序号',
        key:'rowNum',
        render: (text, item) => {
          if (!item.rlSaleNum && item.rlSaleNum !== 0) {
            return <span className="colorRed">{text}</span>
          }
          return text
        }
      }, {
        title: '时间',
        key: 'statDate',
        render: (text, item) => {
          if (!item.rlSaleNum && item.rlSaleNum !== 0) {
            return <span className="colorRed">{text}</span>
          }
          return text
        }
      }, {
        title: '实际销量',
        key: 'rlSaleNum',
        render: (text, item) => {
          if (!text && text !== 0) {
            return <span className="colorRed">-</span>
          }
          return regNum.formatNumber(text)
        }
      }, {
        title: '预测销量',
        key: 'spForecastSaleNum',
        render: (text, item) => {
          if (!item.rlSaleNum && item.rlSaleNum !== 0) {
            return <span className="colorRed">{regNum.formatNumber(text)}</span>
          }
          return regNum.formatNumber(text)
        }
      }
      ],
      chartUrl: 'product/queryDailySalesForecastChart?spId='+String(param.spId),
      tableUrl: ''
    }
  },

  componentDidMount() {
    this.context.app.setState({block: false})
  },
  
  handleSuccess(data) {
    this.setState({data})
  },

  clearNumInput() {
    let num = this.refs.table ? ReactDOM.findDOMNode(this.refs.table).querySelectorAll('.number')[0] : null
    num ? num.value = "" : null
  },

  handleDay() {
    let startValue = handleDate.getDayDate()
    this.clearNumInput()
    if(this.state.aActive) {
      this.setState({
        chartUrl: 'product/queryDailySalesForecastChart?spId='+String(this.state.param.spId),
        startValue,
        end: 100
      })
    } else {
      this.setState({
        tableUrl: 'product/queryDailySalesForecastTable?pageSize=10&currentPage=1&spId='+String(this.state.param.spId)
      })
    }

    this.setState({
      activeIndex: 0,
      start: null,
      selected: {
        '实际销量': true,
        '预测销量': true
      },
      page: 1
    })
  },

  handleWeek() {

    let startValue = handleDate.getWeek(180)
    this.clearNumInput()

    if(this.state.aActive) {
      this.setState({
        chartUrl: 'product/queryWeeklySalesForecastChart?spId='+String(this.state.param.spId),
        startValue,
        end: 100
      })
    } else {
      this.setState({
        tableUrl: 'product/queryWeeklySalesForecastTable?pageSize=10&currentPage=1&spId='+String(this.state.param.spId)
      })
    }

    this.setState({
      activeIndex: 1,
      start: null,
      selected: {
        '实际销量': true,
        '预测销量': true
      },
      page: 1
    })
  },

  handleMonth() {

    let startValue = handleDate.getMonthDate()
    this.clearNumInput()
    if(this.state.aActive) {
      this.setState({
        chartUrl: 'product/queryMonthlySalesForecastChart?spId='+String(this.state.param.spId),
        startValue,
        end: 100
      })
    } else {
      this.setState({
        tableUrl: 'product/queryMonthlySalesForecastTable?pageSize=10&currentPage=1&spId='+String(this.state.param.spId)
      })
    }

    this.setState({
      activeIndex: 2,
      start: null,
      selected: {
        '实际销量': true,
        '预测销量': true
      },
      page: 1
    })
  },

  handleDayChart(e) {
    e.preventDefault()
    let startValue = null
    let start = this.state.start
    let end = this.state.end
    let selected = this.state.selected
    if (start === null) {
      startValue = handleDate.getDayDate()
      end = 100
    }
    this.setState({
      aActive: true,
      chartUrl: 'product/queryDailySalesForecastChart?spId='+String(this.state.param.spId),
      selected,
      startValue,
      start,
      end
    })
  },

  handleWeekChart(e) {
    e.preventDefault()

    let startValue = null
    let start = this.state.start
    let end = this.state.end
    let selected = this.state.selected
    if (start === null) {
      startValue = handleDate.getWeek(180)
      end = 100
    }

    this.setState({
      aActive: true,
      chartUrl: 'product/queryWeeklySalesForecastChart?spId='+String(this.state.param.spId),
      selected,
      startValue,
      start,
      end
    })

  },

  handleMonthChart(e) {
    e.preventDefault()
    let startValue = null
    let start = this.state.start
    let end = this.state.end
    let selected = this.state.selected
    if (start === null) {
      startValue = handleDate.getMonthDate()
      end = 100
    }

    this.setState({
      aActive: true,
      chartUrl: 'product/queryMonthlySalesForecastChart?spId='+String(this.state.param.spId),
      selected,
      startValue,
      start,
      end
    })

  },

  handleDayTable(e) {
    e.preventDefault()
    let page = this.state.page
    this.setState({
      aActive: false,
      tableUrl: 'product/queryDailySalesForecastTable?pageSize=10&currentPage='+page+'&spId='+String(this.state.param.spId)
    })
  },

  handleWeekTable(e) {
    e.preventDefault()
    let page = this.state.page
    this.setState({
      aActive: false,
      tableUrl: 'product/queryWeeklySalesForecastTable?pageSize=10&currentPage='+page+'&spId='+String(this.state.param.spId)
    })
  },

  handleMonthTable(e) {
    e.preventDefault()
    let page = this.state.page
    this.setState({
      aActive: false,
      tableUrl: 'product/queryMonthlySalesForecastTable?pageSize=10&currentPage='+page+'&spId='+String(this.state.param.spId)
    })

  },

  handleChartSuccess(chartData) {
    if (!chartData || !chartData.xAxisData) {
      message.danger('暂无数据！', 4)
      this.setState({
        chartData: {xAxisData: [], realSaleData: [], forecastSaleData: []}
      })
    } else {
      this.setState({chartData})
    }
  },

  getOption: function() {

    let { startValue, start, end, selected, chartData } = this.state

    const  option = {
      title: {},
      animation: false,
      tooltip : {
        trigger: 'axis'
      },
      legend: {
        data:['实际销量','预测销量'],
        selected: selected,
        right: '3%'
      },
      dataZoom : [{
        type: 'slider',
        xAxisIndex: [0],
        backgroundColor: '#fff',
        borderColor: '#00bcd4',
        fillerColor: '#e0f7fa',
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        },
        textStyle: {
          color: '#00bcd4'
        },
        startValue: startValue,
        start: start,
        end: end
      },{
        type: 'inside',
        xAxisIndex: [0],
        startValue : startValue,
        start: start,
        end: end
      }],
      grid: {
        show: true,
        borderColor: '#f5f5f5',
        left: '2%',
        right: '3%',
        top: 40,
        bottom: 60,
        containLabel: true
      },
      xAxis : [{
        type : 'category',
        boundaryGap : false,
        splitLine: {
            show: true,
            lineStyle: {
              color: "#f5f5f5"
            }
          },
        axisLabel: {
          textStyle: {
            color: '#333'
          }
        },
        axisLine: {
          lineStyle: {
            color: "#f5f5f5"
            }
        },
        axisTick: {
          show: false
        },
        data : chartData.xAxisData
      }],
      yAxis : [{
        type : 'value',
        scale: true,
        splitLine: {
            lineStyle: {
              color: "#f5f5f5"
            }
          },
        axisLabel: {
            textStyle: {
              color: '#333'
            }
          },
        axisLine: {
            lineStyle: {
              color: "#f5f5f5"
            }
          },
        axisTick: {
            show: false
          },
        name: '销量',
        nameTextStyle: {
            color: '#333'
          },
        min: 0
      }],
      series : [
        {
          name:'预测销量',
          type:'line',
          //smooth: true,
          // animation: false,
          symbolSize: 8,
          itemStyle: {
            normal: {
              color: '#ffa689'
            }
          },
          areaStyle: {
            normal: {
              color: '#ffdcd0'
            }
          },
          data: chartData.forecastSaleData
        },
        {
          name:'实际销量',
          type:'line',
          symbolSize: 8,
          itemStyle: {
            normal: {
              color: '#98d8f5'
            }
          },
          areaStyle: {
            normal: {
              color: '#caedfd'
            }
          },
          data: chartData.realSaleData
        }
      ]
    };

    return option
  },

  onPageChange(page) {
    let activeIndex = this.state.activeIndex
    if (activeIndex === 0) {
      this.setState({
        tableUrl: 'product/queryDailySalesForecastTable?pageSize=10&currentPage='+page+'&spId='+String(this.state.param.spId)
      })
    } else if (activeIndex === 1) {
      this.setState({
        tableUrl: 'product/queryWeeklySalesForecastTable?pageSize=10&currentPage='+page+'&spId='+String(this.state.param.spId)
      })
    } else {
      this.setState({
        tableUrl: 'product/queryMonthlySalesForecastTable?pageSize=10&currentPage='+page+'&spId='+String(this.state.param.spId)
      })
    }
    this.setState({page})
  },

  onChartDatazoom(obj) {
    let start, end
    if (obj.batch) {
        start = obj.batch[0].start,
        end = obj.batch[0].end
    } else {
      start = obj.start
      end = obj.end
    }
    this.setState({
      start: start,
      end: end
    })
  },

  onLegendselectchanged(obj) {
    this.setState({selected: obj.selected})
  },

  render() {

    let url = 'product/queryProductById?spId='+String(this.state.param.spId)
    let dataList = this.state.data
    document.title = dataList && dataList.spShortName ? dataList.spShortName : '销量预测'

    let dayActive, weekActive, monthActive
    let activeIndex = this.state.activeIndex
    if (activeIndex === 0) {
      dayActive = 'active'
    } else if (activeIndex === 1) {
      weekActive = 'active'
    } else if (activeIndex === 2) {
      monthActive = 'active'
    }

    let chartActive, tableActive, styleChart, styleTable
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

    let onEvents = {
      'datazoom': this.onChartDatazoom,
      'legendselectchanged': this.onLegendselectchanged
    }

    return (
      <div className="function-detail">
        <div className="detail-list"><span>基本信息</span></div>
        <Fetch url={url}  onSuccess={this.handleSuccess}>
          {
            dataList ?
              <div className="list">
                <div>
              <span>
                <span className="labelName">商品编号</span><span className="value">{dataList.spId}</span>
              </span>
              <span>
                <span className="labelName">商品简称</span><span className="value" title={dataList.spShortName}>{dataList.spShortName}</span>
              </span>
                </div>
                <div>
              <span>
                <span className="labelName">所属分类</span><span className="value">{dataList.spcName}</span>
              </span>
              <span>
                <span className="labelName">原产地简称</span><span className="value"> {dataList.sppName}</span>
              </span>
                </div>
                <div>
              <span>
                <span className="labelName">品牌名称</span><span className="value">{dataList.sbName}</span>
              </span>
              <span>
                <span className="labelName">供应商名称</span><span className="value">{dataList.spsName}</span>
              </span>
                </div>
                <div>
              <span>
                <span className="labelName">增值税率（%）</span><span className="value">{regNum.formatDecimal(dataList.spcVatRate)}</span>
              </span>
              <span>
                <span className="labelName">消费税率（%）</span><span className="value">{regNum.formatDecimal(dataList.spcConsRate)}</span>
              </span>
                </div>
                <div>
              <span>
                <span className="labelName">商品库存</span><span className="value">{regNum.formatNumber(dataList.spStockNumber)}</span>
              </span>
              <span>
                <span className="labelName">最新零售价(元)</span><span className="value"> {regNum.formatDecimal(dataList.spRetailPrice)}</span>
              </span>
                </div>
              </div> : null
          }
        </Fetch>
        <div className="marginTop" style={{marginBottom: 20}}>
          <div className="tabTitle">
            <div className="pull-left" style={{marginTop: 1}}>
              <Button className={dayActive} type="primary" onClick={this.handleDay}>日销售量预测</Button>
              <Button className={weekActive} type="primary" onClick={this.handleWeek}>周销售量预测</Button>
              <Button className={monthActive} type="primary" onClick={this.handleMonth}>月销售量预测</Button>
            </div>
            {
              activeIndex === 0 ?
                <div className="pull-right">
                  <a className={chartActive} title='折线图' href="javascript: void(0)" onClick={this.handleDayChart}><Icon type="area-chart"/></a>
                  <a className={tableActive} title='数据表' href="javascript: void(0)" onClick={this.handleDayTable}><Icon type="list"/></a>
                </div> : null
            }
            {
              activeIndex === 1 ?
                <div className="pull-right">
                  <a className={chartActive} title='折线图' href="javascript: void(0)" onClick={this.handleWeekChart}><Icon type="area-chart"/></a>
                  <a className={tableActive} title='数据表' href="javascript: void(0)" onClick={this.handleWeekTable}><Icon type="list"/></a>
                </div> : null
            }
            {
              activeIndex === 2 ?
                <div className="pull-right">
                  <a className={chartActive} title='折线图' href="javascript: void(0)" onClick={this.handleMonthChart}><Icon type="area-chart"/></a>
                  <a className={tableActive} title='数据表' href="javascript: void(0)" onClick={this.handleMonthTable}><Icon type="list"/></a>
                </div> : null
            }
          </div>
          <div>
            { this.state.aActive ?
              <div className="tabList">
                <Fetch url={this.state.chartUrl}  onSuccess={this.handleChartSuccess}/>
                <div className="chartCon">
                  <Echarts onEvents = {onEvents} option={this.getOption()} style={{height: '400px', width: '100%'}}  className='' />
                </div>
              </div> : null
            }
            {
              !this.state.aActive ?
                <div className="tabList">
                  <div className='tableContainer' style={{marginBottom: 30}}>
                    <DataTable
                      url={this.state.tableUrl}
                      onPageChange={this.onPageChange}
                      showPage="true"
                      column={this.state.column}
                      howRow={10}
                      ref = "table"
                      />
                  </div>
                </div> : null
            }

          </div>
        </div>
      </div>
    )
  }

})