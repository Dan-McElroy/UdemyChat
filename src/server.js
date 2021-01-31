const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, ack) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        
        if (error) {
            return ack(error)
        } 
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.name} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        ack()
    })

    socket.on('sendMessage', (message, ack) => {
        const user = getUser(socket.id)
        if (!user) {
            return ack('User could not be found!')
        }
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return ack('Message is profane!')
        }
        io.to(user.room).emit('message', generateMessage(user.name, message))
        ack()
    })

    socket.on('sendLocation', (latitude, longitude, ack) => {
        const user = getUser(socket.id)
        if (!user) {
            return ack('User could not be found!')
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.name, latitude, longitude))
        ack()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (!user) {
            return
        }
        io.to(user.room).emit('message', generateMessage('Admin', `${user.name} has left!`))
            
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })
})

module.exports = server