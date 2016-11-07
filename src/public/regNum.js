/**
 *    用于给数字添加千位符
 * **/

const regNum = {

  formatNumber(num) {
    if(!/^(\+|-)?(\d+)(\.\d+)?$/.test(num)){
      return num
    }
    let a = RegExp.$1, b = RegExp.$2, c = RegExp.$3;
    let result = ''
    while (b.length > 3) {
      result = ',' + b.slice(-3) + result
      b = b.slice(0, b.length - 3)
    }
    b = b + result

    return a +""+ b +""+ c
  },
  
  
  formatDecimal(num) {
    if(!/^(\+|-)?(\d+)(\.\d+)?$/.test(num)){
      return num
    }
    let a = RegExp.$1, b = RegExp.$2, c = RegExp.$3;
    let result = ''
    while (b.length > 3) {
      result = ',' + b.slice(-3) + result
      b = b.slice(0, b.length - 3)
    }
    b = b + result
    if (c && c.length < 3) {
      c = c + "0"
    }
    if (!c) {
      c = c + ".00"
    }
    return a +""+ b +""+ c
  },

  trim(str) {
    if (!str) {return str}
    str = str.replace(/^(\s|\u00A0)+/, '')
    for(var i = str.length-1; i>=0; i--) {
      if(/\S/.test(str.charAt(i))) {
        str = str.substring(0, i+1)
        break
      }
    }
    return str
  }

}

export default regNum