const data_base = {
  db_name: "data_base",
  db: null,
  data: {},
  params: {
    addresses: {
      keyPath: ["id", "article"],
      index: {
        article: { unique: true },
        id: { unique: false },
      },
    },
    orders: {
      keyPath: ["id"],
      index: {
        id: { unique: true },
      },
    },
    elaborations: {
      keyPath: ["date"],
      index: {
        date: { unique: true },
      },
    },
    listArray: {
      keyPath: ["article"],
      index: {
        article: { unique: true },
      },
    },
    compareArray: {
      keyPath: ["article"],
      index: {
        article: { unique: false },
      },
    },
    id: {
      keyPath: ["id"],
      index: {
        id: {
          unique: true,
        },
      },
    },
    production: {
      keyPath: ["id"],
      index: {
        id: { unique: true },
      },
    },
    history: {
      keyPath: ["id"],
      index: {
        id: { unique: true },
      },
    },
    settings: {
      keyPath: ["name"],
      index: {
        name: { unique: true },
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
        data_base.init_data().then(function () {
          console.log(data_base.data);
        });
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
    const transaction = data_base.db.transaction(
      Object.keys(data_base.data),
      "readwrite"
    );

    return Promise.all(
      Object.keys(data_base.data).map(function (storeName) {
        const store = transaction.objectStore(storeName);
        return store.add(
          data_base.data[storeName],
          data_base.params[storeName].keyPath
        );
      })
    );
  },

  init_data: function () {
    return new Promise((resolve, reject) => {
      const store_list = Object.keys(data_base.params);
      const promises = [];

      store_list.forEach(function (store_item) {
        const promise = new Promise((resolveStore, rejectStore) => {
          data_base.data[store_item] = {};
          const store = data_base.db
            .transaction(store_item, "readonly")
            .objectStore(store_item);
          const index_list = Object.keys(data_base.params[store_item].index);

          const indexPromises = index_list.map(function (index_item) {
            return new Promise((resolveIndex, rejectIndex) => {
              const index = store.index(index_item);
              const request = index.getAll();

              request.onerror = function (event) {
                rejectIndex(event.target.error);
              };
              request.onsuccess = function (event) {
                const result = event.target.result;

                if (result.length > 0) {
                  if (store_item === "addresses") {
                    result.forEach(function (res_item) {
                      data_base.data[store_item][res_item.article] = res_item;
                    });
                  } else {
                    result.forEach(function (res_item) {
                      let key = data_base.params[store_item].keyPath;
                      data_base.data[store_item][res_item[key]] = res_item;
                    });
                  }
                }

                resolveIndex();
              };
            });
          });

          Promise.all(indexPromises)
            .then(() => resolveStore())
            .catch((error) => rejectStore(error));
        });

        promises.push(promise);
      });

      Promise.all(promises)
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  },

  save_data: function (req) {
    const transaction = data_base.db.transaction([req.store_name], "readwrite");
    const store = transaction.objectStore(req.store_name);
    const request = store.put(req.request);
    request.onerror = function (event) {
      console.log(event.target.error);
    };
    request.onsuccess = function (event) {
      let key = data_base.params[req.store_name].keyPath[0];
      if (req.store_name === "addresses") key = "article";
      data_base.data[req.store_name][key] = req.request;
    };
  },
  update_data: function (req) {
    const transaction = data_base.db.transaction(req.store_name, "readwrite");
    const objectStore = transaction.objectStore(req.store_name);
    const request = objectStore.get(req.value); // Отримуємо запис за ключем
    request.onerror = function (event) {
      console.log(event);
    };
    request.onsuccess = function (event) {
      const data = event.target.result;
      console.log(data);
      if (data) {
        const keys = Object.keys(req.request);
        keys.forEach(function (key) {
          data[key] = req.request[key];
        });
        objectStore.put(data); // Оновлюємо запис зміненими даними
      }
    };
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
          return reject(event);
        };
        request.onsuccess = function (event) {
          return resolve(event.target.result);
        };
      });
    });
  },

  delete_item: function (req) {
    return new Promise(function (resolve, reject) {
      const transaction = data_base.db.transaction(req.store_name, "readwrite");
      const objectStore = transaction.objectStore(req.store_name);
      const request = objectStore.delete(req.request); // Видаляємо запис за ключем
      request.onsuccess = function (event) {
        return resolve(event.target.result);
      };
      request.onerror = function (event) {
        return reject(event);
      };
    });
  },
};

data_base.init().then(function (event) {
  console.log(data_base.data, event);
  data_base.save_data({ store_name: "addresses", request: { article: "test", id: "test", url: "test" } })
  document.addEventListener("click", function (event) {
    data_base.update_data({ store_name: "addresses", index: "article", value: "test", request: { article: "test", id: "test", event, url: "test2" } });
  });
  document.addEventListener("keyup", function (event) {
    data_base.delete_item({ store_name: "addresses", request: "test" });
  });
});
