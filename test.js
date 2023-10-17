let load = {
	storage: [],

	paprser: (data) => {
		return this.serv();
	},
	test: (data) => {
		console.log(this.storage);
	},
	serv: (data) => {
		fetch("https://google.com", {
			method: "POST",
		})
			.then((res) => {
				return res.text();
			})
			.then((res) => {
				load.storage.push(res);

				return this.storage;
			});
	},
};
load.serv();
console.log(load.storage);
console.log(load.paprser);
