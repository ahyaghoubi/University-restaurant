'use strict'

const checkStudentTilte = document.querySelector('#checkStudentTilte')
const studentNumberToCheck = document.querySelector('#studentNumberToCheck')
const checkButton = document.querySelector('#checkButton')
const studentOrdersContainer = document.querySelector('.studentOrdersContainer')

let student = {}
let studentOrders = []

const getOrders = (SN) => {
    errorMessage(1, checkStudentTilte)
    checkButton.disabled = true
    fetch('/api/admin/studentorders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ studentNumber: SN })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        student = data.student
        studentOrders = data.studentOrders
        renderEverything()
        checkButton.disabled = false
    }).catch((e) =>{
        errorMessage(2, checkStudentTilte)
        checkButton.disabled = false
    })
}

const deleteOrder = (date) => {
    errorMessage(1, checkStudentTilte)
    fetch('/api/admin/studentorders', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({student, date })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        getOrders(student.studentNumber)
        checkStudentTilte.textContent = 'پیگیری ژتون های دانشجو (حذف موفق)'
    }).catch((e) => {
        errorMessage(2, checkStudentTilte)    
    })
}

const renderEverything = () => {
    studentOrdersContainer.textContent = ''
    const studentMessage = document.createElement('h4')
    studentMessage.textContent = `نام و نام خانوادگی: ${student.firstName} ${student.lastName} | شماره دانشجویی: ${student.studentNumber}`
    studentOrdersContainer.appendChild(studentMessage)
    studentOrders.forEach((order) => {
        const orderDiv = document.createElement('div')
        const button = document.createElement('button')
        button.textContent = 'حذف'
        button.addEventListener('click', (e) => {
            deleteOrder(order.date)
        })
        
        const orderMessage = document.createElement('p')
        orderMessage.textContent = `${order.dow} ${order.day} ${order.month} ${order.year} - غذا: ${order.description}`

        orderDiv.appendChild(button)
        orderDiv.appendChild(orderMessage)
        studentOrdersContainer.appendChild(orderDiv)
    })
}

checkButton.addEventListener('click', (e) => {
    errorMessage(1, checkStudentTilte)
    if (studentNumberToCheck.value) {
        getOrders(studentNumberToCheck.value)  
    }
})
