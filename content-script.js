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
	let recycleBinIco = `
<?xml version="1.0" encoding="iso-8859-1"?>

<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg fill="#fff" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 width="30px" height="30px" viewBox="0 0 589.004 589.004"
	 xml:space="preserve">
<g>
	<g>
		<path d="M451.716,146.986H137.289c-16.287,0-31.952,6.876-42.977,18.865c-11.025,11.988-16.566,28.173-15.205,44.403
			l27.241,324.744c1.227,14.629,7.854,28.158,18.66,38.096c10.805,9.938,24.842,15.41,39.521,15.41h259.947
			c14.68,0,28.715-5.473,39.521-15.41s17.434-23.467,18.66-38.097l27.24-324.744c1.361-16.229-4.18-32.414-15.205-44.402
			C483.669,153.862,468.003,146.986,451.716,146.986z M467.208,206.672l-27.24,324.745c-0.676,8.055-7.41,14.247-15.492,14.247
			H164.53c-8.083,0-14.817-6.192-15.492-14.247l-27.241-324.745c-0.761-9.067,6.393-16.846,15.492-16.846h314.427
			C460.815,189.826,467.968,197.605,467.208,206.672z"/>
		<path d="M424.476,589.004H164.529c-14.807,0-28.962-5.52-39.86-15.542c-10.899-10.022-17.583-23.668-18.82-38.422L78.608,210.296
			c-1.373-16.37,4.216-32.693,15.335-44.784c11.119-12.092,26.918-19.027,43.345-19.027h314.427
			c16.429,0,32.227,6.935,43.345,19.027c11.119,12.09,16.708,28.413,15.335,44.782l-27.24,324.744
			c-1.237,14.755-7.921,28.4-18.819,38.423C453.437,583.484,439.28,589.004,424.476,589.004z M137.289,147.486
			c-16.148,0-31.679,6.817-42.609,18.704c-10.93,11.885-16.425,27.931-15.075,44.023l27.241,324.744
			c1.216,14.504,7.787,27.917,18.5,37.77c10.712,9.853,24.628,15.278,39.183,15.278h259.947c14.554,0,28.469-5.426,39.183-15.278
			c10.715-9.853,17.285-23.266,18.501-37.771l27.24-324.744c1.35-16.091-4.145-32.137-15.075-44.021
			c-10.929-11.886-26.459-18.704-42.608-18.704H137.289z M424.476,546.164H164.53c-8.275,0-15.299-6.459-15.99-14.705
			l-27.241-324.745c-0.374-4.461,1.149-8.909,4.179-12.203c3.03-3.295,7.335-5.185,11.811-5.185h314.427
			c4.477,0,8.781,1.889,11.811,5.184c3.03,3.294,4.554,7.743,4.18,12.204l-27.24,324.745
			C439.774,539.705,432.75,546.164,424.476,546.164z M137.289,190.326c-4.197,0-8.234,1.772-11.075,4.861
			c-2.841,3.089-4.269,7.26-3.918,11.442l27.241,324.745c0.648,7.732,7.234,13.789,14.994,13.789h259.946
			c7.759,0,14.346-6.057,14.994-13.789l27.24-324.745c0.351-4.183-1.078-8.354-3.92-11.443c-2.841-3.089-6.877-4.86-11.074-4.86
			H137.289z"/>
	</g>
	<g>
		<path d="M89.292,123.835h410.42c11.83,0,21.42-9.59,21.42-21.42c0-11.83-9.59-21.42-21.42-21.42h-77.799v-0.966V58.886
			c0-32.194-26.191-58.386-58.385-58.386H225.478c-32.194,0-58.386,26.192-58.386,58.386v21.143v0.966H89.292
			c-11.83,0-21.42,9.59-21.42,21.42C67.872,114.245,77.462,123.835,89.292,123.835z M209.931,58.886
			c0-8.586,6.96-15.546,15.546-15.546h138.051c8.584,0,15.545,6.96,15.545,15.546v21.143H209.931V58.886z"/>
		<path d="M499.712,124.335H89.292c-12.087,0-21.92-9.833-21.92-21.92c0-12.086,9.833-21.92,21.92-21.92h77.299V58.886
			C166.591,26.417,193.007,0,225.478,0h138.051c32.469,0,58.885,26.417,58.885,58.886v21.609h77.299
			c12.087,0,21.92,9.833,21.92,21.92C521.632,114.502,511.799,124.335,499.712,124.335z M89.292,81.495
			c-11.535,0-20.92,9.385-20.92,20.92c0,11.536,9.385,20.92,20.92,20.92h410.42c11.535,0,20.92-9.385,20.92-20.92
			c0-11.535-9.385-20.92-20.92-20.92h-78.299V58.886C421.413,26.968,395.446,1,363.528,1H225.478
			c-31.918,0-57.886,25.968-57.886,57.886v22.609H89.292z M379.573,80.528H209.431V58.886c0-8.848,7.198-16.046,16.046-16.046
			h138.051c8.848,0,16.045,7.198,16.045,16.046V80.528z M210.431,79.528h168.142V58.886c0-8.296-6.749-15.046-15.045-15.046H225.478
			c-8.297,0-15.046,6.75-15.046,15.046V79.528z"/>
	</g>
	<g>
		<path d="M218.867,272.233c-0.78-11.805-10.99-20.739-22.785-19.961c-11.805,0.78-20.742,10.982-19.961,22.786l12.438,188.198
			c0.748,11.323,10.166,20.008,21.352,20.008c0.475,0,0.953-0.016,1.434-0.047c11.804-0.78,20.741-10.981,19.961-22.786
			L218.867,272.233z"/>
		<path d="M209.91,483.765c-11.494,0-21.092-8.993-21.851-20.475l-12.438-188.198c-0.386-5.843,1.526-11.485,5.384-15.89
			s9.201-7.042,15.043-7.429c12.139-0.79,22.526,8.462,23.317,20.427l12.438,188.198c0.797,12.061-8.366,22.521-20.427,23.318
			C210.885,483.749,210.396,483.765,209.91,483.765z M197.511,252.725c-0.463,0-0.928,0.016-1.396,0.046
			c-5.576,0.369-10.674,2.886-14.357,7.089c-3.682,4.204-5.507,9.589-5.138,15.165l12.438,188.198
			c0.754,11.422,10.691,20.246,22.254,19.495c11.51-0.761,20.255-10.744,19.495-22.254l-12.438-188.198
			C217.645,261.309,208.483,252.725,197.511,252.725z"/>
	</g>
	<g>
		<path d="M294.502,252.226c-11.83,0-21.42,9.59-21.42,21.42v188.198c0,11.83,9.59,21.42,21.42,21.42
			c11.831,0,21.42-9.59,21.42-21.42V273.646C315.923,261.816,306.333,252.226,294.502,252.226z"/>
		<path d="M294.502,483.764c-12.087,0-21.92-9.833-21.92-21.92V273.646c0-12.087,9.833-21.92,21.92-21.92
			c12.087,0,21.92,9.833,21.92,21.92v188.198C316.423,473.931,306.59,483.764,294.502,483.764z M294.502,252.726
			c-11.535,0-20.92,9.385-20.92,20.92v188.198c0,11.535,9.385,20.92,20.92,20.92c11.536,0,20.92-9.385,20.92-20.92V273.646
			C315.423,262.11,306.038,252.726,294.502,252.726z"/>
	</g>
	<g>
		<path d="M392.923,252.272c-11.797-0.778-22.006,8.156-22.785,19.961L357.7,460.432c-0.779,11.805,8.156,22.006,19.961,22.786
			c0.482,0.031,0.959,0.047,1.434,0.047c11.186,0,20.604-8.686,21.354-20.008l12.436-188.198
			C413.665,263.254,404.728,253.052,392.923,252.272z"/>
		<path d="M379.095,483.765c-0.485,0-0.973-0.016-1.466-0.048c-12.061-0.797-21.224-11.258-20.428-23.318l12.438-188.198
			c0.79-11.965,11.187-21.222,23.317-20.427c5.843,0.386,11.185,3.024,15.043,7.428s5.771,10.047,5.384,15.89L400.947,463.29
			C400.187,474.771,390.588,483.765,379.095,483.765z M391.493,252.725c-10.972,0-20.133,8.583-20.856,19.541l-12.438,188.199
			c-0.76,11.51,7.985,21.493,19.495,22.254c11.605,0.75,21.499-8.074,22.255-19.495l12.436-188.198
			c0.369-5.576-1.455-10.961-5.138-15.165c-3.683-4.204-8.781-6.721-14.357-7.089C392.422,252.741,391.956,252.725,391.493,252.725z
			"/>
	</g>
</g>
</svg>`;

	preloaderWraper.appendChild(preloaderSpiner);
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
	// comapre btn
	let compareBtn = document.createElement("button");
	compareBtn.className = "compare-btn btn";
	compareBtn.innerHTML = `<svg fill="#ffffff" width="40px" height="40px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.048"></g><g id="SVGRepo_iconCarrier"><path d="M12.5 6.75a.75.75 0 00-1.5 0V9H8.75a.75.75 0 000 1.5H11v2.25a.75.75 0 001.5 0V10.5h2.25a.75.75 0 000-1.5H12.5V6.75zM8.75 16a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-6z"></path><path fill-rule="evenodd" d="M5 1a2 2 0 00-2 2v18a2 2 0 002 2h14a2 2 0 002-2V7.018a2 2 0 00-.586-1.414l-4.018-4.018A2 2 0 0014.982 1H5zm-.5 2a.5.5 0 01.5-.5h9.982a.5.5 0 01.354.146l4.018 4.018a.5.5 0 01.146.354V21a.5.5 0 01-.5.5H5a.5.5 0 01-.5-.5V3z"></path></g></svg>`;
	let compareBtnCount = document.createElement("span");
	compareBtnCount.className = "compare-count counter";
	compareBtn.appendChild(compareBtnCount);
	// list btn
	let listBtn = document.createElement("button");
	listBtn.className = "list-btn btn";
	listBtn.innerHTML = `<svg fill="#ffffff" height="40px" width="40px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60" xml:space="preserve" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M12.5,24h25c0.552,0,1-0.448,1-1s-0.448-1-1-1h-25c-0.552,0-1,0.448-1,1S11.948,24,12.5,24z"></path> <path d="M12.5,16h10c0.552,0,1-0.448,1-1s-0.448-1-1-1h-10c-0.552,0-1,0.448-1,1S11.948,16,12.5,16z"></path> <path d="M12.5,32h25c0.552,0,1-0.448,1-1s-0.448-1-1-1h-25c-0.552,0-1,0.448-1,1S11.948,32,12.5,32z"></path> <path d="M29.5,38h-17c-0.552,0-1,0.448-1,1s0.448,1,1,1h17c0.552,0,1-0.448,1-1S30.052,38,29.5,38z"></path> <path d="M26.5,46h-14c-0.552,0-1,0.448-1,1s0.448,1,1,1h14c0.552,0,1-0.448,1-1S27.052,46,26.5,46z"></path> <path d="M48.5,34.363V14.586L33.914,0H1.5v60h44c7.168,0,13-5.832,13-13C58.5,40.866,54.224,35.723,48.5,34.363z M34.5,3.414 L45.086,14H34.5V3.414z M38.578,58H3.5V2h29v14h14v18.044C46.158,34.015,45.826,34,45.5,34c-7.168,0-13,5.832-13,13 c0,0.399,0.025,0.792,0.06,1.183c0.008,0.091,0.017,0.181,0.027,0.272c0.043,0.382,0.098,0.76,0.173,1.131 c0.009,0.044,0.021,0.087,0.03,0.131c0.072,0.338,0.159,0.67,0.257,0.998c0.025,0.082,0.048,0.165,0.074,0.246 c0.113,0.352,0.239,0.698,0.38,1.037c0.027,0.064,0.057,0.126,0.084,0.189c0.129,0.296,0.269,0.585,0.419,0.869 c0.036,0.068,0.07,0.137,0.107,0.205c0.175,0.317,0.363,0.626,0.564,0.927c0.046,0.069,0.094,0.135,0.141,0.203 c0.183,0.264,0.375,0.521,0.576,0.77c0.038,0.047,0.074,0.096,0.113,0.143c0.231,0.278,0.475,0.544,0.728,0.801 c0.062,0.063,0.125,0.124,0.189,0.186c0.245,0.239,0.496,0.471,0.759,0.69c0.023,0.02,0.045,0.041,0.069,0.06 c0.282,0.232,0.577,0.449,0.879,0.658c0.073,0.051,0.147,0.1,0.221,0.149C38.427,57.897,38.501,57.951,38.578,58z M45.5,58 c-6.065,0-11-4.935-11-11s4.935-11,11-11c0.312,0,0.62,0.021,0.926,0.047c0.291,0.028,0.592,0.066,0.909,0.119l0.443,0.074 C52.753,37.293,56.5,41.716,56.5,47C56.5,53.065,51.565,58,45.5,58z"></path> <path d="M51.5,46h-5v-5c0-0.552-0.448-1-1-1s-1,0.448-1,1v5h-5c-0.552,0-1,0.448-1,1s0.448,1,1,1h5v5c0,0.552,0.448,1,1,1 s1-0.448,1-1v-5h5c0.552,0,1-0.448,1-1S52.052,46,51.5,46z"></path> </g> </g></svg>`;
	let listBtnCount = document.createElement("span");
	listBtnCount.className = "list-count counter";
	listBtn.appendChild(listBtnCount);
	let logOutBtn = document.createElement("button");
	logOutBtn.className = "log-out-btn btn";
	logOutBtn.innerHTML = `<svg fill="#ffffff" height="40px" width="40px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 384.971 384.971" xml:space="preserve" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g id="Sign_Out"> <path d="M180.455,360.91H24.061V24.061h156.394c6.641,0,12.03-5.39,12.03-12.03s-5.39-12.03-12.03-12.03H12.03 C5.39,0.001,0,5.39,0,12.031V372.94c0,6.641,5.39,12.03,12.03,12.03h168.424c6.641,0,12.03-5.39,12.03-12.03 C192.485,366.299,187.095,360.91,180.455,360.91z"></path> <path d="M381.481,184.088l-83.009-84.2c-4.704-4.752-12.319-4.74-17.011,0c-4.704,4.74-4.704,12.439,0,17.179l62.558,63.46H96.279 c-6.641,0-12.03,5.438-12.03,12.151c0,6.713,5.39,12.151,12.03,12.151h247.74l-62.558,63.46c-4.704,4.752-4.704,12.439,0,17.179 c4.704,4.752,12.319,4.752,17.011,0l82.997-84.2C386.113,196.588,386.161,188.756,381.481,184.088z"></path> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </g> </g></svg>`;
	// patterns
	let elaborationPattern = /Є уточнення: (\d+) шт\./;
	let questionPattern = /Є питання: (\d+) шт\./;
	let regexArticle = /\s(\d+\.\d+\.\d+)/;
	let regexNumber = /№(\d+)/;
	let regexElaborationArticle = /\((\d+(\.\d+)*)\)/;
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
	let parser = (text) => {
		let domParser = new DOMParser();
		let doc = domParser.parseFromString(text, "text/html");
		return doc;
	};
	let updateStorage = () => {
		localStorage.setItem("storage", JSON.stringify(storage));
	};
	let logOut = () => {
		document.cookie = "login=null";
		document.cookie = "hash=null";
		window.location.reload();
	};
	let getSentenses = (string) => {
		let matches = string.match(regexSentens);
		if (matches) {
			return matches;
		}
		return false;
	};
	let getDate = () => {
		const date = new Date();
		return {
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate(),
			hours: date.getHours(),
			minutes: date.getMinutes(),
			seconds: date.getSeconds(),
		};
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
	let getGoodsCount = (text) => {
		const matches = {};
		let match;
		while ((match = regexGoodsCount.exec(text)) !== null) {
			if (match[1] !== undefined) {
				matches["baseCount"] = parseInt(match[1]);
			} else if (match[3] !== undefined) {
				matches["orderCount"] = parseInt(match[3]);
			}
		}
		return matches;
	};
	let showImage = (e) => {
		e.preventDefault();
		let imgURL = e.currentTarget.getAttribute("href");
		let mainImageWraper = document.createElement("div");
		mainImageWraper.className = "img-wraper";
		let mainImage = document.createElement("img");
		mainImage.src = `https://baza.m-p.in.ua${imgURL}`;
		mainImage.className = "main-image";
		mainImageWraper.appendChild(mainImage);
		contentWraper.appendChild(mainImageWraper);
		mainImageWraper.addEventListener("click", (e) => {
			e.stopPropagation();
			console.log(e, e.srcElement);
			if (e.srcElement.classList.contains("img-wraper")) {
				mainImageWraper.remove();
			}
		});
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
					let goodsPhoto = item.querySelector(".detImg>a>img");
					console.log(goodsPhoto.parentNode);
					let goodsCount = Array.from(
						searchResponce.querySelectorAll(".detPr")
					);
					let goodsDesc = Array.from(
						searchResponce.querySelectorAll(".titleDet")
					);

					data.id = getGoodIdArticle(goodsId[index].textContent).id;
					data.article = getGoodIdArticle(goodsId[index].textContent).article;
					data.photo = goodsPhoto.getAttribute("src");
					data.photoLG = goodsPhoto.parentNode.getAttribute("href");
					data.head = goodsDesc[index].innerHTML.split("<br>")[0].trim();
					data.desc = goodsDesc[index].textContent.trim();
					data.count = goodsCount[index].textContent.trim();
					searchData.push(data);
				});

				generateSearch(searchData);
			});
	};
	let generateSearch = (data) => {
		contentWraper.innerHTML = "";
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

				searchWraper.appendChild(wraper);
				// add event listeners
				itemDesc.addEventListener("click", (e) => {
					e.preventDefault();
					itemDesc.classList.toggle("visible");
				});
				compareInp.addEventListener("input", (e) => {
					let compareVal = e.currentTarget.value;
					if (
						Number(compareVal) !== Number(getGoodsCount(item.count).baseCount)
					) {
						e.currentTarget.style.border = `1px solid red`;
					}
				});
				listBtn.addEventListener("click", (e) => {
					item.isProcesed = false;
					item.addingDate = getDate();
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
						item.addingDate = getDate();
						item.isProcesed = false;
						item.realCount = Number(compareInp.value);
						item.goodsBaseCount = getGoodsCount(item.count).baseCount;
						item.goodsReserve = getGoodsCount(item.count).orderCount;
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
					let questionResult = item.textContent.match(questionPattern);

					if (elaborationResult !== null && Array.isArray(elaborationResult)) {
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
	};
	let barcodeRecognition = () => {
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
	};
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

	let generateQuestionTanble = (data) => {
		contentWraper.innerHTML = "";
		if (data.length > 0) {
			data.forEach((item) => {
				let questionWraper = document.createElement("div");
				questionWraper.className = "question-wraper";
				// desc part
				let questionDescWraper = document.createElement("div");
				questionDescWraper.className = "question-desc-wraper";
				let questionDescGoods = document.createElement("p");
				questionDescGoods.className = "question-desc";
				questionDescGoods.textContent = "Товар";
				let questionDesc = document.createElement("p");
				questionDesc.className = "question-desc";
				questionDesc.textContent = "Питання";
				let questionMainData = document.createElement("p");
				questionMainData.className = "question-main-data";
				questionMainData.textContent = "Додаткова інформація";
				let questionOrderDesc = document.createElement("p");
				questionOrderDesc.className = "question-order-desc";
				questionOrderDesc.textContent = "Замовлення";
				let questionAnswer = document.createElement("p");
				questionAnswer.className = "question-answer";
				questionAnswer.textContent = "Відповідь";
				// question data part
				let questionDataWraper = document.createElement("div");
				questionDataWraper.className = "question-data-wraper";
				let questionGoodsData = document.createElement("p");
				questionGoodsData.className = "question-data";
				questionGoodsData.textContent = item.goodsDesc;
				let question = document.createElement("p");
				question.className = "question";
				question.textContent = item.question;
				let questionManager = document.createElement("p");
				questionManager.className = "question-manager";
				questionManager.textContent = item.questionManager;
				let questionOrder = document.createElement("p");
				questionOrder.className = "question-order";
				questionOrder.textContent = item.questionOrder;
				let answerWraper = document.createElement("div");
				answerWraper.className = "answer-wraper";
				let answerInp = document.createElement("input");
				answerInp.className = "answer-inp";
				answerInp.type = "text";
				answerInp.placeholder = "Відповідь";
				let answerBtn = document.createElement("button");
				answerBtn.className = "answer-btn";
				answerBtn.textContent = "Відправити";
				answerWraper.append(answerInp, answerBtn);
				// question desc part
				questionDescWraper.appendChild(questionDescGoods);
				questionDescWraper.appendChild(questionMainData);
				questionDescWraper.appendChild(questionDesc);
				questionDescWraper.appendChild(questionOrderDesc);
				questionDescWraper.appendChild(questionAnswer);
				// question data part
				questionDataWraper.appendChild(questionGoodsData);
				questionDataWraper.appendChild(questionManager);
				questionDataWraper.appendChild(question);
				questionDataWraper.appendChild(questionOrder);
				questionDataWraper.appendChild(answerWraper);
				questionWraper.appendChild(questionDescWraper);
				questionWraper.appendChild(questionDataWraper);
				contentWraper.appendChild(questionWraper);
			});
		} else {
			let questiuonTitle = document.createElement("p");
			questiuonTitle.className = "question-title content-title";
			questiuonTitle.textContent = "Зараз немає Питань";
			contentWraper.appendChild(questiuonTitle);
		}
	};
	let getQuestions = () => {
		let questionData = [];
		contentWraper.innerHTML = "";
		contentWraper.appendChild(preloaderWraper);
		// fetch(questionURL, {
		// 	method: "POST",
		// })
		// 	.then((responce) => {
		// 		return responce.text();
		// 	})
		// 	.then((responce) => {

		// 		console.log(questionParse);
		// 	})
		// 	.catch((err) => {
		// 		console.log(err);
		// 	});
		let questionText = `<table border="1" cellpadding="0" cellspacing="0" width="98%">
    <tr>
        <td align="center" style="padding: 5px;">Товар</td>
        <td align="center" style="padding: 5px;">Вопрос</td>
        <td align="center" style="padding: 5px;">Ответ</td>
        <td align="center" style="padding: 5px;"># Заказа</td>
    </tr>
    <tr>
        <td align="center" style="padding: 5px;">Фланец под «сухие» ТЭНы Tesy, Hi-Therm (4.80.0028)</td>
        <td title="Козаченко Юлия Владимировна 3 хвилини тому" align="center" style="padding: 5px;">яка довжина трубок?
        </td>
        <td align="center" style="padding: 5px;">
            <input type="text" style="padding: 2px; width: 400px;" id="questionsInp3986"><input type="button"
                value="Ответить" onclick="addAnswer(3986)">
        </td>
        <td align="center" style="padding: 5px; cursor: pointer;" onclick="Orders(1099533);">1099533</td>
    </tr>
</table>`;
		let questionParse = parser(questionText);
		let questionRow = Array.from(questionParse.querySelectorAll("tr"));
		questionRow.shift();

		if (questionRow.length > 0) {
			contentWraper.innerHTML = "";
			questionRow.forEach((row) => {
				let data = {};
				let item = row.querySelectorAll("td");
				data.goodsDesc = item[0].textContent.trim();
				data.questionManager = item[1].getAttribute("title").trim();
				data.question = item[1].textContent.trim();
				data.questionOrder = item[3].textContent.trim();
				console.log(
					item[2].querySelector("input[type='text']").id,
					item[2].querySelector("input[type='button']")
				);
				data.questionNum = item[2]
					.querySelector("input[type='text']")
					.id.match(/(\d+)/)[1];
				questionData.push(data);
			});
			console.log(questionData);
		}
		generateQuestionTanble(questionData);
	};

	let generateElaboration = (data) => {
		contentWraper.innerHTML = "";
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
					image.addEventListener("click", showImage);
				});
				let elaboratiionFooterBtnWraper = document.createElement("div");
				elaboratiionFooterBtnWraper.className =
					"elaboratiion-footer-btn-wraper";
				let reserveBtn = document.createElement("button");
				reserveBtn.className = "reserve-btn";
				reserveBtn.textContent = "Резерв";
				let arrivalbtn = document.createElement("button");
				arrivalbtn.className = "arrival-btn";
				arrivalbtn.textContent = "Приходи";
				let selesBtn = document.createElement("button");
				selesBtn.className = "seles-btn";
				selesBtn.textContent = "Продажі";

				elaboratiionFooterBtnWraper.appendChild(reserveBtn);
				elaboratiionFooterBtnWraper.appendChild(arrivalbtn);
				elaboratiionFooterBtnWraper.appendChild(selesBtn);

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
				tableWraper.appendChild(elaboratiionFooterBtnWraper);
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
							let parseSearch = parser(responseText);
							let articleRow = Array.from(
								parseSearch.querySelectorAll(".detDivTitle")
							);

							articleRow.forEach((a) => {
								if (getGoodIdArticle(a.textContent.trim()).article === data.searchQuery) {
									let countData = parseSearch.querySelector(".detPr");
									let images = Array.from(
										parseSearch.querySelectorAll(".detImg>img")
									);
									let imgSrc = [];
									let imgLink = [];
									images.forEach((img) => {
										imgSrc.push(img.getAttribute("rel"));
										imgLink.push(img.alt);
									});
									elaborationRow[key].imagesSrc = imgSrc;
									elaborationRow[key].imageLink = imgLink;
									elaborationRow[key].numberData = getGoodsCount(
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
	};
	let drawButtonsCount = () => {
		let listCount = 0;
		let compareCount = 0;
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
	};
	let generateList = () => {
		contentWraper.innerHTML = "";
		if (storage.listArray.length == 0) {
			let listTitle = document.createElement("p");
			listTitle.className = "list-title content-title";
			listTitle.textContent = "Список на розноску товару Пустий!!!";
			contentWraper.appendChild(listTitle);
			return;
		}
		storage.listArray.forEach((item, index) => {
			let listItemWraper = document.createElement("div");
			listItemWraper.className = "list-item";
			let delItemBtn = document.createElement("button");
			delItemBtn.className = "del-btn btn";
			delItemBtn.innerHTML = recycleBinIco;
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
				getGoodsCount(item.count).baseCount
			} Резерв: ${getGoodsCount(item.count).orderCount}`;
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
	};
	let generateCompare = () => {
		contentWraper.innerHTML = "";
		if (storage.compareArray.length == 0) {
			let compareTitle = document.createElement("p");
			compareTitle.className = "compare-title content-title";
			compareTitle.textContent = "Список Розбжностей пустий!!!";
			contentWraper.appendChild(compareTitle);
			return;
		}
		storage.compareArray.forEach((item, index) => {
			let difference =
				item.realCount -
				(getGoodsCount(item.count).baseCount +
					getGoodsCount(item.count).orderCount);
			let compareItemWraper = document.createElement("div");
			compareItemWraper.className = "compare-item";
			let delCompareItemBtn = document.createElement("button");
			delCompareItemBtn.className = "del-btn btn";
			delCompareItemBtn.innerHTML = recycleBinIco;
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
			itemCount.textContent = `Кількість по базі: ${
				getGoodsCount(item.count).baseCount
			} Резерв: ${getGoodsCount(item.count).orderCount}
			Реальна кількість: ${item.realCount} Різниця: ${difference}`;
			if (difference < 0) {
				compareItemWraper.style.backgroundColor = "rgb(253, 184, 184)";
				itemCount.style.backgroundColor = "rgb(253, 184, 184)";
			}
			let itemArticle = document.createElement("p");
			itemArticle.className = "item-article";
			itemArticle.textContent = item.article;

			let itemDesc = document.createElement("p");
			itemDesc.className = "item-head";
			itemDesc.textContent = item.head;
			let procesedBtn = document.createElement("button");
			procesedBtn.dataset.id = item.id;
			procesedBtn.className = "procesed-btn";
			if (item.isProcesed) {
				procesedBtn.textContent = "Оброблено";
			} else {
				procesedBtn.textContent = "Обробити";
			}
			if (item.isProcesed) {
				compareItemWraper.style.backgroundColor = "#c2edc2";
			}
			itemTextWraper.appendChild(itemArticle);
			itemTextWraper.appendChild(itemCount);
			itemTextWraper.appendChild(itemDesc);
			itemTextWraper.appendChild(procesedBtn);
			compareItemWraper.appendChild(delCompareItemBtn);
			compareItemWraper.appendChild(itemImageLink);
			compareItemWraper.appendChild(itemTextWraper);
			contentWraper.appendChild(compareItemWraper);
			procesedBtn.addEventListener("click", (e) => {
				storage.compareArray.forEach((item) => {
					if (item.id == Number(e.currentTarget.dataset.id)) {
						item.isProcesed = true;
						procesedBtn.textContent = "Оброблено";
						procesedBtn.parentNode.parentNode.style.backgroundColor = "#c2edc2";
						updateStorage();
						drawButtonsCount();
					}
				});
			});
			delCompareItemBtn.addEventListener("click", (e) => {
				storage.compareArray.forEach((a, index) => {
					if (a.id == Number(item.id)) {
						storage.compareArray.splice(index, 1);
					}
				});
				updateStorage();
				drawButtonsCount();
				compareItemWraper.remove();
			});
			itemImageLink.addEventListener("click", showImage);
		});
	};
	// check Elabotarions count
	setInterval(checkElaborations, elaborationInterval * 1000);

	// add event listeners for buttons
	elaborationBtn.addEventListener("click", elabotarions);
	questionBtn.addEventListener("click", getQuestions);
	listBtn.addEventListener("click", generateList);
	compareBtn.addEventListener("click", generateCompare);
	searchSendBtn.addEventListener("click", search);
	barCodeSearch.addEventListener("click", barcodeRecognition);
	logOutBtn.addEventListener("click", logOut);
	// appendings buttons
	btnWraper.appendChild(elaborationBtn);
	btnWraper.appendChild(questionBtn);
	btnWraper.appendChild(compareBtn);
	btnWraper.appendChild(listBtn);
	btnWraper.appendChild(logOutBtn);
	// add btn wraper
	document.body.appendChild(btnWraper);
	// add content-wrapper
	document.body.appendChild(mainSearchWraper);
	document.body.appendChild(contentWraper);
	checkElaborations();
	drawButtonsCount();
});
// продажі
function podrSales(id) {
	if ($("#podrSales" + id).is(":hidden")) {
		$("#loader").show();
		$.post(
			"https://baza.m-p.in.ua/ajax/podrSales.php",
			{ id: id },
			function (data) {
				$("#podrSales" + id).html(data);
				$("#loader").hide();
			}
		);
		$("#podrSales" + id).show();
	} else {
		$("#podrSales" + id).hide();
	}
}
// резерви
function podrRezerv(id) {
	if ($("#podrRezerv" + id).is(":hidden")) {
		$("#loader").show();
		$.post(
			"https://baza.m-p.in.ua/ajax/podrRezerv.php",
			{ id: id },
			function (data) {
				$("#podrRezerv" + id).html(data);
				$("#loader").hide();
			}
		);
		$("#podrRezerv" + id).show();
	} else {
		$("#podrRezerv" + id).hide();
	}
}
// приход
function podrPrihod(id) {
	if ($("#podrPrihod" + id).is(":hidden")) {
		$("#loader").show();
		$.post(
			"https://baza.m-p.in.ua/ajax/prihod1.php",
			{ id: id },
			function (data) {
				$("#podrPrihod" + id).html(data);
				$("#loader").hide();
			}
		);
		$("#podrPrihod" + id).show();
	} else {
		$("#podrPrihod" + id).hide();
	}
}
