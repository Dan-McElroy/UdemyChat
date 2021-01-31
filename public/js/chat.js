const socket = io()

const $locationButton = document.querySelector('#send-location') 
const $messageForm = document.querySelector('#message-form')
const $messageInput = document.querySelector('#message-form > input')
const $messageButton = document.querySelector('#message-form > button')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', ({text, createdAt}) => {
    const html = Mustache.render(messageTemplate, {
        message: text,
        createdAt: formatTime(createdAt)
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', ({url, createdAt}) => {
    const html = Mustache.render(locationMessageTemplate, { 
        url,
        createdAt: formatTime(createdAt)
     })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', e => {
    e.preventDefault()

    disableElement($messageButton)

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        enableElement($messageButton)

        $messageInput.value = ''
        $messageInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log(`Message delivered`)
    })
})

$locationButton.addEventListener('click', () => {
    disableElement($locationButton)
    
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords
        socket.emit('sendLocation', latitude, longitude, () => {
            enableElement($locationButton)
            console.log('Location shared!')
        })

    })
})

socket.emit('join', { username, room })