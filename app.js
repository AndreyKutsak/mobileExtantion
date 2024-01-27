const storage = {
	data: {},
	changed: false, 
	init() {
		const storedData = JSON.parse(localStorage.getItem("storage")) || {};
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
		if (!storedData) this.save(); 
	},
	save: function () {
		if (!this.changed) {
			console.log("Сохранено");
			localStorage.setItem("storage", JSON.stringify(this.data));
			this.changed = false; // Скидання флагу, оскільки дані тепер актуальні
		}
	},
	address:function(data) {
	
		if (!article) {
			console.error("Артикул є обов'язковим для отримання чи збереження даних");
			return;
		}

		const addressData =
			this.data.addresses[article] ||
			(this.data.addresses[article] = this.observe({}));
			if(data.place&&data.place!==data.addresses[article].place){
				addressData.place = this.observe(data.place);
				this.changed = true;
				this.save(); 
			}
	if(data.cell&&data.cell!==data.addresses[article].cell){
		addressData.cell = this.observe(data.cell);
		this.changed = true;
		this.save(); 
	}
	if(data.cell_capacity&&data.cell_capacity!==data.addresses[article].cell_capacity){
		addressData.cell_capacity = this.observe(data.cell_capacity);
		this.changed = true;
		this.save(); 
	}
	if(data.last_goods_count&&data.last_goods_count!==data.addresses[article].last_goods_count){
		addressData.last_goods_count = this.observe(data.last_goods_count);
		this.changed = true;
		this.save(); 
	}
	if(data.is_ignored&&data.is_ignored!==data.addresses[article].is_ignored){
		addressData.is_ignored = this.observe(data.is_ignored);
		this.changed = true;
		this.save(); 
	}
		

		this.changed = true; 
		this.save(); 
		return addressData;
	},
	observe:function (obj) {
		if (typeof obj !== "object" || obj === null) {
			return obj;
		}

		for (const key in obj) {
			obj[key] = this.observe(obj[key]);
		}

		return new Proxy(obj, {
			set:function (target, key, value) => {
				target[key] = value;
				this.changed = true; // Вказати, що дані були змінені при будь-якій зміні
				this.save(); // Зберегти дані тільки при фактичних змінах
				return true;
			},
		});
	},
};

storage.init();
