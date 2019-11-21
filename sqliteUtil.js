import React,{Component} from 'react'
import{
} from 'react-native'

import SQLiteManager from 'react-native-sqlite-storage'
import {DB_name} from './sqlitConfig'

SQLiteManager.DEBUG(false)
let DB = undefined // 数据库对象
let tempUserID = undefined
/**
 * [initDB 创建数据库]
 * @param  {[type]} userID [用户id，每一个用户独立对应一个数据库]
 */
function initDB(userID) {
  DB = undefined
  tempUserID = userID
  try {
    DB = SQLiteManager.openDatabase(
      {
        name: DB_name + userID +'.sqlite', // 数据库名称
        location: 'Documents' // 仅支持ios，DB在android的位置是固定的，在ios需要指定位置，默认 default(Library/LocalDatabase)
      },
      initDBSuccess,
      initDBError
    )
  } catch (e) {
    console.log('initDB error =', e)
  } finally {
  }
}

/**
 * [initDBSuccess 创建数据库成功输出]
 */
function initDBSuccess(){
}

/**
 * [initDBError 创建数据库失败输出]
 */
function initDBError(err){
  console.log(DB_name + 'initDBError error =',err)
}

/**
 * [closeDB 关闭数据库]
 */
function closeDB(){
  if(DB){
    DB.close()
    DB = undefined
  }else {
    // console.log(DB_name + 'not open')
  }
}

/**
 * [createTable 创建表]
 * @param  {[type]} sql             [sql 语句]
 * @param  {[type]} callBack        [回调   true, data ]
 */
function createTable(sql, callBack) {
  if (DB == undefined) {
    initDB(tempUserID)
    return
  }
  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      [],
      () => {
        callBack && callBack(true)
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      console.log('createTable  transaction error=',err)
      handleError(err)
    },
    () => {
    })
}

/**
 * [insertDataToTable 插入或者更新数据]
 * @param  {[type]} tableName [表名]
 * @param  {[type]} data      [数据]
 */
function insertDataToTable(tableName, data, callBack){
  if (DB == undefined) {
    initDB(tempUserID)
    return
  }
  let sql = `INSERT OR REPLACE INTO ${tableName} (${Object.keys(data).join(',')}) VALUES (${Array(Object.keys(data).length).fill('?').join(',')})`
  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      Object.values(data),
      () => {
        callBack && callBack(true)
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      console.log('insertDataToTable  transaction error=',err)
      handleError(err)
    },
    () => {
    })
}

/**
 * [insertMultipleDataToTable 插入或者更新多个数据]
 * @param  {[type]} tableName [表名]
 * @param  {[type]} data      [数据数组]
 */
function insertMultipleDataToTable(tableName, data, callBack){
  if (DB == undefined) {
    initDB(tempUserID)
    return
  }
  if (!data || data.length == 0){
    callBack && callBack(true)
    return
  }
  let keys = data[0]
  let sqlFirst = `INSERT OR REPLACE INTO ${tableName} (${Object.keys(keys).join(',')}) VALUES`
  let sqlSecond = []
  data.map((item,index)=>{
    let b = Object.values(item)
    let a = b.map((it)=>{
      return '\'' + it + '\''
    })
    let sec = '(' + a.join(',') +')'
    sqlSecond.push(sec)
  })
  let sql = sqlFirst + sqlSecond.join(',')
  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      Object.values(data),
      () => {
        callBack && callBack(true)
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      handleError(err)
    },
    () => {
    })
}


/**
 * [deleteDataFromTable 根据id从表中删除某一条数据]
 * @param  {[type]} tableName [表名]
 * @param  {[type]} key        [字段名称，要根据此字段进行删除对应的数据]
 * @param  {[type]} value        [要删除数据的唯一标识]
 */
function deleteDataFromTable(tableName, key, value, callBack){
  if (DB == undefined) {
    initDB(tempUserID)
    return
  }
  let sql = `DELETE FROM ${tableName} WHERE ${key} = '${value}'`
  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      [],
      () => {
        callBack && callBack(true)
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      console.log('deleteDataFromTable  transaction error=',err)
      handleError(err)
    },
    () => {
    })
}


/**
 * [deleteMultipleDataFromTable 根据id从表中删除某一条数据]
 * @param  {[type]} tableName [表名]
 * conditions  多个条件查询
 * {
   thirdID: 1202,
   thirdType: 1
 }
 */
function deleteMultipleDataFromTable(tableName, conditions, callBack){
  if (DB == undefined) {
    initDB(tempUserID)
    return
  }

  let wheres = []
  for (let i = 0; i < Object.keys(conditions).length; i++) {
    let s =Object.keys(conditions)[i] + '=' + Object.values(conditions)[i]
    wheres.push(s)
  }
  let whereString = wheres.join(' AND ')
  let sql = `DELETE FROM ${tableName} WHERE ` + whereString
// "DELETE FROM sessionList WHERE thirdID=1202 AND thirdType=1"

  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      [],
      () => {
        callBack && callBack(true)
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      console.log('deleteDataFromTable  transaction error=',err)
      handleError(err)
    },
    () => {
    })
}


/**
 * [selectDataFromTable 查询表中所有数据]
 * @param  {[type]} tableName [表名]
 */
