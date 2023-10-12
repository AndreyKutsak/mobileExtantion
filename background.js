let activeTabUrl;
function fetchDataAndNotify() {
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
}
function scheduleFunction() {
	const currentTime = new Date();
	const startHour = 9; // 9:00 AM
	const endHour = 18; // 6:00 PM
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var activeTab = tabs[0];
		activeTabUrl = activeTab.url;
		console.log("activeTabUrl", activeTabUrl);
	});
	if (
		currentTime.getHours() >= startHour &&
		currentTime.getHours() < endHour &&
		!activeTabUrl.contains("baza.m-p.in.ua")
	) {
		fetchDataAndNotify();
	}
}

chrome.alarms.create("myAlarm", {
	periodInMinutes: 1,
});

chrome.alarms.onAlarm.addListener(function (alarm) {
	if (alarm.name === "myAlarm") {
		scheduleFunction();
	}
});
