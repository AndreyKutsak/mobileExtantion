
const data_base = {
  db_name: "data_base",
  db: null,
  data: {},
  params: {
    addresses: {
      keyPath: ["id", "article"],
      index: {
        article: { unique: false },
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

        const promises = data_base.data[storeName].map(item => {
          return new Promise((resolve, reject) => {
            const key = data_base.params[storeName].keyPath.map(key => item[key]);
            const getRequest = store.get(key);
            getRequest.onsuccess = function (event) {
              const existingRecord = event.target.result;
              if (existingRecord) {
                const updateRequest = store.put(item);
                updateRequest.onsuccess = function () {
                  resolve();
                };
                updateRequest.onerror = function (event) {
                  reject(event.target.error);
                };
              } else {
                const addRequest = store.add(item);
                addRequest.onsuccess = function () {
                  resolve();
                };
                addRequest.onerror = function (event) {
                  reject(event.target.error);
                };
              }
            };
            getRequest.onerror = function (event) {
              reject(event.target.error);
            };
          });
        });

        return Promise.all(promises);
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
                console.log("Error: " + event.target.errorCode);
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

    const index = store.index(req.index_name);

    const getRequest = index.get(req.request[req.index_name] || req.index_name);
    getRequest.onsuccess = function (event) {
      const existingRecord = event.target.result;
      if (existingRecord) {
        console.log("Record found, updating...");
        // Оновлюємо запис без його попереднього видалення
        const updateRequest = store.put(req.request);
        updateRequest.onerror = function (event) {
          console.log("Error updating data:", event.target.error);
        };
        updateRequest.onsuccess = function (event) {

          console.log("Data updated successfully:", event.target.result);
        };
      } else {
        const addRequest = store.add(req.request);
        addRequest.onerror = function (event) {
          console.log(event);
          console.log("Error adding new data:", event.target.error);
        };
        addRequest.onsuccess = function (event) {

          console.log("New data added successfully:", event.target.result);
        };
      }
    };

    getRequest.onerror = function (event) {
      console.log("Error checking for existing data:", event.target.error);
    };
  },

  update_data: function (req) {
    const transaction = data_base.db.transaction(req.store_name, "readwrite");
    const objectStore = transaction.objectStore(req.store_name);
    const request = objectStore.get(req.request.article); // Отримуємо запис за ключем
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

  delete_item: function (req) {
    return new Promise(function (resolve, reject) {
      console.log("Starting delete transaction for store:", req.store_name);
      const transaction = data_base.db.transaction(req.store_name, "readwrite");
      const objectStore = transaction.objectStore(req.store_name);
      const index = objectStore.index(req.index_name);
      // Перевірка існування запису перед видаленням
      const getRequest = index.get(req.request);

      getRequest.onsuccess = function (event) {
        if (event.target.result) {
          const record = event.target.result;
          console.log("Record found:", record);


          const keyPath = data_base.params[req.store_name].keyPath;
          let key;
          if (Array.isArray(keyPath)) {
            key = keyPath.map(k => record[k]);
          } else {
            key = record[keyPath];
          }


          const deleteRequest = objectStore.delete(key);

          deleteRequest.onsuccess = function (event) {
            console.log("Data deleted successfully:", event.target.result);
            resolve(event.target.result);
          };

          deleteRequest.onerror = function (event) {
            console.log("Error deleting data:", event.target.error);
            reject(event.target.error);
          };
        } else {
          console.log("Record not found, cannot delete.");
          reject("Record not found");
        }
      };

      getRequest.onerror = function (event) {
        console.log("Error finding record:", event.target.error);
        reject(event.target.error);
      };

      transaction.oncomplete = function () {
        console.log("Transaction completed successfully");
      };

      transaction.onerror = function (event) {
        console.log("Transaction error:", event.target.error);
        reject(event.target.error);
      };

      transaction.onabort = function (event) {
        console.log("Transaction aborted:", event.target.error);
        reject(event.target.error);
      };
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
          console.log("Error getting data:", event.target.error);
          return reject(event);
        };
        request.onsuccess = function (event) {
          return resolve(event.target.result);
        };
      });

    });
  },
};
data_base.init().then(function (event) {
  let articles = Object.keys(data_base.data.addresses);
  console.log("Database initialized");
  articles.forEach((key) => {
    let item = data_base.data.addresses[key];
    if (item.cell_capacity) {
      if (item.save_area_count < 0 && item.real_goods_count < 0) {
        if (item.last_goods_count < item.cell_capacity) {
          item.real_goods_count = item.last_goods_count;
        }
        if (item.last_goods_count > item.cell_capacity) {
          item.real_goods_count = item.cell_capacity;
        }
      }
      data_base.save_data({ store_name: "addresses", request: item });
    };
  })
});
