// let head = document.querySelector("head");
// let meta = document.createElement("meta");
// meta.name = "viewport";
// meta.setAttribute("content", `width=device-width, initial-scale=1.0`);
// head.appendChild(meta);
// let loginInp = document.querySelector("#loginB1");

// if (loginInp === null) {

// 	let select = document.querySelector(".search .select2-selection");
// 	let searchInp = document.querySelector("#search");
// 	let searchInpBtn = document.querySelector(".search input[type='button']");
// 	let div = Array.from(document.querySelectorAll("div")) || [0];
// 	let btnsWraper = document.querySelector(".buttons");
// 	let selectButtons = Array.from(
// 		document.querySelectorAll('.buttons input[type="button"]')
// 	) || [0];
// 	let buttonsToggler = document.createElement("button");
// 	let tableWraper = document.querySelector("#mainDiv");
// 	let elaborationURL = "https://baza.m-p.in.ua/ajax/loadElaboration.php";
// 	let searchURL = "https://baza.m-p.in.ua/ajax/search.php";
// 	let orderURL = "";

// 	let elaborationLink = null;
// 	let testData = [
// 		{
// 			orderNumber: "# 1100051 (3483121203)",
// 			orderManager: "Andrey Kutsat",
// 			positionName: "Бункер для солі для посудомийних машин (9.306.0002)",
// 			positionPlace: "1-2-3",
// 			elaborationType: "Уточняк",
// 			positionQuality: "3",
// 			reserveQuality: "3",
// 			searchQuery:
// 				"Бункер (контейнер) для солі посудомийних машин Ariston C00256548",
// 		},

// 		{
// 			orderNumber: "# 1100051 (34833333)",
// 			orderManager: "Andrey Kutsat",
// 			positionName: "Бункер для солі для посудомийних машин (9.306.0019)",
// 			positionPlace: "1-2-3",
// 			elaborationType: "Уточняк",
// 			positionQuality: "3",
// 			reserveQuality: "3",
// 			searchQuery: "Пробка для солі Indesit C00056435",
// 		},
// 		{
// 			orderNumber: "# 1100051 (3421203)",
// 			orderManager: "Andrey Kutsat",
// 			positionName: "Бункер для солі для посудомийних машин (9.306.0005)",
// 			positionPlace: "1-2-3",
// 			elaborationType: "Уточняк",
// 			positionQuality: "3",
// 			reserveQuality: "3",
// 			searchQuery: "Ємність для солі (іонізатор) Beko 1768300100",
// 		},
// 	];
// 	buttonsToggler.textContent = "Опції";
// 	buttonsToggler.className = "buttons-toggler";
// 	btnsWraper.prepend(buttonsToggler);

// 	tableWraper.style.display = "none";
// 	// set select width
// 	select.style.width = "100%";
// 	// set styles for search input
// 	searchInp.style.padding = "10px";
// 	searchInp.style.fontsize = "18px";
// 	searchInp.style.fontWeight = "600";
// 	// set styles search input button
// 	searchInpBtn.style.width = "20%";
// 	searchInpBtn.style.padding = "10px";
// 	// remove padding and set width 100%
// 	btnsWraper.parentNode.style.paddingLeft = "0px";
// 	btnsWraper.parentNode.style.width = "100%";
// 	// set top margin for buttons wraper
// 	btnsWraper.style.marginTop = "70px";
// 	btnsWraper.classList.add("hide-buttons");

// 	// remove blue div
// 	div.forEach((el) => {
// 		if (
// 			el.textContent.includes("Склад (Василенка)") &&
// 			el.style.borderRadius == "5px"
// 		) {
// 			el.style.display = "none";
// 		}
// 	});
// 	buttonsToggler.addEventListener("click", () => {
// 		btnsWraper.classList.toggle("hide-buttons");
// 	});

//
// 	// elaboration
// 	let getLink = (link) => {
// 		var regex = /\/\d+_\d+\//;
// 		var replacedString = link.replace(regex, "/");
// 		return replacedString;
// 	};
// 	let loadElaboration = () => {
// 		let elaborationData;
// 		let newTableWraper = document.createElement("div");
// 		newTableWraper.className = "new-table-wraper";
// 		let data = {};
// 		fetch(elaborationURL, {
// 			method: "POST",
// 		})
// 			.then((response) => {
// 				return response.text();
// 			})
// 			.then((response) => {
// 				elaborationData = response;
// 				elaborationData = parseGetedHTML(elaborationData);

