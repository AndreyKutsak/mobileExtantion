let storage = [{ a: 1 }, { a: 2 }, { a: 3 }];

storage.forEach((item, index) => {
	console.log(item.a);
	if (item.a == 1) {
		storage.push(item);
		storage.splice(index, 1);
	}
});
console.log(storage);
