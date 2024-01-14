// let table = document.querySelector("table tbody");

// let rows = Array.from(table.children);
// rows.shift();

// rows.forEach((item, index) => {
// 	let rowData = {};
// 	let table = item.querySelector("table");
// 	if (table) {
// 		let th = Array.from(rows[index - 1].querySelectorAll("td"));
// 		let td = Array.from(rows[index].querySelectorAll("td"));
// 		let componentRows = Array.from(td[1].querySelectorAll("table tr"));
// 		componentRows.shift();
// 		componentRows.pop();
// 		componentRows.pop();
// 		rowData.id = th[1].textContent;
// 		rowData.name = th[2].textContent;
// 		rowData.article = th[3].textContent;
// 		rowData.img = td[0].querySelector("img").src;
// 		rowData.components = componentRows.map((item) => {
// 			let obj = {};
// 			let componentData = Array.from(item.querySelectorAll("td"));
// 			componentData.shift();
// 			obj.name = componentData[0].textContent.trim();
// 			obj.article = componentData[1].textContent.trim();
// 			obj.count = componentData[3].textContent.trim();
// 			obj.availability = componentData[5].textContent.trim();
// 			obj.enough = componentData[6].textContent.trim();
// 			return obj;
// 		});

// 		console.log(rowData);
// 	}
// });
function per(data) {
	return (data.main * data.num) / 100;
}
