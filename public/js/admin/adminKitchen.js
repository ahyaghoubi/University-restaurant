'use strict'

const kitchenContainer = document.querySelector('.kitchenContainer')
const kitchenTitle = document.querySelector('#kitchenTitle')

const addStaffTitle = document.querySelector('#addStaffTitle')
const staffName = document.querySelector('#staffName')
const staffUser = document.querySelector('#staffUser')
const staffPass = document.querySelector('#staffPass')
const addStaffButton = document.querySelector('#addStaff')

let staffs = []

const deleteStaff = (username) => {
    errorMessage(1, kitchenTitle)
    fetch('/api/admin/kitchen', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        },
        body: JSON.stringify({username})
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        getStaffs()
        kitchenTitle.textContent = 'کارکنان فعال (حذف موفق)'
    }).catch((e) => {
        errorMessage(2, kitchenTitle)
    })
}

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

const renderStaffs = () => {
    if(!staffs.length) {
        kitchenContainer.textContent = ''
        const emptyStaffMessage = document.createElement('p')
        emptyStaffMessage.textContent = 'کاربری برای نمایش وجود ندارد'

        kitchenContainer.appendChild(emptyStaffMessage)
    } else {
        kitchenContainer.textContent = ''
        staffs.forEach((staff) => {
            const oneStaffDiv = generateStaffDOM(staff)
            kitchenContainer.appendChild(oneStaffDiv)
            kitchenContainer.appendChild(document.createElement('br'))
        })
    }
}

const getStaffs = () => {
    fetch('/api/admin/kitchen', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
        }
    }).then(errorHandler).then((res) => res.json()).then((data) => {
        staffs = data
        renderStaffs()
    }).catch((e) => {
        console.log(e)
    })
}

getStaffs()

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
            getStaffs()
            addStaffTitle.textContent = 'اضافه کردن (عملیات با موفقیت انجام شد)'
        }).catch((e) => {
            errorMessage(2, addStaffTitle)
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