
const interval = 60000;
let check;


function fetchDataAndNotify() {
    fetch("https://baza.m-p.in.ua/ajax/magaz.php")
        .then((response) => response.text())
        .then((data) => {
            // Парсимо отриманий текст
            const parsedData = data;
            console.log(parsedData);

            // Перевіряємо, чи відповідь містить цифри
            if (data.includes("Уточнення") || data.includes("питання")) {
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
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png", // Шлях до зображення для сповіщення
        title: "Розпочато перевірку часу",
        message: "Перевіряється час для роботи розширення",
    });
    const currentTime = new Date();
    const startHour = 9; // 9:00 AM
    const endHour = 18; // 6:00 PM

    if (currentTime.getHours() >= startHour && currentTime.getHours() < endHour) {
        // Ваша функція, яку потрібно виконати
        console.log("Ваша функція виконується о " + currentTime);
        clearInterval(check);
        check = setInterval(fetchDataAndNotify, interval);


    } else {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png", // Шлях до зображення для сповіщення
            title: "Не час для роботи розширення",
            message: "Зараз не час для роботи розширення",
        });
    }
}
setInterval(scheduleFunction, interval);
// Викликайте scheduleFunction() для початку розпорядку
scheduleFunction();
