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
`;
	preloaderWraper.appendChild(preloaderSpiner);
	let searchWraper = document.createElement("div");
	searchWraper.className = "search-wraper";
	let searchInp = document.createElement("input");
	searchInp.className = "search-inp";
	searchInp.placeholder = "Пошук";
	let barCodeSearch = document.createElement("button");
	barCodeSearch.className = "bar-code-search-btn";
	barCodeSearch.innerHTML = `<?xml version="1.0" encoding="iso-8859-1"?>

<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg fill="#000000" height="40px" width="40px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 60 60" xml:space="preserve">
<g>
	<path d="M5,49c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v37C4,48.553,4.448,49,5,49z"/>
	<path d="M55,49c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v37C54,48.553,54.448,49,55,49z"/>
	<path d="M9,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C8,40.553,8.448,41,9,41z"/>
	<path d="M12,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C11,40.553,11.448,41,12,41z"/>
	<path d="M17,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C16,40.553,16.448,41,17,41z"/>
	<path d="M20,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C19,40.553,19.448,41,20,41z"/>
	<path d="M23,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C22,40.553,22.448,41,23,41z"/>
	<path d="M29,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C28,40.553,28.448,41,29,41z"/>
	<path d="M34,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C33,40.553,33.448,41,34,41z"/>
	<path d="M37,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C36,40.553,36.448,41,37,41z"/>
	<path d="M42,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C41,40.553,41.448,41,42,41z"/>
	<path d="M45,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C44,40.553,44.448,41,45,41z"/>
	<path d="M51,41c0.552,0,1-0.447,1-1V11c0-0.553-0.448-1-1-1s-1,0.447-1,1v29C50,40.553,50.448,41,51,41z"/>
	<path d="M9,47c0.552,0,1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1v1C8,46.553,8.448,47,9,47z"/>
	<path d="M12,47c0.552,0,1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1v1C11,46.553,11.448,47,12,47z"/>
	<path d="M15,47c0.552,0,1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1v1C14,46.553,14.448,47,15,47z"/>
	<path d="M17,45v1c0,0.553,0.448,1,1,1s1-0.447,1-1v-1c0-0.553-0.448-1-1-1S17,44.447,17,45z"/>
	<path d="M20,45v1c0,0.553,0.448,1,1,1s1-0.447,1-1v-1c0-0.553-0.448-1-1-1S20,44.447,20,45z"/>
	<path d="M23,45v1c0,0.553,0.448,1,1,1s1-0.447,1-1v-1c0-0.553-0.448-1-1-1S23,44.447,23,45z"/>
	<path d="M27,47c0.552,0,1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1v1C26,46.553,26.448,47,27,47z"/>
	<path d="M29,45v1c0,0.553,0.448,1,1,1s1-0.447,1-1v-1c0-0.553-0.448-1-1-1S29,44.447,29,45z"/>
	<path d="M33,47c0.552,0,1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1v1C32,46.553,32.448,47,33,47z"/>
	<path d="M35,46c0,0.553,0.448,1,1,1s1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1V46z"/>
	<path d="M38,46c0,0.553,0.448,1,1,1s1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1V46z"/>
	<path d="M42,47c0.552,0,1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1v1C41,46.553,41.448,47,42,47z"/>
	<path d="M45,47c0.552,0,1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1v1C44,46.553,44.448,47,45,47z"/>
	<path d="M48,47c0.552,0,1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1v1C47,46.553,47.448,47,48,47z"/>
	<path d="M51,47c0.552,0,1-0.447,1-1v-1c0-0.553-0.448-1-1-1s-1,0.447-1,1v1C50,46.553,50.448,47,51,47z"/>
	<path d="M0,5v50h60V5H0z M58,53H2V7h56V53z"/>
