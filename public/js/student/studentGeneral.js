'use strict'

// If student has NOT logged in then will go to first page
const token = localStorage.getItem('token')
if (!token) location.assign('/')

// Select the logout button and student message elements
const logoutButton = document.querySelector('#studentLogout')
const studentMessage = document.querySelector('#studentMessage')

// Function to handle error messages
const errorMessage = (code, messageContainer) => {
    if (code === 1) {
        // Remove error message if present
        messageContainer.textContent = messageContainer.textContent.replace(' (عملیات ناموفق لطفا دوباره تلاش کنید)', '')
    }
    if (code === 2) {
        // Append error message
        messageContainer.textContent = messageContainer.textContent + ' (عملیات ناموفق لطفا دوباره تلاش کنید)'
    }
}

// Error handler function to handle different response statuses
const errorHandler = (res) => {
    if (res.status === 400) throw new Error('عملیات ناموفق لطفا دوباره تلاش کنید')
    else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('kitchenToken')
        location.assign('/')
        throw new Error('دسترسی نامعتبر')
    }
    else if (res.status === 404) throw new Error('پیدا نشد')
    else if (res.status === 500) throw new Error('مشکلی بوجود آمد لطفا بعدا تلاش کنید')
    else if (!res.ok) throw new Error(res.statusText)
    else return res
}

// Function to render student message
const renderStudentMessage = () => {
    studentMessage.textContent = ''
    fetch('/api/student', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        // Display student name and credit
        studentMessage.textContent = `${data.firstName} ${data.lastName} عزیز, اعتبار شما ${data.credit} تومان می باشد`
    }).catch((e) => {
        // Display error message
        studentMessage.textContent = 'مشکلی بوجود آمد لطفا بعدا تلاش کنید'
    })
}

// Render student message on page load
renderStudentMessage()

// Event listener for logout button
logoutButton.addEventListener('click', () => {
    fetch('/api/student/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(errorHandler).then(() => {
        // Remove token and redirect to first page
        localStorage.removeItem('token')
        location.assign('/')
    }).catch((e) => {
        // Remove token and redirect to first page on error
        localStorage.removeItem('token')
        location.assign('/')
    })
})