// 				let cellNames = [
// 					"orderNumber",
// 					"orderManager",
// 					"positionName",
// 					"positionPlace",
// 					"elaborationType",
// 					"positionQuality",
// 					"reserveQuality",
// 					"searchQuery",
// 					"imagesSrc",
// 					"imageLink",
// 				];
// 				let tableRows = Array.from(
// 					elaborationData.querySelectorAll("table>tbody>tr")
// 				);
// 				tableRows.shift();
// 				data = tableRows.map((row) => {
// 					let rowData = {};
// 					let rowCells = Array.from(row.querySelectorAll("td"));

// 					rowCells.forEach((cell, index) => {
// 						rowData[cellNames[index]] = cell.textContent.trim();
// 						if (cellNames[index] == "searchQuery") {
// 							let result = rowData["positionName"].replace(/\([^)]+\)/g, "");
// 							rowData[cellNames[index]] = result.trim();
// 						}
// 					});

// 					return rowData;
// 				});

// 				testData.forEach((query, key) => {
// 					var request = new URLSearchParams();
// 					request.append("search", query.searchQuery);
// 					request.append("search_sel", "0");
// 					fetch(searchURL, {
// 						method: "POST",
// 						headers: {
// 							Accept: "*/*",
// 							"Accept-Encoding": "gzip, deflate, br",
// 							"Accept-Language": "uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7",
// 							"Sec-Ch-Ua":
// 								'"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
// 							"Sec-Ch-Ua-Mobile": "?1",
// 							"Sec-Ch-Ua-Platform": '"Android"',
// 							"Sec-Fetch-Dest": "empty",
// 							"Sec-Fetch-Mode": "cors",
// 							"Sec-Fetch-Site": "same-origin",
// 							"User-Agent":
// 								"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36",
// 							"X-Requested-With": "XMLHttpRequest",
// 							"Content-Type":
// 								"application/x-www-form-urlencoded; charset=UTF-8",
// 						},
// 						body: request,
// 					})
// 						.then((responce) => {
// 							return responce.text();
// 						})
// 						.then((responce) => {
// 							let searchresult = parseGetedHTML(responce);
// 							let reserve = searchresult.querySelectorAll(".detPr >span")[1];
// 							let images = Array.from(
// 								searchresult.querySelectorAll(".detImg>img")
// 							);
// 							let imgSrc = [];
// 							let imgLink = [];
// 							images.forEach((img) => {
// 								imgSrc.push(img.getAttribute("rel"));
// 								imgLink.push(`https://baza.m-p.in.ua${img.alt}`);
// 							});
// 							testData[key].reserveQuality = reserve.textContent;
// 							testData[key].imagesSrc = imgSrc;
// 							generateTable(testData);
// 						});
// 				});
// 			})
// 			.catch((err) => {
// 				alert("Не вдалося отримати уточнення!!");
// 				console.log(err);
// 			});
// 		let getOrderId = (data) => {
// 			// Визначаємо регулярний вираз для пошуку числа в дужках
// 			var regex = /\((\d+)\)/;

// 			// Знаходимо відповідність регулярному виразу в рядку
// 			var match = data.match(regex);

