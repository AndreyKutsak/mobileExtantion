window.addEventListener("load", () => {
	let storage = localStorage.getItem("storage");
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
	let url = {
		baza: "https://baza.m-p.in.ua/ajax/magaz.php",
		getElaboration: "https://baza.m-p.in.ua/ajax/loadElaboration.php",
		addElaboration: "https://baza.m-p.in.ua/ajax/addElaborationAnswer.php",
		getQuestion: "https://baza.m-p.in.ua/ajax/loadQuestions.php",
		addAnswer: "https://baza.m-p.in.ua/ajax/addAnswer.php",
		search: "https://baza.m-p.in.ua/ajax/search.php",
		getOrder: "https://baza.m-p.in.ua/ajax/order_cont.php",
		reserve: "https://baza.m-p.in.ua/ajax/podrRezerv.php",
		deliveries: "https://baza.m-p.in.ua/ajax/prihod1.php",
		sales: "https://baza.m-p.in.ua/ajax/podrSales.php",
	};
	//regulars expression
	let regExp = {
		elaboration: /Є уточнення: (\d+) шт\./,
		question: /Є питання: (\d+) шт\./,
		article: /\s(\d+\.\d+\.\d+)/,
		number: /№(\d+)/,
		elaborationArticle: /\((\d+(\.\d+)*)\)$/,
		sentence: /[^\\n]+(?=\\n|$)/g,
		cell: new RegExp("cell", "gi"),
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
		goodsCount: function (data) {
			const matches = {};
			let match;
			while ((match = regexGoodsCount.exec(data)) !== null) {
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
				data.funct();
			}
			if (data.style) {
				for (const styleKey in data.style) {
					element.style[styleKey] = data.style[styleKey];
				}
			}
			if (data.href) {
				element.href = data.href;
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
				element.dataset = data.data;
			}
			if (data.event && data.hendler && typeof data.hendler === "function") {
				element.addEventListener(data.event, data.hendler);
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

	// creating and adding new elements to DOM
	let contentWraper = get.elements({ el: "div", className: "wraper" });
	let mainSearchWraper = document.createElement("div");
	mainSearchWraper.className = "main-search-wraper";
	let searchWraper = document.createElement("div");
	searchWraper.className = "search-wraper";
	let searchInp = document.createElement("input");
	searchInp.className = "search-inp";
	searchInp.placeholder = "Пошук";
	let barCodeSearch = document.createElement("button");
	barCodeSearch.className = "bar-code-search-btn";
	barCodeSearch.dataset.scaning = "false";
	let barcodeIco = document.createElement("img");
	barcodeIco.src = get.url(src.ico.barcode);
	barCodeSearch.appendChild(barcodeIco);
	let searchSendBtn = document.createElement("input");
	searchSendBtn.className = "search-send-btn";
	searchSendBtn.type = "submit";
	searchSendBtn.value = "Пошук";
	let barcodeDisplayWraper = document.createElement("div");
	barcodeDisplayWraper.className = "barcode-display-wraper hide-barcode";
	let barcodeDisplay = document.createElement("div");
	barcodeDisplay.className = "barcode";
	barcodeDisplay.id = "reader";
	barcodeDisplayWraper.appendChild(barcodeDisplay);

	searchWraper.appendChild(searchInp);
	searchWraper.appendChild(barCodeSearch);
	searchWraper.appendChild(searchSendBtn);
	mainSearchWraper.appendChild(searchWraper);
	mainSearchWraper.appendChild(barcodeDisplayWraper);

	let bazaURL = "https://baza.m-p.in.ua/ajax/magaz.php";
	let elaborationURL = "https://baza.m-p.in.ua/ajax/loadElaboration.php";
	let addElaborationURL =
		"https://baza.m-p.in.ua/ajax/addElaborationAnswer.php";
	let questionURL = "https://baza.m-p.in.ua/ajax/loadQuestions.php";
	let answerURL = "https://baza.m-p.in.ua/ajax/addAnswer.php";
	let searchURL = "https://baza.m-p.in.ua/ajax/search.php";
	let openOrderURL = "https://baza.m-p.in.ua/ajax/order_cont.php";
	let getReserveURL = "https://baza.m-p.in.ua/ajax/podrRezerv.php";

	let buttons = {
		el: "div",
		className: "btn-wraper",
		children: [
			{
				el: "button",
				className: "elaboration-btn btn",
				event: "click",
				hendler: elaborations,
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
				hendler: generateCompare,
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
				hendler: generateList,
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

	let elaborationPattern = /Є уточнення: (\d+) шт\./;
	let questionPattern = /Є питання: (\d+) шт\./;
	let regexArticle = /\s(\d+\.\d+\.\d+)/;
	let regexNumber = /№(\d+)/;
	let regexElaborationArticle = /\((\d+(\.\d+)*)\)$/;
	let regexSentens = /[^\\n]+(?=\\n|$)/g;
	let regexCell = new RegExp("cell", "gi");
	let regexGoodsCount =
		/всього:\s*(\d+)\(.*?\)\s*(м\/п|компл\.|шт\.)|резерв:\s*(\d+)\(.*?\)\s*(м\/п|компл\.|шт\.)/g;
	if (storage == null) {
		localStorage.setItem(
			"storage",
			JSON.stringify({
				listArray: [],
				compareArray: [],
			})
		);
		storage = JSON.parse(localStorage.getItem("storage"));
	} else {
		storage = JSON.parse(localStorage.getItem("storage"));
	}
	// Global functions
	function drawPreloader(data) {
		let status = data.status || "start";
		if (status === "start") {
			let preloader = get.elements({
				el: "div",
				className: "preloader-wraper",
				children: [
					{
						el: "div",
						className: "preloader-spiner",
						children: [
							{
								el: "img",
								src: get.url(src.ico.spiner),
								alt: "prelapoder spiner",
							},
						],
					},
				],
			});
			contentWraper.appendChild(preloader);
		} else {
			contentWraper.innerHTML = "";
		}
	}

	function updateStorage() {
		localStorage.setItem("storage", JSON.stringify(storage));
	}
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
	function search() {
		let search_query = searchInp.value;
		if (search_query.length < 2) {
			alert("Дожина пошукового запиту маєбути більше 2 символів!");
			return;
		}
		drawPreloader({ status: "start" });
		let search_sell = 0;
		let searchData = new URLSearchParams();
		searchData.append("search", search_query);
		searchData.append("search_sel", search_sell);
		fetch(searchURL, {
			method: "POST",
			body: searchData,
		})
			.then((res) => {
				return res.text();
			})
			.then((res) => {
				let searchData = [];
				let searchResponce = get.parser(res);
				let goodsId = Array.from(
					searchResponce.querySelectorAll(".detDivTitle")
				);
				let searchGoodWraper = Array.from(
					searchResponce.querySelectorAll(".detDiv")
				);
				searchGoodWraper.forEach((item, index) => {
					let data = {};
					let goodsPhoto = item.querySelector(".detImg>a>img");
					let goodsCount = Array.from(
						searchResponce.querySelectorAll(".detPr")
					);
					let goodsDesc = Array.from(
						searchResponce.querySelectorAll(".titleDet")
					);

					data.id = get.article(goodsId[index].textContent).id;
					data.article = get.article(goodsId[index].textContent).article;
					data.photo = goodsPhoto.getAttribute("src");
					data.photoLG = goodsPhoto.parentNode.getAttribute("href");
					data.head = goodsDesc[index].innerHTML.split("<br>")[0].trim();
					data.desc = goodsDesc[index].textContent.trim();
					data.count = goodsCount[index].textContent.trim();
					searchData.push(data);
				});

				generateSearch(searchData);
			});
	}
	function generateSearch(data) {
		drawPreloader({ status: "end" });
		if (data.length > 0) {
			let searchWraper = document.createElement("div");
			searchWraper.className = "search-result-wraper";
			data.forEach((item) => {
				let wraper = document.createElement("div");
				wraper.className = "item-wraper";
				wraper.dataset.id = `${item.id}`;
				let itemHeader = document.createElement("div");
				itemHeader.className = "item-header";
				itemHeader.innerHTML = `ID: ${item.id} | Артикул: ${item.article}`;
				let itemContentWraper = document.createElement("div");
				itemContentWraper.className = "item-content-wraper";
				let itemImageLink = document.createElement("a");
				itemImageLink.className = "image-link";
				itemImageLink.href = item.photoLG;
				let image = document.createElement("img");
				image.src = item.photo;
				image.className = "item-image";
				let textWraper = document.createElement("div");
				textWraper.className = "item-text-wraper";
				let itemCountWraper = document.createElement("div");
				itemCountWraper.className = "item-count-wraper";
				let itemDesc = document.createElement("p");
				itemDesc.className = "item-desc";
				itemDesc.textContent = item.desc;
				let itemCount = document.createElement("p");
				itemCount.className = "item-count";
				itemCount.textContent = item.count;
				// buttons
				let btnWraper = document.createElement("div");
				btnWraper.className = "item-btn-wraper";
				let listBtn = document.createElement("button");
				listBtn.className = "list-btn btn";
				listBtn.textContent = "Рознести";
				// buttons
				let goodsBtnWraper = document.createElement("div");
				goodsBtnWraper.className = "search-btn-wraper";
				let reserveBtn = document.createElement("button");
				reserveBtn.className = "search-btn reserve-btn";
				reserveBtn.textContent = "Резерв";
				let arrivalBtn = document.createElement("button");
				arrivalBtn.className = "search-btn reserve-btn";
				arrivalBtn.textContent = "Приход";
				let salesBtn = document.createElement("button");
				salesBtn.className = "search-btn sales-btn";
				salesBtn.textContent = "Продажі";
				goodsBtnWraper.appendChild(reserveBtn);
				goodsBtnWraper.appendChild(arrivalBtn);
				goodsBtnWraper.appendChild(salesBtn);

				let compareWraper = document.createElement("div");
				compareWraper.className = "compare-wraper";
				let compareBtn = document.createElement("button");
				compareBtn.className = "compare-btn btn";
				compareBtn.textContent = "Пересорт";

				let compareInp = document.createElement("input");
				compareInp.className = "compare-inp";
				compareInp.type = "number";
				compareInp.placeholder = "Фактична кількість";
				// appending image
				itemImageLink.appendChild(image);
				// wrapper appending
				wraper.appendChild(itemHeader);
				wraper.appendChild(itemContentWraper);
				itemCountWraper.appendChild(itemCount);
				itemContentWraper.appendChild(itemImageLink);
				itemContentWraper.appendChild(itemCountWraper);
				itemContentWraper.appendChild(textWraper);
				itemContentWraper.appendChild(textWraper);
				btnWraper.appendChild(listBtn);
				compareWraper.appendChild(compareInp);
				compareWraper.appendChild(compareBtn);
				btnWraper.appendChild(compareWraper);
				wraper.appendChild(itemDesc);
				wraper.appendChild(btnWraper);
				wraper.appendChild(goodsBtnWraper);

				searchWraper.appendChild(wraper);

				reserveBtn.addEventListener("click", () => {
					let data = load.reserve({ url: url.reserve, id: item.id });
					data.then((test) => {
						console.log(test);
					});
				});
				// add event listeners
				itemDesc.addEventListener("click", (e) => {
					e.preventDefault();
					itemDesc.classList.toggle("visible");
				});
				compareInp.addEventListener("input", (e) => {
					let compareVal = e.currentTarget.value;
					if (
						Number(compareVal) !== Number(get.goodsCount(item.count).baseCount)
					) {
						e.currentTarget.style.border = `1px solid red`;
					}
				});
				listBtn.addEventListener("click", (e) => {
					item.isProcesed = false;
					item.addingDate = get.date();
					if (storage.listArray.includes(item)) {
						alert("Такий товар вже в списку");
						return;
					}
					storage.listArray.push(item);
					updateStorage();
					drawButtonsCount();
				});
				compareBtn.addEventListener("click", (e) => {
					if (compareInp.classList.contains("visible-inp")) {
						if (compareInp.value.length == 0) {
							alert("Введи коректну відповідь");
							return;
						}
						if (storage.compareArray.includes(item)) {
							alert("Такий товар вже в списку");
							return;
						}
						item.addingDate = get.date();
						item.isProcesed = false;
						item.realCount = Number(compareInp.value);
						item.goodsBaseCount = get.goodsCount(item.count).baseCount;
						item.goodsReserve = get.goodsCount(item.count).orderCount;
						storage.compareArray.push(item);
						wraper.style.backgroundColor = "#fbc8c8";
						updateStorage();
						drawButtonsCount();
					}
					compareInp.classList.toggle("visible-inp");
				});
				itemImageLink.addEventListener("click", showImage);
			});
			contentWraper.appendChild(searchWraper);
		} else {
			let searchTitle = document.createElement("p");
			searchTitle.className = "question-title content-title";
			searchTitle.textContent = "Нічого не знайдено";
			contentWraper.appendChild(searchTitle);
		}
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
		let orderNumber = e.currentTarget.dataset.orderNumber;
		let elaborationInp = document.getElementById(
			`elaborationInput${orderNumber}`
		);
		let btn = e.currentTarget;
		let count = Number(elaborationInp.dataset.count);
		if (elaborationInp.value == "") {
			alert("Введи коректну відповідь");
			return false;
		}
		if (count > Number(getNum(elaborationInp.value))) {
			alert(" Сподіваюся ти був уважним");
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
				const response = await fetch(data.url, {
					method: data.method,
					body: get.decode(data.body),
				});

				if (!response.ok) {
					throw new Error(`HTTP Error! Status: ${response.status}`);
				}

				const res = await response.text();
				const parse = get.parser(res);
				const parseRow = Array.from(parse.querySelectorAll("tr"));
				parseRow.shift();
				return parseRow;
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
			if (reserve.length === 0) {
				return [];
			}
			reserve.forEach((item) => {
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
			if (sales.length === 0) {
				return [];
			}
			sales.forEach((item) => {
				let rowData = {};
				let td = item.querySelectorAll("td");
				rowData.orderNumber = td[0].textContent;
				rowData.status = td[1].textContent;
				rowData.count = td[2].textContent;
				rowData.price = td[3].textContent;
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
			if (deliveries.length === 0) {
				return [];
			}
			deliveries.forEach((item) => {
				let rowData = {};
				let td = item.querySelectorAll("td");
				rowData.date = td[0].textContent;
				rowData.provider = td[1].textContent;
				rowData.count = td[2].textContent;
				rowData.price = td[3].textContent;
				rowData.manger = td[4].textContent;
				rowData.storage = td[5].textContent;
				this.storage.push(rowData);
			});
			return this.storage;
		},
	};

	function checkAnswer(e) {
		e.preventDefault();
		let answer = e.target.value;
		let count = Number(e.target.dataset.count);

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
		drawPreloader({ status: "end" });
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
		drawPreloader({ status: "start" });
		fetch(questionURL, {
			method: "POST",
		})
			.then((responce) => {
				return responce.text();
			})
			.then((responce) => {
				drawPreloader({ status: "end" });
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

	function generateElaboration(data) {
		drawPreloader({ status: "end" });
		if (data.length > 0) {
			data.forEach((row) => {
				console.log(row);
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
				positionQualityDesc.textContent = "Кількість товару";

				let positionQualityText = document.createElement("div");
				positionQualityText.className = "table-text";
				if (row.numberData.baseCount == 0) {
					positionQualityText.style.backgroundColor = "#fbc8c8";
				} else {
					positionQualityText.style.backgroundColor = "#c2edc2";
				}
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
				if (row.numberData.orderCount == 0) {
					reserveQualityText.style.backgroundColor = "#c2edc2";
				} else {
					reserveQualityText.style.backgroundColor = "#fbc8c8";
				}
				reserveQualityText.textContent = row.numberData.orderCount;
				reserveQualityRow.appendChild(reserveQualityDesc);
				reserveQualityRow.appendChild(reserveQualityText);
				console.log(row, row.reserveQuality);
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
				console.log(row.numberData);
				input.dataset.count = row.numberData.baseCount;
				input.type = "text";
				input.placeholder = "Кількість";
				input.id = `elaborationInput${get.orderId(row.orderNumber)}`;
				let sendBtn = document.createElement("button");
				let sendIco = document.createElement("img");
				sendIco.src = get.url(src.ico.send);
				sendBtn.appendChild(sendIco);
				sendBtn.className = "send-btn";
				sendBtn.dataset.orderNumber = get.orderId(row.orderNumber);
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

					return a;
				});

				images.forEach((image) => {
					imageWraper.appendChild(image);
					image.addEventListener("click", showImage);
				});
				let buttonsRow = document.createElement("div");
				buttonsRow.className = "table-row elaboration-btn-wraper";
				let reserveBtn = document.createElement("button");
				reserveBtn.className = "reserve-btn btn";
				reserveBtn.textContent = "Резерв";
				let arrivalbtn = document.createElement("button");
				arrivalbtn.className = "arrival-btn btn";
				arrivalbtn.textContent = "Приходи";
				let selesBtn = document.createElement("button");
				selesBtn.className = "seles-btn btn";
				selesBtn.textContent = "Продажі";

				buttonsRow.appendChild(reserveBtn);
				buttonsRow.appendChild(arrivalbtn);
				buttonsRow.appendChild(selesBtn);

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
				tableWraper.appendChild(buttonsRow);
				contentWraper.appendChild(tableWraper);
			});
		} else {
			let elaborationTitle = document.createElement("p");
			elaborationTitle.className = "elaboration-title content-title";
			elaborationTitle.textContent = "Зараз немає Уточнень";
			contentWraper.appendChild(elaborationTitle);
		}
	}
	async function elaborations() {
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

		drawPreloader({ status: "start" });

		try {
			// Виконуємо запит на elaborationURL
			const responce = await fetch(elaborationURL, {
				method: "POST",
			});

			if (!responce.ok) {
				throw new Error(`Network response was not ok: ${responce.status}`);
			}

			const elaborationText = await responce.text();

			const elaborationTable = get.parser(elaborationText);
			let article;
			const tableRow = Array.from(
				elaborationTable.querySelectorAll("table>tbody>tr")
			);

			tableRow.shift();
			const elaborationRow = tableRow.map((data) => {
				let elaborationData = {};
				let dataCells = Array.from(data.querySelectorAll("td"));
				dataCells.forEach((td, tdIndex) => {
					elaborationData[keysStore[tdIndex]] = String(td.textContent.trim());
					if (keysStore[tdIndex] == "searchQuery") {
						article = `${elaborationData["positionName"]}`.match(
							regexElaborationArticle
						)[1];

						elaborationData[keysStore[tdIndex]] = article.trim();
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
							let parseSearch = get.parser(responseText);
							let articleRow = Array.from(
								parseSearch.querySelectorAll(".detDivTitle")
							);

							articleRow.forEach((a, index) => {
								console.log(
									get.article(a.textContent.trim()).article ===
										data.searchQuery,
									get.article(a.textContent.trim()).article,
									data.searchQuery
								);
								if (
									get.article(a.textContent.trim()).article === data.searchQuery
								) {
									let countData = parseSearch.querySelectorAll(".detPr")[index];
									let images = Array.from(
										parseSearch
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
									elaborationRow[key].imagesSrc = imgSrc;
									elaborationRow[key].imageLink = imgLink;
									elaborationRow[key].numberData = get.goodsCount(
										countData.textContent.trim()
									);
								}
							});
						})
				);
			});

			// Очікуємо завершення всіх обіцянок
			await Promise.all(promises);

			// Зараз можна викликати generateElaboration
			generateElaboration(elaborationRow);
		} catch (error) {
			console.error(error);
			alert(String(error));
			// Обробка помилок
		}
	}
	function drawButtonsCount() {
		let listCount = 0;
		let compareCount = 0;
		let listBtnCount = document.querySelector(".list-count");
		let compareBtnCount = document.querySelector(".compare-count");
		if (storage == null) return;
		storage.listArray.forEach((item) => {
			if (!item.isProcesed) {
				listCount++;
			}
		});
		storage.compareArray.forEach((item) => {
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
	function generateList() {
		drawPreloader({ status: "end" });
		if (storage.listArray.length == 0) {
			let listTitle = document.createElement("p");
			listTitle.className = "list-title content-title";
			listTitle.textContent = "Список на розноску товару Пустий!!!";
			contentWraper.appendChild(listTitle);
			return;
		}
		storage.listArray.forEach((item, index) => {
			console.log(item);
			let listItemWraper = document.createElement("div");
			listItemWraper.className = "list-item";
			let delItemBtn = document.createElement("button");
			delItemBtn.className = "del-btn btn";
			let delItemImg = document.createElement("img");
			delItemImg.src = get.url(src.ico.recycle);
			delItemBtn.appendChild(delItemImg);
			let dateDesc = document.createElement("p");
			dateDesc.className = "desc date-desc";
			dateDesc.textContent = `${item.addingDate.day}.${item.addingDate.month}.${item.addingDate.year}  ${item.addingDate.hours}:${item.addingDate.minutes}:${item.addingDate.seconds} `;
			let itemImageLink = document.createElement("a");
			itemImageLink.className = "item-image-link";
			itemImageLink.setAttribute("href", item.photoLG);
			let itemImage = document.createElement("img");
			itemImage.className = "item-image";
			itemImage.src = item.photo;
			itemImageLink.appendChild(itemImage);
			let itemTextWraper = document.createElement("div");
			itemTextWraper.className = "item-text-wraper";
			let itemCount = document.createElement("p");
			itemCount.className = "item-count";
			itemCount.textContent = `Кількість: ${
				get.goodsCount(item.count).baseCount
			} Резерв: ${get.goodsCount(item.count).orderCount}`;
			let itemArticle = document.createElement("p");
			itemArticle.className = "item-article";
			itemArticle.textContent = item.article;
			let itemDesc = document.createElement("p");
			itemDesc.className = "item-head";
			itemDesc.textContent = item.head;
			let procesedBtn = document.createElement("button");
			procesedBtn.className = "procesed-btn";
			procesedBtn.dataset.id = item.id;
			if (item.isProcesed) {
				procesedBtn.textContent = "Оброблено";
			} else {
				procesedBtn.textContent = "Обробити";
			}

			if (item.isProcesed) {
				listItemWraper.style.backgroundColor = "#c2edc2";
			}
			itemTextWraper.appendChild(dateDesc);
			itemTextWraper.appendChild(itemArticle);
			itemTextWraper.appendChild(itemCount);
			itemTextWraper.appendChild(itemDesc);
			itemTextWraper.appendChild(procesedBtn);
			listItemWraper.appendChild(delItemBtn);
			listItemWraper.appendChild(itemImageLink);
			listItemWraper.appendChild(itemTextWraper);
			contentWraper.appendChild(listItemWraper);
			procesedBtn.addEventListener("click", (e) => {
				storage.listArray.forEach((item) => {
					if (item.id == Number(e.currentTarget.dataset.id)) {
						item.isProcesed = true;
						procesedBtn.textContent = "Оброблено";
						procesedBtn.parentNode.parentNode.style.backgroundColor = "#c2edc2";
						updateStorage();
						drawButtonsCount();
					}
				});
			});
			delItemBtn.addEventListener("click", (e) => {
				storage.listArray.forEach((a, index) => {
					if (a.id == Number(item.id)) {
						storage.listArray.splice(index, 1);
					}
				});

				updateStorage();
				drawButtonsCount();
				listItemWraper.remove();
			});
			itemImageLink.addEventListener("click", showImage);
		});
	}
	function generateCompare() {
		drawPreloader({ status: "end" });
		if (storage.compareArray.length == 0) {
			let compareTitle = get.elements({
				el: "p",
				className: "compare-title content-title",
				text: "Список Розбжностей пустий!!!",
			});
			contentWraper.appendChild(compareTitle);
			return;
		}
		storage.compareArray.forEach((item, index) => {
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
			let compareWraper = get.elements({
				el: "div",
				className: "compare-item",
				style: drawDifference(),
				children: [
					{
						el: "button",
						className: "del-btn btn",
						event: "click",
						hendler: function (e) {
							e.currentTarget.parentNode.parentNode.remove();
							storage.compareArray.splice(index, 1);
							updateStorage();
						},
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
									storage.compareArray[index].isProcesed = true;
									updateStorage();
								},
							},
						],
					},
				],
			});

			contentWraper.appendChild(compareWraper);
		});
	}
	// check elaborations count
	setInterval(checkElaborations, intarval.elaboration * 1000);

	searchSendBtn.addEventListener("click", search);
	barCodeSearch.addEventListener("click", barcodeRecognition);
	document.body.appendChild(btnWraper);
	// add content-wrapper
	document.body.appendChild(mainSearchWraper);
	document.body.appendChild(contentWraper);
	checkElaborations();
	drawButtonsCount();
});
