'use strict'

const date = location.hash.substring(1)

const studentContainerTitle = document.querySelector('#studentContainerTitle')
const adminContent = document.querySelector('.adminContent')

const generateTitleMessage = () => {
    errorMessage(1, studentContainerTitle)
    fetch('/api/admin/getoneDay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ date })
    }).then(errorHandler).then((res) => res.json()).then((day) => {
        studentContainerTitle.textContent = `دانشجو های روز ${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description} - مبلغ ${day.price} - ظرفیت: ${day.capacity} نفر`
    }).catch((e) => {
        errorMessage(2, studentContainerTitle)
    })
}

generateTitleMessage()

let students = []

const deleteStudentOrder = (student) => {
    errorMessage(1, studentContainerTitle)
    fetch('/api/admin/studentorders', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ student, date })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        getStudentForTheDay()
    }).catch((e) => {    
        errorMessage(2, studentContainerTitle)

    })
}

const renderStudent = () => {
    adminContent.textContent = ''
    students.forEach((student, index) => {
        const studentName = document.createElement('p')
        studentName.textContent = `${index + 1}) ${student.firstName} ${student.lastName} | ${student.studentNumber}`

        const deleteStundetbutton = document.createElement('button')
        deleteStundetbutton.textContent = 'حذف'

        deleteStundetbutton.addEventListener('click', (e) => {
            deleteStudentOrder(student)
        })

        const studentDiv = document.createElement('div')
        studentDiv.appendChild(deleteStundetbutton)
        studentDiv.appendChild(studentName)
        adminContent.appendChild(studentDiv)
        adminContent.appendChild(document.createElement('br'))
    })
}

const getStudentForTheDay = () => {
    errorMessage(1, studentContainerTitle)
    fetch('/api/admin/oneDay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ date })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        students = data
        renderStudent()
    }).catch((e) => {
        errorMessage(2, studentContainerTitle)
    })
}

getStudentForTheDay()