const storage = {
    db: null,
    params: {
        addresses: { keyPath: ["id", "article"],
        index:{article:{unique:true},id:{unique:true}} },
        elaborations: { keyPath: "id" }
    },
    init: function () {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("Storage", 1);
            request.onerror = function (event) {
                reject(`Під час відкриття бази даних сталася помилка: ${event.target.errorCode}`);
            };
            request.onsuccess = function (event) {
                storage.db = event.target.result;
                resolve();
            };
            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                const storeList = Object.keys(storage.params);
                storeList.forEach(function (item) {
                    if (!db.objectStoreNames.contains(item)) {
                        let store=db.createObjectStore(item, { keyPath: storage.params[item].keyPath });
                        console.log(storage.params[item])
                        if(Object.keys(storage.params[item].index).length>0){

                            Object.keys(storage.params[item].index).forEach(function(index){
                                console.log(index,storage.params[item].index[index],storage.params[item][index])
                                store.createIndex(index,index,{unique:storage.params[item].index[index].unique});
                               
                            })
                        }
                       
                    }
                });
            };
        });
    },
    get: function (data) {
        console.log(data.id)
        return new Promise((resolve, reject) => {
            this.init().then(() => {
                const transaction = storage.db.transaction([data.store_name], "readonly");
                const objectStore = transaction.objectStore(data.store_name);
                const index = objectStore.index("artilce");
const request=index.get(data.id||data.article);
console.log(request);

                request.onerror = function (event) {
                    reject(`Помилка при отриманні даних: ${event.target.errorCode}`);
                };
                request.onsuccess = function (event) {
                    console.log(event)
                    const result = event.target.result;
                    const value = result ? result.value || result : null;
                    resolve(value);
                };

            }).catch(error => {
                reject(error);
            });
        });
    },
    set: function (data) {
        return new Promise((resolve, reject) => {
            this.init().then(() => {
                const transaction = storage.db.transaction([data.store_name], "readwrite");
                const objectStore = transaction.objectStore(data.store_name);
                objectStore.put({ id: data.id, article: data.article, value: data.value });
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    }
};

// Приклад використання:
storage.set({
    store_name: "addresses",
    id: "1.12.0007",
    article: "25",
    value: {
        cell: "8805",
        place: "A-12.4.5",
        cell_capacity: "23",
        real_count: "12"
    }
}).then(() => {
    console.log("Дані успішно збережені");
}).catch(error => {
    console.error("Сталася помилка при збереженні даних:", error);
});

// Приклад отримання даних:
storage.get({ store_name: "addresses", id: "25" }).then(result => {
    console.log("Значення для ключа '1.12.0007' у магазині 'addresses':", result);
}).catch(error => {
    console.error("Сталася помилка при отриманні даних:", error);
});

