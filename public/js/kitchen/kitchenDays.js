'use strict'

const kitchenToken = localStorage.getItem('kitchenToken')
if (!kitchenToken) location.assign('/kitchen/login')

const errorMessage = (code, messageContainer) => {
    if (code === 1) messageContainer.textContent = messageContainer.textContent.replace(' (عملیات ناموفق لطفا دوباره تلاش کنید)', '')
    if (code === 2) messageContainer.textContent = messageContainer.textContent + ' (عملیات ناموفق لطفا دوباره تلاش کنید)'
}

const errorHandler = (res) => {
    if (res.status === 400) throw new Error('(عملیات ناموفق لطفا دوباره تلاش کنید)')
    else if (res.status === 401 || res.status === 403) {
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

const kitchenLogout = document.querySelector('#kitchenLogout')
kitchenLogout.addEventListener('click', (e) => {
    fetch('/api/kitchen/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        }
    }).then(errorHandler).then(() => {
        localStorage.removeItem('kitchenToken')
        location.assign('/')
    }).catch((e) => {

    })
})

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

let days = []

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

const getDays = () => {
    fetch('/api/kitchen/day', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        days = data.listOfDays
        options()
    }).catch((e) => {
        
    })
}

getDays()

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

let dayToChangeActive = 0
daySelectorToDisable.addEventListener('click', (e) => {
    dayToChangeActive = Number(e.target.value)
})

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

let dateToDelete = 0
daySelectorToDelete.addEventListener('change', (e) => {
    dateToDelete = Number(e.target.value)
})

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