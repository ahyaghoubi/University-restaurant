'use strict'

const checkStudentTilte = document.querySelector('#checkStudentTilte')
const studentNumberToCheck = document.querySelector('#studentNumberToCheck')
const checkButton = document.querySelector('#checkButton')
const adminStudentPayments = document.querySelector('.adminStudentPayments')

let student = {}
let studentPayments = []

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

checkButton.addEventListener('click', (e) => {
    errorMessage(1, checkStudentTilte)
    if (studentNumberToCheck.value) {
        checkButton.disabled = true
        fetch('/api/admin/studentpayments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + adminToken
            },
            body: JSON.stringify({ studentNumber: studentNumberToCheck.value })
        }).then(errorHandler).then((res) => res.json()).then((data) => {
            console.log(data)
            student = data.student
            studentPayments = data.studentPayments
            renderEverything()
            checkButton.disabled = false
        }).catch((e) =>{
            errorMessage(2, checkStudentTilte)
            checkButton.disabled = false
        })   
    }
})
