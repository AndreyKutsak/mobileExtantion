const database = {
  db: null,
  db_name: "DataBase",
  data: {},
  params: {
    addresses: {
      keyPath: ["id", "article"],
      index: {
        article: { isUnique: true },
        id: { isUnique: false },
      },
    },
    setings: {
      keyPath: ["type"],
    },
    orders: {
      keyPath: ["id"],
    },
  },
  init: function () {
    return new Promise(function (resolve, reject) {
      const request = indexedDB.open(storage._db_name, 1);
      request.onerror = function (event) {
        console.log(event);
        reject(this.error);
      };
      request.onsuccess = function (event) {
        db = event.target.result;
        storage.init_data(event);
        return resolve(db);
      };
      request.onupgradeneeded = function (event) {
        db = event.target.result;
        Object.keys(storage.params).forEach(function (item) {
          if (!db.objectStoreNames.contains(item)) {
            const objectStore = db.createObjectStore(item, {
              keyPath: storage[item].keyPath,
            });
            if (Object.keys(storage.params[item].index.length > 0)) {
              Object.keys(storage.params[item].index).forEach(function (
                index_item
              ) {
                objectStore.createIndex(
                  storage.params[item].index[index_item],
                  storage.params[item].index[index_item],
                  { unique: storage.params[item].index[index_item].isUnique }
                );
              });
            }
          }
        });
      };
    });
  },
  init_data: function (param) {
    let stores_list = param.objectStoreNames;
    stores_list.forEach(function (store_item) {
      let transaction = param.transaction(store_item, "readonly");
      let store = transaction.objectStore(store_item);
      let index = store.index(store_item);
      let request = index.getAll(store_item);
      request.onerror = function (event) {
        console.log(event);
      };
      request.onsuccess = function (event) {
        data[store_item] = event.target.result;
      };
    });
  },
};
