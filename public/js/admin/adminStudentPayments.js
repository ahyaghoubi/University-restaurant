'use strict'

// Select the title, input field, and button for checking student payments
const checkStudentTilte = document.querySelector('#checkStudentTilte')
const studentNumberToCheck = document.querySelector('#studentNumberToCheck')
const checkButton = document.querySelector('#checkButton')
const adminStudentPayments = document.querySelector('.adminStudentPayments')

// Initialize objects to store student information and payments
let student = {}
let studentPayments = []

// Function to generate payment messages based on payment type
const paymentMessageGenerator = (payment) => {
    if (payment.raisecredit) {
        return `در تاریخ ${payment.faFullDate} مبلغ ${payment.amount} دانشجو اعتبار خود را افزایش داد`
    } else if (payment.paidwithcredit) {
        return `در تاریخ ${payment.faFullDate} برای روز ${payment.dateofpaidday} ژتون به مبلغ ${payment.amount} تومان با اعتبار خریداری شده`
    } else if (payment.returnmoney) {
        return `در تاریخ ${payment.faFullDate} مبلغ ${payment.amount} تومان به اعتبار دانشجو برای حذف ژتون روز ${payment.dateofpaidday} اضافه شد`
    } else {
        return `در تاریخ ${payment.faFullDate} برای روز ${payment.dateofpaidday} ژتون به مبلغ ${payment.amount} تومان خریداری شده`
    }
}

// Function to render student information and payments
const renderEverything = () => {
    adminStudentPayments.textContent = ''
    const studentMessage = document.createElement('h4')
    studentMessage.textContent = `نام و نام خانوادگی: ${student.firstName} ${student.lastName} | شماره دانشجویی: ${student.studentNumber}`
    adminStudentPayments.appendChild(studentMessage)
    studentPayments.forEach((payment, index) => {
        const paymentMessage = document.createElement('p')
        paymentMessage.textContent = (index + 1) + ') ' + paymentMessageGenerator(payment)
        adminStudentPayments.appendChild(paymentMessage)
    })
}

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
    if (res.status === 400) throw new Error('(عملیات ناموفق لطفا دوباره تلاش کنید)')
    else if (res.status === 401 || res.status === 403) {
        // Remove tokens and redirect to the home page on unauthorized access
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

// Event listener for the check button click event
checkButton.addEventListener('click', (e) => {
    errorMessage(1, checkStudentTilte)
    if (studentNumberToCheck.value) {
        checkButton.disabled = true // Disable the button to prevent multiple clicks
        // Send a POST request to get student payments
        fetch('/api/admin/studentpayments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + adminToken
            },
            body: JSON.stringify({ studentNumber: studentNumberToCheck.value })
        }).then(errorHandler).then((res) => res.json()).then((data) => {
            // Store student information and payments
            student = data.student
            studentPayments = data.studentPayments
            renderEverything() // Render the student information and payments
            checkButton.disabled = false // Re-enable the button
        }).catch((e) =>{
            errorMessage(2, checkStudentTilte) // Display an error message
            checkButton.disabled = false // Re-enable the button on error
        })
    }
})