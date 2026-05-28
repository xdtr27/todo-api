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

function verifyTaskExists(request, response, next) {
  const idTask = request.params.id;
  const {customer} = request;

  const task = customer.todos.find(task => task.id === idTask)

  if(!task) {
    return response.status(404).json({
      error: "No task with that ID was found associated with that user."
    })
  }

  request.task = task;

  return next()
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

  const userData = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(userData)

  return response.status(201).json(userData)
});

// Buscar lista de tasks de um usuário
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {customer} = request;

  return response.status(200).json(customer.todos)
});

// Criar task
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {customer} = request;
  const {deadline, title} = request.body;


  const taskData = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  customer.todos.push(taskData)



  return response.status(201).json(taskData)
});

// Alterar task via id
app.put('/todos/:id', checksExistsUserAccount, verifyTaskExists,  (request, response) => {
  const {customer, task} = request;
  const {title, deadline} = request.body;


  if(title) task.title = title
  if(deadline) task.deadline = deadline

  return response.status(201).json({
    deadline: task.deadline,
    done: task.done,
    title: task.title
  })

});

app.patch('/todos/:id/done', checksExistsUserAccount, verifyTaskExists,(request, response) => {
    const {customer, task} = request;
    
    task.done = true;
    return response.status(200).json(task)
});

app.delete('/todos/:id', checksExistsUserAccount, verifyTaskExists, (request, response) => {
  const { customer, task } = request;

  const index = customer.todos.findIndex(itemTask => itemTask.id === task.id);

  if (index > -1) {
    customer.todos.splice(index, 1);
  }

  return response.status(204).json({
    message: "Task deleted sucessfully"
  })
});

module.exports = app;