const data_base = {
  db_name: "data_base",
  db: null,
  data: {},
  params: {
    addresses: {
      keyPath: ["id", "article"],
      index: {
        article: { unique: true },
        id: { unique: true },
      },
    },
    orders: {
      keyPath: ["id"],
      index: {
        id: { unique: true },
      },
    },
    elaborations: {
      keyPath: ["id"],
      index: {
        id: { unique: true },
      },
    },
  },
  init: function () {
    return new Promise(function (resolve, reject) {
      const request = indexedDB.open(data_base.db_name, 1);
      request.onerror = function (event) {
        console.log("Error: " + event.target.errorCode);
        reject(event.target.errorCode);
      };
      request.onsuccess = function (event) {
        data_base.db = event.target.result;
        data_base.init_data(event);

        resolve(event);
      };
      request.onupgradeneeded = function (event) {
        const store_list = Object.keys(data_base.params);
        if (store_list.length > 0) {
          store_list.forEach(function (store_item) {
            if (!event.target.result.objectStoreNames.contains(store_item)) {
              const store = event.target.result.createObjectStore(store_item, {
                keyPath: data_base.params[store_item].keyPath,
              });
              const index_list = Object.keys(
                data_base.params[store_item].index
              );
              if (index_list.length > 0) {
                index_list.forEach(function (index_item) {
                  store.createIndex(index_item, index_item, {
                    unique:
                      data_base.params[store_item].index[index_item].unique,
                  });
                });
              }
            }
          });
        }

        resolve(event);
      };
    });
  },
  save_all: function () {
    return data_base
      .init()
      .then(function () {
        const transaction = data_base.db.transaction(
          Object.keys(data_base.data),
          "readwrite"
        );

        // Зберігання кожного ключа об'єкта даних в відповідному сторі
        return Promise.all(
          Object.keys(data_base.data).map(function (storeName) {
            const store = transaction.objectStore(storeName);
            return store.add(data_base.data[storeName]);
          })
        );
      })
      .then(function (results) {
        console.log("All data saved successfully:", results);
      })
      .catch(function (error) {
        console.error("Error saving data:", error);
      });
  },

  init_data: function (event) {
    const store_list = Object.keys(data_base.params);
    const db = event.target.result;
    const transaction = db.transaction(store_list, "readonly");

    transaction.oncomplete = function () {
      store_list.forEach(function (store_item) {
        const store = db
          .transaction(store_item, "readonly")
          .objectStore(store_item);
        const index_list = Object.keys(data_base.params[store_item].index);
        index_list.forEach(function (index_item) {
          const index = store.index(index_item);
          const request = index.getAll();
          request.onerror = function (event) {
            console.log("Error: " + event.target.errorCode);
          };
          request.onsuccess = function (event) {
            data_base.data[store_item] = event.target.result;
          };
        });
      });
    };
  },

  save_data: function (req) {
    return data_base
      .init()
      .then(function () {
        const transaction = data_base.db.transaction(
          [req.store_name],
          "readwrite"
        );
        const store = transaction.objectStore(req.store_name);

        const request = store.add(req.request);
        request.onerror = function (event) {
          console.log(event);
        };
        request.onsuccess = function (event) {
          console.log(event.target.result, "success save");
        };
      })
      .catch(function (error) {
        console.error("Error: " + error);
      });
  },

  get_data: function (req) {
    return data_base.init().then(function (event) {
      return new Promise(function (resolve, reject) {
        const db = event.target.result;
        const transaction = db.transaction(req.store_name, "readonly");
        const store = transaction.objectStore(req.store_name);
        const index = store.index(req.index);
        const request = index.get(req.request);
        request.onerror = function (event) {
          console.log(event, "error");
          return reject(event);
        };
        request.onsuccess = function (event) {
          console.log(event.target.result, "success get");
          return resolve(event.target.result);
        };
      });
    });
  },
};

data_base.init().then(function (data) {});
