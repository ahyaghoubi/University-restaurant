'use strict'

// Get the date from the URL hash
const date = location.hash.substring(1)

// Select the title container and admin content container
const studentContainerTitle = document.querySelector('#studentContainerTitle')
const adminContent = document.querySelector('.adminContent')

// Function to generate the title message for the selected day
const generateTitleMessage = () => {
    errorMessage(1, studentContainerTitle)
    // Fetch the details for the selected day
    fetch('/api/admin/getoneDay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ date })
    }).then(errorHandler).then((res) => res.json()).then((day) => {
        // Update the title with the day's details
        studentContainerTitle.textContent = `دانشجو های روز ${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description} - مبلغ ${day.price} - ظرفیت: ${day.capacity} نفر`
    }).catch((e) => {
        errorMessage(2, studentContainerTitle)
    })
}

// Call the function to generate the title message
generateTitleMessage()

// Initialize an array to store student information
let students = []

// Function to delete a student's order
const deleteStudentOrder = (student) => {
    errorMessage(1, studentContainerTitle)
    // Send a DELETE request to remove the student's order
    fetch('/api/admin/studentorders', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ student, date })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        // Refresh the student list after deletion
        getStudentForTheDay()
    }).catch((e) => {
        errorMessage(2, studentContainerTitle)
    })
}

// Function to render the list of students
const renderStudent = () => {
    adminContent.textContent = ''
    students.forEach((student, index) => {
        // Create a paragraph element for the student's name and number
        const studentName = document.createElement('p')
        studentName.textContent = `${index + 1}) ${student.firstName} ${student.lastName} | ${student.studentNumber}`

        // Create a button to delete the student's order
        const deleteStundetbutton = document.createElement('button')
        deleteStundetbutton.textContent = 'حذف'

        // Add an event listener to the delete button
        deleteStundetbutton.addEventListener('click', (e) => {
            deleteStudentOrder(student)
        })

        // Create a div to hold the student's information and delete button
        const studentDiv = document.createElement('div')
        studentDiv.appendChild(deleteStundetbutton)
        studentDiv.appendChild(studentName)
        adminContent.appendChild(studentDiv)
        adminContent.appendChild(document.createElement('br'))
    })
}

// Function to fetch the list of students for the selected day
const getStudentForTheDay = () => {
    errorMessage(1, studentContainerTitle)
    // Send a POST request to get the students for the day
    fetch('/api/admin/oneDay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ date })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        // Store the student data and render the list
        students = data
        renderStudent()
    }).catch((e) => {
        errorMessage(2, studentContainerTitle)
    })
}

// Call the function to fetch and render the students for the day
getStudentForTheDay()

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
        // Remove tokens and redirect to the home page on unauthorized access
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