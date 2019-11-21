# RN_sqlite
基于react-native-sqlite-storage的使用

```
import SQLiteManager from './sqliteUtil'


创建表
function createTable() {
  let sql = `CREATE TABLE IF NOT EXISTS ${tableName}(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    type INTEGER UNIQUE,
    secondType INTEGER UNIQUE)` // UNIQUE 可以设置多个

  SQLiteManager.createTable(sql)
}

多表查询
  let sql = `select * from (${tableName1} 
    left join ${tableName2} on ${tableName1}.ownID=${tableName2}.ownID) 
    left join ${tableName3} on ${tableName1}.ownID=${tableName3}.ownID`

   SQLiteManager.runCustomSQL(sql, (success, data) => {
     if (success) {
       callBack && callBack(true, data)
     } else {
       callBack && callBack(false, data)
     }
   })
   
排序查询 size 条数
  let sql = `select * from ${tableName} order by time desc limit 0,${size}`
  // let sql = `select * from ${tableName} order by time `
   SQLiteManager.runCustomSQL(sql, (success, data) => {
     if (success) {
       callBack && callBack(true, data)
     } else {
       callBack && callBack(false, data)
     }
   })
```
