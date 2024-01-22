let rows = Array.from(document.querySelectorAll("table tr"));
rows.shift();
rows.forEach((item) => {
	let td = Array.from(item.querySelectorAll("td"));
	let quality;
td.forEach((item) => {
    console.log(item)
})
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
		
		Array.from(td[2].children).forEach((child) => {
			child.textContent = "";
		});
		rowData.positionName = td[2].textContent.trim();
		
		rowData.quality = quality.trim();
		rowData.price = td[5].textContent.trim();
		console.log(rowData)
	}
});
