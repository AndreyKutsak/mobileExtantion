let prepareQuery = (data) => {
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
};
let load = {
	storage: [],
	fetch: async function (data) {
		try {
			const response = await fetch(data.url, {
				method: data.method,
				body: prepareQuery(data.body),
			});

			if (!response.ok) {
				throw new Error(`HTTP Error! Status: ${response.status}`);
			}

			const res = await response.text();
			const parse = parser(res);
			const parseRow = Array.from(parse.querySelectorAll("tr"));
			parseRow.shift();
			return parseRow;
		} catch (error) {
			console.error("Fetch error:", error);
			return [];
		}
	},
	reserve: async function (data) {
		const reserve = await this.fetch({
			url: data.url,
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



console.log(load.reserve({url:"https.google.com//",method:"POST", body: { id: 1 } }))
{el:"div",className:"test-div",id:"test-div",text:"this is text",
children:[
	{el:"p",className:"test-div",id:"test-div",text:"this is text" ,event:"click",hendler:function(){}},
]}