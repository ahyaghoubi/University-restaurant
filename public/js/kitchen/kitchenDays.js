'use strict'

// Retrieve the kitchen token from local storage
const kitchenToken = localStorage.getItem('kitchenToken')
// If no kitchen token is found, redirect to the kitchen login page
if (!kitchenToken) location.assign('/kitchen/login')

// Function to handle error messages
const errorMessage = (code, messageContainer) => {
    if (code === 1) messageContainer.textContent = messageContainer.textContent.replace(' (عملیات ناموفق لطفا دوباره تلاش کنید)', '')
    if (code === 2) messageContainer.textContent = messageContainer.textContent + ' (عملیات ناموفق لطفا دوباره تلاش کنید)'
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

// Select the kitchen logout button
const kitchenLogout = document.querySelector('#kitchenLogout')
// Event listener for the kitchen logout button click event
kitchenLogout.addEventListener('click', (e) => {
    // Send a POST request to logout the kitchen
    fetch('/api/kitchen/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        }
    }).then(errorHandler).then(() => {
        // Remove the kitchen token and redirect to the home page
        localStorage.removeItem('kitchenToken')
        location.assign('/')
    }).catch((e) => {
        // Handle any errors (optional: you can add error handling here)
    })
})

// Select the titles and input fields for adding, editing, disabling, and deleting days
const addDayTitle = document.querySelector('#addDayTitle')
const dayAdd = document.querySelector('#day')
const monthAdd = document.querySelector('#month')
const yearAdd = document.querySelector('#year')
const descriptionAdd = document.querySelector('#description')
const priceAdd = document.querySelector('#price')
const capacityAdd = document.querySelector('#capacity')
const addDayButton = document.querySelector('#addDayButton')

const editDayTitle = document.querySelector('#editDayTitle')
const daySelectorToEdit = document.querySelector('#daySelectorToEdit')
const dayEdit = document.querySelector('#dayEdit')
const monthEdit = document.querySelector('#monthEdit')
const yearEdit = document.querySelector('#yearEdit')
const descriptionEdit = document.querySelector('#descriptionEdit')
const priceEdit = document.querySelector('#priceEdit')
const capacityEdit = document.querySelector('#capacityEdit')
const editDayButton = document.querySelector('#editDayButton')

const disableDayTitle = document.querySelector('#disableDayTitle')
const daySelectorToDisable = document.querySelector('#daySelectorToDisable')
const activeDayButton = document.querySelector('.activeDay')
const disableDayButton = document.querySelector('.disableDay')

const deleteDayTitle = document.querySelector('#deleteDayTitle')
const daySelectorToDelete = document.querySelector('#daySelectorToDelete')
const DeleteDayButton = document.querySelector('.DeleteDay')

// Initialize an array to store days
let days = []

// Function to populate the day selectors with options
const options = () => {
    // Clear existing options
    daySelectorToDelete.innerHTML = ''
    daySelectorToDisable.innerHTML = ''
    daySelectorToEdit.innerHTML = ''

    // Populate the delete day selector
    days.forEach((day) => {
        const option = document.createElement('option')
        option.value = day.date
        option.textContent = `${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description}`
        daySelectorToDelete.appendChild(option)
    })

    // Populate the disable day selector
    days.forEach((day) => {
        const option = document.createElement('option')
        option.value = day.date
        if (day.active) {
            option.textContent = `فعال | ${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description}`
        } else {
            option.textContent = `غیرفعال | ${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description}`
        }
        daySelectorToDisable.appendChild(option)
    })

    // Populate the edit day selector
    days.forEach((day) => {
        const option = document.createElement('option')
        option.value = day.date
        option.textContent = `${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description}`
        daySelectorToEdit.appendChild(option)
    })
}

// Function to fetch days from the server
const getDays = () => {
    fetch('/api/kitchen/day', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        // Store the fetched days and populate the selectors
        days = data.listOfDays
        options()
    }).catch((e) => {
        // Handle any errors (optional: you can add error handling here)
    })
}

// Fetch days on page load
getDays()

// Event listener for the day selector change event (edit)
let date = 0
daySelectorToEdit.addEventListener('change', (e) => {
    date = e.target.value
    const day = days.find((day) => {
        return day.date === Number(e.target.value)
    })
    // Enable the input fields and populate them with the selected day's data
    dayEdit.removeAttribute('disabled')
    monthEdit.removeAttribute('disabled')
    yearEdit.removeAttribute('disabled')
    descriptionEdit.removeAttribute('disabled')
    priceEdit.removeAttribute('disabled')
    capacityEdit.removeAttribute('disabled')
    dayEdit.value = day.day
    monthEdit.value = day.monthInNum
    yearEdit.value = day.year
    descriptionEdit.value = day.description
    priceEdit.value = day.price
    capacityEdit.value = day.capacity
})