</g>
</svg>`;

	let searchSendBtn = document.createElement("input");
	searchSendBtn.className = "search-send-btn";
	searchSendBtn.type = "submit";
	searchSendBtn.value = "Пошук";
	let barcodeDisplayWraper = document.createElement("div");
	barcodeDisplayWraper.className = "barcode-display-wraper";
	let barcodeDisplay = document.createElement("div");
	barcodeDisplay.className = "barcode";
	barcodeDisplay.id = "reader";
	barcodeDisplayWraper.appendChild(barcodeDisplay);

	searchWraper.appendChild(searchInp);
	searchWraper.appendChild(barCodeSearch);
	searchWraper.appendChild(searchSendBtn);
	searchWraper.appendChild(barcodeDisplayWraper);


	// URL
	let bazaURL = "https://baza.m-p.in.ua/ajax/magaz.php";
	let elaborationURL = "https://baza.m-p.in.ua/ajax/loadElaboration.php";
	let addElaborationURL =
		"https://baza.m-p.in.ua/ajax/addElaborationAnswer.php";
	let questionURL = "https://baza.m-p.in.ua/ajax/loadQuestions.php";

	let searchURL = "https://baza.m-p.in.ua/ajax/search.php";
	let openOrderURL = "https://baza.m-p.in.ua/ajax/order_cont.php";
	let getReserveURL = "https://baza.m-p.in.ua/ajax/podrRezerv.php";
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
	// question btn
	let questionBtn = document.createElement("button");
	questionBtn.className = "question-btn btn";
	questionBtn.innerHTML = `<?xml version="1.0" encoding="iso-8859-1"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0px" y="0px"
	 viewBox="0 0 100 100" style="enable-background:new 0 0 92 92;" xml:space="preserve">
<g>
	<path style="fill:#fff;" d="M45.386,0.004C19.983,0.344-0.333,21.215,0.005,46.619c0.34,25.393,21.209,45.715,46.611,45.377
		c25.398-0.342,45.718-21.213,45.38-46.615C91.656,19.986,70.786-0.335,45.386,0.004z M45.25,74l-0.254-0.004
		c-3.912-0.116-6.67-2.998-6.559-6.852c0.109-3.788,2.934-6.538,6.717-6.538l0.227,0.004c4.021,0.119,6.748,2.972,6.635,6.937
		C51.904,71.346,49.123,74,45.25,74z M61.705,41.341c-0.92,1.307-2.943,2.93-5.492,4.916l-2.807,1.938
		c-1.541,1.198-2.471,2.325-2.82,3.434c-0.275,0.873-0.41,1.104-0.434,2.88l-0.004,0.451H39.43l0.031-0.907
		c0.131-3.728,0.223-5.921,1.768-7.733c2.424-2.846,7.771-6.289,7.998-6.435c0.766-0.577,1.412-1.234,1.893-1.936
		c1.125-1.551,1.623-2.772,1.623-3.972c0-1.665-0.494-3.205-1.471-4.576c-0.939-1.323-2.723-1.993-5.303-1.993
		c-2.559,0-4.311,0.812-5.359,2.478c-1.078,1.713-1.623,3.512-1.623,5.35v0.457H27.936l0.02-0.477
		c0.285-6.769,2.701-11.643,7.178-14.487C37.947,18.918,41.447,18,45.531,18c5.346,0,9.859,1.299,13.412,3.861
		c3.6,2.596,5.426,6.484,5.426,11.556C64.369,36.254,63.473,38.919,61.705,41.341z"/>

