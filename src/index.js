const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


// Middleware
function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const customer = users.find(user => user.username === username)

  if(!customer) {
    return response.status(404).json({
      error: "User not found"
    })
  }

  request.customer = customer;

  next()
}


// Cadastrar usuário
app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const customerAlreadyExists = users.some(user => user.username === username)

  if(customerAlreadyExists) {
    return response.status(400).json({
      error: "Customer already exists"
    })
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  })

  return response.status(201).json({
    message: "User created sucessfully"
  })
});

// Buscar lista de tasks de um usuário
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {customer} = request;

  return response.status(200).json({
    status: 200,
    todos: customer.todos
  })
});

// Criar task
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {customer} = request;
  const {deadLine, title} = request.body;

  customer.todos({
    id: uuidv4(),
    title,
    done: false,
    deadLine: new Date(deadLine),
    created_at: new Date()
  })

  return response.status(201).json({
    message: "Task created sucessfully"
  })
});

// Buscar task por id
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const idTask = request.params.id;
  const {customer} = request;
  const {title, deadLine} = request.body;

  const task = customer.todos.find(task => task.id === idTask)

  if(!task) {
    return response.status(404).json({
      error: "No task with that ID was found associated with that user."
    })
  }

  if(title) task.title = title
  if(deadLine) task.deadLine = deadLine

  return response.status(200).json({
    message: "Task changed successfully"
  })

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;