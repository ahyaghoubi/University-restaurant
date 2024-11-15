'use strict'

// Select the container and title elements for the kitchen staff management
const kitchenContainer = document.querySelector('.kitchenContainer')
const kitchenTitle = document.querySelector('#kitchenTitle')

// Select the elements for adding new staff
const addStaffTitle = document.querySelector('#addStaffTitle')
const staffName = document.querySelector('#staffName')
const staffUser = document.querySelector('#staffUser')
const staffPass = document.querySelector('#staffPass')
const addStaffButton = document.querySelector('#addStaff')

// Initialize an array to store staff information
let staffs = []

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

// Function to delete a staff member
const deleteStaff = (username) => {
    errorMessage(1, kitchenTitle)
    fetch('/api/admin/kitchen', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({ username })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        getStaffs() // Refresh the staff list after deletion
        kitchenTitle.textContent = 'کارکنان فعال (حذف موفق)'
    }).catch((e) => {
        errorMessage(2, kitchenTitle) // Display an error message
    })
}

// Function to generate the DOM elements for a staff member
const generateStaffDOM = (staff) => {
    const oneStaffDiv = document.createElement('div')
    oneStaffDiv.className = 'oneActiveStaff'

    const button = document.createElement('button')
    button.textContent = 'حذف'
    button.addEventListener('click', (e) => {
        deleteStaff(staff.username)
    })

    const staffDescription = document.createElement('p')
    staffDescription.textContent = `${staff.name} | ${staff.username}`

    oneStaffDiv.appendChild(button)
    oneStaffDiv.appendChild(staffDescription)

    return oneStaffDiv
}

// Function to render the list of staff members
const renderStaffs = () => {
    kitchenContainer.textContent = ''
    if (!staffs.length) {
        const emptyStaffMessage = document.createElement('p')
        emptyStaffMessage.textContent = 'کاربری برای نمایش وجود ندارد'
        kitchenContainer.appendChild(emptyStaffMessage)
    } else {
        staffs.forEach((staff) => {
            const oneStaffDiv = generateStaffDOM(staff)
            kitchenContainer.appendChild(oneStaffDiv)
            kitchenContainer.appendChild(document.createElement('br'))
        })
    }
}

// Function to fetch the list of staff members from the server
const getStaffs = () => {
    fetch('/api/admin/kitchen', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        staffs = data
        renderStaffs() // Render the staff list
    }).catch((e) => {
        console.log(e)
    })
}

// Fetch and render the staff list on page load
getStaffs()

// Event listener for the add staff button click event
addStaffButton.addEventListener('click', (e) => {
    addStaffTitle.textContent = 'اضافه کردن (در حال انجام ...)'
    addStaffButton.disabled = true
    if (staffUser.value && staffPass.value) {
        fetch('/api/admin/kitchen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + adminToken
            },
            body: JSON.stringify({
                name: staffName.value,
                username: staffUser.value,
                password: staffPass.value
            })
        }).then(errorHandler).then((res) => res.json()).then((data) => {
            getStaffs() // Refresh the staff list after adding a new staff member
            addStaffTitle.textContent = 'اضافه کردن (عملیات با موفقیت انجام شد)'
        }).catch((e) => {
            errorMessage(2, addStaffTitle) // Display an error message
        }).then(() => {
            staffName.value = ''
            staffUser.value = ''
            staffPass.value = ''
            addStaffButton.disabled = false
        })
    } else {
        addStaffTitle.textContent = 'اضافه کردن (وارد کردن نام کاربری و رمز الزامی است)'
        addStaffButton.disabled = false
    }
})