</svg>
`;
	let questionCountText = document.createElement("span");
	questionCountText.className = "question-count-text counter";
	questionBtn.appendChild(questionCountText);
	elaborationBtn.appendChild(elabortionCount);
	// patterns
	let elaborationPattern = /Є уточнення: (\d+) шт\./;
	let questionPattern = /Є питання: (\d+) шт\./;
	let regexArticle = /\s(\d+\.\d+\.\d+)/;
	let regexNumber = /№(\d+)/;
	let parser = (text) => {
		let domParser = new DOMParser();
		let doc = domParser.parseFromString(text, "text/html");
		return doc;
	};
	let getGoodIdArticle = (string) => {
		let data = { id: null, article: null };
		let matchNumber = string.match(regexNumber);
		let matchArticle = string.match(regexArticle);
		if (matchNumber && matchArticle) {
			let numberPart = matchNumber[1];
			let articlePart = matchArticle[1];
			data.id = numberPart;
			data.article = articlePart;
			return data;
		}
		return false;
	};
	let getOrderId = (number) => {
		const regex = /\((\d+)\)/;
		const match = number.match(regex);
		if (match && match.length >= 2) {
			return parseInt(match[1], 10);
		}
		return null;
	};
	let search = () => {
		let search_query = searchInp.value;
		if (search_query.length < 2) {
			alert("Дожина пошукового запиту маєбути більше 2 символів!");
			return;
		}
		contentWraper.appendChild(preloaderWraper);
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
				let searchResponce = parser(res);
				let goodsId = Array.from(
					searchResponce.querySelectorAll(".detDivTitle")
				);
				let searchGoodWraper = Array.from(
					searchResponce.querySelectorAll(".detDiv")
				);
				searchGoodWraper.forEach((item, index) => {
					let data = {};
					let goodsPhoto = Array.from(
						searchResponce.querySelectorAll(".detImg>img")
					);
					let goodsCount = Array.from(
						searchResponce.querySelectorAll(".detPr")
					);
					let goodsDesc = Array.from(
						searchResponce.querySelectorAll(".titleDet")
					);

					data.id = getGoodIdArticle(goodsId[index].textContent).id;
					data.article = getGoodIdArticle(goodsId[index].textContent).article;
					data.photo = goodsPhoto[index].getAttribute("src");
					data.photoLG = goodsPhoto[index].parentNode
						.querySelector("a")
						.getAttribute("href");
					data.desc = goodsDesc[index].textContent.trim();
					data.count = goodsCount[index].textContent.trim();
					searchData.push(data);
					console.log(goodsPhoto[index].parentNode.querySelector("a"));
				});
				console.log(searchData);

				generateSearch(searchData);
			});
		let searchGoods;
	};
	let generateSearch = (data) => {
		contentWraper.innerHTML = "";
		if (data.length > 0) {
			let searchWraper = document.createElement("div");
			searchWraper.className = "search-result-wraper";
			data.forEach((item) => {
				let wraper = document.createElement("div");
				wraper.className = "item-wraper";
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
				listBtn.textContent = "Додати в список";

				let difBtn = document.createElement("button");
				difBtn.className = "dif-btn btn";
				difBtn.textContent = "Відзначити кількість";
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
				btnWraper.appendChild(difBtn);
				wraper.appendChild(itemDesc);
				wraper.appendChild(btnWraper);

				searchWraper.appendChild(wraper);
				// add event listeners
				itemDesc.addEventListener("click", (e) => {
					e.preventDefault();
					itemDesc.classList.toggle("visible");
				});
				listBtn.addEventListener("click", addItemToList);
				difBtn.addEventListener("click", addCountDefference);
			});
			contentWraper.appendChild(searchWraper);
		} else {
			let searchTitle = document.createElement("p");
			searchTitle.className = "question-title content-title";
			searchTitle.textContent = "Нічого не знайдено";
			contentWraper.appendChild(searchTitle);
		}
	};
	let addItemToList = (e) => { };
	let addCountDefference = (e) => { };
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
					let questionResult = item.textContent.match(questionPattern);

					if (elaborationResult !== null) {
						elabortionCount.innerText = elaborationResult[1];
						elabortionCount.style.display = "block";
					} else if (elaborationResult === null) {
						elabortionCount.style.display = "none";
					}

					if (questionResult !== null) {
						questionCountText.innerText = questionResult[1];
						questionCountText.style.display = "block";
					}
				});
			});
	};
	let barcodeRecognition = () => {

		var lastResult, countResults = 0;

		function onScanSuccess(decodedText, decodedResult) {
			if (decodedText !== lastResult) {
				++countResults;
				lastResult = decodedText;
				let searchInp = document.querySelector(".search-inp");
				searchInp.value = decodedText;
				let serarchBtn = document.querySelector(".search-send-btn");
				serarchBtn.click();
				// Handle on success condition with the decoded message.
				console.log(`Scan result ${decodedText}`, decodedResult);
			}
		}

		var html5QrcodeScanner = new Html5QrcodeScanner(
			"reader", { fps: 10, qrbox: 250 });
		html5QrcodeScanner.render(onScanSuccess);
	}
	let addElaborationAnswer = (e) => {
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
		console.log(orderNumber, elaborationInp.value);
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
				console.log(err);
			});
	};
	let checkAnswer = (e) => {
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

			return { baseCount: baseCount, orderCount: orderCount };
		}
	};
	let generateQuestionTanble = (data) => {
		contentWraper.innerHTML = "";
		if (data.length > 0) {
		} else {
			let questiuonTitle = document.createElement("p");
			questiuonTitle.className = "question-title content-title";
			questiuonTitle.textContent = "Зараз немає Питань";
			contentWraper.appendChild(questiuonTitle);
		}
	};
	let getQuestions = () => {
		// let questionKeys = [
		// 	"positionName",
		// 	"orderQuestion",
		// 	"orderNumber",
		// 	"questionManager",
		// 	"positionAddres",
		// ];
		// contentWraper.appendChild(preloaderWraper);
		// fetch(questionURL, { method: "POST" })
		// 	.then((res) => {
		// 		return res.text();
		// 	})
		// 	.then((responce) => {
		// 		let questionData = [];
		// 		let questionResponce = parser(responce);
		// 		let responceTr = Array.from(questionResponce.querySelectorAll("tr"));
		// 		responceTr.shift();
		// 		responceTr.forEach((row, index) => {
		// 			let order = new URLSearchParams();
		// 			let questionRow = {};
		// 			let td = Array.from(row.querySelectorAll("td"));
		// 			td.forEach((data, index) => {
		// 				if (index === 1) {
		// 					questionRow.questionManager = data.getAttribute("title");
		// 					return;
		// 				}
		// 				if (index === 3) {
		// 					questionRow.orderNumber = data.textContent;
		// 					return;
		// 				}
		// 				questionRow[questionKeys[index]] = data.textContent;
		// 				return questionRow;
		// 			});
		// 			questionData.push(questionRow);
		// 			if (
		// 				questionData[index].orderNumber !== null ||
		// 				questionData[index].orderNumber !== undefined
		// 			) {
		// 				console.log(questionData[index].orderNumber);
		// 				order.append("status", questionData[index].orderNumber);
		// 				fetch(openOrderURL, {
		// 					method: "POST",
		// 					body: order,
		// 				})
		// 					.then((res) => {
		// 						return res.text();
		// 					})
		// 					.then((res) => {
		// 						console.log(res);
		// 					});
		// 			}
		// 		});
		// 		generateQuestionTanble([]);
		// 	})
		// 	.catch();
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
				positionQualityDesc.textContent = "Кількість товару";
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
				let sendBtn = document.createElement("button");

				sendBtn.innerHTML = `
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
<svg fill="#ffffff" height="30px" width="30px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.001 512.001" xml:space="preserve" stroke="#ffffff">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <g> <g> <path d="M483.927,212.664L66.967,25.834C30.95,9.695-7.905,42.023,1.398,80.368l21.593,89.001 c3.063,12.622,11.283,23.562,22.554,30.014l83.685,47.915c6.723,3.85,6.738,13.546,0,17.405l-83.684,47.915 c-11.271,6.452-19.491,17.393-22.554,30.015l-21.594,89c-9.283,38.257,29.506,70.691,65.569,54.534l416.961-186.83 C521.383,282.554,521.333,229.424,483.927,212.664z M359.268,273.093l-147.519,66.1c-9.44,4.228-20.521,0.009-24.752-9.435 c-4.231-9.44-0.006-20.523,9.434-24.752l109.37-49.006l-109.37-49.006c-9.44-4.231-13.665-15.313-9.434-24.752 c4.229-9.44,15.309-13.666,24.752-9.435l147.519,66.101C373.996,245.505,374.007,266.49,359.268,273.093z"/> </g> </g> </g>

