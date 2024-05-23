const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

app.use(express.json())
module.exports = app

const initalizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initalizeDBAndServer()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

// app.get('/todos/', async (request, response) => {
//   const {search_q} = request.query
//   const getProrityToDoQuery = `
//   SELECT * FROM
//   todo;`
//   const dbResponseToDo = await db.all(getProrityToDoQuery)
//   response.send(dbResponseToDo)
// })
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  console.log(data)
  response.send(data)
})

//API 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoQuery = `SELECT * 
  FROM todo 
  WHERE 
  id=${todoId};`
  const todoResponse = await db.get(todoQuery)
  response.send(todoResponse)
})

//API 3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const createNewTodoQuery = `INSERT INTO todo (id,todo,priority,status)
  VALUES (${id},'${todo}','${priority}','${status}');`
  await db.run(createNewTodoQuery)
  response.send('Todo Successfully Added')
})

//API 4
//S-1 status
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {todo, priority, status} = request.body
  if (status !== undefined) {
    const updateStatusQuery = `UPDATE todo 
    SET status ='${status}'
    WHERE id=${todoId};`
    await db.run(updateStatusQuery)
    response.send('Status Updated')
  } else if (priority !== undefined) {
    const updatePriorityQuery = `UPDATE todo
    SET priority ='${priority}'
    WHERE id=${todoId};`
    await db.run(updatePriorityQuery)
    response.send('Priority Updated')
  } else if (todo !== undefined) {
    const updateTodoQuery = `UPDATE todo
    SET todo ='${todo}'
    WHERE id=${todoId};`
    await db.run(updateTodoQuery)
    response.send('Todo Updated')
  }
})

//S-2 priority
// app.put('/todos/:todoId/', async (request, response) => {
//   const {todoId} = request.params
//   const {priority} = request.body
//
// })
// //S-3 todo
// app.put('/todos/:todoId/', async (request, response) => {
//   const {todoId} = request.params
//   const {todo} = request.body
//
// })
// API-5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoDeleteQuery = `DELETE FROM 
  todo 
  WHERE id=${todoId};`
  await db.run(todoDeleteQuery)
  response.send('Todo Deleted')
})
