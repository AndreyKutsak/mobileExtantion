const interval = 1000 * 60;
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
		if (tabs.length === 0) {
			activeTabUrl = "hide";
			return;
		}
		var activeTab = tabs[0];
		activeTabUrl = activeTab.url;
		console.log("activeTabUrl", activeTabUrl);
	});
	if (
		(currentTime.getHours() >= startHour &&
			currentTime.getHours() < endHour &&
			!activeTabUrl.includes("baza.m-p.in.ua")) ||
		activeTabUrl === "hide"
	) {
		fetchDataAndNotify();
	}
}

setInterval(function () {
	chrome.notifications.create({
		type: "basic",
		iconUrl: "icon.png", // Шлях до зображення для сповіщення
		title: "перевірка роботи ",
		message: "",
	});
}, 1000 * 60);
chrome.notifications.create({
	type: "basic",
	iconUrl: "icon.png", // Шлях до зображення для сповіщення
	title: "перевірка роботи ",
	message: "",
});
setInterval(scheduleFunction, interval);
