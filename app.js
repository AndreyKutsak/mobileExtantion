const storage = {
    db: null,
    data: {},
    init: function (data, callback) {
        let request = new IndexedDB.open("Storage", 1);
        request.onerror = function (event) {
            alert("Сталася помилка під час");
            console.error(`IndexedDB error ${event.trget.errorCode}`)
        };
        request.onsucess = function (event) {
            this.db = event.target.result;
            const storedData = this.getData(callback);
            this.data = storedData || {
                listArray: {},
                compareArray: {},

                elaborations: {},
                addresses: {},
                orders: {},
                history: [],
                production: [],
                settings: {},
                id: {},
                main_data: {}
            };
        };
        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            const store_list = Object.keys(data.store);
            if (store_list.length > 0) {
                store_list.forEach(function (item) {
                    if (!db.objectStoreNames.contains(item)) {
                        db.createObjectStore(item, { keyPath: data.store[item] });
                    }
                })
            }

        }
    }
}