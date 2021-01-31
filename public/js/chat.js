const socket = io()

const $locationButton = document.querySelector('#send-location') 
const $messageForm = document.querySelector('#message-form')
const $messageInput = document.querySelector('#message-form > input')
const $messageButton = document.querySelector('#message-form > button')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, { message })
    $messages.insertAdjacentHTML('beforeend', html)
})

const disable = (element) => {
    element.setAttribute('disabled', 'disabled')
}
const enable = (element) => {
    element.removeAttribute('disabled')
}

$messageForm.addEventListener('submit', e => {
    e.preventDefault()

    disable($messageButton)

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        enable($messageButton)

        $messageInput.value = ''
        $messageInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log(`Message delivered`)
    })
})

$locationButton.addEventListener('click', () => {
    disable($locationButton)
    
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords
        socket.emit('sendLocation', latitude, longitude, () => {
            enable($locationButton)
            console.log('Location shared!')
        })

    })
})