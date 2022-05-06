const adminToken = localStorage.getItem('adminToken')
if (!adminToken) location.assign('/admin/login')

const logoutButton = document.querySelector('#logoutButton')

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

logoutButton.addEventListener('click', () => {
    fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        }
    }).then(errorHandler).then(() => {
        localStorage.removeItem('adminToken')
        location.assign('/')
    }).catch((e) => {
        localStorage.removeItem('adminToken')
        location.assign('/')
        console.log(e)
    })
})