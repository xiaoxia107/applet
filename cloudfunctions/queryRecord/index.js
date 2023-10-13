const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const MAX_LIMIT = 100
const dbName = 'hotels'
exports.main = async (event, context) => {
  // 先取出集合记录总数
  const countResult = await db.collection(dbName).count()
  const total = countResult.total
  const inputValue = event.inputValue || ''
  const city = event.city || ''
  const _ = db.command
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(dbName).skip(i * MAX_LIMIT).limit(MAX_LIMIT).orderBy('createTime', 'desc').where(_.and([
      {
        ad_info: db.RegExp({
          regexp: '.*' + inputValue,
          options: 'i',
        })
      },
      {
        city: db.RegExp({
          regexp: '.*' + city,
          options: 'i',
        })
      },
    ])).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}