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

const changePassTitle = document.querySelector('#changePassTitle')
const currentPass = document.querySelector('#currentPass')
const newPass = document.querySelector('#newPass')
const repeatNewPass = document.querySelector('#repeatNewPass')

const changeButton = document.querySelector('#changeButton')

changeButton.addEventListener('click', (e) => {
    changeButton.disabled = true
    changePassTitle.textContent = 'تغییر رمز (در حال انجام...)'
    fetch('/api/kitchen', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + kitchenToken
        },
        body: JSON.stringify({
            currentPass: currentPass.value,
            newPass: newPass.value,
            repeatNewPass: repeatNewPass.value
        })
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        changePassTitle.textContent = 'تغییر رمز (رمز با موفقیت تغییر یافت)'
        changeButton.disabled = false
    }).catch((e) => {
        changePassTitle.textContent = 'تغییر رمز'
        errorMessage(2, changePassTitle)
        changeButton.disabled = false
    })
})