// Function to edit a day
const editDayFunc = (day) => {
    editDayButton.disabled = true
    editDayTitle.textContent = 'ویرایش روز (در حال ویرایش...)'
    fetch('/api/kitchen/day', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        },
        body: JSON.stringify(day)
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        editDayTitle.textContent = 'ویرایش روز (روز با موفقیت ویرایش شد)'
        editDayButton.disabled = false
    }).catch((e) => {
        editDayTitle.textContent = 'ویرایش روز'
        errorMessage(1, editDayTitle)
        editDayButton.disabled = false
    })
}

// Function to add a day
const addDayFunc = (day) => {
    addDayButton.disabled = true
    addDayTitle.textContent = 'اضافه کردن روز (در حال انجام)'
    fetch('/api/kitchen/day', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        },
        body: JSON.stringify({
            day
        })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        addDayTitle.textContent = 'اضافه کردن روز (روز با موفقیت اضافه شد)'
        addDayButton.disabled = false
    }).catch((e) => {
        addDayTitle.textContent = 'اضافه کردن روز'
        errorMessage(2, addDayTitle)
        addDayButton.disabled = false
    })
}

// Event listener for the add day button click event
addDayButton.addEventListener('click', (e) => {
    let day = {}
    day.day = Number(dayAdd.value)
    day.monthInNum = Number(monthAdd.value)
    day.year = Number(yearAdd.value)
    day.description = descriptionAdd.value
    day.price = Number(priceAdd.value)
    day.capacity = Number(capacityAdd.value)

    if (day.day && day.monthInNum && day.year && day.description && day.price && day.capacity) {
        addDayFunc(day)
    } else {
        addDayTitle.textContent = 'اضافه کردن روز (لطفا همه فیلد ها را وارد کنید)'
    }
})

// Event listener for the edit day button click event
editDayButton.addEventListener('click', (e) => {
    let day = {}
    day.day = Number(dayEdit.value)
    day.monthInNum = Number(monthEdit.value)
    day.year = Number(yearEdit.value)
    day.description = descriptionEdit.value
    day.price = Number(priceEdit.value)
    day.capacity = Number(capacityEdit.value)
    day.date = date

    if (day.day && day.monthInNum && day.year && day.description && day.price && day.capacity) {
        editDayFunc(day)
    } else {
        editDayTitle.textContent = 'ویرایش روز (لطفا همه فیلد ها را وارد کنید)'
    }
})

// Event listener for the day selector change event (disable)
let dayToChangeActive = 0
daySelectorToDisable.addEventListener('click', (e) => {
    dayToChangeActive = Number(e.target.value)
})

// Event listener for the active day button click event
activeDayButton.addEventListener('click', (e) => {
    activeDayButton.disabled = true
    disableDayTitle.textContent = 'فعال / غیرفعال کردن روز (در حال انجام ...)'
    fetch('/api/kitchen/activeDay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        },
        body: JSON.stringify({
            date: dayToChangeActive,
            value: true
        })
    }).then(errorHandler).then((res) => res.json()).then((date) => {
        disableDayTitle.textContent = 'فعال / غیرفعال کردن روز (عملیات با موفقیت انجام شد)'
        activeDayButton.disabled = false
    }).catch((e) => {
        disableDayTitle.textContent = 'فعال / غیرفعال کردن روز'
        errorMessage(2, disableDayTitle)
        activeDayButton.disabled = false
    })
})

// Event listener for the disable day button click event
disableDayButton.addEventListener('click', (e) => {
    disableDayButton.disabled = true
    disableDayTitle.textContent = 'فعال / غیرفعال کردن روز (در حال انجام ...)'
    fetch('/api/kitchen/activeDay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        },
        body: JSON.stringify({
            date: dayToChangeActive,
            value: false
        })
    }).then(errorHandler).then((res) => res.json()).then((date) => {
        disableDayTitle.textContent = 'فعال / غیرفعال کردن روز (عملیات با موفقیت انجام شد)'
        disableDayButton.disabled = false
    }).catch((e) => {
        disableDayTitle.textContent = 'فعال / غیرفعال کردن روز'
        errorMessage(2, disableDayTitle)
        disableDayButton.disabled = false
    })
})

// Event listener for the day selector change event (delete)
let dateToDelete = 0
daySelectorToDelete.addEventListener('change', (e) => {
    dateToDelete = Number(e.target.value)
})

// Event listener for the delete day button click event
DeleteDayButton.addEventListener('click', (e) => {
    DeleteDayButton.disabled = true
    deleteDayTitle.textContent = 'حذف روز (در حال انجام ...)'
    fetch('/api/kitchen/day', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        },
        body: JSON.stringify({
            date: dateToDelete
        })
    }).then(errorHandler).then((res) => res.json()).then((date) => {
        deleteDayTitle.textContent = 'حذف روز (روز با موفقیت حذف شد)'
        DeleteDayButton.disabled = false
    }).catch((e) => {
        deleteDayTitle.textContent = 'حذف روز'
        errorMessage(2, deleteDayTitle)
        DeleteDayButton.disabled = false
    })
})