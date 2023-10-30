const interval = 1000 * 60;
const startHour = 9;
const endHour = 18;
let activeTabUrl;
let alrmCount = 0;
let intervalCount = 0;

function fetchDataAndNotify() {
	fetch("https://baza.m-p.in.ua/ajax/magaz.php")
		.then((response) => response.text())
		.then((data) => {
			if (data.toLowerCase().includes("уточнення")) {
				chrome.notifications.create({
					type: "basic",
					iconUrl: "icon.png",
					title: "Уточнення",
					message: "У тебе є уточнення!!",
				});
			}
			if (data.toLowerCase().includes("питання")) {
				chrome.notifications.create({
					type: "basic",
					iconUrl: "icon.png",
					title: "Питання",
					message: "У тебе є питання!!",
				});
			}
		})
		.catch((error) => {
			chrome.notifications.create({
				type: "basic",
				iconUrl: "icon.png",
				title: "Помилка!!",
				message: "Відбулася помилка під час запиту на сервер!!",
			});
			console.log(error);
		});
}

function scheduleFunction() {
	const currentTime = new Date();
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (tabs.length <= 0) {
			activeTabUrl = undefined;
			return;
		}
		activeTabUrl = !tabs[0].url.includes("baza.m-p.in.ua");
	});
	if (
		currentTime.getHours() >= startHour &&
		currentTime.getHours() < endHour &&
		(activeTabUrl == undefined || activeTabUrl)
	) {
		fetchDataAndNotify();
	}
}

// Оновлений лістенер, який відстежує зміни в активних вкладках
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.url) {
		activeTabUrl = !changeInfo.url.includes("baza.m-p.in.ua");
		scheduleFunction();
	}
});

chrome.runtime.onInstalled.addListener(function () {
	chrome.alarms.create("test-alarm", {
		delayInMinutes: 1,
		periodInMinutes: 1,
	});
});

chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name == "test-alarm") {
		scheduleFunction();
	}
});
