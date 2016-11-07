/**
 *    用于获得日，周，月
 * **/

const handleDate = {

  getDayDate() {
    const d = new Date(new Date().valueOf()-30*24*60*60*1000)
    return d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日'
  },

  addDays(day, num) {
    let newDay = new Date(day);
    newDay.setDate(newDay.getDate() + num );
    return newDay;
  },

  format(d) {
    return d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';
  },

  getWeek(date) {
    const today = new Date();
    let targetDay = this.addDays(today, -date);
    let dayOfWeek = targetDay.getDay();
    let startDay = this.addDays(targetDay, 1-dayOfWeek);
    let endDay = this.addDays(targetDay, 7-dayOfWeek);
    return this.format(startDay)+ "-" + this.format(endDay);
  },

  getMonthDate() {
    const d = new Date()
    return (d.getFullYear()-1)+'年'+(d.getMonth()+1)+'月'
  }

}

export default handleDate