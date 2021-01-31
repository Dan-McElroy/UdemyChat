const formatTime = (time) => moment(time).format('h:mma')

const disableElement = (element) => {
    element.setAttribute('disabled', 'disabled')
}
const enableElement = (element) => {
    element.removeAttribute('disabled')
}