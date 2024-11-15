'use strict'

// Select elements for adding a new day
const addDayTitle = document.querySelector('#addDayTitle')
const dayAdd = document.querySelector('#day')
const monthAdd = document.querySelector('#month')
const yearAdd = document.querySelector('#year')
const descriptionAdd = document.querySelector('#description')
const priceAdd = document.querySelector('#price')
const capacityAdd = document.querySelector('#capacity')
const addDayButton = document.querySelector('#addDayButton')

// Select elements for editing an existing day
const editDayTitle = document.querySelector('#editDayTitle')
const daySelectorToEdit = document.querySelector('#daySelectorToEdit')
const dayEdit = document.querySelector('#dayEdit')
const monthEdit = document.querySelector('#monthEdit')
const yearEdit = document.querySelector('#yearEdit')
const descriptionEdit = document.querySelector('#descriptionEdit')
const priceEdit = document.querySelector('#priceEdit')
const capacityEdit = document.querySelector('#capacityEdit')
const editDayButton = document.querySelector('#editDayButton')

// Select elements for disabling a day
const disableDayTitle = document.querySelector('#disableDayTitle')
const daySelectorToDisable = document.querySelector('#daySelectorToDisable')
const activeDayButton = document.querySelector('.activeDay')
const disableDayButton = document.querySelector('.disableDay')

// Select elements for deleting a day
const deleteDayTitle = document.querySelector('#deleteDayTitle')
const daySelectorToDelete = document.querySelector('#daySelectorToDelete')
const DeleteDayButton = document.querySelector('.DeleteDay')

// Initialize an array to store the list of days
let days = []

// Function to populate the day selectors with options
const options = () => {
    days.forEach((day) => {
        const option = document.createElement('option')
        option.value = day.date
        option.textContent = `${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description}`
        daySelectorToDelete.appendChild(option)
    })

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

    days.forEach((day) => {
        const option = document.createElement('option')
        option.value = day.date
        option.textContent = `${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description}`
        daySelectorToEdit.appendChild(option)
    })
}

// Function to fetch the list of days from the server
const getDays = () => {
    fetch('/api/admin/day', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        days = data.listOfDays
        options()
    }).catch((e) => {
        console.log(e)
    })
}

// Fetch the list of days on page load
getDays()

// Event listener for selecting a day to edit
let date = 0
daySelectorToEdit.addEventListener('change', (e) => {
    date = e.target.value
    const day = days.find((day) => {
        return day.date === Number(e.target.value)
    })
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
    errorMessage(1, editDayTitle)
    fetch('/api/admin/day', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify(day)
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        editDayTitle.textContent = 'ویرایش روز (روز با موفقیت ویرایش شد)'
    }).catch((e) => {
        errorMessage(2, editDayTitle)
    }).then(() => {
        dayEdit.value = ''
        monthEdit.value = ''
        yearEdit.value = ''
        descriptionEdit.value = ''
        priceEdit.value = ''
        capacityEdit.value = ''
    })
}

// Function to add a new day
const addDayFunc = (day) => {
    errorMessage(1, addDayTitle)
    fetch('/api/admin/day', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify(day) // Fixed bug: removed unnecessary object wrapping
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        addDayTitle.textContent = 'اضافه کردن روز (روز با موفقیت اضافه شد)'
    }).catch((e) => {
        errorMessage(2, addDayTitle)
    }).then(() => {
        dayAdd.value = ''
        monthAdd.value = ''
        yearAdd.value = ''
        descriptionAdd.value = ''
        priceAdd.value = ''
        capacityAdd.value = ''
    })
}

// Event listener for adding a new day
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

// Event listener for editing a day
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

// Event listener for selecting a day to change its active status
let dayToChangeActive = 0
daySelectorToDisable.addEventListener('click', (e) => {
    dayToChangeActive = Number(e.target.value)
})

// Event listener for activating a day
activeDayButton.addEventListener('click', (e) => {
    errorMessage(1, disableDayTitle)
    activeDayButton.disabled = true
    fetch('/api/admin/activeDay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({
            date: dayToChangeActive,
            value: true
        })
    }).then(errorHandler).then((res) => res.json()).then((date) => {
        disableDayTitle.textContent = 'فعال / غیرفعال کردن روز (عملیات با موفقیت انجام شد)'
        activeDayButton.disabled = false
    }).catch((e) => {
        errorMessage(2, disableDayTitle)
        activeDayButton.disabled = false
    })
})

// Event listener for deactivating a day
disableDayButton.addEventListener('click', (e) => {
    errorMessage(1, disableDayTitle)
    disableDayButton.disabled = true
    fetch('/api/admin/activeDay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({
            date: dayToChangeActive,
            value: false
        })
    }).then(errorHandler).then((res) => res.json()).then((date) => {
        disableDayTitle.textContent = 'فعال / غیرفعال کردن روز (عملیات با موفقیت انجام شد)'
        disableDayButton.disabled = false
    }).catch((e) => {
        errorMessage(2, disableDayTitle)
        disableDayButton.disabled = false
    })
})

// Event listener for selecting a day to delete
let dateToDelete = 0
daySelectorToDelete.addEventListener('change', (e) => {
    dateToDelete = Number(e.target.value)
})

// Event listener for deleting a day
DeleteDayButton.addEventListener('click', (e) => {
    errorMessage(1, deleteDayTitle)
    DeleteDayButton.disabled = true
    fetch('/api/admin/day', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({
            date: dateToDelete
        })
    }).then(errorHandler).then((res) => res.json()).then((date) => {
        deleteDayTitle.textContent = 'حذف روز (روز با موفقیت حذف شد)'
        DeleteDayButton.disabled = false
    }).catch((e) => {
        errorMessage(2, deleteDayTitle)
        DeleteDayButton.disabled = false
    })
})