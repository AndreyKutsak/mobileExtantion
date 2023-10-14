const interval = 1000 * 60;
const startHour = 9;
const endHour = 18;
let activeTabUrl;
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
				title: "Пмилка!!",
				message: "Відбулася помилка під час ззапиту на сервер!!",
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
		console.log("activeTabUrl", activeTabUrl);
	});
	if (
		currentTime.getHours() >= startHour &&
		currentTime.getHours() < endHour &&
		(activeTabUrl == undefined || activeTabUrl)
	) {
		fetchDataAndNotify();
	}
}

setInterval(function () {
	chrome.notifications.create({
		type: "basic",
		iconUrl: "icon.png",
		title: "перевірка роботи ",
		message: "",
	});
}, 1000 * 60);
chrome.notifications.create({
	type: "basic",
	iconUrl: "icon.png",
	title: "перевірка роботи ",
	message: "",
});
setInterval(scheduleFunction, interval);

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	console.log(tabs);
	if (tabs.lenght == 0) {
		activeTabUrl = undefined;
		return;
	}

	activeTabUrl = !tabs[0].url.includes("baza.m-p.in.ua");
	console.log("activeTabUrl", activeTabUrl);
	if (activeTabUrl == undefined || activeTabUrl) {
		setInterval(function () {
			chrome.notifications.create({
				type: "basic",
				iconUrl: "icon.png",
				title: "перевірка роботи  пройшла хвилина",
				message: "",
			});
		}, 1000 * 60);
		setInterval(function () {
			chrome.notifications.create({
				type: "basic",
				iconUrl: "icon.png",
				title: "перевірка роботи  пройшло 10 хвилин",
				message: "",
			});
		}, 1000 * 60 * 10);
		setInterval(function () {
			chrome.notifications.create({
				type: "basic",
				iconUrl: "icon.png",
				title: "перевірка роботи  пройшла година",
				message: "",
			});
		}, 1000 * 60 * 60);
		console.log("Розпочати Інтервали");
	} else {
		console.log("Не розпочати Інтервали", tabs, activeTabUrl);
	}
});