</svg>`;
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

					return a;
				});

				images.forEach((image) => {
					imageWraper.appendChild(image);
					image.addEventListener("click", (e) => {
						e.preventDefault();
						let imgWraper = document.createElement("div");
						imgWraper.className = "img-wraper";
						let closeBtn = document.createElement("button");
						closeBtn.className = "close-btn";

						let img = document.createElement("img");
						img.src = image.href;
						imgWraper.appendChild(img);
						imgWraper.appendChild(closeBtn);
						contentWraper.appendChild(imgWraper);
						// add event to close image
						closeBtn.addEventListener("click", () => {
							imgWraper.remove();
						});
					});
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
			const positionID = elaborationTable.querySelector(".detDivTitle");
			const tableRow = Array.from(
				elaborationTable.querySelectorAll("table>tbody>tr")
			);
			console.log(positionID);
			tableRow.shift();
			const elaborationRow = tableRow.map((data) => {
				let elaborationData = {};
				let dataCells = Array.from(data.querySelectorAll("td"));
				dataCells.forEach((td, tdIndex) => {
					elaborationData[keysStore[tdIndex]] = String(td.textContent.trim());
					if (keysStore[tdIndex] == "searchQuery") {
						let result = `${elaborationData["positionName"]}`.replace(
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
				console.error(data);
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
			elaborationRow.forEach(async (dataRow) => {
				console.log(dataRow);
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
	};
	// check Elabotarions count
	setInterval(checkElaborations, elaborationInterval * 1000);

	// add event listeners for buttons
	elaborationBtn.addEventListener("click", elabotarions);
	questionBtn.addEventListener("click", getQuestions);
	searchSendBtn.addEventListener("click", search);
	barCodeSearch.addEventListener("click", barcodeRecognition);
	// appendings buttons
	btnWraper.appendChild(elaborationBtn);
	btnWraper.appendChild(questionBtn);
	// add btn wraper
	document.body.appendChild(btnWraper);
	// add content-wrapper
	document.body.appendChild(searchWraper);
	document.body.appendChild(contentWraper);
	checkElaborations();
});
