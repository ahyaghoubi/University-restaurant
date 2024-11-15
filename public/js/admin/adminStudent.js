'use strict'

// Select the title, input fields, and buttons for adding, editing, and deleting students
const addStudnetTitle = document.querySelector('#addStudnetTitle')
const studentFirstname = document.querySelector('#studentFirstname')
const studentLastname = document.querySelector('#studentLastname')
const studentNumber = document.querySelector('#studentNumber')
const studentPass = document.querySelector('#studentPass')
const addStudentButton = document.querySelector('#addStudent')

const editStudentTitle = document.querySelector('#editStudentTitle')
const studentNumberToSearch = document.querySelector('#studentNumberToSearch')
const findStundetButton = document.querySelector('#findStundet')
const studentFirstnameToEdit = document.querySelector('#studentFirstnameToEdit')
const studentLastnameToEdit = document.querySelector('#studentLastnameToEdit')
const studentNumberToEdit = document.querySelector('#studentNumberToEdit')
const studentCredit = document.querySelector('#studentCredit')
const editStudentButton = document.querySelector('#editStudent')

const deleteStudentTitle = document.querySelector('#deleteStudentTitle')
const studentNumberToDelete = document.querySelector('#studentNumberToDelete')
const deleteStundetButton = document.querySelector('#deleteStundet')
const MessageForDeletedStudent = document.querySelector('#MessageForDeletedStudent')

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

// Event listener for the add student button click event
addStudentButton.addEventListener('click', (e) => {
    addStudnetTitle.textContent = 'اضافه کردن دانشجو'
    errorMessage(1, addStudnetTitle)
    addStudentButton.disabled = true
    // Send a POST request to add a new student
    fetch('/api/admin/student', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({
            firstName: studentFirstname.value,
            lastName: studentLastname.value,
            studentNumber: studentNumber.value,
            password: studentPass.value
        })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        addStudnetTitle.textContent = `اضافه کردن دانشجو (دانشجو ${data.firstName} ${data.lastName} با موفقیت اضافه شد)`
    }).catch((e) => {
        errorMessage(2, addStudnetTitle)
    }).then(() => {
        studentFirstname.value = ''
        studentLastname.value = ''
        studentNumber.value = ''
        studentPass.value = ''
        addStudentButton.disabled = false
    })
})

// Event listener for the find student button click event
findStundetButton.addEventListener('click', (e) => {
    findStundetButton.disabled = true
    errorMessage(1, editStudentTitle)
    // Send a POST request to find a student by student number
    fetch('/api/admin/onestudent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({
            studentNumber: studentNumberToSearch.value
        })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        studentFirstnameToEdit.removeAttribute('disabled')
        studentLastnameToEdit.removeAttribute('disabled')
        studentNumberToEdit.removeAttribute('disabled')
        studentCredit.removeAttribute('disabled')

        studentFirstnameToEdit.value = data.firstName
        studentLastnameToEdit.value = data.lastName
        studentNumberToEdit.value = data.studentNumber
        studentCredit.value = data.credit

    }).catch((e) => {
        errorMessage(2, editStudentTitle)
    }).then(() => {
        studentNumberToSearch.value = ''
        findStundetButton.disabled = false
    })
})

// Event listener for the edit student button click event
editStudentButton.addEventListener('click', (e) => {
    editStudentButton.disabled = true
    errorMessage(1, editStudentTitle)
    // Send a PATCH request to edit student details
    fetch('/api/admin/student', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({
            firstName: studentFirstnameToEdit.value,
            lastName: studentLastnameToEdit.value,
            studentNumber: studentNumberToEdit.value,
            credit: studentCredit.value
        })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        editStudentTitle.textContent = 'ویرایش دانشجو (عملیات با موفقیت انجام شد)'
        editStudentButton.disabled = false
    }).catch((e) => {
        errorMessage(2, editStudentTitle)
        editStudentButton.disabled = false
    })
})

// Event listener for the delete student button click event
deleteStundetButton.addEventListener('click', (e) => {
    deleteStundetButton.disabled = true
    errorMessage(1, deleteStudentTitle)
    // Send a DELETE request to delete a student by student number
    fetch('/api/admin/student', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({
            studentNumber: studentNumberToDelete.value
        })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        MessageForDeletedStudent.textContent = `دانشجو ${data.firstName} ${data.lastName} (${data.studentNumber}) با موفقیت حذف شد.`
    }).catch((e) => {
        errorMessage(2, deleteStudentTitle)
    }).then(() => {
        studentNumberToDelete.value = ''
        deleteStundetButton.disabled = false
    })
})