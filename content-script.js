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

	const storage = {
		data: {},
		changed: false,
		init: function () {
			const storedData = JSON.parse(localStorage.getItem("storage"));
			this.data =
				this.observe(storedData) ||
				this.observe({
					listArray: {},
					compareArray: {},
					questions: [],
					elaborations: {},
					addresses: {},
					orders: {},
					history: [],
					production: [],
					settings: {},
				});
			console.log(this.data, storedData);
			if (!storedData) {
				this.changed = true;
				this.save();
			}
		},
		save: function () {
			if (this.changed) {
				console.log("Сохранено");
				localStorage.setItem("storage", JSON.stringify(this.data));
				this.changed = false;
			}
		},
		address: function (data) {
			console.time("adres");
			console.log(data);
			let article = data.article;
			if (!article) {
				console.error(
					"Артикул є обов'язковим для отримання чи збереження даних"
				);
				return;
			}
			if (!this.data.addresses[article]) {
				this.data.addresses[article] = this.observe({});
			}

			if (data.place && data.place !== this.data.addresses[article].place) {
				console.log("place");
				this.data.addresses[article].place = this.observe(data.place);
				this.changed = true;
				this.save();
			}
			if (data.cell && data.cell !== this.data.addresses[article].cell) {
				console.log("cell");
				this.data.addresses[article].cell = this.observe(data.cell);
				this.changed = true;
				this.save();
			}
			if (
				data.cell_capacity &&
				data.cell_capacity !== this.data.addresses[article].cell_capacity
			) {
				console.log("capacity");
				this.data.addresses[article].cell_capacity = this.observe(
					this.data.cell_capacity
				);
				this.changed = true;
				this.save();
			}
			if (
				this.data.last_goods_count &&
				this.data.last_goods_count !==
				this.data.addresses[article].last_goods_count
			) {
				console.log("good scount");
				this.data.addresses[article].last_goods_count = this.observe(
					this.data.last_goods_count
				);
				this.changed = true;
				this.save();
			}
			if (
				this.data.is_ignored &&
				this.data.is_ignored !== data.addresses[article].is_ignored
			) {
				console.log("is ignored");
				this.data.addresses[article].is_ignored = this.observe(
					this.data.is_ignored
				);
				this.changed = true;
				this.save();
			}
			console.timeEnd("adres");
			return this.data.addresses[article];
		},
		observe: function (obj) {
			if (typeof obj !== "object" || obj === null) {
				return obj;
			}

			for (const key in obj) {
				obj[key] = this.observe(obj[key]);
			}

			return new Proxy(obj, {
				set: (target, key, value) => {
					target[key] = value;
					this.changed = true;
					this.save();
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
		production: "https://baza.m-p.in.ua/ajax/ourGoods.php",
		stilages: "https://baza.m-p.in.ua/ajax/stillages.php",
		stilagesZones: "https://baza.m-p.in.ua/ajax/stillagesZone.php",
		stilage: "https://baza.m-p.in.ua/ajax/stillage.php",
	};
	//regulars expression
	let regExp = {
		elaboration: /Є уточнення: (\d+) шт\./,
		question: /Є питання: (\d+) шт\./,
		article: /\s(\d+\.\d+\.\d+)/,
		elaborationArticle: /\((\d+(\.\d+)*)\)$/,
		orderArticle: /\d+\.\d+\.\d+/,
		number: /№(\d+)/,
		num: /\d+/,
		sentence: /[^\\n]+(?=\\n|$)/g,
		cell: new RegExp("cell", "gi"),
		orderPlace: /[A-Z]\d*-\d+\.\d+\.\d+/gm,
		goodsCount:
			/всього:\s*(\d+)\(.*?\)\s*(м\/п|компл\.|шт\.|бал\.|упак\.)|резерв:\s*(\d+)\(.*?\)\s*(м\/п|компл\.|шт\.|бал\.|упак\.)/g,
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
			history: "img/history-ico.svg",
		},
	};
	let interval = {
		elaboration: 15 * 1000,
		cell_goods_count: 1000 * 30 * 60,
	};
	let get = {
		url: function (data) {
			return chrome.runtime.getURL(String(data));
		},
		mergeSort: function (arr) {
			if (arr.length <= 1) {
				return arr;
			}

			const middle = Math.floor(arr.length / 2);
			const left = arr.slice(0, middle);
			const right = arr.slice(middle);
			function merge(left, right) {
				let result = [];
				let leftIndex = 0;
				let rightIndex = 0;

				while (leftIndex < left.length && rightIndex < right.length) {
					if (left[leftIndex].count > right[rightIndex].count) {
						result.push(left[leftIndex]);
						leftIndex++;
					} else {
						result.push(right[rightIndex]);
						rightIndex++;
					}
				}

				return result.concat(left.slice(leftIndex), right.slice(rightIndex));
			}

			return merge(get.mergeSort(left), get.mergeSort(right));
		},
		parser: function (data) {
			let domParser = new DOMParser();
			let doc = domParser.parseFromString(data, "text/html");
			return doc;
		},
		percent: function (data) {
			return (100 * data.num) / data.main;
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
			let matchNumber = data.match(regExp.number);
			let matchArticle = data.match(regExp.article);
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
					let placeStr = "";
					matchData.article = article[0];
					place.forEach((str) => {
						placeStr += ` ${str}`;
					});
					matchData.place = placeStr;
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
			const matches = data.match(regExp.num);
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

			return convertedData || false;
		},
	};
	let hendlers = {
		add_to_list: function (item) {
			let article = this.dataset.article;
			if (storage.data.listArray[article]) {
				alert("Такий елемент вже є в списку");
				return;
			}
			storage.data.listArray[article] = {
				photo: item.photo,
				photoLG: item.photoLG,
				head: item.head,
				count: item.baseCount,
				isProcesed: false,
				addingDate: get.date(),
			};
			generate.tasksCount();
		},
		add_to_compare: function (item) {
			let article = this.dataset.article;
			let compareInp = this.parentElement.querySelector(".compare-inp");
			let wraper = this.parentElement.parentElement.parentElement;
			if (!compareInp.classList.contains("visible-inp")) {
				compareInp.classList.toggle("visible-inp");
				return;
			}
			if (storage.data.compareArray[article]) {
				alert("Такий елемент вже є в списку");
				return;
			}
			if (compareInp.value == "") {
				alert("Введіть кількість");
				return;
			}
			storage.data.compareArray[article] = {
				photo: item.photo,
				photoLG: item.photoLG,
				head: item.head,
				count: {
					realCount: compareInp.value,
					baseCount: item.baseCount.baseCount,
					orderCount: item.baseCount.orderCount,
				},
				isProcesed: false,
				addingDate: get.date(),
			};
			compareInp.classList.toggle("visible-inp");
			wraper.style.backgroundColor = "#fbc8c8";
			this.classList.toggle("clicked");
			generate.tasksCount();
		},
		check: function () {
			let parentEl = this.parentElement.parentElement;
			parentEl.classList.toggle("success");
			parentEl.parentNode.appendChild(parentEl);
		},
		removeItem: function () {
			let article = this.dataset.article;
			let arr = this.dataset.arr;

			delete storage.data[arr][article];
			storage.save();

			this.parentElement.remove();
			generate.tasksCount();
		},
		getToProduction: function () {
			if (storage.data.production.some((obj) => obj.id === this.dataset.id)) {
				alert("Елемент вже є в списку!!!");
				return;
			}
			let parent = this.parentNode.parentNode;
			let id = this.dataset.id;
			let count = this.parentNode.querySelector(".item-input");
			if (count.value == "") {
				alert("Введіть кількість");
				return;
			}
			if (count.value == "0") {
				alert("Введіть кількість більше нуля");
				return;
			}
			storage.data.production.push({
				id: id,
				count: count.value,
				isProcesed: false,
			});
			count.disabled = true;
			parent.classList.add("procesed");
			parent.parentNode.prepend(parent);
			generate.tasksCount();
		},

		generateList: function () {
			contentWraper.innerHTML = "";
			contentWraper.appendChild(generate.list());
		},
		generateCompare: function () {
			contentWraper.innerHTML = "";
			contentWraper.appendChild(generate.compare());
		},
		procesed: function () {
			let el;
			let itemWraper = this.parentNode.parentNode;
			let arr = this.dataset.arr;
			let id = this.dataset.article;
			this.textContent = "Оброблено";
			this.parentNode.parentNode.style.backgroundColor = "#c2edc2";
			storage.data[arr][id].isProcesed = true;
			el = storage.data[arr][id];
			delete storage.data[arr][id];
			storage.data[arr][id] = el;
			itemWraper.parentNode.appendChild(itemWraper);
			generate.tasksCount();
		},
		production: function () {
			generate.preloader({ status: "start" });
			load.production().then((data) => {
				generate.preloader({ status: "end" });
				contentWraper.appendChild(generate.production(data));
			});
		},
		product: function () {
			let parent = this.parentNode.parentNode;
			let id = this.dataset.id;
			storage.data.production.forEach((item, index) => {
				if (item.id === id) {
					storage.data.production.splice(index, 1);
					parent.remove();
				}
			});

			generate.tasksCount();
		},
		addToList: function () {
			this.textContent = "Взято";
			this.parentNode.classList.add("success");
		},
		showImage: function (e) {
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
		},
		questions: function () {
			generate.preloader({ status: "start" });
			load.questions().then((data) => {
				generate.preloader({ status: "end" });
				contentWraper.appendChild(generate.question(data));
			});
		},
		sendQuestion: function () {
			let area = this.parentNode.parentNode.querySelector("textarea");
			let id = this.dataset.id;
			if (area.value.length == 0) {
				alert("Введи відповідь");
				return;
			}
			load
				.fetch({
					url: url.addAnswer,
					method: "POST",
					body: { id: id, text: area.value },
				})
				.then((result) => {
					console.log(result);
					if (result.body.textContent == "ok") {
						area.remove();
						this.remove();
					} else {
						alert("Помилка Щсь пішло не так!!");
					}
				})
				.catch((err) => {
					connsole.log(err);
				});
		},
		checkAnswer: function () {
			let answer = this.value;
			let count = Number(this.dataset.count);

			if (get.num(answer) > count) {
				this.parentNode.parentNode.classList.add("warn");
				alert("Перевір ще раз,І не забудь вказати лишки в пересорт");
			}
			if (get.num(answer) < count) {
				this.parentNode.parentNode.classList.add("danger");
			}
			if (get.num(answer) === count) {
				this.parentNode.parentNode.classList.remove("warn");
				this.parentNode.parentNode.classList.remove("danger");
			}
			if (answer == "") {
				this.parentNode.parentNode.classList.remove("warn");
				this.parentNode.parentNode.classList.remove("danger");
			}
		},
		// elaboration hendlers
		addElaborationAnswer: function () {
			let order = this.dataset.order;
			let elaborationInp = this.parentNode.querySelector("input");
			let count = Number(get.num(elaborationInp.value));
			let baseCount = this.dataset.count;
			if (elaborationInp.value === "") {
				alert("Введи коректну відповідь!");
				return;
			}
			if (baseCount > count) {
				let isSend = confirm(
					"Введена кількість менша від кількості в базі. Точно відправити данні?"
				);
				if (!isSend) return false;
			}
			load
				.fetch({
					url: url.addElaboration,
					method: "POST",
					body: { text: elaborationInp.value, id: order },
				})
				.then((result) => {
					console.log(result.body.textContent);
					if (result.body.textContent === "ok") {
						this.parentNode.parentNode.classList.add("success");
						elaborationInp.remove();
						this.remove();
						generate.requestCount();
					} else {
						alert("Помилка Щсь пішло не так!!");
					}
				});
		},
		elaborationSearch: function () {
			let inp = document.querySelector(".search-inp");
			let searchBtn = document.querySelector(".search-send-btn");
			inp.value = get.elaborationArtice(this.textContent);
			searchBtn.click();
			inp.value = "";
		},
		elaborationOrder: function () {
			let orderId = get.orderId(this.textContent);
			let elaborationFooter =
				this.parentNode.parentNode.querySelector(".item-footer");
			if (elaborationFooter.classList.contains("active-order")) {
				elaborationFooter.classList.remove("active-order");
				let footerChildren = Array.from(elaborationFooter.children);
				footerChildren.forEach((element) => {
					element.remove();
				});
				return;
			}
			elaborationFooter.classList.add("active-order");
			load.order({ id: orderId }).then((data) => {
				elaborationFooter.appendChild(generate.order(data));
			});
		},
		elaborationReserve: function () {
			let id = this.dataset.id;
			let footer =
				this.parentElement.parentElement.querySelector(".item-footer");
			footer.innerHTML = "";
			if (footer.classList.contains("active-reserve")) {
				footer.innerHTML = "";
				footer.classList.toggle("active-reserve");
				return;
			}
			let reserve = load.reserve({ id: id });
			footer.classList.toggle("active-reserve");

			reserve.then((reserve) => {
				footer.appendChild(generate.reserve(reserve));
			});
		},
		elaborationSales: function () {
			let id = this.dataset.id;
			let elFooter =
				this.parentElement.parentElement.querySelector(".item-footer");
			elFooter.innerHTML = "";
			if (elFooter.classList.contains("active-sales")) {
				elFooter.classList.toggle("active-sales");
				return;
			}
			elFooter.classList.toggle("active-sales");
			load.sales({ id: id }).then((data) => {
				elFooter.appendChild(generate.sales(data));
			});
		},
		elaborationArrival: function () {
			let id = this.dataset.id;
			let elFooter =
				this.parentElement.parentElement.querySelector(".item-footer");
			elFooter.innerHTML = "";
			if (elFooter.classList.contains("active-arrival")) {
				elFooter.classList.toggle("active-arrival");
				return;
			}
			elFooter.classList.toggle("active-arrival");
			load.deliveries({ id: id }).then((data) => {
				elFooter.appendChild(generate.deliveries(data));
			});
		},

		search: function () {
			let input = this.parentNode.querySelector(".search-inp");
			let wrapper = document.querySelector(".wraper");
			if (input.value.length < 2) {
				alert("Довжина пошукового запиту має бути 2-х символів");
				return;
			}
			let isOrder = wrapper.querySelector(".orders-wraper");

			generate.preloader({ status: "start" });
			if (isOrder) {
				load.orders({ text: input.value }).then((data) => {
					wrapper.appendChild(generate.orders(data));
				});
				return;
			}

			let search_sell = 0;
			let result = load.search({
				search: String(input.value),
				search_sell: search_sell,
			});
			result.then((data) => {
				generate.search(data);
			});
		},
		productionSearch: function () {
			let input = this.parentNode.querySelector(".search-inp");
			let wrapper = document.querySelector(".wraper");
			let isProduction = wrapper.querySelector(".production-wraper");

			if (isProduction) {
				let productionsItems = Array.from(
					isProduction.querySelectorAll(".production-item-wraper")
				);
				productionsItems.forEach((item) => {
					let article = item.querySelector(".component-item-article");
					let id = item.querySelector(".get-to-production-btn");
					if (
						!article.textContent.includes(input.value) ||
						id.dataset.id == input.value
					) {
						item.style.display = "none";
					} else {
						item.style.display = "block";
					}
				});
			}
		},
		// orders hendlers
		order: function () {
			let itemFooter = this.querySelector(".row-footer");

			let items = Array.from(
				document.querySelectorAll(".row-footer .order-wraper,.item-preloader")
			);
			let id = this.dataset.id;

			items.forEach((item) => {
				item.remove();
			});
			itemFooter.appendChild(
				get.elements({
					el: "div",
					className: "item-preloader",
					children: [
						{
							el: "img",
							src: get.url(src.ico.spiner),
						},
					],
				})
			);
			if (itemFooter.classList.contains("active")) {
				itemFooter.classList.remove("active");
				itemFooter.innerHTML = "";
				return;
			}

			load.order({ id: id }).then((data) => {
				itemFooter.innerHTML = "";
				if (itemFooter.classList.contains("active")) {
					itemFooter.classList.remove("active");
					return;
				}
				itemFooter.classList.add("active");

				itemFooter.appendChild(generate.order(data));
			});
		},
		show_stilages: function () {
			console.log("show_stilages");

			load.get_stilages();
		},
		// cell capacity
		set_cell_capacity: function () {
			let article = this.dataset.article || false;
			if (article) {
				let capacity = this.value;
				storage.data.addresses[article].cell_capacity = capacity;
			}
		},
		ignore_article: function () {
			let article = this.dataset.article || false;
			if (article) {
				storage.data.addresses[article].is_ignored = true;
			} else {
				storage.data.addresses[article] = false;
			}
		},
		fill_cell: function () {
			let article = this.dataset.article || false;
			this.textContent = "Заповнено";
			if (article) {
				if (
					storage.data.addresses[article].cell_capacity >
					storage.data.addresses[article].last_goods_count
				) {
					storage.data.addresses[article].real_goods_count =
						storage.data.addresses[article].last_goods_count;
				} else {
					storage.data.addresses[article].real_goods_count =
						storage.data.addresses[article].cell_capacity;
				}
			}
		},
		find_empty_cells: function () {
			load.get_goods_count.call(load);
		},
		show_empty_cells: function () {
			let empty_cells = [];
			let articles_list = Object.keys(storage.data.addresses);
			articles_list.forEach((item) => {
				let address = storage.data.addresses[item];

				if (address.is_ignored || address.cell_capacity === undefined) {
					return;
				}

				if (
					address.real_goods_count < address.cell_capacity / 2 &&
					+address.cell_capacity < +address.last_goods_count
				) {
					empty_cells.push(item);
				}
			});

			generate.empty_cells(empty_cells);
		},
	};
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
						event: "input",
						hendler: hendlers.productionSearch,
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
						hendler: hendlers.search,
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
					className: "preloader-wraper",
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
					contentWraper.innerHTML = "";
				}
			}
		},
		production: function (data) {
			if (data.length > 0) {
				let descNames = [
					"Назва",
					"Місце",
					"Артикул",
					"Кількість",
					"Наявність",
					"Вистачає на",
				];

				let prodctionWraper = get.elements({
					el: "div",
					className: "production-wraper",
				});
				data.sort((a, b) => {
					if (
						!b.isProcesed &&
						storage.data.production.find(
							(item) => item.id === a.id && !item.isProcesed
						)
					) {
						return -1;
					}
					return 0;
				});
				data.forEach((item) => {
					let isProcesed = "";
					let val;
					storage.data.production.forEach((a) => {
						if (a.id === item.id) {
							isProcesed = "procesed";
							val = a.count;
							console.log(val, a.count);
						}
					});

					let prodItem = get.elements({
						el: "div",
						className: `production-item-wraper ${isProcesed}`,
						children: [
							{
								el: "div",
								className: "item-head",
								children: [
									{
										el: "button",
										className: "get-to-production-btn",
										text: "Взяти в виробництво",
										event: "click",
										data: [{ id: item.id }],
										hendler: hendlers.getToProduction,
									},

									{
										el: "input",
										type: "number",
										value: val,
										className: `item-input ${isProcesed}`,
										placeholder: "Кількість",
									},
								],
							},

							{
								el: "div",
								className: "production-content-wraper",
								children: [
									{
										el: "p",
										className: "production-item-head",
										text: item.name,
										children: [
											{
												el: "span",
												className: "component-item-article",
												text: item.article,
											},
										],
									},
									{
										el: "div",
										className: "production-item-place danger",
										text: `Місце:${item.place} | Cell: ${item.cell}`,
									},
									{
										el: "div",
										className: "flex-container",
										children: [
											{
												el: "img",
												src: item.img,
												className: "prodction-item-img",
											},
											{
												el: "div",
												className: "text-wraper",

												children: Object.values(item.components).map((part) => {
													return {
														el: "div",
														className: "component-wraper",
														children: Object.values(part)
															.map((desc, index) => {
																return {
																	el: "p",
																	className: "desc",
																	text: `${descNames[index]}: ${desc}`,
																};
															})
															.concat({
																el: "button",
																className: "add-btn",
																text: "Взяти",
																event: "click",
																hendler: hendlers.addToList,
															}),
													};
												}),
											},
										],
									},
									{
										el: "button",
										className: "product-btn",
										text: "Виготовити",
										event: "click",
										data: [{ id: item.id }],
										hendler: hendlers.product,
									},
								],
							},
						],
					});
					prodctionWraper.appendChild(prodItem);
				});

				return prodctionWraper;
			} else {
				return generate.message("Немає виробництва.");
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
										text: "Статус:",
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
			generate.preloader({ status: "end" });
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
						data: [{ id: item.id }],
						hendler: hendlers.order,
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
									{
										el: "p",
										className: "position-quality success",
										text: item.quality,
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
			if (Object.keys(storage.data.compareArray).length > 0) {
				Object.keys(storage.data.compareArray)
					.reverse()
					.forEach((item) => {
						let difference =
							storage.data.compareArray[item].count.realCount -
							(storage.data.compareArray[item].count.baseCount +
								storage.data.compareArray[item].count.orderCount);
						let isProcesed = { text: "Обробити" };
						if (storage.data.compareArray[item].isProcesed) {
							isProcesed.class = "success";
							isProcesed.text = "Оброблено";
						}
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
							className: `compare-item ${isProcesed.class}`,
							style: drawDifference(),
							children: [
								{
									el: "button",
									className: "del-btn btn",
									event: "click",
									hendler: hendlers.removeItem,
									data: [{ article: item }, { arr: "compareArray" }],
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
									href: storage.data.compareArray[item].photoLG,
									event: "click",
									hendler: hendlers.showImage,
									children: [
										{
											el: "img",
											className: "item-image",
											src: storage.data.compareArray[item].photo,
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
											text: `${storage.data.compareArray[item].addingDate.day
												}.${storage.data.compareArray[item].addingDate.month}.${storage.data.compareArray[item].addingDate.year
												}   ${storage.data.compareArray[item].addingDate.hours}:${storage.data.compareArray[item].addingDate.minutes
												}:${storage.data.compareArray[item].addingDate.seconds
												}| ${storage.data.addresses[item]?.place ?? "Ще не Збережено"
												}`,
										},
										{
											el: "div",
											className: "item-count",
											children: [
												{
													el: "p",
													className: "item-count",
													text: `По базі: ${storage.data.compareArray[item].count.baseCount}`,
												},
												{
													el: "p",
													className: "item-count",
													text: `Резерв: ${storage.data.compareArray[item].count.orderCount}`,
												},
												{
													el: "p",
													className: "item-count",
													text: `Всього: ${storage.data.compareArray[item].count.realCount}`,
												},
												{
													el: "p",
													className: "item-count",
													text: `Різниця: ${difference}`,
												},
											],
										},
										{
											el: "p",
											className: "item-article",
											text: item,
										},
										{
											el: "p",
											className: "item-head",
											text: storage.data.compareArray[item].head,
										},
										{
											el: "button",
											className: "procesed-btn",
											text: isProcesed.text,
											data: [{ article: item }, { arr: "compareArray" }],
											event: "click",
											hendler: hendlers.procesed,
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
			if (Object.keys(storage.data.listArray).length > 0) {
				let listWraper = get.elements({ el: "div", className: "list-wraper" });
				Object.keys(storage.data.listArray)
					.reverse()
					.forEach((item) => {
						console.log(storage.data.listArray[item].addingDate);
						let isProcesedText = "Обробити",
							isProcesedClass = ``;
						if (storage.data.listArray[item].isProcesed) {
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
									data: [{ article: item }, { arr: "listArray" }],
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
									href: storage.data.listArray[item].photoLG,
									children: [
										{
											el: "img",
											className: "item-image",
											src: storage.data.listArray[item].photo,
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
											text: `${storage.data.listArray[item].addingDate.day}.${storage.data.listArray[item].addingDate.month
												}.${storage.data.listArray[item].addingDate.year}  ${storage.data.listArray[item].addingDate.hours
												}:${storage.data.listArray[item].addingDate.minutes}:${storage.data.listArray[item].addingDate.seconds
												}|${storage.data.addresses[item]?.place ?? "Ще не Збережено"
												} `,
										},
										{
											el: "p",
											className: "item-article",
											text: item,
										},
										{
											el: "p",
											className: "item-head",
											text: `Кількість по базі: ${storage.data.listArray[item].count.baseCount}`,
										},
										{
											el: "p",
											className: "item-head",
											text: storage.data.listArray[item].head,
										},
										{
											el: "button",
											className: "procesed-btn",
											text: isProcesedText,
											data: [{ article: item }, { arr: "listArray" }],
											event: "click",
											hendler: hendlers.procesed,
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
			contentWraper.innerHTML = "";
			if (data.length > 0) {
				let searchInp = document.querySelector(".search-inp").value;
				data.forEach((item) => {
					let storage_item_data = storage.data.addresses[item.article];
					console.log(storage_item_data);
					let reserve_count_class = "",
						base_count_class = "";
					if (item.baseCount.baseCount < 1) {
						base_count_class = "danger";
					}
					if (item.baseCount.orderCount > 0) {
						reserve_count_class = "danger";
					}
					if (
						searchInp !== "" &&
						searchInp.match(regExp.cell) &&
						storage_item_data?.cell !== searchInp
					) {
						console.log(storage_item_data?.cell !== searchInp);
						storage.address({ article: item.article, cell: searchInp });
					}
					storage_item_data.last_goods_count = item.baseCount.baseCount;
					let searchItem = get.elements({
						el: "div",
						className: "item-wraper",
						data: [{ id: item.id }],
						children: [
							{
								el: "div",
								className: "item-header",

								children: [
									{
										el: "span",
										className: "start",
										text: `ID: ${item.id} | Артикул: ${item.article} `,
									},
									{
										el: "input",
										type: "checkbox",
										className: "status-check",
										event: "click",
										hendler: hendlers.check,
									},
								],
							},
							{
								el: "div",
								className: "item-place danger",
								text: `Місце: ${storage_item_data?.place ?? "Ще не збережено"
									} |  Cell: ${storage_item_data?.cell ?? "Ще не збережено"}`,
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
										hendler: hendlers.showImage,
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
										className: "item-text-wraper",
										children: [
											{
												el: "div",
												className: "item-count",
												children: [
													{
														el: "p",
														className: `count base-count ${base_count_class}`,
														text: `Кількість По Базі: ${item.baseCount.baseCount}`,
													},
													{
														el: "p",
														className: `count reserve-count ${reserve_count_class}`,
														text: `Резерв: ${item.baseCount.orderCount}`,
													},
												],
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
								className: "cell-capacity-display",
								children: [
									{
										el: "p",
										className: "cell-capacity-desc",
										text: `Кількість товару в комірці ${storage_item_data?.real_goods_count || 0
											} шт. з можливих ${storage_item_data?.cell_capacity || 0
											} шт.`,
									},
									{
										el: "p",
										className: "cell-capacity-bar-wraper",
										children: [
											{
												el: "div",
												className: "cell-capacity-bar",
												style: {
													width: `${get.percent({
														main: storage_item_data?.cell_capacity || 0,
														num: storage_item_data?.real_goods_count || 0,
													})}%`,
												},
											},
										],
									},
								],
							},
							{
								el: "div",
								className: "cell-capacity-wraper",
								children: [
									{
										el: "button",
										className: "cell-btn fill",
										text: "Заповнити Комірку",
										event: "click",
										data: [{ article: item.article }],
										hendler: hendlers.fill_cell,
									},
									{
										el: "butoon",
										className: "cell-btn ignore",
										text: "Ігнорувати артикул",
										event: "click",
										data: [{ article: item.article }],
										hendler: hendlers.ignore_article,
									},
									{
										el: "input",
										className: "cell-input",
										placeholder: "Місткість комірки",
										data: [{ article: item.article }],
										type: "number",
										value: storage_item_data?.cell_capacity,
										event: "input",
										hendler: hendlers.set_cell_capacity,
									},
								],
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
										data: [{ article: item.article }],
										hendler: function () {
											hendlers.add_to_list.call(this, item);
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
												data: [{ article: item.article }],
												hendler: function () {
													hendlers.add_to_compare.call(this, item);
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
											if (footer.classList.contains("active-reserve")) {
												footer.innerHTML = "";
												footer.classList.toggle("active-reserve");
												return;
											}
											let reserve = load.reserve({ id: item.id });
											footer.classList.toggle("active-reserve");
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
											if (footer.classList.contains("active-sales")) {
												footer.innerHTML = "";
												footer.classList.toggle("active-sales");
												return;
											}
											let sales = load.sales({ id: item.id });

											footer.innerHTML = "";
											footer.classList.toggle("active-sales");

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
											if (footer.classList.contains("active-arrival")) {
												footer.innerHTML = "";
												footer.classList.toggle("active-arrival");
												return;
											}
											let deliveries = load.deliveries({ id: item.id });
											footer.classList.toggle("active-arrival");
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
									{
										el: "p",
										className: "table-text",
										event: "click",
										hendler: hendlers.elaborationOrder,
										text: item.order,
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
										hendler: hendlers.elaborationSearch,
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
										className: "table-desc",
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
												hendler: hendlers.checkAnswer,
												id: `elaborationInput${get.orderId(item.order)}`,
											},
											{
												el: "button",
												className: "send-btn",
												event: "click",
												data: [
													{ order: get.orderId(item.order) },
													{ count: item.count.baseCount },
												],
												hendler: hendlers.addElaborationAnswer,
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
									{
										el: "p",
										className: "image-desc ",
										text: "Фото товару.",
									},
									{
										el: "div",
										className: "image-wraper",
										children: item.imagesSrc.map((source, index) => {
											return {
												el: "a",
												event: "click",
												hendler: hendlers.showImage,
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
										data: [{ id: item.goodId }],
										hendler: hendlers.elaborationReserve,
									},
									{
										el: "button",
										className: "arrival-btn btn",
										text: "Приход",
										event: "click",

										data: [{ id: item.goodId }],
										hendler: hendlers.elaborationArrival,
									},
									{
										el: "button",
										className: "sales-btn btn",
										text: "Продажі",
										event: "click",

										data: [{ id: item.goodId }],
										hendler: hendlers.elaborationSales,
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
		question: function (data) {
			console.log(data);
			if (data.length > 0) {
				let questionsWraper = get.elements({
					el: "div",
					className: "questions-wraper",
				});
				data.forEach((item) => {
					if (item.id == undefined) {
						return;
					}
					questionsWraper.appendChild(
						get.elements({
							el: "div",
							className: "table-wraper question",
							children: [
								{
									el: "div",
									className: "table-row",
									children: [
										{
											el: "p",
											className: "table-desc ",
											text: "Товар",
										},
										{
											el: "p",
											className: "table-text question",
											text: item.goodsDesc,
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
											text: "Адрес:",
										},
										{
											el: "p",
											className: "table-text",
											text:
												storage.data.addresses[
													get.elaborationArtice(item.goodsDesc)
												]?.place || "Не збережено",
										},
									],
								},
								{
									el: "div",
									className: "table-row",
									children: [
										{
											el: "p",
											className: "table-desc question",
											text: "Питання",
										},
										{
											el: "p",
											className: "table-text question",
											text: item.question,
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
											text: "Додаткова інформація",
										},
										{
											el: "p",
											className: "table-text",
											text: item.questionManager,
										},
									],
								},
								{
									el: "div",
									className: "table-row area-wraper",
									children: [
										{
											el: "textarea",
											className: "answer-area table-input",
											placeholdrer: "Відповідь на питання",
										},
										{
											el: "button",
											className: "answer-btn",
											event: "click",
											data: [{ id: item.id }],
											hendler: hendlers.sendQuestion,
											children: [
												{
													el: "img",
													alt: "Відправити Відповідь.",
													src: get.url(src.ico.send),
												},
											],
										},
									],
								},
							],
						})
					);
				});
				return questionsWraper;
			}
			return this.message("Зараз немає питань");
		},
		requestCount: function () {
			let countData = {};
			load.requestCount().then((data) => {
				let elaborationCounter = document.querySelector(".elabortion-count");
				let questionCounter = document.querySelector(".question-count");
				countData.questions = data[0].questionsCount;
				countData.elaboration = data[0].elaborationsCount;
				if (countData.elaboration !== null && countData.elaboration > 0) {
					elaborationCounter.style.display = "block";
					elaborationCounter.textContent = countData.elaboration;
				} else {
					elaborationCounter.style.display = "none";
				}
				if (countData.questions !== null && countData.questions > 0) {
					questionCounter.style.display = "block";
					questionCounter.textContent = countData.questions;
				} else {
					questionCounter.style.display = "none";
				}
			});
		},
		tasksCount: function () {
			let listCount = 0,
				compareCount = 0,
				productionCount = 0;
			if (Object.keys(storage.data.compareArray).length > 0) {
				Object.keys(storage.data.compareArray).forEach((item) => {
					if (!storage.data.compareArray[item].isProcesed) {
						compareCount++;
					}
				});
			}
			if (Object.keys(storage.data.listArray).length > 0) {
				Object.keys(storage.data.listArray).forEach((item) => {
					if (!storage.data.listArray[item].isProcesed) {
						listCount++;
					}
				});
			}

			if (storage.data.production.length > 0) {
				storage.data.production.forEach((item) => {
					console.log(item.isProcesed);
					if (!item.isProcessed) {
						productionCount++;
					}
				});
			}

			if (listCount > 0) {
				document.querySelector(".list-count").style.display = "block";
				document.querySelector(".list-count").textContent = listCount;
			} else {
				document.querySelector(".list-count").style.display = "none";
			}

			if (compareCount > 0) {
				document.querySelector(".compare-count").style.display = "block";
				document.querySelector(".compare-count").textContent = compareCount;
			} else {
				document.querySelector(".compare-count").style.display = "none";
			}

			if (productionCount > 0) {
				document.querySelector(".production-count").style.display = "block";
				document.querySelector(".production-count").textContent =
					productionCount;
			} else {
				document.querySelector(".production-count").style.display = "none";
			}
		},
		history: function () {
			contentWraper.innerHTML = "";
			contentWraper.appendChild(
				get.elements({
					el: "div",
					className: "history-wraper",
					children: [
						{
							el: "div",
							className: "history-item saved-articles",
							text: `Збережено Артикулів: ${Object.keys(storage.data.addresses).length
								}`,
						},
						{
							el: "div",
							className: "history-item elaboration",
							text: `Відбито Уточнень: ${Object.keys(storage.data.elaborations).length
								}`,
						},
						{
							el: "div",
							className: "history-item production",
							text:
								"Виготовлено продукції: " +
								Object.keys(storage.data.production).length,
						},
						{
							el: "div",
							className: "history-item cells_list",
							text: "Стелажі",
							event: "click",
							hendler: hendlers.show_stilages,
						},
						{
							el: "div",
							className: "history-item empty-cells",
							text: "Пусті комірки",
							event: "click",
							hendler: hendlers.show_empty_cells,
						},
					],
				})
			);
		},
		empty_cells: function (data) {
			contentWraper.innerHTML = "";
			if (data.length === 0) {
				contentWraper.appendChild(
					get.elements({
						el: "div",
						className: "message-title content-title",
						text: "Пусті комірки не знайдені!!!",
					})
				);
			}
			let orders = { main_orders: 0, checked_orders: 0 };
			orders.main_orders = Object.keys(storage.data.orders).length;
			Object.keys(storage.data.orders).forEach((item) => {
				if (!storage.data.orders[item].is_new) {
					orders.checked_orders++;
				}
			});
			contentWraper.appendChild(
				get.elements({
					el: "div",
					className: "empty-cells-wraper",
					children: [
						{
							el: "p",
							className: "empty-cells-description",
							text: `Перевірено Замовлень: ${orders.checked_orders} / ${orders.main_orders} | Остання перевірка була о ${storage.data.settings.last_check.hours}:${storage.data.settings.last_check.minutes}`,
						},
						{
							el: "ul",
							className: "empty-items-wraper",
							children: data.map((item) => {
								let real_count = storage.data.addresses[item].real_goods_count;
								let cell_capacity = storage.data.addresses[item].cell_capacity;

								let percent = get.percent({
									num: real_count,
									main: cell_capacity,
								});
								return {
									el: "li",
									className: "empty-cell-item",
									children: [
										{
											el: "p",
											className: "empty-cell-description",
											children: [
												{
													el: "span",
													className: "empty-cell-article",
													text: item,
												},
												{
													el: "span",
													className: "empty-cell-place",
													text: storage.data.addresses[item].place,
												},
												{
													el: "span",
													className: "empty-cell-data",
													text: `Ємність комірки:${cell_capacity} Реальна кількість: ${real_count} Заповнено на: (${percent.toFixed(
														1
													)}%)`,
												},
											],
										},
										{
											el: "button",
											className: "add-btn",
											text: "Заповнити комірку",
											event: "click",
											data: [{ article: item }],
											hendler: hendlers.fill_cell,
										},
									],
								};
							}),
						},
						{
							el: "button",
							className: "search-empty_cells btn",
							text: "Пошук пустих комірок",
							event: "click",
							hendler: hendlers.find_empty_cells,
						},
					],
				})
			);
		},
	};

	function barcodeRecognition() {
		let barCodeSearch = document.querySelector(".bar-code-search-btn");
		let barcodeDisplayWraper = document.querySelector(
			".barcode-display-wraper"
		);
		let html5QrcodeScanner = new Html5QrcodeScanner("reader", {
			fps: 8,
			qrbox: 250,
		});

		let lastResult,
			countResults = 0;
		function onScanSuccess(decodedText) {
			if (decodedText !== lastResult) {
				++countResults;
				lastResult = decodedText;
				let searchInp = document.querySelector(".search-inp");
				searchInp.value = decodedText;
				let serarchBtn = document.querySelector(".search-send-btn");
				if (decodedText.match(regExp.cell) !== null) {
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

				const res = await response.text();
				try {
					return get.parser(res);
				} catch (parseError) {
					console.error("Parsing error:", parseError);
					return res;
				}
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
				data.count = get.goodsCount(
					goodsCount[index].textContent.trim()
				).baseCount;
				data.baseCount = get.goodsCount(goodsCount[index].textContent.trim());
				this.storage.push(data);
			});

			return get.mergeSort(this.storage);
		},
		orders: async function (data) {
			this.storage = [];
			const orders = await this.fetch({
				url: url.orders,
				method: "POST",
				body: data,
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
				let quality;

				if (td.length > 7) {
					td.shift();
				}

				if (td.length > 5) {
					if (td[4].querySelector("input")) {
						quality = td[4].querySelector("input[type='text']").value;
					} else {
						quality = td[4].textContent;
					}
					let checkStyle = td[0].getAttribute("style");

					if (checkStyle.includes("background-color:#d7cafb;")) {
						return;
					}

					let rowData = {};
					let base_quality_div = td[2].querySelectorAll("div")[4];
					let base_quality = 0;
					if (base_quality_div != undefined && base_quality_div !== null) {
						base_quality = base_quality_div.textContent.trim();
					}

					rowData.imgSrc = td[1].querySelector("img").src;
					Array.from(td[2].children).forEach((child) => {
						child.textContent = "";
					});
					rowData.base_quality = base_quality;
					rowData.positionName = td[2].textContent.trim();
					rowData.articleAndPlace = get.articleAndPlacement(
						td[3].textContent.trim()
					);
					rowData.quality = quality.trim();
					rowData.price = td[5].textContent.trim();
					console.log(rowData);
					this.storage.push(rowData);
				}
			});

			return this.storage;
		},
		production: async function () {
			this.storage = [];
			const production = await this.fetch({
				url: url.production,
				method: "POST",
			});
			let table = production.querySelector("table tbody");

			let rows = Array.from(table.children);
			rows.shift();

			rows.forEach((item, index) => {
				let rowData = {};
				let table = item.querySelector("table");
				if (table) {
					let th = Array.from(rows[index - 1].querySelectorAll("td"));
					let td = Array.from(rows[index].querySelectorAll("td"));
					let componentRows = Array.from(td[1].querySelectorAll("table tr"));
					componentRows.shift();
					componentRows.pop();
					componentRows.pop();
					rowData.id = th[1].textContent;
					rowData.name = th[2].textContent;
					rowData.place =
						storage.data.addresses[th[3].textContent]?.place ??
						"Ще не збережено";
					rowData.cell =
						storage.data.addresses[th[3].textContent]?.cell ??
						"Ще не збережено";
					rowData.article = th[3].textContent;
					rowData.img = td[0].querySelector("img").src;
					rowData.components = componentRows.map((item) => {
						let obj = {};
						let componentData = Array.from(item.querySelectorAll("td"));
						componentData.shift();
						obj.name = componentData[0].textContent.trim();
						obj.place =
							storage.data.addresses[componentData[1].textContent.trim()]
								?.place ?? "Ще не збережено";
						obj.article = componentData[1].textContent.trim();
						obj.count = componentData[3].textContent.trim();
						obj.availability = componentData[5].textContent.trim();
						obj.enough = componentData[6].textContent.trim();
						return obj;
					});
					this.storage.push(rowData);
				}
			});
			return this.storage;
		},
		requestCount: async function () {
			this.storage = [];
			let requests = { questionsCount: 0, elaborationsCount: 0 };

			const requestCount = await this.fetch({
				url: url.baza,
				method: "POST",
			});

			let divs = Array.from(requestCount.querySelectorAll("div"));

			divs.forEach((item) => {
				let questionCount = item.textContent.match(regExp.question);
				let elaborationsCount = item.textContent.match(regExp.elaboration);
				if (questionCount !== null) {
					requests.questionsCount = questionCount[1];
				}
				if (elaborationsCount !== null) {
					requests.elaborationsCount = elaborationsCount[1];
				}
			});

			if (divs.length == 0) {
				console.log(divs.length);
				this.logOut();
				return;
			}

			this.storage.push(requests);
			return this.storage;
		},

		elaborations: async function (data) {
			this.storage = [];
			const elaborations = await this.fetch({
				url: url.elaborations,
				method: "POST",
			});

			const rows = Array.from(elaborations.querySelectorAll("table tbody tr"));
			let sortByPlace = (a, b) => {
				let placeA = a.place.toUpperCase();
				let placeB = b.place.toUpperCase();
				if (placeA < placeB) return -1;
				if (placeA > placeB) return 1;
				return 0;
			};
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
							elaborationData.goodId = get.article(item.textContent.trim()).id;
							elaborationData.imagesSrc = imgSrc;
							elaborationData.imageLink = imgLink;
							elaborationData.count = get.goodsCount(
								countData.textContent.trim()
							);
						}
					});
					return elaborationData;
				})
			);
			elaborationsList.sort(sortByPlace);
			this.storage = elaborationsList;
			console.log(this.storage);
			return this.storage;
		},
		questions: async function (data) {
			this.storage = [];
			const questions = await this.fetch({
				url: url.getQuestion,
				method: "POST",
			});
			let tr = Array.from(questions.querySelectorAll("table tr"));
			tr.shift();
			if (tr.length > 0) {
				tr.forEach((row) => {
					let data = {};
					let item = row.querySelectorAll("td");

					try {
						data.goodsDesc = item[0].textContent.trim();
						data.questionManager = item[1].getAttribute("title").trim();
						data.question = item[1].textContent.trim();

						let inputElement = item[2].querySelector("input[type='text']");
						if (inputElement) {
							data.id = inputElement.id.match(/(\d+)/)[1];
						} else {
							throw new Error("Елемент input[type='text'] не знайдено");
						}

						data.questionOrder = item[3].textContent.trim();
						this.storage.push(data);
					} catch (error) {
						console.error("Помилка обробки рядка:", error.message);

						return;
					}
				});
			}
			return this.storage;
		},
		get_stilages: async function () {
			let places = {};
			let count = 0;
			let areas = {};
			let load_stilages_id = await this.fetch({
				url: url.stilages,
				method: "POST",
			});
			let id_tr = Array.from(load_stilages_id.querySelectorAll("table tr"));
			id_tr.shift();
			let places_id = [];
			let stilages_data;

			id_tr.forEach((item) => {
				let area = item.querySelectorAll("td")[1].textContent.trim();
				areas[area] = {};
				places_id.push(item.querySelector("td").textContent.trim());
			});

			if (places_id.length === 0) {
				return;
			}

			stilages_data = await Promise.all(
				places_id.map(async (item) => {
					let stilages = await this.fetch({
						url: url.stilagesZones,
						method: "POST",
						body: { zone: item },
					});
					let rows = Array.from(stilages.querySelectorAll("table tbody tr"));
					rows.shift();
					let stilage = rows.map((item) => {
						let td = Array.from(item.querySelectorAll("td"));
						return {
							id: td[0].textContent,
							number: td[1].textContent,
							zone: td[3].textContent,
						};
					});
					return stilage;
				})
			);

			await Promise.all(
				stilages_data.flat().map(async (stilage_item) => {
					let cells = [];
					let stilage = await this.fetch({
						url: url.stilage,
						method: "POST",
						body: { id: stilage_item.id },
					});
					let stilage_rows = Array.from(
						stilage.querySelectorAll("table tbody tr")
					);
					let zoneKey = stilage_item.zone;
					let stilageItem = stilage_item.number;
					areas[zoneKey][stilageItem] = {};
					stilage_rows.forEach((place_item) => {
						let td = Array.from(place_item.querySelectorAll("td"));
						td.forEach((item) => {
							cells.push(item);
						});
					});

					cells.forEach((data) => {
						if (data.textContent.trim().includes(".")) {
							let cell_name = data.textContent.trim();
							let str = data.getAttribute("title")?.trim() || null;
							let articles;
							let place = `${zoneKey}-${stilageItem}.${cell_name}`.trim();
							if (str !== null) {
								articles = str.match(new RegExp(regExp.article, "gim"));
							}

							if (articles !== null && articles !== undefined) {
								places[place] = articles;
							}

							areas[zoneKey][stilageItem][cell_name] = articles;
						}
					});
				})
			);

			let int = setInterval(() => {
				let key = Object.keys(places)[count];
				places[key].forEach((item) => {
					storage.address({
						article: item.trim(),
						place: Object.keys(places)[count],
					});
				});

				if (count === Object.keys(places).length - 1) {
					count = 0;
					alert("Завершено");
					clearInterval(int);
				} else {
					count++;
				}
			}, 2);

			console.log(places);
			return areas;
		},
		get_goods_count: async function () {
			let preloader_indicator = get.elements({
				el: "div",
				className: "checking-indicator",
				children: [
					{
						el: "p",
						className: "indecator-desc",
						text: "Триває Перевірка замовлень",
					},
					{
						el: "img",
						src: get.url(src.ico.spiner),
					},
				],
			});
			contentWraper.appendChild(preloader_indicator);
			let orders = await this.fetch({
				url: url.orders,
				method: "POST",
				body: { status: 4 },
			});

			let tr = Array.from(orders.querySelectorAll("table tbody tr"));
			tr.shift();
			tr.forEach((item) => {
				let td = Array.from(item.querySelectorAll("td"));
				if (td.length < 5) {
					return;
				}
				if (
					td[3].textContent === "чекає відправки" &&
					td[2].textContent !== "****** (***** *****)" &&
					td[4].textContent !== "******"
				) {
					let order_id = td[0].textContent.trim();
					if (!storage.data.orders[order_id]) {
						storage.data.orders[order_id] = {
							is_new: true,
							order_date: get.date(),
						};
						storage.save();
					}
				}
			});

			for (const order_id of Object.keys(storage.data.orders)) {
				if (storage.data.orders[order_id].is_new) {
					let response = await this.order({ id: order_id });
					console.log(response);
					response.forEach((item) => {
						if (item.questionsCount >= 0) {
							return;
						}
						let article = item.articleAndPlace.article;
						let storage_article = storage.data.addresses[article];
						let quality = item.quality.match(regExp.num)[0];

						if (
							storage_article == null ||
							storage_article == undefined ||
							quality >= storage_article.cell_capacity
						) {
							return;
						}
						storage_article.last_goods_count = item.base_quality;
						if (storage_article.real_goods_count) {
							storage_article.real_goods_count =
								Number(storage_article.real_goods_count) - Number(quality);
						}
					});
					await new Promise((resolve) => setTimeout(resolve, 250));
				}
			}
			storage.data.settings = {
				last_check: get.date(),
			};
			preloader_indicator.remove();
			storage.save();
		},

		logOut: function () {
			document.cookie = "login=null";
			document.cookie = "hash=null";
			window.location.reload();
		},
	};

	// check elaborations count
	setInterval(() => {
		generate.requestCount();
	}, interval.elaboration);
	// checking empty cells
	setInterval(() => {
		load.get_goods_count();
	}, interval.cell_goods_count);
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
				hendler: hendlers.questions,
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
					generate.preloader({ status: "start" });
					let orders = load.orders();
					orders.then((data) => {
						generate.preloader({ status: "end" });
						let mainWraper = document.querySelector(".wraper");
						mainWraper.innerHTML = "";
						mainWraper.appendChild(generate.orders(data));
					});
				},
				children: [{ el: "img", src: get.url(src.ico.orders) }],
			},
			{
				el: "button",
				className: "production-btn btn",
				event: "click",
				hendler: hendlers.production,
				children: [
					{
						el: "span",
						className: "production-count counter",
					},
					{
						el: "img",
						src: get.url(src.ico.production),
						alt: "Виробництво",
					},
				],
			},
			{
				el: "button",
				className: "history-btn btn",
				event: "click",
				hendler: generate.history,
				children: [
					{
						el: "img",
						src: get.url(src.ico.history),
						alt: "Історія",
					},
				],
			},
			{
				el: "button",
				className: "log-out-btn btn",
				event: "click",
				hendler: load.logOut,
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
	function check_last_check() {
		let last_check_time = storage.data.settings.last_check;
		if (last_check_time == undefined) {
			storage.data.settings.last_check = {
				year: 0,
				month: 0,
				day: 0,
				hours: 0,
				minutes: 0,
			};
			last_check_time = storage.data.settings.last_check;
		}
		let current_date = get.date();
		if (
			storage.data.orders !== undefined &&
			Object.keys(storage.data.orders).length !== 0
		) {
			Object.keys(storage.data.orders).forEach((item) => {
				if (storage.data.orders[item].order_date.day !== current_date.day) {
					delete storage.data.orders[item];
				}
			});
		}

		if (last_check_time) {
			let hours_difference = current_date.hours - last_check_time.hours;
			let minutes_difference = current_date.minutes - last_check_time.minutes;

			let time_difference =
				(hours_difference * 60 + minutes_difference + 1440) % 1440;

			if (time_difference > 30) {
				load.get_goods_count();
			}
		}
	}

	check_last_check();

	let btnWraper = get.elements(buttons);
	document.body.appendChild(searchWraper);
	document.body.appendChild(contentWraper);
	document.body.appendChild(btnWraper);
	generate.requestCount();
	generate.tasksCount();
});
