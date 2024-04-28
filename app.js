const storage = {
    db: null,
    data: {},
    init: function (data, callback) {
        let request = indexedDB.open("Storage", 1);
        request.onerror = function (event) {
            alert("Сталася помилка під час");
            console.error(`IndexedDB error ${event.trget.errorCode}`)
        };
        request.onsucess = function (event) {
            this.db = event.target.result;
            const storedData = this.getData();
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
            console.log(event)
            const db = event.target.result;
            const store_list = Object.keys(data.store);
            if (store_list.length > 0) {
                store_list.forEach(function (item) {
                    if (!db.objectStoreNames.contains(item)) {
                        db.createObjectStore(item, { keyPath: data.store[item] });
                    }
                })
            }
            this.getData()

        }
    },
    getData: function (data) {
        let transaction = this.db.transaction(Object.keys(data.store), "readonly");
        let objectStore = transaction.objectStore(data.store);
        let request = objectStore.getAll();

    }
storage.init({ store: { listArray: ["article"], compareArray: ["artilce"], elaborations: "id", addresses: ["article", "id"], orders: ["id"], history: "id", production: "id", settings: "id", id: "id", main_data: "name" } })