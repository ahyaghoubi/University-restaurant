'use strict'

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

addStudentButton.addEventListener('click', (e) => {
    errorMessage(1, addStudnetTitle)
    addStudentButton.disabled = true
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

findStundetButton.addEventListener('click', (e) => {
    findStundetButton.disabled = true
    errorMessage(1, editStudentTitle)
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

editStudentButton.addEventListener('click', (e) => {
    editStudentButton.disabled = true
    errorMessage(1, editStudentTitle)
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

deleteStundetButton.addEventListener('click', (e) => {
    deleteStundetButton.disabled = true
    errorMessage(1, deleteStudentTitle)
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