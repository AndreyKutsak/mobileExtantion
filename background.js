
const interval = 60000;
let check;


function fetchDataAndNotify() {
    fetch("https://baza.m-p.in.ua/ajax/magaz.php")
        .then((response) => response.text())
        .then((data) => {
            if (data.toLowerCase().includes("замовлення") || data.toLowerCase().includes("уточнення") || data.toLowerCase().includes("питання")) {
                // Відправляємо сповіщення
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png", // Шлях до зображення для сповіщення
                    title: "У тебе є птання чи уточнення!!",
                    message: "Є питання чи уточнення",
                });
            }
        })
        .catch((error) => {
            console.error("Помилка запиту:", error);
        });
}

// Викликаємо функцію fetchDataAndNotify по інтервалу

// Зауваження: цей код призначений для Chrome Extension API. Якщо ви використовуєте інший браузер або WebExtensions API, код може вимагати певних змін.
function scheduleFunction() {
    console.log("Check time is sarting");
    const currentTime = new Date();
    const startHour = 9; // 9:00 AM
    const endHour = 18; // 6:00 PM

    if (currentTime.getHours() >= startHour && currentTime.getHours() < endHour) {
        // Ваша функція, яку потрібно виконати
        clearInterval(check);
        check = setInterval(fetchDataAndNotify, interval);


    } else {
        console.log("Now is not working time!!")
    }
}
setInterval(scheduleFunction, interval);
// Викликайте scheduleFunction() для початку розпорядку
scheduleFunction();
fetchDataAndNotify();
chrome.alarms.create('ALARM_NAME', {
    //options
    periodInMinutes: 1
});