// 			// Перевіряємо, чи знайдено числову відповідність
// 			if (match && match[1]) {
// 				// Повертаємо число в дужках як ціле число
// 				return parseInt(match[1], 10);
// 			} else {
// 				// Якщо число в дужках не знайдено, повертаємо null або можна вказати інше значення за замовчуванням
// 				return null;
// 			}
// 		};
// 		let generateTable = (data) => {
// 			data.forEach((rowData) => {
// 				let images = "";
// 				console.log(rowData);
// 				try {
// 					rowData.imagesSrc.forEach((imgSrc) => {
// 						images += `
// 					<a href="${getLink(imgSrc)}"><img src="${imgSrc}"></a>`;
// 					});
// 				} catch {
// 					console.error();
// 				}
// 				let table;
// 				let tableHTML = `<div class='table'>
// 						<div class='order-num fx'>
// 							<p class='table-desc'>Номер Замовлення</p>
// 							<p class='table-desc'>${rowData.orderNumber}</p>
// 						</div>
// 						<div class='order-manager fx'>
// 							<p class='table-desc'>Менеджер</p>
// 							<p class='table-desc'>${rowData.orderManager}</p>
// 						</div>
// 						<div class='good-desc fx'>
// 							<p class='table-desc'>Товар</p>
// 							<p class='table-desc'>${rowData.positionName}</p>
// 						</div>
// 						<div class='goods-adres fx'>
// 							<p class='table-desc'>Адрес товару</p>
// 							<p class='table-desc'>${rowData.positionPlace}</p>
// 						</div>
// 						<div class='goods-quality fx'>
// 							<p class='table-desc'>Кількість</p>
// 							<p class='table-desc'>${rowData.positionQuality}</p>
// 						</div>
// 						<div class='goods-reserve fx'>
// 							<p class='table-desc'>Резерв</p>
// 							<p class='table-desc'>${rowData.reserveQuality}</p>
// 						</div>
// 						<div class='order-anwser fx'>
// 							<p class='table-desc'>Відповідь</p>
// 							<div class='inp-wraper'><input
//                        type="text" class="elaboration-inp" id="elaborationInput${getOrderId(
// 													rowData.orderNumber
// 												)}">
// 					   <button
//                         data-orderID="${getOrderId(
// 													rowData.orderNumber
// 												)},0" class="elaboration-btn">збер.</button></div>
// 						</div>
// 						<div class='goods-photo fx'>
// 							<p class='table-desc'>Фото товару</p>
// 							<div class='goods-photo-wraper table-desc'>${images}</div>
// 						</div>
// 					</div>`;
// 				table = parseGetedHTML(tableHTML).querySelector(".table");
// 				newTableWraper.appendChild(table);
// 				console.log(table);
// 				let elaborationInp = newTableWraper.querySelector(".elaboration-inp");
// 				let elaborationBtn = newTableWraper.querySelector(".elaboration-btn");
// 				elaborationBtn.addEventListener("click", addElaborationAnswer);
// 			});
// 			document.body.appendChild(newTableWraper);
// 		};
// 		let addElaborationAnswer = (e) => {
// 			let orderId = e.target.dataset.orderId || false;
// 			if (orderId === false) {
// 				console.log("order id is not defined");
// 				return false;
// 			}
// 			var text = document
// 				.querySelector(`#elaborationInput${orderId}`)
// 				.value()
// 				.trim();
// 			console.log(text, orderId);
// 			// 	if (text.length > 0) {
// 			// 		$("#loader").show();
// 			// 		$.post(
// 			// 			"https://baza.m-p.in.ua/ajax/addElaborationAnswer.php",
// 			// 			{ id: id, text: text },
// 			// 			function (data) {
// 			// 				if (data == "ok") {
// 			// 					if (order == 1) {
// 			// 						$("#elaborationInput" + id).hide();
// 			// 						$("#elaborationButton" + id).hide();
// 			// 						$("#loader").hide();
// 			// 					} else {
// 			// 						//loadElaboration();
// 			// 						$("#eleborationAnswer" + id).html(
// 			// 							'<span style="color: blue;">' + text + "</span>"
// 			// 						);
// 			// 						$("#loader").hide();
// 			// 					}
// 			// 				} else alert("ups");
// 			// 			}
// 			// 		);
// 			// 	} else alert("Занадто коротке питання");
// 			// }
// 		};
// 		// Вибираємо елемент, який ми хочемо відстежувати
// 		const targetElement = document.getElementById("magaz");

// 		// Створюємо спостерігача за змінами
// 		const observer = new MutationObserver(function (mutationsList, observer) {
// 			for (const mutation of mutationsList) {
// 				if (mutation.type === "childList" || mutation.type === "attributes") {
// 					// Обробляємо зміни
// 					let children = Array.from(mutation.target.querySelectorAll("div"));
// 					children.forEach((el) => {
// 						if (el.textContent.includes("Є уточнення:")) {
// 							el.id = "elaborationLink";

// 							el.removeEventListener("click", loadElaboration);
// 							el.addEventListener("click", loadElaboration);
// 						}
// 					});
// 				}
// 			}
// 		});

