const interval = 60000;
let check;
let browser = function fetchDataAndNotify() {
	fetch("https://baza.m-p.in.ua/ajax/magaz.php")
		.then((response) => response.text())
		.then((data) => {
			if (
				data.toLowerCase().includes("уточнення") ||
				data.toLowerCase().includes("питання")
			) {
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
			chrome.notifications.create({
				type: "basic",
				iconUrl: "icon.png", // Шлях до зображення для сповіщення
				title: "Відбулася помилка під час запиту!!",
				message: "",
			});
		});
};

// Викликаємо функцію fetchDataAndNotify по інтервалу

// Зауваження: цей код призначений для Chrome Extension API. Якщо ви використовуєте інший браузер або WebExtensions API, код може вимагати певних змін.
function scheduleFunction() {
	console.log("Check time is sarting");
	const currentTime = new Date();
	const startHour = 9; // 9:00 AM
	const endHour = 18; // 6:00 PM

	if (currentTime.getHours() >= startHour && currentTime.getHours() < endHour) {
		fetchDataAndNotify();
	} else {
		chrome.notifications.create({
			type: "basic",
			iconUrl: "icon.png", // Шлях до зображення для сповіщення
			title: "Зараз не час для роботи розширення!",
			message: "",
		});
	}
}

chrome.alarms.create("myAlarm", {
	periodInMinutes: 1, // Періодичність в хвилинах (один раз в хвилину)
});

// Обробник події, який викликає вашу функцію при спрацюванні будильника
chrome.alarms.onAlarm.addListener(function (alarm) {
	if (alarm.name === "myAlarm") {
		scheduleFunction(); // Викликайте вашу функцію, коли будильник спрацьовує
	}
});
