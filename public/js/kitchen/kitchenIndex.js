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
    })
})

const kitchenMainContent = document.querySelector('.kitchenMainContent')
const activeDaysTitle = document.querySelector('#activeDaysTitle')
let days = []

const renderDays = () => {
    if(!days.length) {
        kitchenMainContent.textContent = ''
        const emptyDayMessage = document.createElement('p')
        emptyDayMessage.textContent = 'روز فعالی موجود نیست'

        kitchenMainContent.appendChild(emptyDayMessage)
    } else {
        kitchenMainContent.textContent = ''
        days.forEach((day) => {
            const dayDescription = document.createElement('p')
            dayDescription.textContent = `${day.dow} ${day.day} ${day.month} ${day.year} - غذا: ${day.description} - تعداد سفارشات: ${day.numOfOrder} - ظرفیت: ${day.capacity} نفر`
            kitchenMainContent.appendChild(dayDescription)
        })
    }
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
        renderDays()
    }).catch((e) => {
        
    })
}

getDays()