function selectDataFromTable(tableName, callBack){
  if (DB == undefined) {
    initDB(tempUserID)
    return
  }
  let sql = `SELECT * FROM ${tableName}`
  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      [],
      (tx,results) => {
        if (results && results.rows){
          let datas = [];
          for(let i = 0; i < results.rows.length; i++){
            let info = results.rows.item(i);
            datas.push(info)
          }
          callBack && callBack(true, datas)
          return
        }
        callBack && callBack(false, {error: 100, msg: '数据库没有要查询的数据'})
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      console.log('selectDataFromTable  transaction error=',err)
      handleError(err)
    },
    () => {
    })
}

/**
 * [getMsgInfoFromTable 根据id获取某一条信息]
 * @param  {[type]} tableName [表名]
 * @param  {[type]} key        [字段名称，要根据此字段进行获取对应的数据]
 * @param  {[type]} value        [要获取数据的唯一标识]
 */
function getMsgInfoFromTable(tableName, key, value, callBack){
  if (DB == undefined) {
    initDB(tempUserID)
    return
  }
  let sql = `SELECT * FROM ${tableName} WHERE ${key} = '${value}'`
  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      [],
      (tx,results) => {
        if (results.rows.item(0) == undefined){
          callBack && callBack(false, {error: 100, msg: '数据库没有此条信息'})
        }else {
          callBack && callBack(true, results.rows.item(0))
        }
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      console.log('getMsgInfoFromTable  transaction error=',err)
      handleError(err)
      callBack && callBack(false, err)
    },
    () => {
    })
}


/**
 * [getMutipleMsgInfoFromTable 根据多个条件获取某一条信息]
 * @param  {[type]} tableName [表名]
 * conditions  多个条件查询
 * {
   thirdID: 1202,
   thirdType: 1
 }
 */
function getMutipleMsgInfoFromTable(tableName, conditions, callBack){
  if (DB == undefined) {
    initDB(tempUserID)
    return
  }
  let wheres = []
  for (let i = 0; i < Object.keys(conditions).length; i++) {
    let s =Object.keys(conditions)[i] + '=' + Object.values(conditions)[i]
    wheres.push(s)
  }
  let whereString = wheres.join(' AND ')
  let sql = `SELECT * FROM ${tableName} WHERE ` + whereString
  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      [],
      (tx,results) => {
        if (results.rows.item(0) == undefined){
          callBack && callBack(false, {error: 100, msg: '数据库没有此条信息'})
        }else {
          callBack && callBack(true, results.rows.item(0))
        }
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      console.log('getMsgInfoFromTable  transaction error=',err)
      handleError(err)
      callBack && callBack(false, err)
    },
    () => {
    })
}




/**
 * [getMsgInfoListFromTable 获取符合条件的数据列表]
 * @param  {[type]} tableName [表名]
 * @param  {[type]} key        [字段名称，要根据此字段进行获取对应的数据]
 * @param  {[type]} value        [要获取数据的唯一标识]
 */
function getMsgInfoListFromTable(tableName, key, value, callBack){
  if (DB == undefined) {
    initDB(tempUserID)
    return
  }
  let sql = `SELECT * FROM ${tableName} WHERE ${key} = '${value}'`
  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      [],
      (tx,results) => {
        callBack && callBack(true, results.rows)
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      console.log('getMsgInfoFromTable  transaction error=',err)
      handleError(err)
    },
    () => {
    })
}


/**
 * [dropTable 删除表]
 * @param  {[type]} tableName [表名]
 */
function dropTable(tableName, callBack){
  if (DB == undefined) {
    initDB(tempUserID)
    return
  }
  let sql = `DROP TABLE ${tableName}`
  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      [],
      (tx,results) => {
        callBack && callBack(true)
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      console.log('dropTable  transaction error=',err)
      handleError(err)
    },
    () => {
    })
}

/**
 * [customSQL 自定义sql语句]
 * @param  {[type]} sql      [sql语句]
 */
function runCustomSQL(sql, callBack){
  if (DB == undefined) {
    initDB(tempUserID)
    callBack && callBack(false)
    return
  }
  DB.transaction((tx) => {
    tx.executeSql(
      sql,
      [],
      (tx,results) => {
        if (results && results.rows){
          let datas = [];
          for(let i = 0; i < results.rows.length; i++){
            let info = results.rows.item(i);
            datas.push(info)
          }
          callBack && callBack(true, datas)
          return
        }
        callBack && callBack(false, {error: 100, msg: '数据库没有要查询的数据'})
      },
      (err) => {
        callBack && callBack(false, err)
      })
    },
    (err) => {
      console.log('runCustomSQL  transaction error=',err)
      handleError(err)
    },
    () => {
    })
}

function handleError(err){
  if (err.message && err.message.indexOf('not open') != -1){
    // database not open
    console.log('handleError database not open');
    initDB(tempUserID)
  }
}


/**
 * [existTableName 判断表是否存在]
 * @param  {[type]} tableName [description]
 * @return {[type]}           [description]
 */
function existTableName(tableName, callBack){
  let sql = `select * from sqlite_master`
  runCustomSQL(sql, (success, data) => {
    if (success) {
      let isHas = false
      for (let i = 0; i < data.length; i++) {
        if (data[i].name == tableName){
          isHas = true
          break
        }
      }
      if (isHas){
        callBack && callBack(true)
      }else {
        callBack && callBack(false)
      }
    } else {
      callBack && callBack(false)
    }
  })
}

export default {
  initDB,
  closeDB,
  createTable,
  insertDataToTable,
  insertMultipleDataToTable,
  deleteDataFromTable,
  deleteMultipleDataFromTable,
  selectDataFromTable,
  getMsgInfoFromTable,
  getMutipleMsgInfoFromTable,
  getMsgInfoListFromTable,
  dropTable,
  runCustomSQL,
  existTableName
}
