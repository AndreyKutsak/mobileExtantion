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
	let children = Array.from(document.body.children);
	children.forEach((child) => {
		child.remove();
	});
	// URL
	let storage = {
		data: {},
		init: function () {
			let storedData = JSON.parse(localStorage.getItem("storage"));
			if (storedData) {
				this.data = this.observe(storedData);
			} else {
				this.data = {
					listArray: [],
					compareArray: [],
					questions: [],
					elaborations: [],
					addresses: {},
				};
				this.data = this.observe(this.data);
				this.save();
			}
		},
		save: function () {
			localStorage.setItem("storage", JSON.stringify(this.data));
		},
		address: function (data) {
			if (!data.article) {
				console.error(
					"Артикул є обов'язковим для отримання чи збереження даних"
				);
				return;
			}
			let savedArticle = JSON.parse(localStorage.getItem("storage"));
			if (data.place) {
				this.data.addresses[data.article] = this.observe({ place: data.place });
			}
			if (data.cell) {
				this.data.addresses[data.article] = this.observe({ cell: data.cell });
			}
			this.save();
			if (savedArticle.addresses[data.article]) {
				return savedArticle.addresses[data.article];
			} else {
				return false;
			}
		},
		observe: function (obj) {
			if (typeof obj !== "object" || obj === null) {
				return obj;
			}

			for (let key in obj) {
				obj[key] = this.observe(obj[key]);
			}

			return new Proxy(obj, {
				set: function (target, key, value) {
					target[key] = value;
					storage.save();
					console.log(
						`Змінено: storage.data.${key} = ${JSON.stringify(value)}`
					);
					return true;
				},
			});
		},
	};
	storage.init();
	let url = {
		baza: "https://baza.m-p.in.ua/ajax/magaz.php",
		elaborations: "https://baza.m-p.in.ua/ajax/loadElaboration.php",
		addElaboration: "https://baza.m-p.in.ua/ajax/addElaborationAnswer.php",
		getQuestion: "https://baza.m-p.in.ua/ajax/loadQuestions.php",
		addAnswer: "https://baza.m-p.in.ua/ajax/addAnswer.php",
		search: "https://baza.m-p.in.ua/ajax/search.php",
		orders: "https://baza.m-p.in.ua/ajax/orders.php",
		order: "https://baza.m-p.in.ua/ajax/order_cont.php",
		reserve: "https://baza.m-p.in.ua/ajax/podrRezerv.php",
		deliveries: "https://baza.m-p.in.ua/ajax/prihod1.php",
		sales: "https://baza.m-p.in.ua/ajax/podrSales.php",
	};
	//regulars expression
	let regExp = {
		elaboration: /Є уточнення: (\d+) шт\./,
		question: /Є питання: (\d+) шт\./,
		article: /\s(\d+\.\d+\.\d+)/,
		elaborationArticle: /\((\d+(\.\d+)*)\)$/,
		orderArticle: /\d+\.\d+\.\d+/,
		number: /№(\d+)/,

		sentence: /[^\\n]+(?=\\n|$)/g,
		cell: new RegExp("cell", "gi"),
		orderPlace: /[A-Z]\d*-\d+\.\d+\.\d+/,
		goodsCount:
			/всього:\s*(\d+)\(.*?\)\s*(м\/п|компл\.|шт\.|бал\.)|резерв:\s*(\d+)\(.*?\)\s*(м\/п|компл\.|шт\.|бал\.)/g,
	};
	let src = {
		ico: {
			recycle: "img/recycle-bin-ico.svg",
			barcode: "img/barcode-ico.svg",
			list: "img/list-ico.svg",
			compare: "img/compare-ico.svg",
			elaboration: "img/elaboration-ico.svg",
			send: "img/send-ico.svg",
			spiner: "img/spiner.svg",
			logout: "img/logout-ico.svg",
			question: "img/question-ico.svg",
			orders: "img/order-ico.svg",
			production: "img/production-ico.svg",
		},
	};
	let intarval = {
		elaboration: 20,
	};
	let get = {
		url: function (data) {
			return chrome.runtime.getURL(String(data));
		},
		parser: function (data) {
			let domParser = new DOMParser();
			let doc = domParser.parseFromString(data, "text/html");
			return doc;
		},
		elaborationArtice: function (data) {
			if (data == undefined) {
				return false;
			}
			let article = data.match(regExp.elaborationArticle);
			if (article !== null) {
				return article[1];
			}
			console.warn(`не вдалось отримати артикул з уточнення ${data}`);
			return false;
		},
		article: function (data) {
			let matchData = { id: null, article: null };
			let matchNumber = data.match(regexNumber);
			let matchArticle = data.match(regexArticle);
			if (matchNumber && matchArticle) {
				let numberPart = matchNumber[1];
				let articlePart = matchArticle[1];
				matchData.id = numberPart;
				matchData.article = articlePart;
				return matchData;
			}
			return false;
		},
		articleAndPlacement: function (data) {
			if (data !== undefined) {
				let matchData = { place: null, article: null };
				let article = data.match(regExp.orderArticle);
				let place = data.match(regExp.orderPlace);
				if (article !== null && place !== null) {
					matchData.article = article[0];
					matchData.place = place[0];
					storage.address(matchData);
				}
				return matchData;
			}
		},
		date: function () {
			const date = new Date();
			return {
				year: date.getFullYear(),
				month: date.getMonth() + 1,
				day: date.getDate(),
				hours: date.getHours(),
				minutes: date.getMinutes(),
				seconds: date.getSeconds(),
			};
		},
		orderId: function (data) {
			const regex = /\((\d+)\)/;
			const match = data.match(regex);
			if (match && match.length >= 2) {
				return parseInt(match[1], 10);
			}
			return null;
		},
		num: function (data) {
			const regex = /\d+/;
			const matches = data.match(regex);

			if (matches && matches.length > 0) {
				return parseInt(matches[0], 10);
			}

			return null;
		},
		goodsCount: function (data) {
			const matches = {};
			let match;
			while ((match = regExp.goodsCount.exec(data)) !== null) {
				if (match[1] !== undefined) {
					matches["baseCount"] = parseInt(match[1]);
				} else if (match[3] !== undefined) {
					matches["orderCount"] = parseInt(match[3]);
				}
			}
			return matches;
		},
		elements: function (data) {
			let element = document.createElement(data.el);
			if (data.className) {
				element.className = data.className;
			}
			if (data.src) {
				element.src = data.src;
			}
			if (data.alt) {
				element.alt = data.alt;
			}
			if (data.func) {
				data.func.call(element);
			}
			if (data.style) {
				for (const styleKey in data.style) {
					element.style[styleKey] = data.style[styleKey];
				}
			}
			if (data.href) {
				element.href = data.href;
			}
			if (data.value) {
				element.value = data.value;
			}

			if (data.placeholder) {
				element.placeholder = data.placeholder;
			}
			if (data.type) {
				element.type = data.type;
			}
			if (data.id) {
				element.id = data.id;
			}
			if (data.text) {
				element.textContent = data.text;
			}
			if (data.data) {
				data.data.forEach((item) => {
					const keys = Object.keys(item);
					const values = Object.values(item);
					if (keys.length === 1) {
						const key = keys[0];
						const value = values[0];
						element.dataset[key] = value;
					}
				});
			}

			if (data.event && data.hendler && typeof data.hendler === "function") {
				element.addEventListener(data.event, (event) => {
					data.hendler.call(element, event); // Виклик хендлера в контексті створеного DOM-елемента
				});
			}
			if (data.children) {
				data.children.forEach((child) => {
					let childElement = this.elements(child);
					element.appendChild(childElement);
				});
			}
			return element;
		},
		decode: function (data) {
			if (data === undefined) {
				console.error("Помилка при кодуванні інформації", data);
				return;
			}
			if (typeof data !== "object") {
				console.log("Передано не коректний тип данних");
				return;
			}
			if (Object.values(data).length == 0) {
				console.log("Відсутня інформація для конвертації");
				return;
			}
			let convertedData = new URLSearchParams();
			Object.values(data).forEach((item, index) => {
				convertedData.append(Object.keys(data)[index], item);
			});
			console.log(data);
			return convertedData || false;
		},
	};

	console.log(storage.data);
	// creating and adding new elements to DOM
	let contentWraper = get.elements({ el: "div", className: "wraper" });
	let searchWraper = get.elements({
		el: "div",
		className: "main-search-wraper",
		children: [
			{
				el: "div",
				className: "search-wraper",
				children: [
					{
						el: "input",
						type: "text",
						className: "search-inp",
						placeholder: "Пошук",
					},
					{
						el: "button",
						className: "bar-code-search-btn",
						event: "click",
						hendler: barcodeRecognition,
						data: [
							{
								scanning: false,
							},
						],
						children: [
							{
								el: "img",
								src: get.url(src.ico.barcode),
								alt: "Штрих код",
							},
						],
					},
					{
						el: "input",
						type: "submit",
						value: "Пошук",
						className: "search-send-btn",
						event: "click",
						hendler: function (e) {
							let search_query =
								e.currentTarget.parentElement.querySelector(
									".search-inp"
								).value;
							if (search_query.length < 2) {
								alert("Дожина пошукового запиту маєбути більше 2 символів!");
								return;
							}
							generate.preloader({ status: "start" });
							let search_sell = 0;
							let result = load.search({
								search: search_query,
								search_sell: search_sell,
							});
							result.then((data) => {
								generate.search(data);
							});
						},
					},
				],
			},
			{
				el: "div",
				className: "barcode-display-wraper hide-barcode",
				children: [
					{
						el: "div",
						className: " barcode",
						id: "reader",
					},
				],
			},
		],
	});

	let bazaURL = "https://baza.m-p.in.ua/ajax/magaz.php";

	let addElaborationURL =
		"https://baza.m-p.in.ua/ajax/addElaborationAnswer.php";
	let questionURL = "https://baza.m-p.in.ua/ajax/loadQuestions.php";
	let answerURL = "https://baza.m-p.in.ua/ajax/addAnswer.php";

	let generate = {
		message: function (data) {
			let element = get.elements({
				el: "div",
				className: "message-title content-title",
				text: data,
			});
			return element;
		},
		preloader: function (data) {
			if (data.status == "start") {
				let element = get.elements({
					el: "div",
					className: "preloader-wraper wraper",
					children: [
						{
							el: "img",
							className: "preloader-spiner",
							src: get.url(src.ico.spiner),
						},
					],
				});
				contentWraper.innerHTML = "";
				contentWraper.appendChild(element);
			} else {
				let element = contentWraper.querySelector(".preloader-wraper");
				if (element) {
					contentWraper.removeChild(element);
				}
			}
		},
		reserve: function (data) {
			if (data.length > 0) {
				let = reserveWraper = get.elements({
					el: "div",
					className: "reserve-wraper wraper",
				});
				data.forEach((element) => {
					let reserve = get.elements({
						el: "div",
						className: "reserve-item",
						children: [
							{
								el: "div",
								className: "reserve-row id-row",
								// hendler
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "ID",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.id,
									},
								],
							},
							{
								el: "div",
								className: "reserve-row storage-row",
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Склад",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.storage,
									},
								],
							},
							{
								el: "div",
								className: "reserve-row count-row",
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Кількість",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.count,
									},
								],
							},
							{
								el: "div",
								className: "reserve-row time-row",
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Час",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.time,
									},
								],
							},
						],
					});
					reserveWraper.appendChild(reserve);
				});
				return reserveWraper;
			}
			return generate.message("Немає резервів.");
		},
		sales: function (data) {
			if (data.length > 0) {
				let salseWraper = get.elements({
					el: "div",
					className: "sales-wraper wraper",
				});
				data.forEach((element) => {
					let sales = get.elements({
						el: "div",
						className: "sales-item",
						children: [
							{
								el: "div",
								className: "sales-row id-row",
								// hendler
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Номер Замовлення",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.orderNumber,
									},
								],
							},
							{
								el: "div",
								className: "sales-row status-row",
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Статус",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.status,
									},
								],
							},
							{
								el: "div",
								className: "sales-row count-row",
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Кількість",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.count,
									},
								],
							},
							{
								el: "div",
								className: "sales-row price-row",
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Дата",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.date,
									},
								],
							},
						],
					});
					salseWraper.appendChild(sales);
				});
				return salseWraper;
			}
			return generate.message("Немає продажів.");
		},
		deliveries: function (data) {
			if (data.length > 0) {
				let deliveriesWraper = get.elements({
					el: "div",
					className: "deliveries-wraper wraper",
				});
				data.forEach((element) => {
					let deliveries = get.elements({
						el: "div",
						className: "deliveries-item",
						children: [
							{
								el: "div",
								className: "deliveries-row date-row",
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Дата",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.date,
									},
								],
							},
							{
								el: "div",
								className: "deliveries-row provider-row",
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Постачальник",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.provider,
									},
								],
							},
							{
								el: "div",
								className: "deliveries-row count-row",
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Кількість",
									},
									{
										el: "p",
										className: "row-desc",
										text: element.count,
									},
								],
							},
							{
								el: "div",
								className: "deliveries-row manager-row",
								children: [
									{
										el: "p",
										className: "row-desc",
										text: "Хто додав",
									},
									{ el: "p", className: "row-desc", text: element.manager },
								],
							},
						],
					});
					deliveriesWraper.appendChild(deliveries);
				});
				return deliveriesWraper;
			}
			return generate.message("Немає Поставок.");
		},
		orders: function (data) {
			if (data.length > 0) {
				let ordersWraper = get.elements({
					el: "div",
					className: "orders-wraper wraper",
				});
				data.forEach((item) => {
					let orderRow = get.elements({
						el: "div",
						className: "order-row",
						event: "click",
						hendler: function (e) {
							load.order({ id: item.id }).then((data) => {
								let itemFooter = this.querySelector(".row-footer");
								if (itemFooter.classList.contains("active")) {
									itemFooter.innerHTML = "";
									itemFooter.classList.remove("active");
									return;
								}
								itemFooter.classList.add("active");
								itemFooter.innerHTML = "";
								itemFooter.appendChild(generate.order(data));
							});
						},
						children: [
							{
								el: "div",
								className: "row-body",
								children: [
									// {
									// 	el: "p",
									// 	className: "row-desc id",
									// 	text: item.id,
									// },
									{
										el: "p",
										className: "row-desc number",
										text: item.Number,
									},
									// {
									// 	el: "p",
									// 	className: "row-desc status client",
									// 	text: item.client,
									// },
									{
										el: "p",
										className: "row-desc status",
										text: item.status,
									},
									{
										el: "p",
										className: "row-desc city",
										text: item.city,
									},
									{ el: "p", className: "row-desc type", text: item.type },
									{ el: "p", className: "row-desc date", text: item.date },
								],
							},
							{
								el: "div",
								className: "row-footer",
							},
						],
					});
					ordersWraper.appendChild(orderRow);
				});
				return ordersWraper;
			}
			return generate.message("Немає замовлень.");
		},
		order: function (data) {
			let orderWraper = get.elements({ el: "div", className: "order-wraper" });
			if (data.length > 0) {
				data.forEach((item) => {
					storage.address({
						article: item.articleAndPlace.article,
						place: item.articleAndPlace.place,
					});
					let orderItem = get.elements({
						el: "div",
						className: "order-item",
						children: [
							{
								el: "img",
								className: "goods-image",
								src: item.imgSrc,
								aly: item.positionName,
							},
							{
								el: "div",
								className: "text-wraper",
								children: [
									{
										el: "p",
										className: "order-article success",
										children: [
											{
												el: "span",
												className: "article",
												text: item.articleAndPlace.article,
											},
											{
												el: "span",
												className: "place",
												text: item.articleAndPlace.place,
											},
										],
									},
									{
										el: "p",
										className: "position-name",
										text: item.positionName,
									},
								],
							},
						],
					});
					orderWraper.appendChild(orderItem);
				});
				return orderWraper;
			}
			return generate.message("Сталася помилка під час отримання інформації.");
		},
		compare: function () {
			contentWraper.innerHTML = "";
			let compareWraper = get.elements({
				el: "div",
				className: "compare-wraper",
			});
			if (storage.data.compareArray.length > 0) {
				storage.data.compareArray.forEach((item, index) => {
					console.log(item);
					let difference =
						item.realCount -
						(get.goodsCount(item.count).baseCount +
							get.goodsCount(item.count).orderCount);
					function drawDifference() {
						if (difference <= 0) {
							return { backgroundColor: "rgb(253, 184, 184)" };
						}
						if (item.isProcesed) {
							return { backgroundColor: "#c2edc2" };
						}
					}
					let compareItem = get.elements({
						el: "div",
						className: "compare-item",
						style: drawDifference(),
						children: [
							{
								el: "button",
								className: "del-btn btn",
								event: "click",
								hendler: hendlers.removeItem,
								data: [{ article: item.article }, { arr: "compareArray" }],
								children: [
									{
										el: "img",
										src: get.url(src.ico.recycle),
										alt: "Видалити Елемент",
									},
								],
							},
							{
								el: "a",
								className: "item-image-link",
								href: item.photoLG,
								event: "click",
								hendler: showImage,
								children: [
									{
										el: "img",
										className: "item-image",
										src: item.photo,
									},
								],
							},
							{
								el: "div",
								className: "item-text-wraper",
								style: drawDifference(),
								children: [
									{
										el: "p",
										className: "compare-time",
										text: `${item.addingDate.day}.${item.addingDate.month}.${item.addingDate.year}   ${item.addingDate.hours}:${item.addingDate.minutes}:${item.addingDate.seconds}`,
									},
									{
										el: "p",
										className: "item-count",
										text: `Кількість по базі: ${
											get.goodsCount(item.count).baseCount
										} Резерв: ${get.goodsCount(item.count).orderCount}
			Реальна кількість: ${item.realCount} Різниця: ${difference}`,
									},
									{
										el: "p",
										className: "item-article",
										text: item.article,
									},
									{
										el: "p",
										className: "item-head",
										text: item.head,
									},
									{
										el: "button",
										className: "procesed-btn",
										text: "Обробити",
										dataId: item.id,
										event: "click",
										hendler: function (e) {
											e.currentTarget.textContent = "Оброблено";
											e.currentTarget.parentNode.parentNode.style.backgroundColor =
												"#c2edc2";
											storage.data.compareArray[index].isProcesed = true;
										},
									},
								],
							},
						],
					});
					compareWraper.appendChild(compareItem);
				});
				return compareWraper;
			}

			return generate.message("Немає розбіжностей!!!");
		},
		list: function () {
			if (storage.data.listArray.length > 0) {
				let listWraper = get.elements({ el: "div", className: "list-wraper" });
				storage.data.listArray.forEach((item, index) => {
					let isProcesedText = "Обробити",
						isProcesedClass = ``;
					if (item.isProcesed) {
						isProcesedText = "Оброблено";
						isProcesedClass = "success";
					}
					let listItem = get.elements({
						el: "div",
						className: `list-item ${isProcesedClass}`,
						children: [
							{
								el: "button",
								className: "del-btn btn",
								event: "click",
								data: [{ article: item.article }, { arr: "listArray" }],
								hendler: hendlers.removeItem,
								children: [
									{
										el: "img",
										src: get.url(src.ico.recycle),
										alt: "Видалити елемент",
									},
								],
							},
							{
								el: "a",
								className: "item-image-link",
								href: item.photoLG,
								children: [
									{
										el: "img",
										className: "item-image",
										src: item.photo,
									},
								],
							},
							{
								el: "div",
								className: "item-text-wraper",
								children: [
									{
										el: "p",
										className: "desc date-desc",
										text: `${item.addingDate.day}.${item.addingDate.month}.${item.addingDate.year}  ${item.addingDate.hours}:${item.addingDate.minutes}:${item.addingDate.seconds} `,
									},
									{
										el: "p",
										className: "item-article",
										text: item.article,
									},
									{
										el: "p",
										className: "item-head",
										text: item.head,
									},
									{
										el: "button",
										className: "procesed-btn",
										text: isProcesedText,
										data: [{ dataId: item.id }],
										event: "click",
										hendler: function (e) {
											e.currentTarget.textContent = "Оброблено";
											e.currentTarget.parentNode.parentNode.style.backgroundColor =
												"#c2edc2";
											storage.data.listArray[index].isProcesed = true;
										},
									},
								],
							},
						],
					});
					listWraper.appendChild(listItem);
				});
				return listWraper;
			}
			return generate.message("Список товару на розноску пустий!!!");
		},
		search: function (data) {
			generate.preloader({ status: "end" });
			if (data.length > 0) {
				let searchInp = document.querySelector(".search-inp").value;
				data.forEach((item) => {
					if (searchInp !== "" && searchInp.match(regExp.cell)) {
						storage.address({ article: item.article, cell: searchInp });
					}
					let searchItem = get.elements({
						el: "div",
						className: "item-wraper",
						data: [{ id: item.id }],
						children: [
							{
								el: "div",
								className: "item-header",
								text: `ID: ${item.id} | Артикул: ${item.article}`,
							},
							{
								el: "div",
								className: "item-content-wraper",
								children: [
									{
										el: "a",
										className: "image-link",
										href: item.photoLG,
										event: "click",
										hendler: showImage,
										children: [
											{
												el: "img",
												className: "image-link",
												src: item.photo,
											},
										],
									},
									{
										el: "div",
										className: "item-text-raper",
										children: [
											{
												el: "p",
												className: "item-count",
												text: item.count,
											},
										],
									},
								],
							},
							{
								el: "p",
								className: "item-desc",
								event: "click",
								hendler: function (e) {
									e.currentTarget.classList.toggle("visible");
								},
								text: item.desc,
							},
							{
								el: "div",
								className: "item-btn-wraper",
								children: [
									{
										el: "button",
										className: "list-btn btn",
										text: "Рознести",
										event: "click",
										hendler: function (e) {
											item.isProcesed = false;
											item.addingDate = get.date();
											if (storage.data.listArray.includes(item)) {
												alert("Такий товар вже в списку");
												return;
											}
											storage.data.listArray.push(item);
											drawButtonsCount();
										},
									},
									{
										el: "div",
										className: "compare-wraper",
										children: [
											{
												el: "input",
												type: "number",
												className: "compare-inp",
												event: "input",
												hendler: function (e) {
													let compareVal = e.currentTarget.value;
													if (
														Number(compareVal) !==
														Number(get.goodsCount(item.count).baseCount)
													) {
														e.currentTarget.style.border = `1px solid red`;
													}
												},
												placeholder: "Фактична кількість",
											},
											{
												el: "button",
												className: "compare-btn btn",
												text: "Пересорт",
												event: "click",
												hendler: function (e) {
													let compareInp =
														e.currentTarget.parentElement.querySelector(
															".compare-inp"
														);
													let wraper =
														e.currentTarget.parentElement.parentElement
															.parentElement;
													if (compareInp.classList.contains("visible-inp")) {
														if (compareInp.value.length == 0) {
															alert("Введи коректну відповідь");
															return;
														}
														if (storage.data.compareArray.includes(item)) {
															alert("Такий товар вже в списку");
															return;
														}
														item.addingDate = get.date();
														item.isProcesed = false;
														item.realCount = Number(compareInp.value);
														item.goodsBaseCount = get.goodsCount(
															item.count
														).baseCount;
														item.goodsReserve = get.goodsCount(
															item.count
														).orderCount;
														storage.data.compareArray.push(item);
														wraper.style.backgroundColor = "#fbc8c8";

														drawButtonsCount();
													}
													compareInp.classList.toggle("visible-inp");
												},
											},
										],
									},
								],
							},
							{
								el: "div",
								className: "item-data-btn-wraper",
								children: [
									{
										el: "button",
										className: "reserve-btn btn",
										text: "Резерв",
										event: "click",
										hendler: function (e) {
											let footer =
												e.currentTarget.parentElement.parentElement.querySelector(
													".item-footer"
												);
											if (footer.classList.contains("active")) {
												footer.innerHTML = "";
												footer.classList.toggle("active");
												return;
											}
											let reserve = load.reserve({ id: item.id });
											footer.classList.toggle("active");
											footer.innerHTML = "";
											reserve.then((reserve) => {
												console.log(reserve, generate.reserve(reserve));
												footer.appendChild(generate.reserve(reserve));
											});
										},
									},
									{
										el: "button",
										className: "cales-btn btn",
										text: "Продажі",
										event: "click",
										hendler: function (e) {
											let footer =
												e.currentTarget.parentElement.parentElement.querySelector(
													".item-footer"
												);
											if (footer.classList.contains("active")) {
												footer.innerHTML = "";
												footer.classList.toggle("active");
												return;
											}
											let sales = load.sales({ id: item.id });

											footer.innerHTML = "";
											footer.classList.toggle("active");

											sales.then((data) => {
												footer.appendChild(generate.sales(data));
											});
										},
									},
									{
										el: "button",
										className: "deliveries-btn btn",
										text: "Приходи",
										event: "click",
										hendler: function (e) {
											let footer =
												e.currentTarget.parentElement.parentElement.querySelector(
													".item-footer"
												);
											if (footer.classList.contains("active")) {
												footer.innerHTML = "";
												footer.classList.toggle("active");
												return;
											}
											let deliveries = load.deliveries({ id: item.id });
											footer.classList.toggle("active");
											footer.innerHTML = "";
											deliveries.then((data) => {
												footer.appendChild(generate.deliveries(data));
											});
										},
									},
								],
							},
							{ el: "div", className: "item-footer" },
						],
					});
					contentWraper.classList.add("search-result-wraper");
					contentWraper.appendChild(searchItem);
				});
				return;
			}
			generate.message("Нічого не знайдено!!");
		},
		elaborations: function (data) {
			generate.preloader({ status: "end" });

			if (data.length > 0) {
				let elaborationWraper = get.elements({
					el: "div",
					className: "elaboration-wraper",
				});
				data.forEach((item) => {
					storage.address({
						article: get.elaborationArtice(item.positionName),
						place: item.place,
					});
					console.log(item);
					let isReserve = "success",
						isSmallCount = "success";
					if (item.count.baseCount < 1) {
						isSmallCount = "danger";
					}
					if (item.count.orderCount > 0) {
						isReserve = "danger";
					}

					let elaborationItem = get.elements({
						el: "div",
						className: "table-wraper",
						children: [
							{
								el: "div",
								className: "table-row",
								children: [
									{
										el: "p",
										className: "table-desc",
										text: "Номер Замовлення",
									},
									{ el: "p", className: "table-text", text: item.order },
								],
							},
							{
								el: "div",
								className: "table-row",
								children: [
									{
										el: "p",
										className: "table-desc",
										text: "Менеджер",
									},
									{ el: "p", className: "table-text", text: item.manager },
								],
							},
							{
								el: "div",
								className: "table-row",
								children: [
									{
										el: "p",
										className: "table-desc",
										text: "Імя товару",
									},
									{
										el: "p",
										className: "table-text",
										event: "click",
										hendler: function () {
											let inp = document.querySelector(".search-inp");
											let searchBtn =
												document.querySelector(".search-send-btn");
											inp.value = get.elaborationArtice(item.positionName);
											searchBtn.click();
											inp.value = "";
										},

										text: item.positionName,
									},
								],
							},
							{
								el: "div",
								className: "table-row",
								children: [
									{
										el: "p",
										className: "table-desc",
										text: "Місце товару:",
									},
									{
										el: "p",
										className: "table-text",
										text: item.place,
									},
								],
							},
							{
								el: "div",
								className: "table-row",
								children: [
									{
										el: "p",
										className: "table-desc",
										text: "Тип Уточнення:",
									},
									{
										el: "p",
										className: "table-text",
										text: item.type,
									},
								],
							},
							{
								el: "div",
								className: `table-row ${isSmallCount}`,
								children: [
									{
										el: "p",
										className: "table-desc",
										text: "Кількість",
									},
									{
										el: "p",
										className: "table-text",
										text: item.quality,
									},
								],
							},
							{
								el: "div",
								className: `table-row ${isReserve}`,
								children: [
									{
										el: "p",
										className: "table-desc",
										text: "Резерв:",
									},
									{
										el: "p",
										className: "table-text",
										text: String(item.count.orderCount),
									},
								],
							},
							{
								el: "div",
								className: "table-row",
								children: [
									{
										el: "p",
										className: "table-row",
										text: "Вкажи кількість:",
									},
									{
										el: "div",
										className: "table-input-wraper",
										children: [
											{
												el: "input",
												type: "text",
												placeholder: "Кількість",
												className: "table-input",
												data: [{ count: item.count.baseCount }],
												event: "input",
												hendler: checkAnswer,
												id: `elaborationInput${get.orderId(item.order)}`,
											},
											{
												el: "button",
												className: "send-btn",
												event: "click",
												data: [{ order: get.orderId(item.order) }],
												hendler: addElaborationAnswer,
												children: [
													{
														el: "img",
														src: get.url(src.ico.send),
														alt: "send",
													},
												],
											},
										],
									},
								],
							},
							{
								el: "div",
								className: "table-row image-row",
								children: [
									{ el: "p", className: "table-desc", text: "Фото товару." },
									{
										el: "div",
										className: "image-wraper",
										children: item.imagesSrc.map((source, index) => {
											return {
												el: "a",
												event: "click",
												hendler: showImage,
												href: item.imageLink[index],
												children: [{ el: "img", src: source }],
											};
										}),
									},
								],
							},
							{
								el: "div",
								className: "elaboration-btn-wraper",
								children: [
									{
										el: "button",
										className: "reserve-btn btn",
										event: "click",
										text: "Резерв",
										hendler: function (e) {},
									},
									{
										el: "button",
										className: "arrival-btn btn",
										text: "Приход",
										event: "click",
										hendler: function (e) {},
									},
									{
										el: "button",
										className: "sales-btn btn",
										text: "Продажі",
										event: "click",
										hendler: function (e) {},
									},
								],
							},
							{
								el: "div",
								className: "item-footer",
							},
						],
					});
					elaborationWraper.appendChild(elaborationItem);
				});
				return elaborationWraper;
			}
			return generate.message("Зараз немає уточнень");
		},
	};

	let elaborationPattern = /Є уточнення: (\d+) шт\./;
	let questionPattern = /Є питання: (\d+) шт\./;
	let regexArticle = /\s(\d+\.\d+\.\d+)/;
	let regexNumber = /№(\d+)/;
	let regexCell = new RegExp("cell", "gi");

	function logOut() {
		document.cookie = "login=null";
		document.cookie = "hash=null";
		window.location.reload();
	}

	function showImage(e) {
		e.preventDefault();
		let imgURL = e.currentTarget.getAttribute("href");
		let image = get.elements({
			el: "div",
			className: "img-wraper",
			event: "click",
			hendler: function (e) {
				if (e.srcElement.classList.contains("img-wraper")) {
					image.remove();
				}
			},
			children: [
				{
					el: "img",
					src: `https://baza.m-p.in.ua${imgURL}`,
				},
			],
		});
		contentWraper.appendChild(image);
	}

	function checkElaborations() {
		fetch(bazaURL, {
			method: "POST",
		})
			.then((res) => {
				return res.text();
			})
			.then((responce) => {
				let questionCountText = document.querySelector(".question-count");
				let elabortionCount = document.querySelector(".elabortion-count");
				let parserResponce = get.parser(responce);
				let responceItems = Array.from(parserResponce.querySelectorAll("div"));
				responceItems.forEach((item) => {
					let elaborationResult = item.textContent.match(elaborationPattern);
					let questionResult = item.textContent.match(questionPattern);
					if (elaborationResult !== null) {
						elabortionCount.innerText = elaborationResult[1];
						elabortionCount.style.display = "block";
					} else if (
						elaborationResult == null ||
						elaborationResult == undefined
					) {
						elabortionCount.style.display = "none";
					}
					if (questionResult !== null) {
						questionCountText.innerText = questionResult[1];
						questionCountText.style.display = "block";
					}
				});
			});
	}
	function barcodeRecognition() {
		let barCodeSearch = document.querySelector(".bar-code-search-btn");
		let barcodeDisplayWraper = document.querySelector(
			".barcode-display-wraper"
		);
		let html5QrcodeScanner = new Html5QrcodeScanner("reader", {
			fps: 10,
			qrbox: 250,
		});
		let lastResult,
			countResults = 0;
		function onScanSuccess(decodedText, decodedResult) {
			if (decodedText !== lastResult) {
				++countResults;
				lastResult = decodedText;
				let searchInp = document.querySelector(".search-inp");
				searchInp.value = decodedText;
				let serarchBtn = document.querySelector(".search-send-btn");
				if (decodedText.match(regexCell) !== null) {
					serarchBtn.click();
				}
			}
		}
		html5QrcodeScanner.render(onScanSuccess);
		if (barCodeSearch.dataset.scaning == "true") {
			barCodeSearch.dataset.scaning = "false";

			html5QrcodeScanner.clear();

			barcodeDisplayWraper.classList.add("hide-barcode");
			return;
		}
		barcodeDisplayWraper.classList.remove("hide-barcode");
		barCodeSearch.dataset.scaning = "true";
	}
	function addElaborationAnswer(e) {
		let elaboration = new URLSearchParams();
		let orderNumber = e.currentTarget.dataset.order;
		let elaborationInp = document.getElementById(
			`elaborationInput${orderNumber}`
		);
		let btn = e.currentTarget;
		let count = Number(elaborationInp.dataset.count);
		console.log(e, elaborationInp, orderNumber);
		if (elaborationInp.value == "") {
			alert("Введи коректну відповідь");
			return false;
		}
		if (count > Number(getNum(elaborationInp.value))) {
			let isSend = confirm(
				"Введена кількість менша від кількості в базі. ТОчно відправити данні?"
			);
			if (!isSend) return false;
		}

		elaboration.append("text", elaborationInp.value);
		elaboration.append("id", orderNumber);

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
					btn.remove();
					checkElaborations();
				} else alert("Помилка");
			})
			.catch((err) => {
				alert("Помилка під час відправлення відповіді");
				console.log(err);
			});
	}
	let load = {
		storage: [],
		fetch: async function (data) {
			try {
				const requestBody = data.body ? get.decode(data.body) : "";
				const response = await fetch(data.url, {
					method: data.method,
					body: requestBody,
				});

				if (!response.ok) {
					throw new Error(`HTTP Error! Status: ${response.status}`);
				}
				response;

				const res = await response.text();
				const parse = get.parser(res);

				return parse;
			} catch (error) {
				console.error("Fetch error:", error);
				return [];
			}
		},
		reserve: async function (data) {
			this.storage = [];
			const reserve = await this.fetch({
				url: url.reserve,
				method: "POST",
				body: { id: data.id },
			});

			const rows = Array.from(reserve.querySelectorAll("tr"));
			rows.shift();
			if (rows.length === 0) {
				return [];
			}

			rows.forEach((item) => {
				let rowData = {};
				let td = item.querySelectorAll("td");
				rowData.id = td[0].textContent;
				rowData.storage = td[1].textContent;
				rowData.count = td[2].textContent;
				rowData.time = td[3].textContent;
				this.storage.push(rowData);
			});
			return this.storage;
		},
		sales: async function (data) {
			this.storage = [];
			const sales = await this.fetch({
				url: url.sales,
				method: "POST",
				body: { id: data.id },
			});

			let rows = Array.from(sales.querySelectorAll("tr"));
			rows.shift();
			if (sales.length === 0) {
				return [];
			}
			rows.forEach((item) => {
				let rowData = {};
				let td = item.querySelectorAll("td");
				rowData.orderNumber = td[0].textContent;
				rowData.status = td[1].textContent;
				rowData.count = td[2].textContent;
				rowData.date = td[4].textContent;
				this.storage.push(rowData);
			});
			return this.storage;
		},
		deliveries: async function (data) {
			this.storage = [];
			const deliveries = await this.fetch({
				url: url.deliveries,
				method: "POST",
				body: { id: data.id },
			});
			let rows = Array.from(deliveries.querySelectorAll("tr"));
			rows.shift();
			if (deliveries.length === 0) {
				return [];
			}
			rows.forEach((item) => {
				let rowData = {};
				let td = item.querySelectorAll("td");
				rowData.date = td[0].textContent;
				rowData.provider = td[1].textContent;
				rowData.count = td[2].textContent;
				rowData.price = td[3].textContent;
				rowData.manager = td[4].textContent;
				rowData.storage = td[5].textContent;
				this.storage.push(rowData);
			});
			return this.storage;
		},
		search: async function (data) {
			this.storage = [];
			const result = await this.fetch({
				url: url.search,
				method: "POST",
				body: { search: data.search, search_sel: data.search_sell },
			});

			let goodsId = Array.from(result.querySelectorAll(".detDivTitle"));
			let searchGoodWraper = Array.from(result.querySelectorAll(".detDiv"));
			searchGoodWraper.forEach((item, index) => {
				let data = {};
				let goodsPhoto = item.querySelector(".detImg>a>img");
				let goodsCount = Array.from(result.querySelectorAll(".detPr"));
				let goodsDesc = Array.from(result.querySelectorAll(".titleDet"));
				data.id = get.article(goodsId[index].textContent).id;
				data.article = get.article(goodsId[index].textContent).article;
				data.photo = goodsPhoto.getAttribute("src");
				data.photoLG = goodsPhoto.parentNode.getAttribute("href");
				data.head = goodsDesc[index].innerHTML.split("<br>")[0].trim();
				data.desc = goodsDesc[index].textContent.trim();
				data.count = goodsCount[index].textContent.trim();
				this.storage.push(data);
			});

			return this.storage;
		},
		orders: async function () {
			this.storage = [];
			const orders = await this.fetch({
				url: url.orders,
				method: "POST",
			});
			let rows = Array.from(orders.querySelectorAll("table tr"));

			rows.shift();
			rows.forEach((item) => {
				let rowData = {};
				let td = Array.from(item.querySelectorAll("td"));
				if (td.length < 6) {
					return;
				}

				rowData.id = td[0].textContent;
				rowData.Number = td[1].textContent;
				rowData.client = td[2].textContent;
				rowData.ststus = td[3].textContent;
				rowData.city = td[4].textContent;
				rowData.type = td[5].textContent;
				rowData.date = td[6].textContent;
				this.storage.push(rowData);
			});
			console.log(this.storage);
			return this.storage;
		},
		order: async function (data) {
			this.storage = [];
			const order = await this.fetch({
				url: url.order,
				method: "POST",
				body: { id: data.id },
			});
			let rows = Array.from(order.querySelectorAll("table tr"));
			rows.shift();
			rows.forEach((item) => {
				let td = Array.from(item.querySelectorAll("td"));

				if (td.length > 7) {
					td.shift();
				}

				if (td.length > 5) {
					let checkStyle = td[0].getAttribute("style");

					if (checkStyle.includes("background-color:#d7cafb;")) {
						return;
					}

					let rowData = {};
					rowData.imgSrc = td[1].querySelector("img").src;
					Array.from(td[2].children).forEach((child) => {
						child.textContent = "";
					});
					rowData.positionName = td[2].textContent.trim();
					rowData.articleAndPlace = get.articleAndPlacement(
						td[3].textContent.trim()
					);
					rowData.price = td[5].textContent.trim();
					this.storage.push(rowData);
				}
			});
			console.log(this.storage);
			return this.storage;
		},
		production: async function (data) {
			this.storage = [];
			return;
		},
		elaborations: async function (data) {
			this.storage = [];
			const elaborations = await this.fetch({
				url: url.elaborations,
				method: "POST",
			});

			const rows = Array.from(elaborations.querySelectorAll("table tbody tr"));

			rows.shift();
			const elaborationsList = await Promise.all(
				rows.map(async (data) => {
					let elaborationData = {};
					let cell = Array.from(data.querySelectorAll("td"));
					elaborationData.order = cell[0].textContent.trim();
					elaborationData.manager = cell[1].textContent.trim();
					elaborationData.positionName = cell[2].textContent.trim();
					elaborationData.place = cell[3].textContent.trim();
					elaborationData.type = cell[4].textContent.trim();
					elaborationData.quality = cell[5].textContent.trim();
					elaborationData.search = get.elaborationArtice(
						cell[2].textContent.trim()
					);

					const search = await load.fetch({
						url: url.search,
						method: "POST",
						body: { search: elaborationData.search, search_sel: "0" },
					});

					const result = Array.from(search.querySelectorAll(".detDivTitle"));
					result.forEach((item, index) => {
						if (
							get.article(item.textContent.trim()).article ===
							elaborationData.search
						) {
							let countData = search.querySelectorAll(".detPr")[index];
							let images = Array.from(
								search
									.querySelectorAll(".detImg")
									[index].querySelectorAll("img")
							);

							let imgSrc = [];
							let imgLink = [];
							images.forEach((img) => {
								if (!img.parentNode.classList.contains("detImg")) {
									return;
								}
								imgSrc.push(img.getAttribute("rel"));
								imgLink.push(img.alt);
							});
							elaborationData.imagesSrc = imgSrc;
							elaborationData.imageLink = imgLink;
							elaborationData.count = get.goodsCount(
								countData.textContent.trim()
							);
							console.log(
								countData,
								get.goodsCount(countData.textContent.trim())
							);
						}
					});
					return elaborationData;
				})
			);
			this.storage = elaborationsList;
			console.log(this.storage);
			return this.storage;
		},
		question: async function (data) {},
		production: async function (data) {},
	};
	let hendlers = {
		removeItem: function () {
			let article = this.dataset.article;
			let arr = this.dataset.arr;
			storage.data[arr].forEach((item, index) => {
				console.log(item.article, article);
				if (item.article === article) {
					storage.data[arr].splice(index, 1);
				}
			});
			this.parentElement.remove();
		},
		generateList: function () {
			contentWraper.innerHTML = "";
			contentWraper.appendChild(generate.list());
		},
		generateCompare: function () {
			contentWraper.innerHTML = "";
			contentWraper.appendChild(generate.compare());
		},
	};
	function checkAnswer(e) {
		e.preventDefault();
		let answer = e.target.value;
		let count = Number(e.target.dataset.count);
		console.log(answer, count, e);
		if (getNum(answer) > count) {
			e.target.parentNode.parentNode.classList.add("warn");
			alert("Перевір ще раз,І не забудь вказати лишки в пересорт");
		}
		if (getNum(answer) < count) {
			e.target.parentNode.parentNode.classList.add("danger");
		}
		if (getNum(answer) === count) {
			e.target.parentNode.parentNode.classList.remove("warn");
			e.target.parentNode.parentNode.classList.remove("danger");
		}
		if (answer == "") {
			e.target.parentNode.parentNode.classList.remove("warn");
			e.target.parentNode.parentNode.classList.remove("danger");
		}
	}
	function getNum(inputString) {
		const regex = /\d+/;
		const matches = inputString.match(regex);

		if (matches && matches.length > 0) {
			return parseInt(matches[0], 10);
		}

		return null; // Повертаємо null, якщо число не знайдено в рядку
	}

	function generateQuestionTanble(data) {
		generate.preloader({ status: "end" });
		if (data.length > 0) {
			data.forEach((item) => {
				let questionWraper = document.createElement("div");
				questionWraper.className = "table-wraper question";
				// goods description
				let goodsRow = document.createElement("div");
				goodsRow.className = "table-row";
				let goodsDesc = document.createElement("p");
				goodsDesc.className = "table-desc question-row";
				goodsDesc.textContent = "Товар";
				let goodsData = document.createElement("p");
				goodsData.className = "table-text question";
				goodsData.textContent = item.goodsDesc;
				goodsRow.appendChild(goodsDesc);
				goodsRow.appendChild(goodsData);
				// question
				let questionRow = document.createElement("div");
				questionRow.className = "table-row";
				let questiondDesc = document.createElement("p");
				questiondDesc.className = "table-desc question";
				questiondDesc.textContent = "Питання";
				let questionData = document.createElement("p");
				questionData.className = "table-desc";
				questionData.textContent = item.question;
				questionRow.appendChild(questiondDesc);
				questionRow.appendChild(questionData);
				// main question data
				let mainDataRow = document.createElement("div");
				mainDataRow.className = "table-row";
				let mainDataDesc = document.createElement("p");
				mainDataDesc.className = "table-desc";
				mainDataDesc.textContent = "Додаткова Інформація";
				let mainData = document.createElement("p");
				mainData.textContent = item.questionManager;
				mainDataRow.appendChild(mainDataDesc);
				mainDataRow.appendChild(mainData);
				// question order
				let orderRow = document.createElement("div");
				orderRow.className = "table-row";
				let orderDdesc = document.createElement("p");
				orderDdesc.className = "table-desc";
				orderDdesc.textContent = "Замовлення";
				let orderNum = document.createElement("p");
				orderNum.className = "table-desc";
				orderNum.textContent = item.questionOrder;
				orderRow.appendChild(orderDdesc);
				orderRow.appendChild(orderNum);
				// question answer
				let answerRow = document.createElement("p");
				answerRow.className = "table-row area-wraper";
				let answerArea = document.createElement("textarea");
				answerArea.className = "answer-area table-input";
				answerArea.setAttribute("plaseholder", "Відповідь");
				answerArea.setAttribute("rows", 5);
				let answerBtn = document.createElement("button");
				answerBtn.className = "answer-btn";
				let sendIco = document.createElement("img");
				sendIco.src = get.url(src.ico.send);
				answerBtn.appendChild(sendIco);
				answerRow.appendChild(answerArea);
				answerRow.appendChild(answerBtn);
				// appending elements for generate question table
				questionWraper.appendChild(goodsRow);
				questionWraper.appendChild(questionRow);
				questionWraper.appendChild(mainDataRow);
				questionWraper.appendChild(orderRow);
				questionWraper.appendChild(answerRow);
				contentWraper.appendChild(questionWraper);
				// add listeners
				answerBtn.addEventListener("click", () => {
					if (answerArea.value.length == 0) {
						alert("Дай коректну відповідь на питання!!!");
						return;
					}
					let answerData = new URLSearchParams();
					answerData.append("id", String(item.id));
					answerData.append("text", String(answerArea.value));
					fetch(answerURL, {
						method: "POST",
						body: answerData,
					})
						.then((responce) => {
							return responce.text();
						})
						.then((responce) => {
							if (responce == "ok") {
								answerArea.remove();
								answerBtn.remove();
								answerArea.classList.add("success");
							} else {
								alert("Щось пішло не так!!");
							}
						})
						.catch((err) => {
							alert("Відбулася помилка!!!");
							console.log(err);
						});
				});
			});
		} else {
			let questiuonTitle = document.createElement("p");
			questiuonTitle.className = "question-title content-title";
			questiuonTitle.textContent = "Зараз немає Питань";
			contentWraper.appendChild(questiuonTitle);
		}
	}
	function getQuestions() {
		let questionData = [];
		generate.preloader({ status: "start" });
		fetch(questionURL, {
			method: "POST",
		})
			.then((responce) => {
				return responce.text();
			})
			.then((responce) => {
				generate.preloader({ status: "end" });
				let questionParse = get.parser(responce);
				let questionRow = Array.from(questionParse.querySelectorAll("tr"));
				questionRow.shift();

				if (questionRow.length > 0) {
					questionRow.forEach((row) => {
						let data = {};
						let item = row.querySelectorAll("td");
						data.goodsDesc = item[0].textContent.trim();
						data.questionManager = item[1].getAttribute("title").trim();
						data.question = item[1].textContent.trim();
						data.id = item[2]
							.querySelector("input[type='text']")
							.id.match(/(\d+)/)[1];
						data.questionOrder = item[3].textContent.trim();
						questionData.push(data);
					});
				}

				generateQuestionTanble(questionData);
			})
			.catch((err) => {
				alert("Не Вдалося отримати питання!!!");
				console.log(err);
			});
	}

	function drawButtonsCount() {
		let listCount = 0;
		let compareCount = 0;
		let listBtnCount = document.querySelector(".list-count");
		let compareBtnCount = document.querySelector(".compare-count");
		if (storage.data == null) return;
		if (storage.data.listArray.length === 0) return;
		storage.data.listArray.forEach((item) => {
			if (!item.isProcesed) {
				listCount++;
			}
		});
		if (storage.data.compareArray.length === 0) return;
		storage.data.compareArray.forEach((item) => {
			if (!item.isProcesed) {
				compareCount++;
			}
		});
		if (listCount > 0) {
			listBtnCount.textContent = listCount;
			listBtnCount.style.display = "block";
		} else {
			listBtnCount.style.display = "none";
		}
		if (compareCount > 0) {
			compareBtnCount.textContent = compareCount;
			compareBtnCount.style.display = "block";
		} else {
			compareBtnCount.style.display = "none";
		}
	}

	// check elaborations count
	setInterval(checkElaborations, intarval.elaboration * 1000);

	// add content-wrapper

	let buttons = {
		el: "div",
		className: "btn-wraper",
		children: [
			{
				el: "button",
				className: "elaboration-btn btn",
				event: "click",
				hendler: function () {
					generate.preloader({ status: "start" });
					let elaborations = load.elaborations();
					elaborations.then((data) => {
						generate.preloader({ status: "end" });
						contentWraper.appendChild(generate.elaborations(data));
					});
				},
				children: [
					{
						el: "span",
						className: "elabortion-count counter",
					},
					{
						el: "img",
						src: get.url(src.ico.elaboration),
						alt: "Наявні уточнення",
					},
				],
			},
			{
				el: "button",
				className: "question-btn btn",
				event: "click",
				hendler: getQuestions,
				children: [
					{
						el: "span",
						className: "question-count counter",
					},
					{
						el: "img",
						src: get.url(src.ico.question),
						alt: "Наявні питання",
					},
				],
			},
			{
				el: "button",
				className: "compare-btn btn",
				event: "click",
				hendler: hendlers.generateCompare,
				children: [
					{
						el: "span",
						className: "compare-count counter",
					},
					,
					{
						el: "img",
						src: get.url(src.ico.compare),
						alt: "Розбіжності товару",
					},
				],
			},
			{
				el: "button",
				className: "list-btn btn",
				event: "click",
				hendler: hendlers.generateList,
				children: [
					{
						el: "span",
						className: "list-count counter",
					},
					{
						el: "img",
						src: get.url(src.ico.list),
						alt: "Список на рознесення товару",
					},
				],
			},
			{
				el: "button",
				className: "orders-btn btn",
				event: "click",
				hendler: function () {
					let orders = load.orders();
					orders.then((data) => {
						let mainWraper = document.querySelector(".wraper");
						mainWraper.innerHTML = "";
						mainWraper.appendChild(generate.orders(data));
					});
				},
				children: [{ el: "img", src: get.url(src.ico.orders) }],
			},
			{
				el: "img",
				className: "production-btn btn",
				src: get.url(src.ico.production),
			},
			{
				el: "button",
				className: "log-out-btn btn",
				event: "click",
				hendler: logOut,
				children: [
					{
						el: "img",
						src: get.url(src.ico.logout),
						alt: "Вийти з Акаунта",
					},
				],
			},
		],
	};
	let btnWraper = get.elements(buttons);
	document.body.appendChild(searchWraper);
	document.body.appendChild(contentWraper);
	document.body.appendChild(btnWraper);
	checkElaborations();
	drawButtonsCount();
});
