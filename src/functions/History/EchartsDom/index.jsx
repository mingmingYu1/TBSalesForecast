import React, { PropTypes } from 'react'
import echarts from 'echarts'
import elementResizeEvent from 'element-resize-event'
import regNum from 'public/regNum'
import './index.less'

const EchartsDom = React.createClass({

  getChildContext() {
    return {
      parent: this
    }
  },

  getInitialState() {
    return {
      lengedData: [
        {name: '当期销量'},
        {name: '累计销量'},
        {name: '当期金额'},
        {name: '累计金额'}
      ],
      lengedSelected: {
        '当期销量': false,
        '累计销量': true,
        '当期金额': false,
        '累计金额': true
      }
    }
  },

  componentDidMount() {

    // init the echart object
    this.getEchartsInstance()

    this.echartsLine.group = "group1"
    this.echartsBar.group = "group1"
    echarts.connect("group1")

    this.renderEchartDom()


    let _this = this

    elementResizeEvent(this.refs.echartsLine, function() {
      _this.echartsLine.resize();
    })

    elementResizeEvent(this.refs.echartsBar, function() {
      _this.echartsBar.resize();
    })

  },

  resize() {
    this.echartsLine.resize();
    this.echartsBar.resize();
  },

  componentDidUpdate(prevProps, prevState) {
    
   if (prevProps.chartData !== this.props.chartData) {
     this.renderEchartDom()
   }
    if(this.props.active) {
      this.resize()
    }
  },

  componentWillReceiveProps() {

  },

  componentWillUnmount() {
    echarts.dispose(this.refs.echartsLine)
    echarts.dispose(this.refs.echartsBar)
  },

  lineResize() {
    this.echartsLine.resize()
  },

  renderEchartDom() {

    // set the echart option
    this.echartsLine.setOption(this.getOptionLine());
    this.echartsBar.setOption(this.getOptionBar());

  },



  getEchartsInstance() {

    // return the echart object
    this.echartsLine = echarts.getInstanceByDom(this.refs.echartsLine) || echarts.init(this.refs.echartsLine, this.props.theme)
    this.echartsBar = echarts.getInstanceByDom(this.refs.echartsBar) || echarts.init(this.refs.echartsBar, this.props.theme)

  },

  getOptionLine: function()  {

    let chartData = this.props.chartData
    let startValue = this.props.startValue
    let { lengedData, lengedSelected} = this.state
    let modelSaleAmtData = [], modelSaleAmtAccumData = []

    if(!chartData) {
      chartData = {
        xAxisData: [],
        saleNumData: [],
        saleNumAccumData: [],
        saleAmtData: [],
        saleAmtAccumData: []
      }
    }

    if(chartData) {
      chartData.saleNumData.map((item, i) => {
        modelSaleAmtData[i] = 0
        modelSaleAmtAccumData[i] = 0
      })
    }

    const  option = {
      title: {},
      tooltip : {
        trigger: 'axis',
        formatter: function (params) {
          let res = params[0].name
          const arr = []
          params.map((item, i) => {
            if (params[i].seriesName === "当期销量" || params[i].seriesName === "累计销量") {
              arr.push(i)
            }
          })
          arr.map((item) => {
            let value = regNum.formatNumber(params[item].value) ? regNum.formatNumber(params[item].value) : '-'
            res += '<br/><span class="echartsIcon" style="background-color:'+params[item].color+'"></span>'
                    + params[item].seriesName+" : "+value
          })
          return res
        }
      },
      legend: {
        data: lengedData,
        right: '3%',
        selected: lengedSelected
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
        top: 300,
        startValue : startValue,
        end : 100
      },{
        type: 'inside',
        xAxisIndex: [0],
        startValue : startValue,
        end : 100
      }],
      grid: {
        show: true,
        borderColor: '#f5f5f5',
        left: '2%',
        right: '3%',
        top: 40,
        bottom: 20,
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
      animation: false,
      series : [{
        name:'当期销量',
        type:'line',
        symbolSize: 8,
        itemStyle: {
          normal: {
            color: '#FF8056'
          }
        },
        data: chartData.saleNumData
      },{
        name:'累计销量',
        type:'line',
        symbolSize: 8,
        itemStyle: {
          normal: {
            color: '#64DBFB'
          }
        },
        data: chartData.saleNumAccumData
      },{
        name:'累计金额',
        type:'bar',
        itemStyle: {
          normal: {
            color: '#64DBFB'
          }
        },
        lineStyle: {
          normal: {
            opacity: 0,
          }
        },
        data: modelSaleAmtData
      },{
        name:'当期金额',
        type:'bar',
        itemStyle: {
          normal: {
            color: '#FF8056'
          }
        },
        lineStyle: {
          normal: {
            opacity: 0,
          }
        },
        data: modelSaleAmtAccumData
      }]
    }

    return option
  },

  getOptionBar: function() {

    let chartData = this.props.chartData
    let startValue = this.props.startValue
  
    let { lengedData, lengedSelected} = this.state

    let modelSaleNumData = [], modelSaleNumAccumData = []

    if(!chartData) {
      chartData = {
        xAxisData: [],
        saleNumData: [],
        saleNumAccumData: [],
        saleAmtData: [],
        saleAmtAccumData: []
      }
    }
    if(chartData) {
      chartData.saleNumData.map((item, i) => {
        modelSaleNumData[i] = 0
        modelSaleNumAccumData[i] = 0
      })
    }

    const  option = {
      title: {},
      animation: false,
      tooltip : {
        trigger: 'axis',
        formatter: function (params) {
          let res = params[1].name
          const arr = []
          params.map((item, i) => {
            if (params[i].seriesName === "当期金额" || params[i].seriesName === "累计金额") {
              arr.push(i)
            }
          })
          arr.map((item) => {
            let value = regNum.formatDecimal(params[item].value) ? regNum.formatDecimal(params[item].value) : '-'
            res += '<br/><span class="echartsIcon" style="background-color:'+params[item].color+'"></span>'
                    + params[item].seriesName+" : "+value
          })
          return res
        }
      },
      legend: {
        data: lengedData,
        top: -30,
        right: '-100%',
        height: 0,
        selected: lengedSelected
      },
      dataZoom : [{
        type: 'slider',
        xAxisIndex: [0],
        backgroundColor: '#fff',
        borderColor: '#00bcd4',
        fillerColor: '#e0f7fa',
        handleIcon: 'M4.9,17.8c0-1.4,4.5-10.5,5.5-12.4c0-0.1,0.6-1.1,0.9-1.1c0.4,0,0.9,1,0.9,1.1c1.1,2.2,5.4,11,5.4,12.4v17.8c0,1.5-0.6,2.1-1.3,2.1H6.1c-0.7,0-1.3-0.6-1.3-2.1V17.8z',
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
        startValue : startValue,
        end : 100
      },{
        type: 'inside',
        xAxisIndex: [0],
        startValue : startValue,
        //start: start,
        end : 100
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
        name: '金额',
        nameTextStyle: {
          color: '#333'
        },
        min: 0
      }],
      series : [{
        name:'当期销量',
        type:'line',
        itemStyle: {
          normal: {
            color: '#FF8056',
            opacity: 0
          }
        },
        lineStyle: {
          normal: {
            opacity: 0,
          }
        },
        data: modelSaleNumData
      },{
        name:'累计销量',
        type:'line',
        itemStyle: {
          normal: {
            color: '#64DBFB',
            opacity: 0
          }
        },
        lineStyle: {
          normal: {
            opacity: 0,
          }
        },
        data: modelSaleNumAccumData
      },{
        name:'当期金额',
        type:'bar',
        itemStyle: {
          normal: {
            color: '#FF8056'
          }
        },
        data: chartData.saleAmtData
      },{
        name:'累计金额',
        type:'bar',
        itemStyle: {
          normal: {
            color: '#64DBFB'
          }
        },
        data: chartData.saleAmtAccumData
      }]
    }

    return option
  },

  render() {
    return (
      <div className="echartsDom">
        <div ref = "echartsLine" style={{height: '300px', width: '100%'}}></div>
        <div ref = "echartsBar" style={{height: '300px', width: '100%'}}></div>
      </div>
    )
  }
})

EchartsDom.childContextTypes = {
  parent: PropTypes.instanceOf(EchartsDom)
}

export default EchartsDom