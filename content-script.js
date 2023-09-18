let head = document.querySelector("head");
let meta = document.createElement("meta");
meta.name = "viewport";
meta.setAttribute("content", `width=device-width, initial-scale=1.0`);
head.appendChild(meta);
let loginInp = document.querySelector("#loginB1");

if (loginInp === null) {
	let parser = new DOMParser();
	let select = document.querySelector(".search .select2-selection");
	let searchInp = document.querySelector("#search");
	let searchInpBtn = document.querySelector(".search input[type='button']");
	let div = Array.from(document.querySelectorAll("div")) || [0];
	let btnsWraper = document.querySelector(".buttons");
	let selectButtons = Array.from(
		document.querySelectorAll('.buttons input[type="button"]')
	) || [0];
	let buttonsToggler = document.createElement("button");
	let tableWraper = document.querySelector("#mainDiv");
	let elaborationURL = "https://baza.m-p.in.ua/ajax/loadElaboration.php";
	let searchURL = "https://baza.m-p.in.ua/ajax/search.php";
	let orderURL = "";

	let elaborationLink = null;
	buttonsToggler.textContent = "Опції";
	buttonsToggler.className = "buttons-toggler";
	btnsWraper.prepend(buttonsToggler);

	tableWraper.style.display = "none";
	// set select width
	select.style.width = "100%";
	// set styles for search input
	searchInp.style.padding = "10px";
	searchInp.style.fontsize = "18px";
	searchInp.style.fontWeight = "600";
	// set styles search input button
	searchInpBtn.style.width = "20%";
	searchInpBtn.style.padding = "10px";
	// remove padding and set width 100%
	btnsWraper.parentNode.style.paddingLeft = "0px";
	btnsWraper.parentNode.style.width = "100%";
	// set top margin for buttons wraper
	btnsWraper.style.marginTop = "70px";
	btnsWraper.classList.add("hide-buttons");

	// remove blue div
	div.forEach((el) => {
		if (
			el.textContent.includes("Склад (Василенка)") &&
			el.style.borderRadius == "5px"
		) {
			el.style.display = "none";
		}
	});
	buttonsToggler.addEventListener("click", () => {
		btnsWraper.classList.toggle("hide-buttons");
	});

	let parseGetedHTML = (data) => {
		let doc = parser.parseFromString(data, "text/html");
		return doc;
	};
	// elaboration
	let getLink = (link) => {
		var regex = /\/\d+_\d+\//;
		var replacedString = link.replace(regex, "/");
		return replacedString;
	};
	let loadElaboration = () => {
		let elaborationData;
		let newTableWraper = document.createElement("div");
		newTableWraper.className = "new-table-wraper";
		let data = {};
		fetch(elaborationURL, {
			method: "POST",
		})
			.then((response) => {
				return response.text();
			})
			.then((response) => {
				elaborationData = response;
				elaborationData = parseGetedHTML(elaborationData);

				let cellNames = [
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
				let tableRows = Array.from(
					elaborationData.querySelectorAll("table>tbody>tr")
				);
				tableRows.shift();
				data = tableRows.map((row) => {
					let rowData = {};
					let rowCells = Array.from(row.querySelectorAll("td"));

					rowCells.forEach((cell, index) => {
						// if (cell.textContent == "Уточнення наявності") {
						// 	delete rowCells[index];
						// 	return;
						// } else {
						// 	console.log(cell.textContent);
						// }
						rowData[cellNames[index]] = cell.textContent.trim();
						if (cellNames[index] == "searchQuery") {
							let result = rowData["positionName"].replace(/\([^)]+\)/g, "");
							rowData[cellNames[index]] = result.trim();
						}
					});

					return rowData;
				});

				data.forEach((query, key) => {
					console.log(key);
					var request = new URLSearchParams();
					request.append("search", query.searchQuery);
					request.append("search_sel", "0");
					fetch(searchURL, {
						method: "POST",
						headers: {
							Accept: "*/*",
							"Accept-Encoding": "gzip, deflate, br",
							"Accept-Language": "uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7",
							"Sec-Ch-Ua":
								'"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
							"Sec-Ch-Ua-Mobile": "?1",
							"Sec-Ch-Ua-Platform": '"Android"',
							"Sec-Fetch-Dest": "empty",
							"Sec-Fetch-Mode": "cors",
							"Sec-Fetch-Site": "same-origin",
							"User-Agent":
								"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36",
							"X-Requested-With": "XMLHttpRequest",
							"Content-Type":
								"application/x-www-form-urlencoded; charset=UTF-8",
						},
						body: request,
					})
						.then((responce) => {
							return responce.text();
						})
						.then((responce) => {
							let searchresult = parseGetedHTML(responce);
							let reserve = searchresult.querySelectorAll(".detPr >span")[1];
							let images = Array.from(
								searchresult.querySelectorAll(".detImg>img")
							);
							let imgSrc = [];
							let imgLink = [];
							images.forEach((img) => {
								imgSrc.push(img.getAttribute("rel"));
								imgLink.push(`https://baza.m-p.in.ua${img.alt}`);
							});
							console.log(data);

							data[key].reserveQuality = reserve.textContent;
							data[key].imagesSrc = imgSrc;
							generateTable(data);
						});
				});
			})
			.catch((err) => {
				alert("Не вдалося отримати уточнення!!");
				console.log(err);
			});
		let getOrderId = (data) => {
			// Визначаємо регулярний вираз для пошуку числа в дужках
			var regex = /\((\d+)\)/;

			// Знаходимо відповідність регулярному виразу в рядку
			var match = data.match(regex);

			// Перевіряємо, чи знайдено числову відповідність
			if (match && match[1]) {
				// Повертаємо число в дужках як ціле число
				return parseInt(match[1], 10);
			} else {
				// Якщо число в дужках не знайдено, повертаємо null або можна вказати інше значення за замовчуванням
				return null;
			}
		};
		let generateTable = (data) => {
			data.forEach((rowData) => {
				let images = "";
				rowData.imagesSrc.forEach((imgSrc) => {
					images += `
					<a href="${getLink(imgSrc)}"><img src="${imgSrc}"></a>`;
				});
				let table = `<div class='table'>
						<div class='order-num fx'>
							<p class='table-desc'>Номер Замовлення</p>
							<p class='table-desc'>${rowData.orderNumber}</p>
						</div>
						<div class='order-manager fx'>
							<p class='table-desc'>Менеджер</p>
							<p class='table-desc'>${rowData.orderManager}</p>
						</div>
						<div class='good-desc fx'>
							<p class='table-desc'>Товар</p>
							<p class='table-desc'>${rowData.positionName}</p>
						</div>
						<div class='goods-adres fx'>
							<p class='table-desc'>Адрес товару</p>
							<p class='table-desc'>${rowData.positionPlace}</p>
						</div>
						<div class='goods-quality fx'>
							<p class='table-desc'>Кількість</p>
							<p class='table-desc'>${rowData.positionQuality}</p>
						</div>
						<div class='goods-reserve fx'>
							<p class='table-desc'>Резерв</p>
							<p class='table-desc'>${rowData.reserveQuality}</p>
						</div>
						<div class='order-anwser fx'>
							<p class='table-desc'>Відповідь</p>
							<div class='inp-wraper'><input
                       type="text" class="elaboration-inp" id="elaborationInput348303"><button
                        onclick="addElaborationAnswer(${getOrderId(
													rowData.orderNumber
												)},0)" class="elaboration-btn">збер.</button></div>
						</div>
						<div class='goods-photo fx'>
							<p class='table-desc'>Фото товару</p>
							<div class='goods-photo-wraper table-desc'>${images}</div>
						</div>
					</div>`;
				newTableWraper.innerHTML = table;
				let elaborationInp = newTableWraper.querySelector(".elaboration-inp");
				let elaborationBtn = newTableWraper.querySelector(".elaboration-btn");
			});
		};
		document.body.appendChild(newTableWraper);
	};
	// Вибираємо елемент, який ми хочемо відстежувати
	const targetElement = document.getElementById("magaz");

	// Створюємо спостерігача за змінами
	const observer = new MutationObserver(function (mutationsList, observer) {
		for (const mutation of mutationsList) {
			if (mutation.type === "childList" || mutation.type === "attributes") {
				// Обробляємо зміни
				let children = Array.from(mutation.target.querySelectorAll("div"));
				children.forEach((el) => {
					if (el.textContent.includes("Є уточнення:")) {
						el.id = "elaborationLink";

						el.removeEventListener("click", loadElaboration);
						el.addEventListener("click", loadElaboration);
					}
				});
			}
		}
	});

	// Починаємо відстежування змін
	observer.observe(targetElement, {
		attributes: true, // Відстежувати зміни атрибутів
		childList: true, // Відстежувати зміни в дочірніх елементах
		characterData: true, // Відстежувати зміни текстового вмісту
		subtree: true, // Відстежувати зміни в піддереві
	});
}