// 		// Починаємо відстежування змін
// 		observer.observe(targetElement, {
// 			attributes: true, // Відстежувати зміни атрибутів
// 			childList: true, // Відстежувати зміни в дочірніх елементах
// 			characterData: true, // Відстежувати зміни текстового вмісту
// 			subtree: true, // Відстежувати зміни в піддереві
// 		});
// 	};
// 	loadElaboration();
// }
window.addEventListener("load", () => {
	let head = document.querySelector("head");
	head.innerHTML = ` <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Мобільна База Замовлень</title>`;
	let loginInp = document.querySelector("#loginB1");

	if (loginInp !== null) {
		return false;
	}
	// remove all elements from body
	document.body.innerHTML = "";
	// creating and adding new elements to DOM
	let contentWraper = document.createElement("div");
	contentWraper.className = "wraper";
	let preloaderWraper = document.createElement("div");
	preloaderWraper.className = "preloader-wraper";
	let preloaderSpiner = document.createElement("div");
	preloaderSpiner.className = "preloader-spiner";
	preloaderSpiner.innerHTML = `
<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; display: block; shape-rendering: auto;" width="217px" height="217px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
<circle cx="50" cy="50" r="32" stroke-width="8" stroke="#85a2b6" stroke-dasharray="50.26548245743669 50.26548245743669" fill="none" stroke-linecap="round">
  <animateTransform attributeName="transform" type="rotate" dur="3.846153846153846s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50;360 50 50"></animateTransform>
</circle>
<circle cx="50" cy="50" r="23" stroke-width="8" stroke="#bbcedd" stroke-dasharray="36.12831551628262 36.12831551628262" stroke-dashoffset="36.12831551628262" fill="none" stroke-linecap="round">
  <animateTransform attributeName="transform" type="rotate" dur="3.846153846153846s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50;-360 50 50"></animateTransform>
</circle>
<!-- [ldio] generated by https://loading.io/ --></svg>`;
	preloaderWraper.appendChild(preloaderSpiner);
	// URL
	let bazaURL = "https://baza.m-p.in.ua/ajax/magaz.php";
	let elaborationURL = "https://baza.m-p.in.ua/ajax/loadElaboration.php";
	let addElaborationURL =
		"https://baza.m-p.in.ua/ajax/addElaborationAnswer.php";

	let searchURL = "https://baza.m-p.in.ua/ajax/search.php";
	let elaborationInterval = 10;
	let btnWraper = document.createElement("div");
	btnWraper.className = "btn-wraper";
	// btn block
	let elaborationBtn = document.createElement("button");
	elaborationBtn.className = "elaboration-btn btn";
	elaborationBtn.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" focusable="false" viewBox="0 0 12 12">
  <path fill="#fff" d="M5 2.98a1 1 0 110-2h5a1 1 0 010 2H5zM5 7a1 1 0 110-2h5a1 1 0 010 2H5zm0 4a1 1 0 010-2h5a1 1 0 010 2H5zM1.49 3.21c-.13 0-.21-.08-.21-.22V2.9c0-.13.08-.21.21-.21h.28V1.56l-.05.05c-.05.04-.1.07-.15.07-.04 0-.1-.01-.15-.08l-.07-.06a.224.224 0 01-.06-.15c0-.04.01-.09.07-.15l.41-.39c.07-.06.14-.09.22-.09h.14c.13 0 .21.08.21.22V2.7h.28c.13 0 .22.08.22.21V3c0 .13-.08.22-.22.22H1.49v-.01zm-.35 3.82c0-.58.38-.85.69-1.06.21-.14.39-.27.39-.42 0-.18-.14-.24-.27-.24-.15 0-.24.1-.28.14-.05.07-.11.09-.17.09a.21.21 0 01-.13-.05l-.08-.06c-.1-.08-.12-.19-.05-.29.13-.18.36-.38.75-.38.49 0 .83.31.83.76 0 .46-.37.71-.66.9-.17.11-.31.2-.37.31h.84c.13 0 .22.08.22.21v.09c0 .14-.08.22-.22.22H1.37c-.14 0-.23-.09-.23-.22zM1.25 11c-.1-.08-.12-.19-.04-.3l.06-.1c.05-.08.12-.1.16-.1.04 0 .09.01.13.04.08.06.21.13.37.13.19 0 .33-.11.33-.26 0-.25-.31-.28-.41-.28-.15 0-.22-.04-.27-.14a.227.227 0 01.03-.27s.37-.44.38-.45h-.56c-.13 0-.21-.08-.21-.21v-.09c0-.13.08-.22.21-.22h1.13c.13 0 .22.08.22.21s-.03.19-.08.26l-.41.47c.3.09.56.33.56.72-.01.41-.31.83-.89.83-.32 0-.56-.13-.71-.24z"/>
</svg>
`;
	let elabortionCount = document.createElement("span");
	elabortionCount.className = "elaboration-count counter";
	elaborationBtn.appendChild(elabortionCount);
	// patterns
	let elaborationPattern = /Є уточнення: (\d+) шт\./;

	let parser = (text) => {
		let domParser = new DOMParser();
		let doc = domParser.parseFromString(text, "text/html");
		return doc;
	};
	let getOrderId = (number) => {
		const regex = /\((\d+)\)/;
		const match = number.match(regex);
		if (match && match.length >= 2) {
			return parseInt(match[1], 10);
		}
		return null;
	};
	let checkElaborations = () => {
		fetch(bazaURL, {
			method: "POST",
		})
			.then((res) => {
				return res.text();
			})
			.then((responce) => {
				let parserResponce = parser(responce);
				let responceItems = Array.from(parserResponce.querySelectorAll("div"));

				responceItems.forEach((item) => {
					let elaborationResult = item.textContent.match(elaborationPattern);
					if (elaborationResult !== null) {
						elabortionCount.innerText = elaborationResult[1];
						elabortionCount.style.display = "block";
					}
				});
			});
	};
	let addElaborationAnswer = (e) => {
		let elaboration = new URLSearchParams();
		let orderNumber = e.target.dataset.orderNumber;
		let elaborationInp = document.getElementById(
			`elaborationInput${orderNumber}`
		);
		let count = Number(elaborationInp.dataset.count);
		if (elaborationInp.value == "") {
			alert("Введи коректну відповідь");
			return false;
		}
		if (count > Number(getNum(elaborationInp.value))) {
			alert(" Сподіваюся ти був уважним");
		}

		elaboration.append("text", elaborationInp.value);
		elaboration.append("id", e.target.dataset.orderNumber);

		fetch(addElaborationURL, {
			method: "POST",
			body: elaboration,
		})
			.then((res) => {
				return res.text();
			})
			.then((responce) => {
				if (responce == "ok") {
					elaborationInp.parentNode.parentNode.classList.add("success");
					elaborationInp.remove();
					e.target.remove();
				} else alert("Помилка");
				console.log(responce);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	let checkAnswer = (e) => {
		e.preventDefault();
		let answer = e.target.value;
		let count = Number(e.target.dataset.count);

		if (getNum(answer) > count) {
			e.target.parentNode.parentNode.classList.add("warn");
			alert("Переввір ще раз,І не забудь вказати лишки в пересорт");
		}
		if (getNum(answer) < count) {
			e.target.parentNode.parentNode.classList.add("danger");
		}
		if (getNum(answer) === count) {
			e.target.parentNode.parentNode.classList.remove("warn");
			e.target.parentNode.parentNode.classList.remove("danger");
		}
	};
	function getNum(inputString) {
		const regex = /\d+/;
		const matches = inputString.match(regex);

		if (matches && matches.length > 0) {
			return parseInt(matches[0], 10);
		}

		return null; // Повертаємо null, якщо число не знайдено в рядку
	}
	let getGoodsCount = (data) => {
		const regex = /По базе: (\d+)В заказі: (\d+)/;
		const matches = data.match(regex);
		if (matches && matches.length >= 3) {
			const baseCount = parseInt(matches[1], 10);
			const orderCount = parseInt(matches[2], 10);
			console.log(`По базе: ${baseCount}`);
			console.log(`В заказі: ${orderCount}`);
			return { baseCount: baseCount, orderCount: orderCount };
		}
	};
	let generateElaboration = (data) => {
		contentWraper.innerHTML = "";
		if (data.length > 0) {
			data.forEach((row) => {
				let tableWraper = document.createElement("div");
				tableWraper.className = "table-wraper";
				// order number
				let orderNumberRow = document.createElement("div");
				orderNumberRow.className = "table-row";
				let orderNumberDesc = document.createElement("div");
				orderNumberDesc.className = "table-desc";
				orderNumberDesc.textContent = "Номер Замовлення";
				let orderNumberText = document.createElement("div");
				orderNumberText.className = "table-text";
				orderNumberText.textContent = row.orderNumber;
				orderNumberRow.appendChild(orderNumberDesc);
				orderNumberRow.appendChild(orderNumberText);
				// order manager
				let managerRow = document.createElement("div");
				managerRow.className = "table-row";
				let managerDesc = document.createElement("div");
				managerDesc.className = "table-desc";
				managerDesc.textContent = "Менеджер";
				let managerName = document.createElement("div");
				managerName.className = "table-text";
				managerName.textContent = row.orderManager;
				managerRow.appendChild(managerDesc);
				managerRow.appendChild(managerName);
				// position name
				let positionNameRow = document.createElement("div");
				positionNameRow.className = "table-row";
				let positionNameDesc = document.createElement("div");
				positionNameDesc.className = "table-desc";
				positionNameDesc.textContent = "Імя товару";
				let positionNameText = document.createElement("div");
				positionNameText.className = "table-text";
				positionNameText.textContent = row.positionName;
				positionNameRow.appendChild(positionNameDesc);
				positionNameRow.appendChild(positionNameText);
				// position place
				let placeRow = document.createElement("div");
				placeRow.className = "table-row";
				let placeDesc = document.createElement("div");
				placeDesc.className = "table-desc";
				placeDesc.textContent = "Місце";
				let placeText = document.createElement("div");
				placeText.className = "table-text";
				placeText.textContent = row.positionPlace;
				placeRow.appendChild(placeDesc);
				placeRow.appendChild(placeText);

				// elaboration type
				let elaborationTypeRow = document.createElement("div");
				elaborationTypeRow.className = "table-row";
				let elaborationTypeDesc = document.createElement("div");
				elaborationTypeDesc.className = "table-desc";
				elaborationTypeDesc.textContent = "Тип Уточнення";
				let elaborationTypeText = document.createElement("div");
				elaborationTypeText.className = "table-text";
				elaborationTypeText.textContent = row.elaborationType;
				elaborationTypeRow.appendChild(elaborationTypeDesc);
				elaborationTypeRow.appendChild(elaborationTypeText);
				// position quality
				let positionQualityRow = document.createElement("div");
				positionQualityRow.className = "table-row";
				let positionQualityDesc = document.createElement("div");
				positionQualityDesc.className = "table-desc";
				positionQualityDesc.textContent = "Клас товару";
				let positionQualityText = document.createElement("div");
				positionQualityText.className = "table-text";
				positionQualityText.textContent = row.positionQuality;
				positionQualityRow.appendChild(positionQualityDesc);
				positionQualityRow.appendChild(positionQualityText);
				// reserve quality
				let reserveQualityRow = document.createElement("div");
				reserveQualityRow.className = "table-row";
				let reserveQualityDesc = document.createElement("div");
				reserveQualityDesc.className = "table-desc";
				reserveQualityDesc.textContent = "Резерв";
				let reserveQualityText = document.createElement("div");
				reserveQualityText.className = "table-text";
				reserveQualityText.textContent = row.reserveQuality;
				reserveQualityRow.appendChild(reserveQualityDesc);
				reserveQualityRow.appendChild(reserveQualityText);
				// input row
				let inputRow = document.createElement("div");
				inputRow.className = "table-row";
				let inputDesc = document.createElement("div");
				inputDesc.className = "table-desc";
				inputDesc.textContent = "Вкажи Кількість";
				let inputText = document.createElement("div");
				inputText.className = "table-input-wraper";
				let input = document.createElement("input");
				input.className = "table-input";
				input.dataset.count = getGoodsCount(row.positionQuality).baseCount;
				input.type = "text";
				input.placeholder = "Кількість";
				input.id = `elaborationInput${getOrderId(row.orderNumber)}`;
				let sendBtn = document.createElement("input");
				sendBtn.type = "button";
				sendBtn.value = "Відправити";
				sendBtn.className = "send-btn";
				sendBtn.dataset.orderNumber = getOrderId(row.orderNumber);
				inputText.appendChild(input);
				inputText.appendChild(sendBtn);
				inputRow.appendChild(inputDesc);
				inputRow.appendChild(inputText);
				// image row
				let imageRow = document.createElement("div");
				imageRow.className = "table-row";
				let imageDesc = document.createElement("div");
				imageDesc.className = "table-desc";
				imageDesc.textContent = "Фото товару";
				let imageWraper = document.createElement("div");
				imageWraper.className = "image-wraper";

				let images = row.imagesSrc.map((src, index) => {
					let a = document.createElement("a");
					a.href = row.imageLink[index];
					let img = document.createElement("img");
					img.src = src;
					a.appendChild(img);
					console.log(a);
					return a;
				});

				images.forEach((image) => {
					imageWraper.appendChild(image);
				});

				// Add event listeners
				sendBtn.addEventListener("click", addElaborationAnswer);
				input.addEventListener("input", checkAnswer);
				// appending elements
				tableWraper.appendChild(orderNumberRow);
				tableWraper.appendChild(managerRow);
				tableWraper.appendChild(positionNameRow);
				tableWraper.appendChild(placeRow);
				tableWraper.appendChild(elaborationTypeRow);
				tableWraper.appendChild(positionQualityRow);
				tableWraper.appendChild(reserveQualityRow);
				tableWraper.appendChild(inputRow);
				tableWraper.appendChild(imageWraper);
				contentWraper.appendChild(tableWraper);
			});
		} else {
			let elaborationTitle = document.createElement("p");
			elaborationTitle.className = "elaboration-title content-title";
			elaborationTitle.textContent = "Зараз немає Уточнень";
			contentWraper.appendChild(elaborationTitle);
		}
	};
	let elabotarions = async () => {
		let keysStore = [
			"orderNumber",
			"orderManager",
			"positionName",
			"positionPlace",
			"elaborationType",
			"positionQuality",
			"reserveQuality",
			"searchQuery",
			"imagesSrc",
			"imageLink",
		];

		contentWraper.appendChild(preloaderWraper);

		try {
			// Виконуємо запит на elaborationURL
			const responce = await fetch(elaborationURL, {
				method: "POST",
			});

			if (!responce.ok) {
				throw new Error(`Network response was not ok: ${responce.status}`);
			}

			const elaborationText = await responce.text();
			const elaborationTable = parser(elaborationText);
			const tableRow = Array.from(
				elaborationTable.querySelectorAll("table>tbody>tr")
			);
			tableRow.shift();
			const elaborationRow = tableRow.map((data) => {
				let elaborationData = {};
				let dataCells = Array.from(data.querySelectorAll("td"));
				dataCells.forEach((td, tdIndex) => {
					elaborationData[keysStore[tdIndex]] = td.textContent.trim();
					if (keysStore[tdIndex] == "searchQuery") {
						let result = elaborationData["positionName"].replace(
							/\([^)]+\)/g,
							""
						);
						elaborationData[keysStore[tdIndex]] = result.trim();
					}
				});
				return elaborationData;
			});

			// Масив для зберігання обіцянок
			const promises = [];

			elaborationRow.forEach((data, key) => {
				let request = new URLSearchParams();
				request.append("search", data.searchQuery);
				request.append("search_sel", "0");

				// Додаємо обіцянку в масив
				promises.push(
					fetch(searchURL, {
						method: "POST",
						body: request,
					})
						.then((response) => {
							if (!response.ok) {
								throw new Error(
									`Network response was not ok: ${response.status}`
								);
							}
							return response.text();
						})
						.then((responseText) => {
							let parseSearch = parser(responseText);
							let reserve = parseSearch.querySelectorAll(".detPr >span")[1];

							let images = Array.from(
								parseSearch.querySelectorAll(".detImg>img")
							);
							let imgSrc = [];
							let imgLink = [];
							images.forEach((img) => {
								imgSrc.push(img.getAttribute("rel"));
								imgLink.push(`https://baza.m-p.in.ua${img.alt}`);
							});
							elaborationRow[key].reserveQuality = reserve.textContent;

							elaborationRow[key].imagesSrc = imgSrc;
							elaborationRow[key].imageLink = imgLink;
						})
				);
			});

			// Очікуємо завершення всіх обіцянок
			await Promise.all(promises);

			// Зараз можна викликати generateElaboration
			generateElaboration(elaborationRow);
		} catch (error) {
			console.error(error);
			// Обробка помилок
		}
	};
	// check Elabotarions count
	setInterval(checkElaborations, elaborationInterval * 1000);

	// add event listeners forbuttons
	elaborationBtn.addEventListener("click", elabotarions);
	// appendings buttons
	btnWraper.appendChild(elaborationBtn);
	// add btn wraper
	document.body.appendChild(btnWraper);
	// add content-wrapper
	document.body.appendChild(contentWraper);
});
