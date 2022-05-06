'use strict'

const kitchenToken = localStorage.getItem('kitchenToken')
if (!kitchenToken) location.assign('/kitchen/login')

const errorMessage = (code, messageContainer) => {
    if (code === 1) messageContainer.textContent = messageContainer.textContent.replace(' (عملیات ناموفق لطفا دوباره تلاش کنید)', '')
    if (code === 2) messageContainer.textContent = messageContainer.textContent + ' (عملیات ناموفق لطفا دوباره تلاش کنید)'
}

const errorHandler = (res) => {
    if (res.status === 400) throw new Error('(عملیات ناموفق لطفا دوباره تلاش کنید)')
    else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('kitchenToken')
        location.assign('/')
        throw new Error('دسترسی نامعتبر')
    }
    else if (res.status === 404) throw new Error('پیدا نشد')
    else if (res.status === 500) throw new Error('(مشکلی بوجود آمد لطفا بعدا تلاش کنید)')
    else if (!res.ok) throw new Error(res.statusText)
    else return res
}

const kitchenLogout = document.querySelector('#kitchenLogout')
kitchenLogout.addEventListener('click', (e) => {
    fetch('/api/kitchen/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        }
    }).then(errorHandler).then(() => {
        localStorage.removeItem('kitchenToken')
        location.assign('/')
    }).catch((e) => {
        
    })
})

const studentNumberToCheck = document.querySelector('#studentNumberToCheck')
const checkButton = document.querySelector('#checkButton')
const studentOrdersContainer = document.querySelector('.studentOrdersContainer')
const DaysTitle = document.querySelector('#DaysTitle')

let student = {}
let studentOrders = []

const renderEverything = () => {
    studentOrdersContainer.textContent = ''
    const studentMessage = document.createElement('h4')
    studentMessage.textContent = `نام و نام خانوادگی: ${student.firstName} ${student.lastName} | شماره دانشجویی: ${student.studentNumber}`
    studentOrdersContainer.appendChild(studentMessage)
    studentOrders.forEach((order) => {
        const orderMessage = document.createElement('p')
        orderMessage.textContent = `${order.dow} ${order.day} ${order.month} ${order.year} - غذا: ${order.description}`
        studentOrdersContainer.appendChild(orderMessage)
    })
}

checkButton.addEventListener('click', (e) => {
    errorMessage(1, DaysTitle)
    if (studentNumberToCheck.value) {
        checkButton.disabled = true
        fetch('/api/kitchen/studentorders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + kitchenToken
            },
            body: JSON.stringify({ studentNumber: studentNumberToCheck.value })
        }).then(errorHandler).then((res) => res.json()).then((data) => {
            student = data.student
            studentOrders = data.studentOrders
            renderEverything()
            checkButton.disabled = false
        }).catch((e) =>{
            checkButton.disabled = false
            errorMessage(2, DaysTitle)
        })
    }
})
