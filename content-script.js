window.addEventListener("load", () => {
  let head = document.querySelector("head");
  head.innerHTML = `<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мобільна База Замовлень</title>">
`;
  let loginInp = document.querySelector("#loginB1");
  if (loginInp !== null) {
    let btn = document.querySelector("button");
    btn.addEventListener("click", function (event) {
      let login = loginInp.value;
      password = document.querySelector("#passB1").value;
      let loginData = { login: login, password: password };
      localStorage.setItem("loginData", JSON.stringify(loginData));
    });

    return false;
  }
  // remove all elements from body
  let children = Array.from(document.body.children);
  children.forEach((child) => {
    child.remove();
  });
  data_base.init();
});
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
        console.log(event);
        console.log("Error: " + event.target.errorCode);
        reject(event.target.errorCode);
      };
      request.onblocked = function (event) {
        console.warn(
          "Database upgrade is blocked because another tab is using an older version."
        );
        // Можна повідомити користувача або закрити інші вкладки
        alert(
          "Please close other tabs using this website to proceed with the update."
        );
      };
      request.onsuccess = function (event) {
        data_base.db = event.target.result;

        // Завантаження даних виконується асинхронно
        data_base
          .init_data()
          .then(() => {
            main();
            console.log("Дані успішно завантажено");
          })
          .catch((error) => {
            console.error("Помилка під час завантаження даних:", error);
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

        const promises = data_base.data[storeName].map((item) => {
          return new Promise((resolve, reject) => {
            const key = data_base.params[storeName].keyPath.map(
              (key) => item[key]
            );
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
        console.log(store, req.request);
        const addRequest = store.put(req.request);
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
            key = keyPath.map((k) => record[k]);
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

function main() {
  let loginData = JSON.parse(localStorage.getItem("loginData"));
  if (!loginData) {
    alert("Залогінся!!!");
    return;
  }

  let url = {
    baza: "https://baza.m-p.in.ua/ajax/magaz.php",
    elaborations: "https://baza.m-p.in.ua/ajax/loadElaboration.php",
    addElaboration: "https://baza.m-p.in.ua/ajax/addElaborationAnswer.php",
    getQuestion: "https://baza.m-p.in.ua/ajax/loadQuestions.php",
    addAnswer: "https://baza.m-p.in.ua/ajax/addAnswer.php",
    search: "https://baza.m-p.in.ua/ajax/search.php",
    orders: "https://baza.m-p.in.ua/ajax/orders.php",
    order: "https://baza.m-p.in.ua/ajax/order_cont.php",
    reserve: "https://baza.m-p.in.ua/ajax/podrRezerv.php",
    deliveries: "https://baza.m-p.in.ua/ajax/prihod1.php",
    sales: "https://baza.m-p.in.ua/ajax/podrSales.php",
    production: "https://baza.m-p.in.ua/ajax/ourGoods.php",
    stilages: "https://baza.m-p.in.ua/ajax/stillages.php",
    stilagesZones: "https://baza.m-p.in.ua/ajax/stillagesZone.php",
    stilage: "https://baza.m-p.in.ua/ajax/stillage.php",
    prihod: "https://baza.m-p.in.ua/ajax/prihod.php",
    prihod_item: "https://baza.m-p.in.ua/ajax/nakladnaya_cont.php",
    seal_number: "https://baza.m-p.in.ua/ajax/save_warranty.php",
    add_coment: "https://baza.m-p.in.ua/ajax/add_comment_order.php",
    add_goods_comment: "https://baza.m-p.in.ua/ajax/redactAdmComm.php",
    podrobno: "https://baza.m-p.in.ua/ajax/podrobno_cont.php",
    bar_code:
      "https://barcode.tec-it.com/barcode.ashx?code=Code128&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=96&imagetype=Gif&rotation=0&color=%23000000&bgcolor=%23ffffff&codepage=&qunit=Mm&quiet=2",
    API: {
      baza: "https://baza.m-p.in.ua/API/magaz.php",
      search: "https://baza.m-p.in.ua/API/search.php",
      reserve: "https://baza.m-p.in.ua/API/podrRezerv.php",
      elaborations: "https://baza.m-p.in.ua/API/loadElaboration.php",
    },
  };

  //regulars expression
  let regExp = {
    id: /\((\d+)\)/,
    time_from_str: /\d+(?=:|\b)/g,
    elaboration: /Є уточнення: (\d+) шт\./,
    question: /Є питання: (\d+) шт\./,
    article: /\s(\d+\.\d+\.\d+)/,
    elaborationArticle: /\((\d+(\.\d+)*)\)$/,
    orderArticle: /\d+\.\d+\.\d+/,
    params: /\((.*?)\)/,
    number: /№(\d+)/,
    num: /\d+/,
    sentence: /[^\\n]+(?=\\n|$)/g,
    cell: new RegExp("cell", "gi"),
    barcode_cell: /openShtrihCodes\('\d+',(\d+)\);/,
    orderPlace: /[A-Z]\d*-\d+\.\d+\.\d+/gm,
    goodsCount:
      /всього:\s*(\d+)\(.*?\)\s*(м\/п|компл\.|шт\.|бал\.|упак\.|пар\.)|резерв:\s*(\d+)\(.*?\)\s*(м\/п|компл\.|шт\.|бал\.|упак\.|пар\.)/g,
  };
  let barcode_params = {};
  let barcodes_data = {};
  let src = {
    ico: {
      recycle: "img/recycle-bin-ico.svg",
      barcode: "img/barcode-ico.svg",
      list: "img/list-ico.svg",
      compare: "img/compare-ico.svg",
      elaboration: "img/elaboration-ico.svg",
      send: "img/send-ico.svg",
      spiner: "img/spiner.svg",
      logout: "img/logout-ico.svg",
      question: "img/question-ico.svg",
      orders: "img/order-ico.svg",
      production: "img/production-ico.svg",
      history: "img/history-ico.svg",
    },
    img: {
      test_cell_barcode: "img/barcode.gif",
    },
  };
  let interval = {
    elaboration: 15 * 1000,
    cell_goods_count: 1000 * 30 * 60,
  };
  let get = {
    years_frequency: function (data) {
      if (data.length == 0) {
        return { err: true, err_desc: "no data" };
      }

      let year_freq = {};

      data.forEach(function (item) {
        let year = item.date.trim().split(" ")[2];
        if (year_freq[year]) {
          year_freq[year].freq++;
          year_freq[year].sum += Number(item.count);
        } else {
          year_freq[year] = { freq: 1, sum: Number(item.count) };
        }
      });

      Object.keys(year_freq).forEach(function (item) {
        year_freq[item].amount = Math.round(
          year_freq[item].sum / year_freq[item].freq
        );
      });

      console.log(year_freq);

      return year_freq;
    },

    time_from_last_delivery: function (data) {
      let month = {
        січня: 0,
        лютого: 1,
        березня: 2,
        квітня: 3,
        травня: 4,
        червня: 5,
        липня: 6,
        серпня: 7,
        вересня: 8,
        жовтня: 9,
        листопада: 10,
        грудня: 11,
      };
      let currentDate = new Date();
      let [day, delivery_month, year] = data.toLowerCase().split(" ");

      if (data.includes("сьогодні")) {
        return { years: 0, months: 0, days: 0 };
      } else if (data.includes("вчора")) {
        currentDate.setDate(currentDate.getDate() - 1);
        [day, delivery_month, year] = [
          currentDate.getDate(),
          currentDate.getMonth(),
          currentDate.getFullYear(),
        ];
      }

      let targetDate = new Date(year, month[delivery_month], day);
      let elapsedTime = currentDate.getTime() - targetDate.getTime();
      const elapsedYears = Math.floor(
        elapsedTime / (1000 * 60 * 60 * 24 * 365)
      );
      const elapsedMonths =
        Math.floor(elapsedTime / (1000 * 60 * 60 * 24 * 30.44)) % 12;
      const elapsedDays =
        Math.floor(elapsedTime / (1000 * 60 * 60 * 24)) % 30.44;

      return {
        years: elapsedYears,
        months: elapsedMonths,
        days: elapsedDays.toFixed(0),
      };
    },
    elaboration_time: function (data) {
      let date = get.date();
      let hours = date.hours;
      let minutes = date.minutes;
      var match = data.match(regExp.time_from_str);
      if (match) {
        if (match.length === 1) {
          minutes -= parseInt(match[0]);
        } else if (match.length === 2) {
          hours -= parseInt(match[0]);
          minutes -= parseInt(match[1]);
        }
      }
      return { hours: hours, minutes: minutes };
    },
    params_for_seal: function (str) {
      let matches = str.match(regExp.params);
      let params = [];
      if (matches && matches.length > 1) {
        matches[1].split(",").forEach((item) => {
          params.push(item.trim());
        });
        return params;
      }
    },
    url: function (data) {
      return chrome.runtime.getURL(String(data));
    },
    mergeSort: function (arr) {
      if (arr.length <= 1) {
        return arr;
      }

      const middle = Math.floor(arr.length / 2);
      const left = arr.slice(0, middle);
      const right = arr.slice(middle);
      function merge(left, right) {
        let result = [];
        let leftIndex = 0;
        let rightIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length) {
          if (left[leftIndex].count > right[rightIndex].count) {
            result.push(left[leftIndex]);
            leftIndex++;
          } else {
            result.push(right[rightIndex]);
            rightIndex++;
          }
        }

        return result.concat(left.slice(leftIndex), right.slice(rightIndex));
      }

      return merge(get.mergeSort(left), get.mergeSort(right));
    },
    parser: function (data) {
      let domParser = new DOMParser();
      let doc = domParser.parseFromString(data, "text/html");
      return doc;
    },
    percent: function (data) {
      return (100 * data.num) / data.main;
    },
    elaborationArtice: function (data) {
      if (data == undefined) {
        return false;
      }
      let article = data.match(regExp.elaborationArticle);
      if (article !== null) {
        return article[1];
      }
      console.warn(`не вдалось отримати артикул з уточнення ${data}`);
      return false;
    },
    article: function (data) {
      let matchData = { id: null, article: null };
      let matchNumber = data.match(regExp.number);
      let matchArticle = data.match(regExp.article);
      if (matchNumber && matchArticle) {
        let numberPart = matchNumber[1];
        let articlePart = matchArticle[1];
        matchData.id = numberPart;
        matchData.article = articlePart;
        return matchData;
      }
      return false;
    },
    articleAndPlacement: function (data) {
      if (data !== undefined) {
        let matchData = { place: null, article: null };
        let article = data.match(regExp.orderArticle);
        let place = data.match(regExp.orderPlace);

        if (article !== null && place !== null) {
          let placeStr = "";
          matchData.article = article[0];
          place.forEach((str) => {
            placeStr += ` ${str}`;
          });
          matchData.place = placeStr;
        }
        return matchData;
      }
    },
    date: function () {
      const date = new Date();
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
      };
    },
    orderId: function (data) {
      const regex = /\((\d+)\)/;
      const match = data.match(regex);
      if (match && match.length >= 2) {
        return parseInt(match[1], 10);
      }
      return null;
    },
    num: function (data) {
      const matches = data.match(regExp.num);
      if (matches && matches.length > 0) {
        return parseInt(matches[0], 10);
      }

      return null;
    },
    goodsCount: function (data) {
      const matches = {};
      let match;
      while ((match = regExp.goodsCount.exec(data)) !== null) {
        if (match[1] !== undefined) {
          matches["baseCount"] = parseInt(match[1]);
        } else if (match[3] !== undefined) {
          matches["orderCount"] = parseInt(match[3]);
        }
      }
      return matches;
    },
    elements: function (data) {
      let element = document.createElement(data.el);
      if (data.className) {
        element.className = data.className;
      }
      if (data.src) {
        element.src = data.src;
      }
      if (data.alt) {
        element.alt = data.alt;
      }
      if (data.autofill) {
        element.setAttribute("autocomplete", data.autofill);
      }
      if (data.atr) {
        for (const atrKey in data.atr) {
          element.setAttribute(atrKey, data.atr[atrKey]);
        }
      }
      if (data.func) {
        data.func.call(element);
      }
      if (data.style) {
        for (const styleKey in data.style) {
          element.style[styleKey] = data.style[styleKey];
        }
      }
      if (data.href) {
        element.href = data.href;
      }
      if (data.value) {
        element.value = data.value;
      }

      if (data.placeholder) {
        element.placeholder = data.placeholder;
      }
      if (data.type) {
        element.type = data.type;
      }
      if (data.id) {
        element.id = data.id;
      }
      if (data.text) {
        element.textContent = data.text;
      }
      if (data.for) {
        element.setAttribute("for", data.for);
      }
      if (data.data) {
        data.data.forEach((item) => {
          const keys = Object.keys(item);
          const values = Object.values(item);
          if (keys.length === 1) {
            const key = keys[0];
            const value = values[0];
            element.dataset[key] = value;
          }
        });
      }

      if (data.event && data.hendler && typeof data.hendler === "function") {
        element.addEventListener(data.event, (event) => {
          event.stopPropagation();
          data.hendler.call(element, event);
        });
      }
      if (data.children) {
        data.children.forEach((child) => {
          let childElement = this.elements(child);
          element.appendChild(childElement);
        });
      }
      return element;
    },
    decode: function (data) {
      if (data === undefined) {
        console.error("Помилка при кодуванні інформації", data);
        return;
      }
      if (typeof data !== "object") {
        console.log("Передано не коректний тип данних");
        return;
      }
      if (Object.values(data).length == 0) {
        console.log("Відсутня інформація для конвертації");
        return;
      }
      let convertedData = new URLSearchParams();
      Object.values(data).forEach((item, index) => {
        convertedData.append(Object.keys(data)[index], item);
      });

      return convertedData || false;
    },
  };
  let hendlers = {
    get_ending_goods: async function () {
      generate.preloader({ status: "start" });
      const production_goods_list = await load.production();
      const goods_list = [];
      const chcecked_items = {};

      for (let i = 0; i < production_goods_list.length; i++) {
        generate.preloader({
          status: "update_status",
          desc: `${i} / ${Object.keys(production_goods_list).length}`,
        });
        if (
          production_goods_list[i].can_product == "0" ||
          chcecked_items[production_goods_list[i].article]
        ) {
          continue;
        }
        chcecked_items[production_goods_list[i].article] = true;
        console.log(production_goods_list[i]);
        const search = await load.search({
          search: production_goods_list[i].article,
          search_sell: 0,
        });
        search.forEach(async function (item) {
          if (item.article == production_goods_list[i].article) {
            const min_count = await load.podrobno({ id: item.id, divId: "0" });
            if (+min_count["Мін."] >= +item.count) {
              production_goods_list[i].count = item.count;
              production_goods_list[i].min_count = min_count["Мін."];
              goods_list.push(production_goods_list[i]);
            }
          }
        });
      }
      console.log(goods_list);
      generate.preloader({ status: "end" });
      contentWraper.appendChild(generate.production(goods_list));
    },

    show_barcodes: function () {
      if (!barcodes_data) {
        alert("Немаєданних для генерації штрихкодів!!!");
        return;
      }
      let barcodes_wrapper = document.querySelector(".sticker_list_wrapper");
      Object.keys(barcodes_data).forEach(function (item) {
        barcodes_data[item].forEach(function (cell) {
          if (!cell?.cell) {
            console.log("Пуста комірка:", cell);
            return;
          }
          observeStickers();
          let cell_place = {
            el: "p",
            className: "cell_place",
            text: cell.cell_number,
          };
          if (!barcode_params.add_place_checkbox) {
            cell_place = {
              el: "div",
              style: [
                {
                  display: "none",
                },
              ],
            };
          }
          let cell_barcode = {
            el: "div",
            className: "image_wrapper",
            children: [
              {
                el: "img",
                alt: `CELL: ${cell.cell}`,
                src: url.bar_code + `&data=CELL${cell.cell}`,
                className: "cell_barcode_img",
                event: "click",
                hendler: hendlers.handleElementEdit,
              },
              cell_place,
            ],
          };
          if (!barcode_params.add_cell_barcode_checkbox) {
            cell_barcode = {
              el: "div",
              style: [
                {
                  display: "none",
                },
              ],
            };
          }

          let cell_goods_list = {
            el: "ul",
            className: "goods_list",
            event: "click",
            hendler: hendlers.handleElementEdit,
            children: [],
          };

          // Тепер ми ітеруємо тільки по товарах конкретної комірки
          if (cell.goods_list && cell.goods_list.length > 0) {
            cell.goods_list.forEach(function (good_item) {
              let article;
              let desc;
              if (barcode_params.add_article_checkbox) {
                article = good_item.article;
              }
              if (barcode_params.add_description_checkbox) {
                desc = good_item.desc;
              }
              console.log(desc);
              let good_element = {
                el: "li",
                className: "article_item",
                text: article,
                children: [
                  {
                    el: "p",
                    className: "good_desc",
                    text: desc,
                    event: "click",
                    hendler: hendlers.handleElementEdit,
                  },
                ],
              };

              cell_goods_list.children.push(good_element);
            });
          }
          // Додаємо готові елементи до сторінки
          barcodes_wrapper.appendChild(
            get.elements({
              el: "div",
              className: "sticker",
              event: "click",
              hendler: hendlers.handleElementEdit,
              children: [cell_barcode, cell_goods_list],
            })
          );
        });
      });
      splitBarcodeItems();
    },
    handleElementEdit: function (event) {
      const target = event.target;
      const existingEditor = document.querySelector("#css-editor-container");

      // Якщо існує редактор, видаляємо його
      if (
        existingEditor &&
        existingEditor.dataset.target === target.dataset.target
      ) {
        target.style.backgroundColor = "";
        existingEditor.remove();
        return;
      }

      if (existingEditor) {
        const previousTarget = document.querySelector(
          `.${existingEditor.dataset.target}`
        );
        previousTarget.style.backgroundColor = "";
        existingEditor.remove();
      }

      // Виділяємо вибраний елемент
      target.style.backgroundColor = "rgba(255, 0, 0, 0.2)";

      // Створюємо контейнер редактора
      const editorContainer = document.createElement("div");
      editorContainer.id = "css-editor-container";
      editorContainer.dataset.target = target.className;
      editorContainer.style.position = "absolute";

      const targetRect = target.getBoundingClientRect();
      editorContainer.style.left = `${Math.min(
        targetRect.left + window.scrollX,
        window.innerWidth - 400 + window.scrollX
      )}px`;
      editorContainer.style.top = `${Math.min(
        targetRect.bottom + 10 + window.scrollY,
        targetRect.top + 300 + window.scrollY
      )}px`;

      editorContainer.style.width = "400px";
      editorContainer.style.height = "200px";
      editorContainer.style.backgroundColor = "#2d2d2d";
      editorContainer.style.border = "1px solid #ccc";
      editorContainer.style.padding = "10px";
      editorContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
      editorContainer.style.borderRadius = "5px";
      editorContainer.style.overflow = "hidden";

      const editor = document.createElement("textarea");
      editor.id = "css-editor";
      editor.dataset.target = target.className;
      editor.style.width = "100%";
      editor.style.height = "150px";
      editor.style.fontFamily = "monospace";
      editor.style.backgroundColor = "#2d2d2d";
      editor.style.color = "#f8f8f2";
      editor.style.border = "none";
      editor.style.padding = "10px";
      editor.style.overflowY = "auto";
      editor.style.whiteSpace = "pre-wrap";

      const applyButton = document.createElement("button");
      applyButton.id = "css-editor-apply";
      applyButton.textContent = "Застосувати до всіх";
      applyButton.style.position = "absolute";
      applyButton.style.bottom = "10px";
      applyButton.style.right = "10px";
      applyButton.style.padding = "5px 10px";
      applyButton.style.backgroundColor = "#007bff";
      applyButton.style.color = "#fff";
      applyButton.style.border = "none";
      applyButton.style.borderRadius = "5px";
      applyButton.style.cursor = "pointer";
      applyButton.style.fontSize = "12px";

      editorContainer.appendChild(applyButton);
      editorContainer.appendChild(editor);
      document.body.appendChild(editorContainer);

      let isDragging = false;
      let offsetX, offsetY;

      editorContainer.addEventListener("mousedown", (e) => {
        if (e.target !== applyButton && e.target !== editor) {
          isDragging = true;
          offsetX = e.clientX - editorContainer.getBoundingClientRect().left;
          offsetY = e.clientY - editorContainer.getBoundingClientRect().top;
          editorContainer.style.cursor = "move";
        }
      });

      document.addEventListener("mousemove", (e) => {
        if (isDragging) {
          editorContainer.style.left = `${e.clientX - offsetX}px`;
          editorContainer.style.top = `${e.clientY - offsetY}px`;
        }
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
        editorContainer.style.cursor = "";
      });

      // Отримуємо тільки інлайн стилі
      let inlineStyles = target.getAttribute("style")
        ? target.getAttribute("style").replace(/;/g, ";\n") + "\n"
        : "";
      editor.value = inlineStyles.trim();

      editor.addEventListener("input", function () {
        const elements = document.querySelectorAll(`.${target.className}`);
        const applyBtn = document.querySelector("#css-editor-apply");
        const newStyles = editor.value.trim();
        if (applyBtn.textContent == "Застосувати до всіх") {
          elements.forEach((item) => {
            item.setAttribute("style", newStyles);
          });
        } else if (applyBtn.textContent == "Застосувати до одного") {
          target.setAttribute("style", newStyles);
        }
      });

      // Застосовуємо стилі до всіх елементів з однаковим класом
      applyButton.addEventListener("click", (e) => {
        let text = e.target.textContent;
        if (text == "Застосувати до всіх") {
          e.target.textContent = "Застосувати до одного";
        } else {
          e.target.textContent = "Застосувати до всіх";
        }
      });
    },
    set_barcode_params: function () {
      let id = this.id;

      let wrapper = document.querySelector(".sticker");
      if (id == "add_cell_barcode_checkbox" && this.checked) {
        barcode_params[id] = this.checked;
        wrapper.appendChild(
          get.elements({
            el: "div",
            className: "image_wrapper",
            id: "image_wrapper",
            event: "click",
            children: [
              {
                el: "img",
                className: "cell_barcode_img",
                alt: "barcode example",
                src: get.url(src.img.test_cell_barcode),
              },
            ],
            hendler: hendlers.handleElementEdit,
          })
        );
      } else if (id == "add_cell_barcode_checkbox" && !this.checked) {
        barcode_params[id] = this.checked;
        Array.from(document.querySelectorAll(".image_wrapper")).forEach(
          (item) => item.remove()
        );
      }
      if (id == "add_article_checkbox" && this.checked) {
        barcode_params[id] = this.checked;
        wrapper.appendChild(
          get.elements({
            el: "div",

            className: "article_item",
            text: "1.2.3456",
            event: "click",
            hendler: hendlers.handleElementEdit,
          })
        );
      } else if (id == "add_article_checkbox" && !this.checked) {
        barcode_params[id] = this.checked;
        Array.from(document.querySelectorAll(".article_item")).forEach((item) =>
          item.remove()
        );
      }
      if (id == "add_description_checkbox" && this.checked) {
        barcode_params[id] = this.checked;
        let desc = get.elements({
          el: "div",
          className: "position_description",
          className: "good_desc",
          text: "Опис позиції",
          event: "click",
          hendler: hendlers.handleElementEdit,
        });
        if (document.querySelector(".article_item")) {
          document.querySelector(".article_item").appendChild(desc);
          return;
        }
        wrapper.appendChild(desc);
      } else if (id == "add_description_checkbox" && !this.checked) {
        barcode_params[id] = this.checked;
        Array.from(document.querySelectorAll(".position_description")).forEach(
          (item) => item.remove()
        );
      }
      if (id == "add_place_checkbox" && this.checked) {
        barcode_params[id] = this.checked;
        let img_wrapper = document.querySelector(".image_wrapper");
        if (!img_wrapper) {
          alert("Місце Можливо додати лише якщо є штрихкод");
          return;
        }
        img_wrapper.appendChild(
          get.elements({
            el: "p",
            className: "cell_place",
            text: "A-1.2.3",
            event: "click",
            hendler: hendlers.handleElementEdit,
          })
        );
      } else if (id == "add_place_checkbox" && !this.checked) {
        barcode_params[id] = this.checked;
        let desc_items = document.querySelectorAll(".cell_number");
        desc_items.forEach((item) => {
          item.remove();
        });
      }
    },
    show_available_articles: function (categorys, places) {
      let desc = document.querySelector(".description");
      let articles = Object.keys(data_base.data.addresses);
      let matchingArticles = [];
      console.log(articles.length);
      if (categorys && Object.keys(categorys).length !== 0) {
        articles.forEach((item) => {
          let category = item.split(".");
          let isMatch = true;
          if (
            categorys.category !== undefined &&
            Number(categorys.category) !== Number(category[0])
          ) {
            isMatch = false;
          }
          if (
            categorys.sub_category !== undefined &&
            Number(categorys.sub_category) !== Number(category[1])
          ) {
            isMatch = false;
          }
          if (
            categorys.article !== undefined &&
            Number(categorys.article) !== Number(category[2])
          ) {
            isMatch = false;
          }

          if (isMatch) {
            matchingArticles.push(item);
          }
        });
      }
      if (places && Object.keys(places).length !== 0) {
        articles.forEach((item) => {
          if (data_base.data.addresses[item].place == undefined) return;
          let zone = data_base.data.addresses[item].place.split("-");
          let place = zone[1].split(".");
          let isMatch = true;

          if (places.zone !== undefined && places.zone !== zone[0]) {
            isMatch = false;
          }
          if (places.stilage !== undefined && places.stilage !== place[0]) {
            isMatch = false;
          }
          if (places.row !== undefined && places.stilage !== place[1]) {
            isMatch = false;
          }
          if (isMatch) {
            matchingArticles.push(item);
          }
        });
      }
      let check_btn = get.elements({
        el: "button",
        className: "check_btn btn",
        event: "click",
        hendler: function () {
          load.deliveries_statistics(matchingArticles);
        },
        text: "Розпочати перевірку",
      });

      desc.textContent = `Кількість артикулів: ${matchingArticles.length}`;
      console.log(matchingArticles, desc.parentElement.childNodes);
      let existBtn = desc.parentElement.querySelector(".check_btn");
      if (existBtn) existBtn.remove();
      if (!desc.parentElement.querySelector(".check_btn"))
        desc.parentElement.appendChild(check_btn);
    },
    database: async function (data) {
      let db;

      function save_data(data) {
        let transaction = db.transaction([data.store_name], "readwrite");
        let store = transaction.objectStore(data.store_name);
        let request = store.put(data.data);

        request.onerror = function (event) {
          console.log("Error: " + event.target.errorCode);
        };

        request.onsuccess = function (event) {
          console.log("Data saved successfully");
        };
      }

      function get_data(data, callback) {
        let transaction = db.transaction([data.store_name], "readonly");
        let objectStore = transaction.objectStore(data.store_name);
        let request = objectStore.getAll();

        request.onsuccess = function (event) {
          let stored_data = event.target.result;

          if (callback) {
            callback(stored_data);
          }
        };

        request.onerror = function (event) {
          console.log("Error getting data: " + event.target.errorCode);
        };
      }

      async function deliveries_table(data) {
        let indexDB = indexedDB.open("deliveries", 1);

        indexDB.onerror = function (event) {
          console.log("Error: " + event.target.errorCode);
        };

        indexDB.onsuccess = function (event) {
          db = event.target.result;
          console.log("Database initialised");

          if (data.action == "get_data") {
            get_data(data, data.callback);
          } else if (data.action == "save_data") {
            save_data(data);
          } else if (data.action == "clear_store") {
            let transaction = db.transaction([data.store_name], "readwrite");
            transaction.objectStore(data.store_name).clear();
          }
        };

        indexDB.onupgradeneeded = function (event) {
          db = event.target.result;
          db.createObjectStore("deliveries_list", { keyPath: "id" });
        };
      }

      await deliveries_table(data);
    },
    remove_elaboration_item: function () {
      let date = this.dataset.date.trim();
      let el = this.parentNode;
      console.log(date);
      data_base
        .delete_item({
          store_name: "elaborations",
          request: date,
          index_name: "date",
        })
        .then(function () {
          delete data_base.data.elaborations[date];
          el.remove();
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    send_seal_number: function () {
      let order_num = this.dataset.order_num;
      let seal_goods = this.dataset.seal_goods;
      let seal_number = this.value;

      load.seal_number({
        body: { order: order_num, goods: seal_goods, warranty: seal_number },
      });
    },
    add_seal_number: function () {
      let inp = this.parentElement.querySelector(".seal_inp");
      let comment_area = document.querySelector("textarea.order_comment");
      let comment_btn = document.querySelector("button.send_comment");
      if (inp.value.length == 0) {
        alert("Введіть пломбу!!");
        return;
      }
      if (comment_area.value.length > 0) {
        comment_area.value += "," + inp.value;
        return;
      }
      comment_area.value = inp.value;
    },
    send_order_comment: function (e) {
      e.preventDefault();
      let parrent = this.parentElement;
      let textarea = parrent.querySelector("textarea");
      let order_id = this.dataset.order_id;
      if (textarea.value.length < 2) {
        alert("Введіть коментар");
        return;
      }
      if (!order_id) {
        alert("Сталася помилка пад час відправки коментаря");
        return;
      }
      load.add_order_comment({
        body: { order: order_id, texts: textarea.value },
      });
    },
    add_good_comment: function (e) {
      e.preventDefault();
      // let inp = this.querySelector(".good_comment_inp");
      // let btn = this.querySelector(".send_comment_btn");
      // if (!btn.classList.contains("active")) {
      // 	btn.classList.add("active");
      // 	inp.classList.add("active_inp");
      // 	return;
      // }
      // btn.classList.remove("active");
      // inp.classList.remove("active_inp");
      // inp.value = ""
    },
    add_to_list: function (item) {
      let article = this.dataset.article;
      if (data_base.data.listArray[article]) {
        alert("Такий елемент вже є в списку");
        return;
      }
      data_base.data.listArray[article] = {
        article: article,
        photo: item.photo,
        photoLG: item.photoLG,
        head: item.head,
        count: item.baseCount,
        isProcesed: false,
        addingDate: get.date(),
      };
      data_base.save_data({
        store_name: "listArray",
        article: article,
        index_name: "article",
        request: data_base.data.listArray[article],
      });
      generate.tasksCount();
    },
    add_to_compare: function (item) {
      let article = this.dataset.article;
      let compareInp = this.parentElement.querySelector(".compare-inp");
      let wraper = this.parentElement.parentElement.parentElement;
      if (!compareInp.classList.contains("visible-inp")) {
        compareInp.classList.toggle("visible-inp");
        return;
      }
      if (data_base.data.compareArray[article]) {
        alert("Такий елемент вже є в списку");
        return;
      }
      if (compareInp.value == "") {
        alert("Введіть кількість");
        return;
      }
      data_base.data.compareArray[article] = {
        article: article,
        photo: item.photo,
        photoLG: item.photoLG,
        head: item.head,
        count: {
          realCount: compareInp.value,
          baseCount: item.baseCount.baseCount,
          orderCount: item.baseCount.orderCount,
        },
        isProcesed: false,
        addingDate: get.date(),
      };
      data_base.save_data({
        store_name: "compareArray",
        article: article,
        index_name: "article",
        request: data_base.data.compareArray[article],
      });
      compareInp.classList.toggle("visible-inp");
      wraper.style.backgroundColor = "#fbc8c8";
      this.classList.toggle("clicked");
      generate.tasksCount();
    },
    check: function () {
      let parentEl = this.parentElement.parentElement;
      parentEl.classList.toggle("success");
      parentEl.parentNode.appendChild(parentEl);
    },
    removeItem: function () {
      let article = this.dataset.article;
      let arr = this.dataset.arr;
      delete data_base.data[arr][article];

      this.parentElement.remove();
      data_base
        .delete_item({
          store_name: arr,
          index_name: "article",
          request: article,
        })
        .catch(function (error) {
          console.log(error);
        });
      generate.tasksCount();
    },
    getToProduction: function () {
      if (
        Object.values(data_base.data.production).some(
          (obj) => obj.id === this.dataset.id
        )
      ) {
        alert("Елемент вже є в списку!!!");
        return;
      }
      let parent = this.parentNode.parentNode;
      let id = this.dataset.id;
      let count = this.parentNode.querySelector(".item-input");
      if (count.value == "") {
        alert("Введіть кількість");
        return;
      }
      if (count.value == "0") {
        alert("Введіть кількість більше нуля");
        return;
      }
      data_base.data.production[id] = {
        id: id,
        count: count.value,
        isProcesed: false,
      };
      data_base.save_data({
        store_name: "production",
        id: id,
        index_name: "id",
        request: data_base.data.production[id],
      });

      count.disabled = true;
      parent.classList.add("procesed");
      parent.parentNode.prepend(parent);
      generate.tasksCount();
    },

    generateList: function () {
      contentWraper.innerHTML = "";
      contentWraper.appendChild(generate.list());
    },
    generateCompare: function () {
      contentWraper.innerHTML = "";
      contentWraper.appendChild(generate.compare());
    },
    procesed: function () {
      let el;
      let itemWraper = this.parentNode.parentNode;
      let arr = this.dataset.arr;
      let id = this.dataset.article;
      this.textContent = "Оброблено";
      this.parentNode.parentNode.style.backgroundColor = "#c2edc2";
      data_base.data[arr][id].isProcesed = true;
      el = data_base.data[arr][id];
      delete data_base.data[arr][id];
      data_base.data[arr][id] = el;
      itemWraper.parentNode.appendChild(itemWraper);
      data_base.save_data({
        store_name: arr,
        index_name: "article",
        request: data_base.data[arr][id],
      });
      generate.tasksCount();
    },
    production: function () {
      generate.preloader({ status: "start" });
      load.production().then((data) => {
        generate.preloader({ status: "end" });
        contentWraper.appendChild(generate.production(data));
      });
    },
    product: function () {
      let parent = this.parentNode.parentNode;
      let id = this.dataset.id;
      Object.values(data_base.data.production).forEach((item, index) => {
        if (item.id === id) {
          delete data_base.data.production[item.id];
          data_base
            .delete_item({
              store_name: "production",
              index_name: "id",
              request: item.id,
            })
            .then(function () {
              parent.remove();
            })
            .catch(function (err) {
              console.log(err);
              alert("Не вдалося видалити елемент");
            });
        }
      });

      generate.tasksCount();
    },
    addToList: function () {
      this.textContent = "Взято";
      this.parentNode.classList.add("success");
    },
    showImage: function (e) {
      e.preventDefault();
      let imgURL = e.currentTarget.getAttribute("href");
      let image = get.elements({
        el: "div",
        className: "img-wraper",
        event: "click",
        hendler: function (e) {
          if (e.srcElement.classList.contains("img-wraper")) {
            image.remove();
          }
        },
        children: [
          {
            el: "img",
            src: imgURL,
          },
        ],
      });
      contentWraper.appendChild(image);
    },
    questions: function () {
      generate.preloader({ status: "start" });
      load.questions().then((data) => {
        generate.preloader({ status: "end" });
        contentWraper.appendChild(generate.question(data));
      });
    },
    sendQuestion: function () {
      let area = this.parentNode.parentNode.querySelector("textarea");
      let id = this.dataset.id;
      if (area.value.length == 0) {
        alert("Введи відповідь");
        return;
      }
      load
        .fetch({
          url: url.addAnswer,
          method: "POST",
          body: { id: id, text: area.value },
        })
        .then((result) => {
          if (result.body.textContent == "ok") {
            area.remove();
            this.remove();
          } else {
            alert("Помилка Щсь пішло не так!!");
          }
        })
        .catch((err) => {
          connsole.log(err);
        });
    },
    checkAnswer: function () {
      let answer = this.value;
      let count = Number(this.dataset.count);

      if (get.num(answer) > count) {
        this.parentNode.parentNode.classList.add("warn");
        alert("Перевір ще раз,І не забудь вказати лишки в пересорт");
      }
      if (get.num(answer) < count) {
        this.parentNode.parentNode.classList.add("danger");
      }
      if (get.num(answer) === count) {
        this.parentNode.parentNode.classList.remove("warn");
        this.parentNode.parentNode.classList.remove("danger");
      }
      if (answer == "") {
        this.parentNode.parentNode.classList.remove("warn");
        this.parentNode.parentNode.classList.remove("danger");
      }
    },
    // elaboration hendlers
    addElaborationAnswer: function (data) {
      let order = this.dataset.order;
      let elaborationInp = this.parentNode.querySelector("input");
      let count = Number(get.num(elaborationInp.value));
      let baseCount = this.dataset.count;
      let delay = {
        hours: get.date().hours - parseInt(data.time.hours),
        minutes: get.date().minutes - parseInt(data.time.minutes),
      };
      if (delay.hours < 10) {
        delay.hours = `0${delay.hours}`;
      }
      if (delay.minutes < 10) {
        delay.minutes = `0${delay.minutes}`;
      }
      if (elaborationInp.value === "") {
        alert("Введи коректну відповідь!");
        return;
      }
      if (baseCount > count) {
        let isSend = confirm(
          "Введена кількість менша від кількості в базі. Точно відправити данні?"
        );
        if (!isSend) return false;
      }
      load
        .fetch({
          url: url.addElaboration,
          method: "POST",
          body: { text: elaborationInp.value, id: order },
        })
        .then((result) => {
          if (result.body.textContent === "ok") {
            this.parentNode.parentNode.classList.add("success");
            elaborationInp.remove();
            this.remove();
            generate.requestCount();
            0;
            data.user_answer = elaborationInp.value;
            data.delay = delay;
            data.id = `${get.date().year}.${get.date().month}.${
              get.date().day
            }.${get.date().hours}:${get.date().minutes}:${get.date().seconds}`;
            data.date = `${get.date().year}.${get.date().month}.${
              get.date().day
            }.${get.date().hours}:${get.date().minutes}:${get.date().seconds}`;

            data_base.save_data({
              store_name: "elaborations",
              index_name: "date",
              date: `${get.date().year}.${get.date().month}.${get.date().day}.${
                get.date().hours
              }:${get.date().minutes}:${get.date().seconds}`,
              request: data,
            });
          } else {
            alert("Помилка Щсь пішло не так!!");
          }
        });
    },
    elaborationSearch: function () {
      let inp = document.querySelector(".search-inp");
      let searchBtn = document.querySelector(".search-send-btn");
      inp.value = this.dataset.article;
      searchBtn.click();
      inp.value = "";
    },
    elaborationOrder: function () {
      let orderId = this.dataset.id;
      let elaborationFooter =
        this.parentNode.parentNode.querySelector(".item-footer");
      if (elaborationFooter.classList.contains("active-order")) {
        elaborationFooter.classList.remove("active-order");
        let footerChildren = Array.from(elaborationFooter.children);
        footerChildren.forEach((element) => {
          element.remove();
        });
        return;
      }
      elaborationFooter.classList.add("active-order");
      load.order({ id: orderId }).then((data) => {
        elaborationFooter.appendChild(generate.order(data));
      });
    },
    elaborationReserve: async function () {
      let id = this.dataset.id;
      let footer =
        this.parentElement.parentElement.querySelector(".item-footer");
      footer.innerHTML = "";
      if (footer.classList.contains("active-reserve")) {
        footer.innerHTML = "";
        footer.classList.toggle("active-reserve");
        return;
      }
      let reserve = await load.fetch({
        url: url.API.reserve,
        method: "POST",
        body: {
          id: id,
          login: loginData.login,
          pass: loginData.password,
        },
      });
      console.log(reserve);
      footer.classList.toggle("active-reserve");
      footer.appendChild(generate.reserve(reserve));
    },
    elaborationSales: function () {
      let id = this.dataset.id;
      let elFooter =
        this.parentElement.parentElement.querySelector(".item-footer");
      elFooter.innerHTML = "";
      if (elFooter.classList.contains("active-sales")) {
        elFooter.classList.toggle("active-sales");
        return;
      }
      elFooter.classList.toggle("active-sales");
      load.sales({ id: id }).then((data) => {
        elFooter.appendChild(generate.sales(data));
      });
    },
    elaborationArrival: function () {
      let id = this.dataset.id;
      let elFooter =
        this.parentElement.parentElement.querySelector(".item-footer");
      elFooter.innerHTML = "";
      if (elFooter.classList.contains("active-arrival")) {
        elFooter.classList.toggle("active-arrival");
        return;
      }
      elFooter.classList.toggle("active-arrival");
      load.deliveries({ id: id }).then((data) => {
        elFooter.appendChild(generate.deliveries(data));
      });
    },

    search: function (data) {
      console.log(data);
      let input = document.querySelector(".search-inp");
      let wrapper = document.querySelector(".wraper");
      let random_order_num;
      let is_order_number = false;
      if (Object.keys(data_base.data.orders).length > 0) {
        random_order_num = Object.keys(data_base.data.orders)[0];
        is_order_number =
          input.value[0] !== "0" &&
          !input.value.includes(".") &&
          !isNaN(Number(input.value)) &&
          input.value.trim()[0] === random_order_num[0] &&
          input.value.trim()[1] === random_order_num[1];
      }
      if (data) {
        input.value = data;
      }

      if (input.value.trim().length < 2 && !data) {
        alert("Довжина пошукового запиту має бути 2-х символів");
        return;
      }

      generate.preloader({ status: "start" });
      console.log(input.value, is_order_number, random_order_num);
      if (is_order_number) {
        load.orders({ status: input.value }).then((data) => {
          wrapper.appendChild(generate.orders(data));
        });
        return;
      }

      let search_sell = 0;
      let result = load.search({
        search: String(input.value),
        search_sell: search_sell,
      });
      result.then((data) => {
        generate.search(data);
      });
    },

    productionSearch: function () {
      let input = this.parentNode.querySelector(".search-inp");
      let wrapper = document.querySelector(".wraper");
      let isProduction = wrapper.querySelector(".production-wraper");

      if (isProduction) {
        let productionsItems = Array.from(
          isProduction.querySelectorAll(".production-item-wraper")
        );
        productionsItems.forEach((item) => {
          let article = item.querySelector(".component-item-article");
          let id = item.querySelector(".get-to-production-btn");
          if (
            !article.textContent.includes(input.value) ||
            id.dataset.id == input.value
          ) {
            item.style.display = "none";
          } else {
            item.style.display = "block";
          }
        });
      }
    },
    // orders hendlers
    order: function (e) {
      let itemFooter = this.querySelector(".row-footer");
      let items = Array.from(
        document.querySelectorAll(".row-footer .order-wraper,.item-preloader")
      );
      let id = this.dataset.id;
      if (itemFooter.contains(e.target)) {
        return;
      }
      items.forEach((item) => {
        item.remove();
      });

      itemFooter.appendChild(
        get.elements({
          el: "div",
          className: "item-preloader",
          children: [
            {
              el: "img",
              src: get.url(src.ico.spiner),
            },
          ],
        })
      );

      if (itemFooter.classList.contains("active")) {
        itemFooter.classList.remove("active");
        itemFooter.innerHTML = "";
        return;
      }

      load.order({ id: id }).then((data) => {
        itemFooter.innerHTML = "";
        if (itemFooter.classList.contains("active")) {
          itemFooter.classList.remove("active");
          return;
        }
        itemFooter.classList.add("active");

        itemFooter.appendChild(generate.order(data));
      });
    },

    show_stilages: function () {
      console.log("show_stilages");

      load.get_stilages();
    },
    // cell capacity
    set_cell_capacity: function () {
      let article = this.dataset.article || false;
      if (article) {
        let capacity = this.value;
        if (capacity == "" || isNaN(Number(capacity))) {
          alert("Введи правильні данні!!!");
          return;
        }

        data_base.save_data({
          store_name: "addresses",
          index_name: "article",
          request: {
            article: article,
            cell_capacity: Number(capacity),
          },
        });
      } else {
        alert("Невдалося встановити ємність комірки!!!");
      }
    },
    ignore_article: function () {
      let article = this.dataset.article || false;
      if (article) {
        data_base.data.addresses[article].is_ignored = true;
      } else {
        data_base.save_data({
          store_name: "addresses",
          index_name: "article",
          request: data_base.data.addresses[article],
        });
      }
    },
    fill_cell: async function () {
      let article = this.dataset.article || false;
      let added_count = Number(this.dataset.added_count);
      let delivery_id = this.dataset.delivery_id;
      let wrapper = this.parentElement.parentElement.querySelector(
        ".cell-capacity-display"
      );
      if (article && article in data_base.data.addresses) {
        console.log(data_base.data.addresses[article], article);
        if (data_base.data.addresses[article].save_area_count < 0) {
          data_base.data.addresses[article].save_area_count = 0;
        }
        if (data_base.data.addresses[article].real_goods_count < 0) {
          data_base.data.addresses[article].real_goods_count = 0;
        }
        if (
          data_base.data.addresses[article].last_goods_count > 0 &&
          data_base.data.addresses[article].cell_capacity > 0 &&
          data_base.data.addresses[article].save_area_count == 0 &&
          data_base.data.addresses[article].real_goods_count == 0
        ) {
          if (
            data_base.data.addresses[article].cell_capacity >
            data_base.data.addresses[article].last_goods_count
          ) {
            data_base.data.addresses[article].real_goods_count =
              data_base.data.addresses[article].last_goods_count;
            data_base.data.addresses[article].save_area_count = 0;
          } else if (
            data_base.data.addresses[article].cell_capacity <
            data_base.data.addresses[article].last_goods_count
          ) {
            data_base.data.addresses[article].real_goods_count =
              data_base.data.addresses[article].cell_capacity;
            data_base.data.addresses[article].save_area_count =
              data_base.data.addresses[article].last_goods_count -
              data_base.data.addresses[article].cell_capacity;
          }
        } else if (
          data_base.data.addresses[article].cell_capacity >
          data_base.data.addresses[article].last_goods_count
        ) {
          data_base.data.addresses[article].real_goods_count =
            data_base.data.addresses[article].last_goods_count;
          data_base.data.addresses[article].save_area_count = 0;
          console.log("save_area_count 0");
        } else if (
          data_base.data.addresses[article].cell_capacity -
            data_base.data.addresses[article].real_goods_count >
          data_base.data.addresses[article].save_area_count
        ) {
          data_base.data.addresses[article].real_goods_count =
            data_base.data.addresses[article].real_goods_count +
            data_base.data.addresses[article].save_area_count;
          console.log("summ save areacount and real count");
        } else {
          data_base.data.addresses[article].real_goods_count =
            data_base.data.addresses[article].cell_capacity;
          data_base.data.addresses[article].save_area_count =
            Number(data_base.data.addresses[article].last_goods_count) -
            Number(data_base.data.addresses[article].real_goods_count);
          console.log("real count = cell capacity");
        }
        if (
          added_count > 0 &&
          data_base.data.addresses[article].cell_capacity > 0
        ) {
          let indicator_bar = this.parentNode.querySelector(".fill-indicator");
          let indicator_desc = this.parentNode.querySelector(".indicator-desc");
          let search_query = await load.search({
            search: String(data_base.data.addresses[article].article),
            search_sell: 0,
          });
          search_query.forEach((item) => {
            if (item.article == data_base.data.addresses[article].article) {
              data_base.data.addresses[article].last_goods_count = item.count;
              if (
                data_base.data.addresses[article].cell_capacity < item.count
              ) {
                data_base.data.addresses[article].real_goods_count =
                  data_base.data.addresses[article].cell_capacity;
                data_base.data.addresses[article].save_area_count =
                  item.count - data_base.data.addresses[article].cell_capacity;
              } else {
                data_base.data.addresses[article].real_goods_count = item.count;
                data_base.data.addresses[article].save_area_count = 0;
              }
              this.parentElement.style = "background-color: #96efc6;";
              console.log(data_base.data.addresses[article].article + "filed");
            }
          });
          indicator_bar.style.width = `${get.percent({
            num: data_base.data.addresses[article].real_goods_count,
            main: data_base.data.addresses[article].cell_capacity,
          })}%`;
          indicator_desc.textContent = `${data_base.data.addresses[article].real_goods_count}/${data_base.data.addresses[article].cell_capacity}`;
        } else if (!isNaN(added_count)) {
          this.textContent = "Не додано!";
          return;
        }

        data_base.save_data({
          store_name: "addresses",
          index_name: "article",
          article: article,
          request: data_base.data.addresses[article],
        });
        this.textContent = "Заповнено";
      }
      console.log(data_base.data.addresses[article]);
      if (!wrapper) return;
      wrapper.innerHTML = "";
      wrapper.appendChild(
        get.elements({
          el: "div",

          children: [
            {
              el: "p",
              className: "cell-capacity-desc",
              text: `Кількість товару в комірці ${
                data_base.data.addresses[article]?.real_goods_count || 0
              } шт. з можливих ${
                data_base.data.addresses[article]?.cell_capacity || 0
              } шт. В зоні збереження ${
                data_base.data.addresses[article]?.save_area_count || 0
              } .шт`,
            },
            {
              el: "p",
              className: "cell-capacity-bar-wraper",
              children: [
                {
                  el: "div",
                  className: "cell-capacity-bar",
                  style: {
                    width: `${get.percent({
                      main:
                        data_base.data.addresses[article]?.cell_capacity || 0,
                      num:
                        data_base.data.addresses[article]?.real_goods_count ||
                        0,
                    })}%`,
                  },
                },
              ],
            },
          ],
        })
      );
    },
    find_empty_cells: function () {
      load.get_goods_count.call(load);
    },
    show_wroted_cells: function () {
      let cells = {};
      Object.keys(data_base.data.addresses).forEach((item) => {
        if (data_base.data.addresses[item].cell_capacity) {
          console.log(item);
          cells[item] = data_base.data.addresses[item];
        }
      });
      let wrapper = document.querySelector(".empty-cells-wraper");
      if (Object.keys(cells).length > 0) {
        wrapper.innerHTML = "";
        wrapper.appendChild(
          get.elements({
            el: "p",
            className: "cells-header",
            text: `Записані Комірки: ${Object.keys(cells).length}шт.`,
          })
        );
        wrapper.appendChild(
          get.elements({
            el: "div",
            className: "wroted_cells_wrapper empty-items-wraper",
            children: Object.keys(cells).map((item) => {
              if (data_base.data.addresses[item].cell_capacity) {
                let cell_bg = "";

                let real_count =
                  data_base.data.addresses[item].real_goods_count;
                let cell_capacity =
                  data_base.data.addresses[item].cell_capacity;
                let save_area = data_base.data.addresses[item].save_area_count;

                let percent = get.percent({
                  num: real_count,
                  main: cell_capacity,
                });
                if (percent <= 25) {
                  cell_bg = "danger";
                } else if (percent > 25) {
                  cell_bg = "warrning";
                } else if (percent >= 50) {
                  cell_bg = "success";
                }

                return {
                  el: "li",
                  className: `empty-cell-item ${cell_bg}`,
                  event: "click",

                  children: [
                    {
                      el: "p",
                      className: `empty-cell-description`,
                      children: [
                        {
                          el: "span",
                          className: "empty-cell-article",
                          text: item,
                        },
                        {
                          el: "span",
                          className: "empty-cell-place",
                          text: data_base.data.addresses[item].place,
                        },
                        {
                          el: "span",
                          className: "empty-cell-data",
                          text: `Ємність комірки:${cell_capacity} Реальна кількість: ${real_count} Заповнено на: (${percent.toFixed(
                            1
                          )}%)`,
                        },
                        {
                          el: "span",
                          className: "empty-cell-data",
                          text: `Товару в зоні збереження:${save_area}`,
                        },
                      ],
                    },
                    {
                      el: "button",
                      className: "add-btn",
                      text: "Заповнити комірку",
                      event: "click",
                      data: [{ article: item }],
                      hendler: hendlers.fill_cell,
                    },
                  ],
                };
              }
            }),
          })
        );
      } else {
        wrapper.innerHTML = "";
        wrapper.appendChild(
          generate.message("Немає Комірок з записаною Ємністю")
        );
      }
    },
    show_empty_cells: function () {
      let empty_cells = [];
      let articles_list = Object.keys(data_base.data.addresses);
      articles_list.forEach((item) => {
        let address = data_base.data.addresses[item];

        if (
          address.is_ignored ||
          address.cell_capacity === undefined ||
          address.save_area_count == undefined ||
          address.save_area_count <= 0
        ) {
          return;
        }

        if (
          address.real_goods_count < address.cell_capacity / 2 ||
          +address.cell_capacity - +address.real_goods_count >
            +address.save_area_count
        ) {
          empty_cells.push(item);
        }
      });

      empty_cells.sort((a, b) => {
        let placeA = data_base.data.addresses[a]?.place?.trim() ?? "";
        let placeB = data_base.data.addresses[b]?.place?.trim() ?? "";
        return placeA.localeCompare(placeB);
      });

      generate.empty_cells(empty_cells);
    },
    show_delivery: function () {
      generate.preloader({ status: "start" });
      load.deliverys_list().then((data) => {
        generate.delivery_list(data);
      });
    },
    show_delivery_item: function (e) {
      e.stopPropagation();
      if (!e.target.classList.contains("delivery-item")) return;
      let el = this;
      let item_id = el.dataset.delivery_id;
      let footers = Array.from(document.querySelectorAll(".item-footer"));
      let item_footer = el.querySelector(".item-footer");

      if (!item_footer) {
        console.error("Елемент .item-footer не знайдено");
        return;
      }

      footers.forEach((footer) => {
        footer.innerHTML = "";
      });
      if (e.target.classList.contains("active")) {
        e.target.classList.remove("active");
        return;
      }
      el.classList.add("active");
      // Додаємо прелоадер
      item_footer.appendChild(
        get.elements({
          el: "div",
          className: "item-preloader",
          children: [
            {
              el: "img",
              src: get.url(src.ico.spiner),
            },
          ],
        })
      );

      // Завантаження даних та генерування елементу
      if (item_id) {
        load
          .delivery_item(item_id)
          .then((data) => {
            generate.delivery_item.call(el, data, generate);
          })
          .catch((error) => {
            console.error("Помилка завантаження елементу:", error);
            alert("Відбулася помилка під час отримання інформації про прихід");
          });
        return;
      }

      alert("Відбулася помилка під час отримання інформації про прихід");
    },

    import_export_database: function () {
      contentWraper.innerHTML = "";
      contentWraper.appendChild(
        get.elements({
          el: "div",
          className: "import_export_wrapper",
          children: [
            {
              el: "h2",
              className: "import_export_title",
              text: "Імпорт/Експорт бази данних",
            },
            {
              el: "div",
              className: "buttons_wrapper",
              children: [
                {
                  el: "button",
                  className: "export_btn btn",
                  text: "Експорт даних",
                  event: "click",
                  hendler: hendlers.export_data,
                },
                {
                  el: "button",
                  className: "import_btn btn",
                  text: "Імпорт даних",
                  event: "click",
                  hendler: hendlers.import_data,
                },
              ],
            },
          ],
        })
      );
    },
    export_data: function () {
      let data = new Blob([JSON.stringify(data_base.data)], {
        type: "application/json",
      });
      let url = URL.createObjectURL(data);
      let a = document.createElement("a");
      let fileName = "data_base.json";
      a.href = url;
      a.download = fileName;
      a.click();
    },
    import_data: function uploadAndSaveToIndexedDB() {
      // Створюємо вікно для завантаження файлу
      const inputElement = document.createElement("input");
      inputElement.type = "file";
      inputElement.accept = ".json"; // Приймаємо тільки JSON файли

      // Додаємо обробник події для завантаження файлу
      inputElement.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) {
          try {
            // Читаємо файл як текст
            const fileContent = await file.text();

            // Парсимо JSON дані
            const parsedData = JSON.parse(fileContent);
            Object.keys(parsedData).forEach(function (storeName) {
              let items = Object.keys(parsedData[storeName]);
              if (items.length == 0) return;
              items.forEach(async function (item) {
                let index_name = Object.keys(data_base.params[storeName].index);
                if (index_name.includes("article")) {
                  index_name = "article";
                } else {
                  index_name = Object.keys(
                    data_base.params[storeName].index
                  )[0];
                }
                data_base.save_data({
                  store_name: storeName,
                  request: parsedData[storeName][item],
                  index_name: index_name,
                });
              });
            });
          } catch (error) {
            console.error("Error parsing or saving data:", error);
          }
        }
      });

      inputElement.click();
    },
    get_id: async function () {
      let store = data_base.data.addresses;
      let stored_cell = data_base.data.settings.cell;
      let stored_id = data_base.data.id;
      let cell_count = 0;
      if (stored_cell == undefined) {
        stored_cell = {};
        data_base.data.settings.cell = {};
      }
      if (stored_id == undefined) {
        data_base.data.id = {};
      }

      Object.values(store).forEach((element, index) => {
        if (element.cell == undefined) {
          return;
        }
        if (Object.keys(stored_cell).includes(element.cell)) {
          return;
        }
        if (Object.values(stored_id).includes(Object.keys(store)[index])) {
          return;
        }
        if (stored_cell[element.cell] == undefined) {
          stored_cell[element.cell] = {
            is_checked: false,
          };
        }
      });

      generate.preloader({ status: "start" });
      for (const cellKey in stored_cell) {
        cell_count++;

        if (stored_cell[cellKey].is_checked) {
          continue;
        }
        let search = await load.search({ search: cellKey, search_sel: 0 });
        stored_cell[cellKey].is_checked = true;

        await Promise.all(search);

        generate.preloader({
          status: "update_status",
          desc: `${cell_count} / ${Object.keys(stored_cell).length}`,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    },
  };
  // creating and adding new elements to DOM
  let contentWraper = get.elements({ el: "div", className: "wraper" });
  let searchWraper = get.elements({
    el: "div",
    className: "main-search-wraper",
    children: [
      {
        el: "form",
        className: "search-wraper",
        event: "submit",
        hendler: function (e) {
          e.preventDefault();
          hendlers.search();
        },
        children: [
          {
            el: "input",
            type: "text",
            className: "search-inp",
            autofill: "off",
            event: "input",
            hendler: hendlers.productionSearch,
            placeholder: "Пошук",
          },
          {
            el: "button",
            className: "bar-code-search-btn",
            type: "button",
            event: "click",
            hendler: barcodeRecognition,
            data: [
              {
                scanning: false,
              },
            ],
            children: [
              {
                el: "img",
                src: get.url(src.ico.barcode),
                alt: "Штрих код",
              },
            ],
          },
          {
            el: "input",
            type: "submit",
            value: "Пошук",
            className: "search-send-btn",
            event: "submit",
            hendler: function () {
              hendlers.search();
            },
          },
        ],
      },
      {
        el: "div",
        className: "barcode-display-wraper hide-barcode",
        children: [
          {
            el: "div",
            className: " barcode",
            id: "reader",
          },
        ],
      },
    ],
  });

  let generate = {
    barcodes: async function () {
      let data = {};

      let zones = await load.fetch({
        url: url.stilages,
        method: "POST",
      });
      let zones_names = Array.from(zones.querySelectorAll("tr"));
      zones_names.shift();
      zones_names.forEach((tr) => {
        let td = Array.from(tr.querySelectorAll("td"));
        let zone_name = td[1].textContent;
        data[zone_name] = {
          id: td[0].textContent,
        };
      });
      contentWraper.innerHTML = "";
      contentWraper.appendChild(
        get.elements({
          el: "div",
          className: "main-barcode_wrapper",
          children: [
            { el: "h2", className: "barcode-title", text: "Друк Штрихкодів" },
            {
              el: "p",
              className: "select_desc",
              text: "Виберіть Зону",
            },
            {
              el: "div",
              calssName: "barcode_settings_wrapper",
              children: [
                {
                  el: "div",
                  className: "settings_item",
                  children: [
                    {
                      el: "input",
                      type: "checkbox",
                      id: "add_cell_barcode_checkbox",
                      event: "change",
                      hendler: hendlers.set_barcode_params,

                      checked: false,
                    },
                    {
                      el: "label",
                      for: "add_cell_barcode_checkbox",
                      text: "Додати коди комірки",
                    },
                  ],
                },
                {
                  el: "div",
                  className: "settings_item",
                  children: [
                    {
                      el: "input",
                      type: "checkbox",
                      id: "add_place_checkbox",
                      event: "change",
                      hendler: hendlers.set_barcode_params,
                      checked: false,
                    },
                    {
                      el: "label",
                      for: "add_place_checkbox",
                      text: "Додати адрес комірки",
                      checked: false,
                    },
                  ],
                },
                {
                  el: "div",
                  className: "settings_item",
                  children: [
                    {
                      el: "input",
                      type: "checkbox",
                      id: "add_article_checkbox",
                      event: "change",
                      hendler: hendlers.set_barcode_params,
                      checked: false,
                    },
                    {
                      el: "label",
                      for: "add_article_checkbox",
                      text: "Додати артикул",
                    },
                  ],
                },
                {
                  el: "div",
                  className: "settings_item",
                  children: [
                    {
                      el: "input",
                      type: "checkbox",
                      id: "add_description_checkbox",
                      event: "change",
                      hendler: hendlers.set_barcode_params,
                      checked: false,
                    },
                    {
                      el: "label",
                      for: "add_description_checkbox",
                      text: "Додати опис позиції",
                    },
                  ],
                },
                {
                  el: "div",
                  className: "sticker",
                  id: "sticker",
                  event: "click",
                  hendler: hendlers.handleElementEdit,
                },
                {
                  el: "div",
                  className: "settings_item",
                  children: [
                    {
                      el: "button",
                      className: "btn print_barcode_btn",
                      event: "click",
                      hendler: hendlers.show_barcodes,
                      text: "Показати штрихкоди",
                    },
                  ],
                },
              ],
            },
            {
              el: "select",
              className: "barcode_select",
              event: "change",
              hendler: async function (event) {
                let stilage_wrapper = document.querySelector(
                  ".select_barcode_stilage"
                );
                if (stilage_wrapper) {
                  stilage_wrapper.remove();
                }
                let zone_name = event.target.value;

                if (!zone_name || !data[zone_name]) {
                  return;
                }

                let stilages = await load.fetch({
                  url: url.stilagesZones,
                  method: "POST",
                  body: {
                    zone: data[zone_name].id,
                  },
                });
                let stilages_list = Array.from(
                  stilages.querySelectorAll("table tr")
                );
                stilages_list.shift();
                if (!data[zone_name].stilages_list) {
                  data[zone_name].stilages_list = {};
                }

                stilages_list.forEach((tr) => {
                  let stilage_data = Array.from(tr.querySelectorAll("td"));
                  data[zone_name].stilages_list[stilage_data[1].textContent] = {
                    id: stilage_data[0].textContent,
                    name: stilage_data[1].textContent,
                  };
                });
                let barcode_container = document.querySelector(
                  ".main-barcode_wrapper"
                );
                barcode_container.appendChild(
                  get.elements({
                    el: "div",
                    className: "select_barcode_stilage",
                    children: [
                      {
                        el: "p",
                        className: "select_desc",
                        text: "Виберіть Стілаж",
                      },
                      {
                        el: "select",
                        className: "select_stilage",
                        event: "change",
                        hendler: async function (event) {
                          let stilage = await load.fetch({
                            url: url.stilage,
                            method: "POST",
                            body: {
                              id: data[zone_name].stilages_list[
                                event.target.value
                              ].id,
                            },
                          });

                          let stilage_row = Array.from(
                            stilage.querySelectorAll("tr")
                          );
                          stilage_row.forEach(function (key, index) {
                            index = index + 1;
                            if (
                              !data[zone_name].stilages_list[event.target.value]
                                .row
                            ) {
                              data[zone_name].stilages_list[event.target.value][
                                index
                              ] = {};
                            }
                            let td = Array.from(key.querySelectorAll("td"));
                            data[zone_name].stilages_list[event.target.value][
                              index
                            ] = td.map(function (item) {
                              if (item.title == "") {
                                console.log(item);
                                return;
                              }
                              let goods_list = item.title
                                .split("\r")
                                .map(function (str) {
                                  let article;
                                  let desc;
                                  try {
                                    article = str.match(
                                      new RegExp(regExp.article)
                                    )[1];
                                    desc = str
                                      .replace(regExp.article, "")
                                      .trim();
                                  } catch (error) {
                                    alert(error);
                                    alert(
                                      `помилка при отриманні артикулу ${str}`
                                    );
                                    article = false;
                                    desc = false;
                                  }
                                  if (!article) {
                                    console.log(str);
                                  }
                                  return {
                                    article: article,
                                    desc: desc,
                                  };
                                });
                              let cell = item
                                .getAttribute("onClick")
                                ?.match(regExp.barcode_cell)[1];

                              return {
                                goods_list: goods_list,
                                cell: cell,
                                cell_number: `${zone_name}-${
                                  event.target.value
                                }.${item.textContent.trim()}`,
                              };
                            });
                            console.log(
                              data[zone_name].stilages_list[event.target.value]
                            );
                            barcodes_data =
                              data[zone_name].stilages_list[event.target.value];
                          });
                          hendlers.generate_barcodes(
                            data[zone_name].stilages_list[event.target.value]
                          );
                        },
                        children: Object.keys(data[zone_name].stilages_list)
                          .map(function (stilage, index) {
                            if (index === 0) {
                              console.log(index, stilage);
                              return [
                                {
                                  el: "option",
                                  text: "Виберіть Стілаж",
                                  value: false,
                                },
                                { el: "option", text: stilage, value: stilage },
                              ];
                            }
                            return {
                              el: "option",
                              text: stilage,
                              value: stilage,
                            };
                          })
                          .flat(),
                      },
                    ],
                  })
                );
              },

              children: Object.keys(data).map((name, index) => {
                console.log(index);
                if (index == 0) {
                  return (
                    {
                      el: "option",
                      text: "Виберіть Зону",
                      value: false,
                    },
                    { el: "option", text: name, value: name }
                  );
                }
                return { el: "option", text: name, value: name };
              }),
            },
          ],
        })
      );
      contentWraper.appendChild(
        get.elements({
          el: "div",
          className: "sticker_list_wrapper",
        })
      );
    },
    deliveries_table_excel: function (data) {
      let a = get.elements({
        el: "a",
      });
      let table = get.elements({
        el: "table",
        className: "excel-table",
        atr: {
          border: "1",
        },
        children: [
          {
            el: "tr",
            atr: {
              border: "1",
            },
            style: {
              backgroundColor: "#a5b3eb",
              fontSize: "12px",
              fontWeight: "600",
            },
            children: [
              {
                el: "td",
                text: "ID",
                atr: {
                  border: "1",
                },
              },
              {
                el: "td",
                text: "CELL",
                atr: {
                  border: "1",
                },
              },
              {
                el: "td",
                text: "Адреса",
                atr: {
                  border: "1",
                },
              },
              {
                el: "td",
                text: "Артикул",
                atr: {
                  border: "1",
                },
              },
              {
                el: "td",
                text: "Назва товару",
                atr: {
                  border: "1",
                },
              },
              {
                el: "td",
                text: "Кількість",
                atr: {
                  border: "1",
                },
              },
              { el: "td", text: "Ходови/Заказний", atr: { border: "1" } },
              {
                el: "td",
                text: "Середня кількість поставки  товару",
                atr: {
                  border: "1",
                },
              },
              {
                el: "td",
                text: "Дата останньої поставки",
                atr: {
                  border: "1",
                },
              },
              {
                el: "td",
                text: "пройшло часу з останньої поставки",
                atr: {
                  border: "1",
                },
              },
              {
                el: "td",
                text: "Дата Парсингу",
                atr: {
                  border: "1",
                },
              },
              {
                el: "td",
                text: "Частота поставки",
                atr: {
                  border: "1",
                },
              },
            ],
          },
        ],
      });

      data.forEach((item) => {
        table.appendChild(
          get.elements({
            el: "tr",
            atr: {
              border: "1",
            },
            children: [
              {
                el: "td",
                text: item.id,
              },
              {
                el: "td",
                text: item.cell,
              },
              {
                el: "td",
                text: item.place,
              },
              {
                el: "td",
                text: item.article,
              },
              {
                el: "td",
                text: item.name,
              },
              {
                el: "td",
                text: String(item.count),
              },
              {
                el: "td",
                text: item.goods_type,
              },
              {
                el: "td",
                text: Math.round(item.average_amount),
              },
              {
                el: "td",
                text: item.last_delivery_date,
              },
              {
                el: "td",
                text: `${item.time_from_last_delivery.years} років ${item.time_from_last_delivery.months} місяців ${item.time_from_last_delivery.days} днів`,
              },
              {
                el: "td",
                text: `${item.checking_date.day}.${item.checking_date.month}.${item.checking_date.year}`,
              },
              {
                el: "td",
                children: Object.keys(item.years_frequency).map((key) => {
                  return {
                    el: "span",
                    children: [
                      {
                        el: "span",
                        style: {
                          border: "1px solid black",
                          backgroundColor: "#36aeaeae",
                        },
                        text: key,
                      },
                      {
                        el: "span",
                        style: {
                          border: "1px solid black",
                          backgroundColor: "yellow",
                        },
                        text: `  ${item.years_frequency[key].freq} (${item.years_frequency[key].amount})|||`,
                      },
                    ],
                  };
                }),
              },
            ],
          })
        );
      });
      let file = new Blob([table.outerHTML], {
        type: "application/vnd.ms-excel",
      });
      let url = URL.createObjectURL(file);
      let filename = "table.xls";
      document.body.appendChild(table);
      a.download = filename;
      a.href = url;
      a.click();
    },
    deliveries_table: async function (data) {
      let download_btn;
      let store = data_base.data.addresses;
      let categorys = {};
      let places = {};
      let selected_place = {};
      let selected_cateory = {};
      if (data.length > 0) {
        download_btn = get.elements({
          el: "button",
          className: "download_btn btn",
          text: "Завантажити таблицю",
          event: "click",
          hendler: function () {
            generate.deliveries_table_excel(data);
          },
        });
      }
      Object.keys(store).forEach((key) => {
        const category = key.split(".");
        const zone = store[key]?.place?.split("-") ?? undefined;

        if (!categorys[category[0]]) {
          categorys[category[0]] = {};
        }
        if (!categorys[category[0]][category[1]]) {
          categorys[category[0]][category[1]] = [];
        }
        if (!categorys[category[0]][category[1]].includes(category[2])) {
          categorys[category[0]][category[1]].push(category[2]);
        }

        if (zone === undefined) {
          return;
        }
        const stilage = zone[1]?.split(".") ?? undefined;
        if (!places[zone[0]]) {
          places[zone[0]] = {};
        }
        if (!places[zone[0]][stilage[0]]) {
          places[zone[0]][stilage[0]] = [];
        }
        if (!places[zone[0]][stilage[0]].includes(stilage[1])) {
          places[zone[0]][stilage[0]].push(stilage[1]);
        }
      });
      contentWraper.innerHTML = "";
      function generateSelect(options, event, handler) {
        const select = {
          el: "select",
          event: event,
          hendler: handler,
          children: options.map((item) => ({
            el: "option",
            value: item,
            text: item,
          })),
        };
        return select;
      }
      function generateCategoryWrapper(categorys) {
        const categoryWrapper = get.elements({
          el: "div",
          className: "categorys_wrapper",
          children: [
            {
              el: "p",
              className: "description",
              text: "",
            },
            {
              el: "form",
              children: [
                {
                  el: "p",
                  className: "title",
                  text: "Обери категорію",
                },
                generateSelect(Object.keys(categorys), "change", function () {
                  const value = this.value;
                  const categorysWrapper = this.parentElement;
                  const subCategorys = Object.keys(categorys[value]);
                  selected_cateory.category = value;
                  hendlers.show_available_articles(
                    selected_cateory,
                    selected_place
                  );
                  const subCategorySelect = generateSelect(
                    subCategorys,
                    "change",
                    function () {
                      const sub_category_value = this.value;
                      const num_category_wrpper = this.parentElement;
                      const articles_list = Object.keys(
                        categorys[value][sub_category_value]
                      );
                      selected_cateory.sub_category = sub_category_value;
                      hendlers.show_available_articles(
                        selected_cateory,
                        selected_place
                      );
                      if (articles_list.length > 0) {
                        if (
                          num_category_wrpper.querySelector(".articles_wrapper")
                        ) {
                          num_category_wrpper
                            .querySelector(".articles_wrapper")
                            .remove();
                        }

                        const articlesSelect = generateSelect(
                          articles_list,
                          "change",
                          function () {
                            const article_value = this.value;
                            selected_cateory.article = article_value;
                            hendlers.show_available_articles(
                              selected_cateory,
                              selected_place
                            );
                          }
                        );
                        num_category_wrpper.appendChild(
                          get.elements({
                            el: "div",
                            className: "articles_wrapper",
                            children: [
                              {
                                el: "p",
                                className: "title",
                                text: "Обери артикул",
                              },
                              articlesSelect,
                            ],
                          })
                        );
                      }
                    }
                  );
                  const subCategoryWrapper = get.elements({
                    el: "div",
                    className: "sub_categorys_wrapper",
                    children: [
                      {
                        el: "p",
                        className: "title",
                        text: "Обери підкатегорію",
                      },
                      subCategorySelect,
                    ],
                  });
                  const existingSubCategoryWrapper =
                    categorysWrapper.querySelector(".sub_categorys_wrapper");
                  if (existingSubCategoryWrapper) {
                    existingSubCategoryWrapper.replaceWith(subCategoryWrapper);
                  } else {
                    categorysWrapper.appendChild(subCategoryWrapper);
                  }
                }),
              ],
            },
          ],
        });

        return categoryWrapper;
      }
      function generatePlacesWrapper(places) {
        const zone_keys = Object.keys(places);
        if (zone_keys.length > 0) {
          return get.elements({
            el: "div",
            className: "places_wrapper",
            children: [
              {
                el: "p",
                className: "title",
                text: "Обери зону",
              },
              generateSelect(zone_keys, "change", function () {
                const selected_zone = this.value;
                const zone_wrapper = this.parentElement;
                const stilages = Object.keys(places[selected_zone]);
                selected_place.zone = selected_zone;
                hendlers.show_available_articles(
                  selected_cateory,
                  selected_place
                );
                if (stilages) {
                  if (zone_wrapper.querySelector(".stilages_wrapper")) {
                    zone_wrapper.querySelector(".stilages_wrapper").remove();
                  }
                  zone_wrapper.appendChild(
                    get.elements({
                      el: "div",
                      className: "stilages_wrapper",
                      children: [
                        {
                          el: "p",
                          className: "title",
                          text: "Обери стілаж",
                        },
                        generateSelect(stilages, "change", function () {
                          const selected_stilages = this.value;
                          const stilages_wrapper = this.parentElement;
                          const rows = Object.keys(
                            places[selected_zone][selected_stilages]
                          );
                          selected_place.stilage = selected_stilages;
                          hendlers.show_available_articles(
                            selected_cateory,
                            selected_place
                          );
                          if (rows.length > 0) {
                            if (
                              stilages_wrapper.querySelector(".rows_wrapper")
                            ) {
                              stilages_wrapper
                                .querySelector(".rows_wrapper")
                                .remove();
                            }
                            stilages_wrapper.appendChild(
                              get.elements({
                                el: "div",
                                className: "rows_wrapper",
                                children: [
                                  {
                                    el: "p",
                                    className: "title",
                                    text: "Обери ряд",
                                  },
                                  generateSelect(rows, "change", function () {
                                    const selected_row = this.value;
                                    selected_place.row = selected_row;
                                    hendlers.show_available_articles(
                                      selected_cateory,
                                      selected_place
                                    );
                                  }),
                                ],
                              })
                            );
                          }
                        }),
                      ],
                    })
                  );
                }
              }),
            ],
          });
        }
      }

      contentWraper.appendChild(generateCategoryWrapper(categorys));
      contentWraper.appendChild(generatePlacesWrapper(places));
      contentWraper.appendChild(download_btn);
    },
    message: function (data) {
      let element = get.elements({
        el: "div",
        className: "message-title content-title",
        text: data,
      });
      return element;
    },

    elaborations_list: function () {
      let item_count = 1;
      contentWraper.innerHTML = "";
      let elaborations_list = get.elements({
        el: "div",
        className: "elaborations-list-wrapper",
      });
      if (Object.keys(data_base.data.elaborations).length > 0) {
        Object.values(data_base.data.elaborations)
          .reverse()
          .forEach((item, index) => {
            elaborations_list.appendChild(
              get.elements({
                el: "div",
                className: "list-item",
                children: [
                  {
                    el: "span",
                    className: "remove_btn",
                    text: "X",
                    event: "click",
                    data: [
                      {
                        date: item.date,
                      },
                    ],
                    hendler: hendlers.remove_elaboration_item,
                  },
                  {
                    el: "p",
                    className: "item-desc count",
                    text: "№",
                    children: [
                      {
                        el: "span",
                        text: String(item_count),
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "item-desc order",
                    text: "Номер замовлення:",
                    children: [
                      {
                        el: "span",
                        text: item.order,
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "item-desc manager",
                    text: "Менеджер:",
                    children: [
                      {
                        el: "span",
                        text: item.manager,
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "item-desc date",
                    text: "Дата:",
                    children: [
                      {
                        el: "span",
                        text: item.date,
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "item-desc",
                    text: "Час створення уточнекння:",
                    children: [
                      {
                        el: "span",
                        text: `${item?.time?.hours ?? "00"}:${
                          item?.time?.minutes ?? "00"
                        }`,
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "item-desc delay",
                    text: "Відбито за:",
                    children: [
                      {
                        el: "span",
                        text: `${item?.delay?.hours ?? "00"}:${
                          item?.delay?.minutes ?? "00"
                        }`,
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "item-desc artilce",
                    text: "Артикул:",
                    children: [
                      {
                        el: "span",
                        text: item.search,
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "item-desc base-quantity",
                    text: "Кількість По базі",
                    children: [
                      {
                        el: "span",
                        text: String(item.count.baseCount),
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "item-desc reserve-quantity",
                    text: "Зарезервовано:",
                    children: [
                      {
                        el: "span",
                        text: String(item.count.orderCount),
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "item-desc user-answer",
                    text: "Відповідь:",
                    children: [
                      {
                        el: "span",
                        text: item.user_answer || `не збережено`,
                      },
                    ],
                  },
                ],
              })
            );
            item_count++;
          });
        contentWraper.appendChild(elaborations_list);
        return;
      }
      contentWraper.appendChild(generate.message("Ще не було уточнень"));
    },
    preloader: function (data) {
      let element;
      if (data.status == "start") {
        element = get.elements({
          el: "div",
          className: "preloader-wraper",
          children: [
            {
              el: "img",
              className: "preloader-spiner",
              src: get.url(src.ico.spiner),
            },
            {
              el: "p",
              className: "preloader-text tasks-count",
            },
          ],
        });
        contentWraper.innerHTML = "";
        contentWraper.appendChild(element);
      } else if (data.status == "update_status") {
        let status_desc = document.querySelector(".preloader-text");
        status_desc.textContent = data.desc;
        status_desc.appendChild(
          get.elements({
            el: "span",
            className: "task-proces-bar",
            style: { width: `${data.percent}%` },
          })
        );
      } else {
        let element = contentWraper.querySelector(".preloader-wraper");
        if (element) {
          contentWraper.removeChild(element);
          contentWraper.innerHTML = "";
        }
      }
    },
    production: function (data) {
      if (data.length > 0) {
        let descNames = [
          "Назва",
          "Місце",
          "Артикул",
          "Кількість",
          "Наявність",
          "Вистачає на",
        ];

        let prodctionWraper = get.elements({
          el: "div",
          className: "production-wraper",
          children: [
            {
              el: "button",
              className: "production_btn",
              text: "Товари що закінчуються",
              event: "click",
              hendler: hendlers.get_ending_goods,
            },
          ],
        });
        data.sort((a, b) => {
          if (
            !b.isProcesed &&
            Object.values(data_base.data.production).find(
              (item) => item.id === a.id && !item.isProcesed
            )
          ) {
            return -1;
          }
          return 0;
        });
        data.forEach((item) => {
          let isProcesed = "";
          let val;
          Object.values(data_base.data.production).forEach((a) => {
            if (a.id === item.id) {
              isProcesed = "procesed";
              val = a.count;
            }
          });

          let prodItem = get.elements({
            el: "div",
            className: `production-item-wraper ${isProcesed}`,
            children: [
              {
                el: "div",
                className: "item-head",
                children: [
                  {
                    el: "button",
                    className: "get-to-production-btn",
                    text: "Взяти в виробництво",
                    event: "click",
                    data: [{ id: item.id }],
                    hendler: hendlers.getToProduction,
                  },

                  {
                    el: "input",
                    type: "number",
                    autofill: "off",
                    value: val,
                    className: `item-input ${isProcesed}`,
                    placeholder: "Кількість",
                  },
                ],
              },

              {
                el: "div",
                className: "production-content-wraper",
                children: [
                  {
                    el: "p",
                    className: "production-item-head",
                    text: item.name,
                    children: [
                      {
                        el: "span",
                        className: "component-item-article",
                        text: item.article,
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "goods_count_desc",
                    text: `Залишок:${
                      item?.count + "шт." ?? " Достатньо"
                    }  Мінімально допустимий Залишок:${
                      item?.min_count + "шт." ?? " Достатньо"
                    }`,
                  },
                  {
                    el: "div",
                    className: "production-item-place danger",
                    text: `Місце:${item.place} | Cell: ${item.cell}`,
                  },
                  {
                    el: "div",
                    className: "flex-container",
                    children: [
                      {
                        el: "img",
                        src: item.img,
                        className: "prodction-item-img",
                      },
                      {
                        el: "div",
                        className: "text-wraper",

                        children: Object.values(item.components).map((part) => {
                          return {
                            el: "div",
                            className: "component-wraper",
                            children: Object.values(part)
                              .map((desc, index) => {
                                return {
                                  el: "p",
                                  className: "desc",
                                  text: `${descNames[index]}: ${desc}`,
                                };
                              })
                              .concat({
                                el: "button",
                                className: "add-btn",
                                text: "Взяти",
                                event: "click",
                                hendler: hendlers.addToList,
                              }),
                          };
                        }),
                      },
                    ],
                  },
                  {
                    el: "button",
                    className: "product-btn",
                    text: "Виготовити",
                    event: "click",
                    data: [{ id: item.id }],
                    hendler: hendlers.product,
                  },
                ],
              },
            ],
          });
          prodctionWraper.appendChild(prodItem);
        });

        return prodctionWraper;
      } else {
        return generate.message("Немає виробництва.");
      }
    },
    reserve: function (data) {
      if (data.reservations && data.reservations.length > 0) {
        let = reserveWraper = get.elements({
          el: "div",
          className: "reserve-wraper wraper",
        });
        data.reservations.forEach((element) => {
          let reserve = get.elements({
            el: "div",
            className: "reserve-item",
            children: [
              {
                el: "div",
                className: "reserve-row id-row",
                // hendler
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "ID",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.goods_reserv_history_id,
                  },
                ],
              },
              {
                el: "div",
                className: "reserve-row storage-row",
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Склад",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.warehouses_name,
                  },
                ],
              },
              {
                el: "div",
                className: "reserve-row count-row",
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Кількість",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.goods_reserv_history_quantity,
                  },
                ],
              },
              {
                el: "div",
                className: "reserve-row time-row",
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Статус:",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.rezervName,
                  },
                ],
              },
            ],
          });
          reserveWraper.appendChild(reserve);
        });
        return reserveWraper;
      }
      return generate.message(data.error);
    },
    sales: function (data) {
      if (data.length > 0) {
        let salseWraper = get.elements({
          el: "div",
          className: "sales-wraper wraper",
        });
        data.forEach((element) => {
          let sales = get.elements({
            el: "div",
            className: "sales-item",
            children: [
              {
                el: "div",
                className: "sales-row id-row",
                // hendler
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Номер Замовлення",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.orderNumber,
                  },
                ],
              },
              {
                el: "div",
                className: "sales-row status-row",
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Статус",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.status,
                  },
                ],
              },
              {
                el: "div",
                className: "sales-row count-row",
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Кількість",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.count,
                  },
                ],
              },
              {
                el: "div",
                className: "sales-row price-row",
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Дата",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.date,
                  },
                ],
              },
            ],
          });
          salseWraper.appendChild(sales);
        });
        return salseWraper;
      }
      return generate.message("Немає продажів.");
    },
    deliveries: function (data) {
      if (data.length > 0) {
        let deliveriesWraper = get.elements({
          el: "div",
          className: "deliveries-wraper wraper",
        });
        data.forEach((element) => {
          let deliveries = get.elements({
            el: "div",
            className: "deliveries-item",
            children: [
              {
                el: "div",
                className: "deliveries-row date-row",
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Дата",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.date,
                  },
                ],
              },
              {
                el: "div",
                className: "deliveries-row provider-row",
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Постачальник",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.provider,
                  },
                ],
              },
              {
                el: "div",
                className: "deliveries-row count-row",
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Кількість",
                  },
                  {
                    el: "p",
                    className: "row-desc",
                    text: element.count,
                  },
                ],
              },
              {
                el: "div",
                className: "deliveries-row manager-row",
                children: [
                  {
                    el: "p",
                    className: "row-desc",
                    text: "Хто додав",
                  },
                  { el: "p", className: "row-desc", text: element.manager },
                ],
              },
            ],
          });
          deliveriesWraper.appendChild(deliveries);
        });
        return deliveriesWraper;
      }
      return generate.message("Немає Поставок.");
    },
    orders: function (data) {
      generate.preloader({ status: "end" });
      if (data.length > 0) {
        let ordersWraper = get.elements({
          el: "div",
          className: "orders-wraper wraper",
        });
        data.forEach((item) => {
          let orderRow = get.elements({
            el: "div",
            className: "order-row",
            event: "click",
            data: [{ id: item.id }],
            hendler: hendlers.order,
            children: [
              {
                el: "div",
                className: "row-body",
                children: [
                  {
                    el: "p",
                    className: "row-desc number",
                    text: item.Number,
                  },
                  ,
                  {
                    el: "p",
                    className: "row-desc status",
                    text: item.status,
                  },
                  {
                    el: "p",
                    className: "row-desc city",
                    text: item.city,
                  },
                  { el: "p", className: "row-desc type", text: item.type },
                  { el: "p", className: "row-desc date", text: item.date },
                ],
              },
              {
                el: "div",
                className: "row-footer",
              },
            ],
          });
          ordersWraper.appendChild(orderRow);
        });
        return ordersWraper;
      }
      return generate.message("Немає замовлень.");
    },
    order: function (data) {
      let order_id;
      let orderWraper = get.elements({
        el: "div",
        className: "order-wraper",
        children: [
          {
            el: "div",
            className: "order-item",
            children: [
              {
                el: "p",
                className: "manager_desc",
                text: `Менеджер: ${data[0].order_manager}`,
              },
            ],
          },
        ],
      });
      if (data.length > 0) {
        data.forEach((item) => {
          if (Array.isArray(item)) return;
          order_id = item.order_id;
          let options_inp = [];
          let seal_number = item.seal_number || "";

          if (item.is_need_seal) {
            options_inp.push(
              {
                el: "input",
                className: "seal_inp",
                type: "text",
                placeholder: "№ пломби",
                autofill: "off",
                value: seal_number,
                event: "input",
                data: [
                  { order_num: item.seal_params[0] },
                  { seal_goods: item.seal_params[1] },
                ],
                hendler: hendlers.send_seal_number,
              },
              {
                el: "button",
                className: "send_seal_btn",
                event: "click",
                hendler: hendlers.add_seal_number,
                children: [
                  {
                    el: "img",
                    src: get.url(src.ico.send),
                  },
                ],
              }
            );
          }

          let orderItem = get.elements({
            el: "div",
            className: "order-item",
            children: [
              {
                el: "div",
                className: "main_item_desc",
                children: [
                  {
                    el: "img",
                    className: "goods-image",
                    src: item.imgSrc,
                    alt: item.positionName,
                  },
                  {
                    el: "div",
                    className: "text-wraper",
                    children: [
                      {
                        el: "p",
                        className: "order-article success",
                        children: [
                          {
                            el: "span",
                            className: "article",
                            text: item.articleAndPlace.article,
                          },
                          {
                            el: "span",
                            className: "place",
                            text: item.articleAndPlace.place,
                          },
                        ],
                      },
                      {
                        el: "p",
                        className: "position-name",
                        text: item.positionName,
                      },
                      {
                        el: "form",
                        className: "good_comment",
                        event: "submit",
                        children: [
                          {
                            el: "div",
                            className: "inp-wrapper",
                          },
                          {
                            el: "div",
                            className: "options_wrapper",
                            children: options_inp,
                          },
                        ],
                        hendler: hendlers.add_good_comment,
                      },
                      {
                        el: "p",
                        className: "position-quantity success",
                        text: item.quantity,
                      },
                    ],
                  },
                ],
              },
            ],
          });
          orderWraper.appendChild(orderItem);
        });
        data.forEach((item) => {
          if (!Array.isArray(item)) return;
          orderWraper.appendChild(
            get.elements({
              el: "div",
              className: "comments_wrapper",
              children: item.map((comment) => {
                return {
                  el: "div",
                  className: "comment_item",
                  children: [
                    {
                      el: "p",
                      className: "comment_creator",
                      text: comment.whom,
                      children: [
                        {
                          el: "span",
                          className: "comment_time",
                          text: comment.time,
                        },
                      ],
                    },
                    {
                      el: "p",
                      className: "comment_text",
                      text: comment.comment,
                      children: [
                        {
                          el: "span",
                          className: "comment_type",
                          text: comment.type,
                        },
                      ],
                    },
                  ],
                };
              }),
            })
          );
        });
        orderWraper.appendChild(
          get.elements({
            el: "form",
            className: "order_comment_form",
            event: "submit",
            data: [
              {
                order_id: order_id,
              },
            ],
            hendler: hendlers.send_order_comment,
            children: [
              {
                el: "textarea",
                className: "order_comment",
                placeholder: "Коментар",
              },
              {
                el: "button",
                className: "send_comment",
                children: [
                  {
                    el: "img",
                    src: get.url(src.ico.send),
                    alt: "send icon",
                  },
                ],
              },
            ],
          })
        );
        return orderWraper;
      }
      return generate.message("Сталася помилка під час отримання інформації.");
    },
    compare: function () {
      console.log(data_base.data.compareArray);
      contentWraper.innerHTML = "";
      let compareWraper = get.elements({
        el: "div",
        className: "compare-wraper",
      });
      if (Object.keys(data_base.data.compareArray).length > 0) {
        Object.keys(
          Object.fromEntries(
            Object.entries(data_base.data.compareArray).sort(
              (a, b) => a[1].isProcesed - b[1].isProcesed
            )
          )
        ).forEach((item) => {
          let difference =
            data_base.data.compareArray[item].count.realCount -
            (data_base.data.compareArray[item].count.baseCount +
              data_base.data.compareArray[item].count.orderCount);
          let isProcesed = { text: "Обробити" };
          if (data_base.data.compareArray[item].isProcesed) {
            isProcesed.class = "success";
            isProcesed.text = "Оброблено";
          }
          function drawDifference() {
            if (difference <= 0) {
              return { backgroundColor: "rgb(253, 184, 184)" };
            }
            if (item.isProcesed) {
              return { backgroundColor: "#c2edc2" };
            }
          }
          let compareItem = get.elements({
            el: "div",
            className: `compare-item ${isProcesed.class}`,
            style: drawDifference(),
            children: [
              {
                el: "button",
                className: "del-btn btn",
                event: "click",
                hendler: hendlers.removeItem,
                data: [{ article: item }, { arr: "compareArray" }],
                children: [
                  {
                    el: "img",
                    src: get.url(src.ico.recycle),
                    alt: "Видалити Елемент",
                  },
                ],
              },
              {
                el: "a",
                className: "item-image-link",
                href: data_base.data.compareArray[item].photoLG,
                event: "click",
                hendler: hendlers.showImage,
                children: [
                  {
                    el: "img",
                    className: "item-image",
                    src: data_base.data.compareArray[item].photo,
                  },
                ],
              },
              {
                el: "div",
                className: "item-text-wraper",
                style: drawDifference(),
                children: [
                  {
                    el: "p",
                    className: "compare-time",
                    text: `${
                      data_base.data.compareArray[item].addingDate.day
                    }.${data_base.data.compareArray[item].addingDate.month}.${
                      data_base.data.compareArray[item].addingDate.year
                    }   ${data_base.data.compareArray[item].addingDate.hours}:${
                      data_base.data.compareArray[item].addingDate.minutes
                    }:${
                      data_base.data.compareArray[item].addingDate.seconds
                    }| ${
                      data_base.data.addresses[item]?.place ?? "Ще не Збережено"
                    }`,
                  },
                  {
                    el: "div",
                    className: "item-count",
                    children: [
                      {
                        el: "p",
                        className: "item-count",
                        text: `По базі: ${data_base.data.compareArray[item].count.baseCount}`,
                      },
                      {
                        el: "p",
                        className: "item-count",
                        text: `Резерв: ${data_base.data.compareArray[item].count.orderCount}`,
                      },
                      {
                        el: "p",
                        className: "item-count",
                        text: `Всього: ${data_base.data.compareArray[item].count.realCount}`,
                      },
                      {
                        el: "p",
                        className: "item-count",
                        text: `Різниця: ${difference}`,
                      },
                    ],
                  },
                  {
                    el: "p",
                    className: "item-article",
                    text: item,
                  },
                  {
                    el: "p",
                    className: "item-head",
                    text: data_base.data.compareArray[item].head,
                  },
                  {
                    el: "button",
                    className: "procesed-btn",
                    text: isProcesed.text,
                    data: [{ article: item }, { arr: "compareArray" }],
                    event: "click",
                    hendler: hendlers.procesed,
                  },
                ],
              },
            ],
          });
          compareWraper.appendChild(compareItem);
        });
        return compareWraper;
      }

      return generate.message("Немає розбіжностей!!!");
    },
    list: function () {
      if (Object.keys(data_base.data.listArray).length > 0) {
        let listWraper = get.elements({
          el: "div",
          className: "list-wraper",
        });
        Object.keys(
          Object.fromEntries(
            Object.entries(data_base.data.listArray).sort(
              (a, b) => a[1].isProcesed - b[1].isProcesed
            )
          )
        ).forEach((item) => {
          let isProcesedText = "Обробити",
            isProcesedClass = ``;
          if (data_base.data.listArray[item].isProcesed) {
            isProcesedText = "Оброблено";
            isProcesedClass = "success";
          }
          let listItem = get.elements({
            el: "div",
            className: `list-item ${isProcesedClass}`,
            children: [
              {
                el: "button",
                className: "del-btn btn",
                event: "click",
                data: [{ article: item }, { arr: "listArray" }],
                hendler: hendlers.removeItem,
                children: [
                  {
                    el: "img",
                    src: get.url(src.ico.recycle),
                    alt: "Видалити елемент",
                  },
                ],
              },
              {
                el: "a",
                className: "item-image-link",
                href: data_base.data.listArray[item].photoLG,
                children: [
                  {
                    el: "img",
                    className: "item-image",
                    src: data_base.data.listArray[item].photo,
                  },
                ],
              },
              {
                el: "div",
                className: "item-text-wraper",
                children: [
                  {
                    el: "p",
                    className: "desc date-desc",
                    text: `${data_base.data.listArray[item].addingDate.day}.${
                      data_base.data.listArray[item].addingDate.month
                    }.${data_base.data.listArray[item].addingDate.year}  ${
                      data_base.data.listArray[item].addingDate.hours
                    }:${data_base.data.listArray[item].addingDate.minutes}:${
                      data_base.data.listArray[item].addingDate.seconds
                    }|${
                      data_base.data.addresses[item]?.place ?? "Ще не Збережено"
                    } `,
                  },
                  {
                    el: "p",
                    className: "item-article",
                    text: item,
                  },
                  {
                    el: "p",
                    className: "item-head",
                    text: `Кількість по базі: ${data_base.data.listArray[item].count.baseCount}`,
                  },
                  {
                    el: "p",
                    className: "item-head",
                    text: data_base.data.listArray[item].head,
                  },
                  {
                    el: "button",
                    className: "procesed-btn",
                    text: isProcesedText,
                    data: [{ article: item }, { arr: "listArray" }],
                    event: "click",
                    hendler: hendlers.procesed,
                  },
                ],
              },
            ],
          });
          listWraper.appendChild(listItem);
        });
        return listWraper;
      }
      return generate.message("Список товару на розноску пустий!!!");
    },
    search: function (data) {
      generate.preloader({ status: "end" });
      contentWraper.innerHTML = "";
      if (data.length > 0) {
        let searchInp = document.querySelector(".search-inp").value;
        data.forEach((item) => {
          let storage_item_data = data_base.data.addresses[item.article];
          console.log(storage_item_data);
          let reserve_count_class = "",
            base_count_class = "";
          if (item.questionsCount !== undefined) {
            return;
          }
          if (item.baseCount.baseCount < 1) {
            base_count_class = "danger";
          }
          if (item.baseCount.orderCount > 0) {
            reserve_count_class = "danger";
          }

          if (storage_item_data == undefined) {
            storage_item_data = {};

            storage_item_data.article = item.article;
            storage_item_data.last_goods_count = item.baseCount.baseCount;
            data_base.save_data({
              store_name: "addresses",
              index_name: "article",
              article: item.article,
              request: storage_item_data,
            });
          }
          data_base.data.id[item.article] = item.id;
          data_base.save_data({
            store_name: "id",
            index_name: "id",
            request: { article: item.article, id: item.id },
          });

          if (
            searchInp !== "" &&
            searchInp.match(regExp.cell) &&
            storage_item_data?.cell !== searchInp
          ) {
            storage_item_data["cell"] = searchInp; // Додати ключ без передачі у save_data
            data_base.save_data({
              store_name: "addresses",
              article: item.article,
              index_name: "article",
              request: storage_item_data,
            });
          }
          storage_item_data.id = item.id;
          storage_item_data["last_goods_count"] = item.baseCount.baseCount; // Додати ключ без передачі у save_data
          data_base.save_data({
            store_name: "addresses",
            index_name: "article",
            request: storage_item_data,
          });
          if (
            storage_item_data.cell_capacity !== undefined &&
            storage_item_data.last_goods_count !== undefined &&
            storage_item_data.real_goods_count !== undefined
          ) {
            storage_item_data.save_area_count =
              storage_item_data.last_goods_count -
              storage_item_data.real_goods_count;
            data_base.save_data({
              store_name: "addresses",
              article: item.article,
              index_name: "article",
              request: storage_item_data,
            });
          } else if (
            storage_item_data?.cell_capacity == undefined ||
            storage_item_data.cell_capacity == "" ||
            storage_item_data.cell_capacity == 0 ||
            storage_item_data.cell_capacity < 0
          ) {
            storage_item_data.save_area_count = item.baseCount.baseCount;

            console.log(storage_item_data.save_area_count);
            data_base.save_data({
              store_name: "addresses",
              article: item.article,
              index_name: "article",
              request: storage_item_data,
            });
          }
          console.log(storage_item_data);
          let searchItem = get.elements({
            el: "div",
            className: "item-wraper",
            data: [{ id: item.id }],
            children: [
              {
                el: "div",
                className: "item-header",
                children: [
                  {
                    el: "span",
                    className: "start",
                    text: `ID: ${item.id} | Артикул: ${item.article} `,
                  },
                  {
                    el: "input",
                    type: "checkbox",
                    className: "status-check",
                    event: "click",
                    hendler: hendlers.check,
                  },
                ],
              },
              {
                el: "div",
                className: "item-place danger",
                text: `Місце: ${
                  storage_item_data?.place ?? "Ще не збережено"
                } |  Cell: ${storage_item_data?.cell ?? "Ще не збережено"}`,
              },
              {
                el: "div",
                className: "item-content-wraper",
                children: [
                  {
                    el: "a",
                    className: "image-link",
                    href: item.photoLG,
                    event: "click",
                    hendler: hendlers.showImage,
                    children: [
                      {
                        el: "img",
                        className: "image-link",
                        src: item.photo,
                      },
                    ],
                  },
                  {
                    el: "div",
                    className: "item-text-wraper",
                    children: [
                      {
                        el: "div",
                        className: "item-count",
                        children: [
                          {
                            el: "p",
                            className: `count base-count ${base_count_class}`,
                            text: `Кількість По Базі: ${item.baseCount.baseCount}`,
                          },
                          {
                            el: "p",
                            className: `count reserve-count ${reserve_count_class}`,
                            text: `Резерв: ${item.baseCount.orderCount}`,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                el: "p",
                className: "item-desc",
                event: "click",
                hendler: function (e) {
                  e.currentTarget.classList.toggle("visible");
                },
                text: item.desc,
              },

              {
                el: "div",
                className: "cell-capacity-display",
                children: [
                  {
                    el: "p",
                    className: "cell-capacity-desc",
                    text: `Кількість товару в комірці ${
                      storage_item_data?.real_goods_count || 0
                    } шт. з можливих ${
                      storage_item_data?.cell_capacity || 0
                    } шт. В зоні збереження ${
                      storage_item_data?.save_area_count || 0
                    } .шт`,
                  },
                  {
                    el: "p",
                    className: "cell-capacity-bar-wraper",
                    children: [
                      {
                        el: "div",
                        className: "cell-capacity-bar",
                        style: {
                          width: `${get.percent({
                            main: storage_item_data?.cell_capacity || 0,
                            num: storage_item_data?.real_goods_count || 0,
                          })}%`,
                        },
                      },
                    ],
                  },
                ],
              },
              {
                el: "div",
                className: "cell-capacity-wraper",
                children: [
                  {
                    el: "button",
                    className: "cell-btn fill",
                    text: "Заповнити Комірку",
                    event: "click",
                    data: [{ article: item.article }],
                    hendler: hendlers.fill_cell,
                  },
                  {
                    el: "butoon",
                    className: "cell-btn ignore",
                    text: "Ігнорувати артикул",
                    event: "click",
                    data: [{ article: item.article }],
                    hendler: hendlers.ignore_article,
                  },
                  {
                    el: "input",
                    className: "cell-input",
                    autofill: "off",
                    placeholder: "Місткість комірки",
                    data: [{ article: item.article }],
                    type: "number",
                    value: storage_item_data?.cell_capacity,
                    event: "input",
                    hendler: function () {
                      storage_item_data["cell_capacity"] = +this.value;
                      data_base.save_data({
                        store_name: "addresses",
                        article: item.article,
                        index_name: "article",
                        id: item.id,
                        request: storage_item_data,
                      });
                    },
                  },
                ],
              },

              {
                el: "div",
                className: "item-btn-wraper",
                children: [
                  {
                    el: "button",
                    className: "list-btn btn",
                    text: "Рознести",
                    event: "click",
                    data: [{ article: item.article }],
                    hendler: function () {
                      hendlers.add_to_list.call(this, item);
                    },
                  },
                  {
                    el: "div",
                    className: "compare-wraper",
                    children: [
                      {
                        el: "input",
                        type: "number",
                        className: "compare-inp",
                        autofill: "off",
                        event: "input",
                        hendler: function (e) {
                          let compareVal = e.currentTarget.value;
                          if (
                            Number(compareVal) !==
                            Number(get.goodsCount(item.count).baseCount)
                          ) {
                            e.currentTarget.style.border = `1px solid red`;
                          }
                        },
                        placeholder: "Фактична кількість",
                      },
                      {
                        el: "button",
                        className: "compare-btn btn",
                        text: "Пересорт",
                        event: "click",
                        data: [{ article: item.article }],
                        hendler: function () {
                          hendlers.add_to_compare.call(this, item);
                        },
                      },
                    ],
                  },
                ],
              },
              {
                el: "div",
                className: "item-data-btn-wraper",
                children: [
                  {
                    el: "button",
                    className: "reserve-btn btn",
                    text: "Резерв",
                    event: "click",
                    hendler: function (e) {
                      let footer =
                        e.currentTarget.parentElement.parentElement.querySelector(
                          ".item-footer"
                        );
                      if (footer.classList.contains("active-reserve")) {
                        footer.innerHTML = "";
                        footer.classList.toggle("active-reserve");
                        return;
                      }
                      let reserve = load.reserve({ id: item.id });
                      footer.classList.toggle("active-reserve");
                      footer.innerHTML = "";
                      reserve.then((reserve) => {
                        footer.appendChild(generate.reserve(reserve));
                      });
                    },
                  },
                  {
                    el: "button",
                    className: "cales-btn btn",
                    text: "Продажі",
                    event: "click",
                    hendler: function (e) {
                      let footer =
                        e.currentTarget.parentElement.parentElement.querySelector(
                          ".item-footer"
                        );
                      if (footer.classList.contains("active-sales")) {
                        footer.innerHTML = "";
                        footer.classList.toggle("active-sales");
                        return;
                      }
                      let sales = load.sales({ id: item.id });

                      footer.innerHTML = "";
                      footer.classList.toggle("active-sales");

                      sales.then((data) => {
                        footer.appendChild(generate.sales(data));
                      });
                    },
                  },
                  {
                    el: "button",
                    className: "deliveries-btn btn",
                    text: "Приходи",
                    event: "click",
                    hendler: function (e) {
                      let footer =
                        e.currentTarget.parentElement.parentElement.querySelector(
                          ".item-footer"
                        );
                      if (footer.classList.contains("active-arrival")) {
                        footer.innerHTML = "";
                        footer.classList.toggle("active-arrival");
                        return;
                      }
                      let deliveries = load.deliveries({ id: item.id });
                      footer.classList.toggle("active-arrival");
                      footer.innerHTML = "";
                      deliveries.then((data) => {
                        footer.appendChild(generate.deliveries(data));
                      });
                    },
                  },
                ],
              },
              {
                el: "div",
                className: "history-wrapper",
                event: "click",
                children: [
                  {
                    el: "p",
                    className: "history-desc",
                    text: "Показати історію забору з комірки.",
                  },
                ],
                hendler: function () {
                  let childs = this.children.length;
                  if (childs > 1) {
                    Array.from(this.children).forEach((child) => {
                      if (child.classList.contains("history-desc")) return;
                      child.remove();
                    });
                    return;
                  }
                  Object.keys(data_base.data.history)
                    .reverse()
                    .forEach((key) => {
                      console.log(key);
                      if (key.includes(item.article)) {
                        console.log(key.match(regExp.num));
                        this.appendChild(
                          get.elements({
                            el: "p",
                            className: "history-desc",
                            children: [
                              {
                                el: "span",
                                text: `Замовлення: ${key.match(regExp.num)[0]}`,
                              },
                              {
                                el: "span",
                                text: `${data_base.data.history[key].quantity}`,
                              },
                            ],
                          })
                        );
                      }
                    });
                },
              },
              { el: "div", className: "item-footer" },
            ],
          });
          contentWraper.classList.add("search-result-wraper");
          contentWraper.appendChild(searchItem);
        });

        return;
      }
      contentWraper.appendChild(generate.message("Нічого не знайдено!!"));
    },
    elaborations: function (data) {
      generate.preloader({ status: "end" });
      console.log(data);
      if (data.length > 0) {
        let elaborationWraper = get.elements({
          el: "div",
          className: "elaboration-wraper",
        });
        data.forEach((item) => {
          console.log(item);
          let isReserve = "success",
            isSmallCount = "success";
          if (item.count.baseCount < 1) {
            isSmallCount = "danger";
          }
          if (item.count.orderCount > 0) {
            isReserve = "danger";
          }

          let elaborationItem = get.elements({
            el: "div",
            className: "table-wraper",
            children: [
              {
                el: "div",
                className: "table-row",
                children: [
                  {
                    el: "p",
                    className: "table-desc",
                    text: "Номер Замовлення",
                  },
                  {
                    el: "p",
                    className: "table-text",
                    event: "click",
                    hendler: hendlers.elaborationOrder,
                    data: [{ id: item.order.id }],
                    text: `ID:${item.order.id} Номер:${item.order.number}`,
                  },
                ],
              },
              {
                el: "div",
                className: "table-row",
                children: [
                  {
                    el: "p",
                    className: "table-desc",
                    text: "Менеджер",
                  },
                  { el: "p", className: "table-text", text: item.manager },
                ],
              },
              {
                el: "div",
                className: "table-row",
                children: [
                  {
                    el: "p",
                    className: "table-desc",
                    text: "Імя товару",
                  },
                  {
                    el: "p",
                    className: "table-text",
                    event: "click",
                    data: [{ article: item.article }],
                    hendler: hendlers.elaborationSearch,
                    text: `${item.positionName} (${item.article})`,
                  },
                ],
              },
              {
                el: "div",
                className: "table-row",
                children: [
                  {
                    el: "p",
                    className: "table-text",
                    text: "Час",
                  },
                  {
                    el: "p",
                    className: "table-text",
                    text: `${item.time}`,
                  },
                ],
              },
              {
                el: "div",
                className: "table-row",
                children: [
                  {
                    el: "p",
                    className: "table-desc",
                    text: "Місце товару:",
                  },
                  {
                    el: "p",
                    className: "table-text",
                    text: item.place,
                  },
                ],
              },
              {
                el: "div",
                className: "table-row",
                children: [
                  {
                    el: "p",
                    className: "table-desc",
                    text: "Тип Уточнення:",
                  },
                  {
                    el: "p",
                    className: "table-text",
                    text: item.type,
                  },
                ],
              },
              {
                el: "div",
                className: `table-row ${isSmallCount}`,
                children: [
                  {
                    el: "p",
                    className: "table-desc",
                    text: "Кількість",
                  },
                  {
                    el: "p",
                    className: "table-text",
                    text: `По базі: ${item.count.baseCount} В замовленні: ${item.count.orderCount}`,
                  },
                ],
              },
              {
                el: "div",
                className: `table-row ${isReserve}`,
                children: [
                  {
                    el: "p",
                    className: "table-desc",
                    text: "Резерв:",
                  },
                  {
                    el: "p",
                    className: "table-text",
                    text: String(item.count.reservedCount),
                  },
                ],
              },
              {
                el: "div",
                className: "table-row",
                children: [
                  {
                    el: "p",
                    className: "table-desc",
                    text: "Вкажи кількість:",
                  },
                  {
                    el: "div",
                    className: "table-input-wraper",
                    children: [
                      {
                        el: "input",
                        type: "text",
                        placeholder: "Кількість",
                        className: "table-input",
                        data: [{ count: item.count.baseCount }],
                        event: "input",
                        hendler: hendlers.checkAnswer,
                        id: `elaborationInput${item.order.id}`,
                      },
                      {
                        el: "button",
                        className: "send-btn",
                        event: "click",
                        data: [
                          { order: item.elaborationId },
                          { count: item.count.baseCount },
                        ],
                        hendler: function () {
                          hendlers.addElaborationAnswer.call(this, item);
                        },
                        children: [
                          {
                            el: "img",
                            src: get.url(src.ico.send),
                            alt: "send",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                el: "div",
                className: "table-row image-row",
                children: [
                  {
                    el: "p",
                    className: "image-desc ",
                    text: "Фото товару.",
                  },
                  {
                    el: "div",
                    className: "image-wraper",
                    children: item.imageSm.map((source, index) => {
                      return {
                        el: "a",
                        event: "click",
                        hendler: hendlers.showImage,
                        href: item.imageLg[index],
                        children: [{ el: "img", src: source }],
                      };
                    }),
                  },
                ],
              },
              {
                el: "div",
                className: "elaboration-btn-wraper",
                children: [
                  {
                    el: "button",
                    className: "reserve-btn btn",
                    event: "click",
                    text: "Резерв",
                    data: [{ id: item.goodId }],
                    hendler: hendlers.elaborationReserve,
                  },
                  {
                    el: "button",
                    className: "arrival-btn btn",
                    text: "Приход",
                    event: "click",

                    data: [{ id: item.goodId }],
                    hendler: hendlers.elaborationArrival,
                  },
                  {
                    el: "button",
                    className: "sales-btn btn",
                    text: "Продажі",
                    event: "click",

                    data: [{ id: item.goodId }],
                    hendler: hendlers.elaborationSales,
                  },
                ],
              },
              {
                el: "div",
                className: "item-footer",
              },
            ],
          });
          elaborationWraper.appendChild(elaborationItem);
        });
        return elaborationWraper;
      }
      return generate.message("Зараз немає уточнень");
    },
    question: function (data) {
      console.log(data);
      if (data.length > 0) {
        let questionsWraper = get.elements({
          el: "div",
          className: "questions-wraper",
        });
        data.forEach((item) => {
          if (item.id == undefined) {
            return;
          }
          questionsWraper.appendChild(
            get.elements({
              el: "div",
              className: "table-wraper question",
              children: [
                {
                  el: "div",
                  className: "table-row",
                  children: [
                    {
                      el: "p",
                      className: "table-desc ",
                      text: "Товар",
                    },
                    {
                      el: "p",
                      className: "table-text question",
                      text: item.goodsDesc,
                    },
                  ],
                },
                {
                  el: "div",
                  className: "table-row",
                  children: [
                    {
                      el: "p",
                      className: "table-desc",
                      text: "Адрес:",
                    },
                    {
                      el: "p",
                      className: "table-text",
                      text:
                        data_base.data.addresses[
                          get.elaborationArtice(item.goodsDesc)
                        ]?.place || "Не збережено",
                    },
                  ],
                },
                {
                  el: "div",
                  className: "table-row",
                  children: [
                    {
                      el: "p",
                      className: "table-desc question",
                      text: "Питання",
                    },
                    {
                      el: "p",
                      className: "table-text question",
                      text: item.question,
                    },
                  ],
                },
                {
                  el: "div",
                  className: "table-row",
                  children: [
                    {
                      el: "p",
                      className: "table-desc",
                      text: "Додаткова інформація",
                    },
                    {
                      el: "p",
                      className: "table-text",
                      text: item.questionManager,
                    },
                  ],
                },
                {
                  el: "div",
                  className: "table-row area-wraper",
                  children: [
                    {
                      el: "textarea",
                      className: "answer-area table-input",
                      placeholdrer: "Відповідь на питання",
                    },
                    {
                      el: "button",
                      className: "answer-btn",
                      event: "click",
                      data: [{ id: item.id }],
                      hendler: hendlers.sendQuestion,
                      children: [
                        {
                          el: "img",
                          alt: "Відправити Відповідь.",
                          src: get.url(src.ico.send),
                        },
                      ],
                    },
                  ],
                },
              ],
            })
          );
        });
        return questionsWraper;
      }
      return this.message("Зараз немає питань");
    },
    requestCount: function () {
      let countData = {};
      load.requestCount().then((data) => {
        let elaborationCounter = document.querySelector(".elabortion-count");
        let questionCounter = document.querySelector(".question-count");
        console.log(data);
        if (data.elaboration !== null && data.elaboration > 0) {
          elaborationCounter.style.display = "block";
          elaborationCounter.textContent = data.elaboration;
        } else {
          elaborationCounter.style.display = "none";
        }
        if (data.new_goods_questions !== null && data.new_goods_questions > 0) {
          questionCounter.style.display = "block";
          questionCounter.textContent = data.new_goods_questions;
        } else {
          questionCounter.style.display = "none";
        }
      });
    },
    tasksCount: function () {
      let listCount = 0,
        compareCount = 0,
        productionCount = 0;
      if (Object.keys(data_base.data?.compareArray).length > 0) {
        Object.keys(data_base.data.compareArray).forEach((item) => {
          if (!data_base.data.compareArray[item].isProcesed) {
            compareCount++;
          }
        });
      }
      if (Object.keys(data_base.data?.listArray).length > 0) {
        Object.keys(data_base.data.listArray).forEach((item) => {
          if (!data_base.data.listArray[item].isProcesed) {
            listCount++;
          }
        });
      }

      if (Object.keys(data_base.data?.production ?? {}) > 0) {
        Object.keys(data_base.data.production).forEach((item) => {
          if (!item.isProcessed) {
            productionCount++;
          }
        });
      }

      if (listCount > 0) {
        document.querySelector(".list-count").style.display = "block";
        document.querySelector(".list-count").textContent = listCount;
      } else {
        document.querySelector(".list-count").style.display = "none";
      }

      if (compareCount > 0) {
        document.querySelector(".compare-count").style.display = "block";
        document.querySelector(".compare-count").textContent = compareCount;
      } else {
        document.querySelector(".compare-count").style.display = "none";
      }

      if (productionCount > 0) {
        document.querySelector(".production-count").style.display = "block";
        document.querySelector(".production-count").textContent =
          productionCount;
      } else {
        document.querySelector(".production-count").style.display = "none";
      }
    },
    history: function () {
      contentWraper.innerHTML = "";
      let today_elaboration_count = 0;
      Object.keys(data_base.data?.elaborations ?? {}).forEach((item) => {
        if (
          item.includes(
            `${get.date().year}.${get.date().month}.${get.date().day}`
          )
        ) {
          today_elaboration_count++;
        }
      });
      contentWraper.appendChild(
        get.elements({
          el: "div",
          className: "history-wraper",
          children: [
            {
              el: "div",
              className: "history-item saved-articles",
              text: `Збережено Артикулів: ${
                Object.keys(data_base.data.addresses).length
              }`,
            },
            {
              el: "div",
              className: "history-item elaboration",
              text: `Відбито Уточнень: ${
                Object.keys(data_base.data?.elaborations).length
              }(${today_elaboration_count})`,
              event: "click",
              hendler: generate.elaborations_list,
            },
            {
              el: "div",
              className: "history-item production",
              text:
                "Виготовлено продукції: " +
                Object.keys(data_base.data?.production).length,
            },
            {
              el: "div",
              className: "history-item cells_list",
              text: "Стелажі",
              event: "click",
              hendler: hendlers.show_stilages,
            },
            {
              el: "div",
              className: "history-item empty-cells",
              text: "Пусті комірки",
              event: "click",
              hendler: hendlers.show_empty_cells,
            },
            {
              el: "div",
              className: "history-item get_cells",
              text: `Отримати ID товаів збережено ${
                Object.keys(data_base.data?.id || {}).length
              }/${Object.keys(data_base.data?.addresses).length}`,
              event: "click",
              hendler: hendlers.get_id,
            },
            {
              el: "div",
              className: "history-item get_delivery",
              text: "Показати приходи",
              event: "click",
              hendler: hendlers.show_delivery,
            },
            {
              el: "div",
              className: "history-item get_history",
              text: "Імпорт експорт данних",
              event: "click",
              hendler: hendlers.import_export_database,
            },

            {
              el: "div",
              className: "history-item  deliveries_table",
              text: "Таблиця приходів",
              event: "click",
              hendler: function () {
                hendlers.database({
                  action: "get_data",
                  store_name: "deliveries_list",
                  callback: generate.deliveries_table,
                });
              },
            },
            {
              el: "div",
              className: "history-item barcode_print",
              text: "Друк адресів, штрихкодів",
              event: "click",
              hendler: generate.barcodes,
            },
          ],
        })
      );
    },
    empty_cells: function (data) {
      contentWraper.innerHTML = "";
      if (data.length === 0) {
        contentWraper.appendChild(
          get.elements({
            el: "div",
            className: "message-title content-title",
            text: "Пусті комірки не знайдені!!!",
          })
        );
      }
      let orders = { main_orders: 0, checked_orders: 0 };
      orders.main_orders = Object.keys(data_base.data.orders).length;
      Object.keys(data_base.data.orders).forEach((item) => {
        if (!data_base.data.orders[item].is_new) {
          orders.checked_orders++;
        }
      });
      contentWraper.appendChild(
        get.elements({
          el: "div",
          className: "empty-cells-wraper",
          children: [
            {
              el: "div",
              className: "cells-header",
              children: [
                {
                  el: "button",
                  className: "btn suc",
                  text: "Записані комірки",
                  event: "click",
                  hendler: hendlers.show_wroted_cells,
                },
                {
                  el: "button",
                  className: "btn empt",
                  text: "Пусті Комірки",
                  event: "click",
                  hendler: hendlers.show_emp_cells,
                },
                {
                  el: "button",
                  className: "btn warn",
                  text: "Товар Закінчується",
                  event: "click",
                  hendler: hendlers.show_expired,
                },
              ],
            },
            {
              el: "p",
              className: "empty-cells-description",
              text: `Перевірено Замовлень: ${orders.checked_orders} / ${orders.main_orders} | Остання перевірка була о ${data_base.data.settings.last_check?.hours}:${data_base.data.settings.last_check?.minutes}`,
            },
            {
              el: "p",
              text: `Кількість пустих комірок: ${data.length}`,
            },
            {
              el: "ul",
              className: "empty-items-wraper",
              children: data.map((item) => {
                let cell_bg = "";

                let real_count =
                  data_base.data.addresses[item].real_goods_count;
                let cell_capacity =
                  data_base.data.addresses[item].cell_capacity;
                let save_area = data_base.data.addresses[item].save_area_count;

                let percent = get.percent({
                  num: real_count,
                  main: cell_capacity,
                });
                if (percent <= 25) {
                  cell_bg = "danger";
                } else if (percent > 25) {
                  cell_bg = "warrning";
                } else if (percent >= 50) {
                  cell_bg = "success";
                }
                console.log(cell_bg, percent);
                return {
                  el: "li",
                  className: `empty-cell-item ${cell_bg}`,
                  event: "click",
                  hendler: function () {
                    hendlers.search(item);
                  },
                  children: [
                    {
                      el: "p",
                      className: `empty-cell-description`,
                      children: [
                        {
                          el: "span",
                          className: "empty-cell-article",
                          text: item,
                        },
                        {
                          el: "span",
                          className: "empty-cell-place",
                          text: data_base.data.addresses[item].place,
                        },
                        {
                          el: "span",
                          className: "empty-cell-data",
                          text: `Ємність комірки:${cell_capacity} Реальна кількість: ${real_count} Заповнено на: (${percent.toFixed(
                            1
                          )}%)`,
                        },
                        {
                          el: "span",
                          className: "empty-cell-data",
                          text: `Товару в зоні збереження:${save_area}`,
                        },
                      ],
                    },
                    {
                      el: "button",
                      className: "add-btn",
                      text: "Заповнити комірку",
                      event: "click",
                      data: [{ article: item }],
                      hendler: hendlers.fill_cell,
                    },
                  ],
                };
              }),
            },
            {
              el: "button",
              className: "search-empty_cells btn",
              text: "Пошук пустих комірок",
              event: "click",
              hendler: hendlers.find_empty_cells,
            },
          ],
        })
      );
    },
    delivery_list: function (data) {
      generate.preloader({ status: "end" });
      if (data.length === 0) {
        this.message("Немає приходів");
        return;
      }
      let delivery_wraper = get.elements({
        el: "div",
        className: "delivery-wraper",
        children: [
          {
            el: "div",
            className: "delivery-header",
            children: [
              {
                el: "p",
                className: "delivery-desc",
                text: "ID",
              },
              {
                el: "p",
                className: "delivery-desc",
                text: "Постачальник",
              },
              {
                el: "p",
                className: "delivery-desc",
                text: "Дата",
              },
            ],
          },
        ],
      });
      data.forEach((item) => {
        delivery_wraper.appendChild(
          get.elements({
            el: "div",
            className: `delivery-item ${item.status}`,
            event: "click",
            data: [{ delivery_id: item.delivery_id }],
            hendler: hendlers.show_delivery_item,
            children: [
              {
                el: "div",
                className: "desc-wrapper",
                children: [
                  {
                    el: "p",
                    className: "item-desc",
                    text: item.delivery_id,
                  },
                  {
                    el: "p",
                    className: "item-desc",
                    text: item.delivery_provider,
                  },
                  {
                    el: "p",
                    className: "item-desc",
                    text: item.delivery_date,
                  },
                ],
              },
              {
                el: "div",
                className: "item-footer",
              },
            ],
          })
        );
      });
      contentWraper.appendChild(delivery_wraper);
    },
    delivery_item: function (data) {
      if (data.length > 0) {
        let item_footer = this.querySelector(".item-footer");
        item_footer.innerHTML = "";
        let store = data_base.data;
        let item_wraper = get.elements({
          el: "div",
          className: "item-wraper",
          children: [
            {
              el: "div",
              className: "item item-header",
              children: [
                {
                  el: "p",
                  className: "item-desc",
                  text: "Артикул",
                },
                {
                  el: "p",
                  className: "item-desc",
                  text: "Назва товару",
                },
                {
                  el: "p",
                  className: "item-desc",
                  text: "місце",
                },
                {
                  el: "p",
                  className: "item-desc",
                  text: "Кількість",
                },
                {
                  el: "button",
                  className: "btn fill_all_cell_btn",
                  text: "Заповнити всі комірки",
                  event: "click",
                  hendler: function () {
                    let buttons = Array.from(
                      document.querySelectorAll(".fill_cell_btn")
                    );
                    buttons.forEach(function (button) {
                      if (button.disabled) return;
                      let nakl_num =
                        button.parentElement.parentElement.parentElement.dataset
                          .delivery_id || false;
                      button.dataset.delivery_id = nakl_num;
                      button.click();
                      button.disabled = true;
                    });
                  },
                },
              ],
            },
          ],
        });
        item_footer.appendChild(item_wraper);
        data.forEach((item) => {
          let item_article = store?.id[item.id] || 0;

          item_footer.appendChild(
            get.elements({
              el: "div",
              className: "item",
              children: [
                {
                  el: "p",
                  className: "item-desc",
                  text: item_article.article || "не збережено",
                },
                {
                  el: "p",
                  className: "item-desc",
                  text: item.desc,
                },
                {
                  el: "p",
                  className: "item-desc",
                  text: item.place,
                },
                {
                  el: "p",
                  className: "item-desc",
                  text: item.count,
                },
                {
                  el: "button",
                  className: "btn fill_cell_btn",
                  text: "Заповнити комірку",
                  event: "click",
                  data: [
                    { article: item_article.article },
                    { added_count: item.count },
                  ],
                  hendler: hendlers.fill_cell,
                },
                {
                  el: "div",
                  className: "indicator-wrapper",
                  children: [
                    {
                      el: "div",
                      className: "fill-indicator",
                      style: {
                        width: `${get.percent({
                          main:
                            store.addresses[item_article.article]
                              ?.cell_capacity || 0,
                          num:
                            store.addresses[item_article.article]
                              ?.real_goods_count || 0,
                        })}%`,
                      },
                      children: [
                        {
                          el: "span",
                          className: "indicator-desc",
                          text: `${
                            store.addresses[item_article.article]
                              ?.real_goods_count || 0
                          } / ${
                            store.addresses[item_article.article]
                              ?.cell_capacity || 0
                          }`,
                        },
                      ],
                    },
                  ],
                },
              ],
            })
          );
        });

        return;
      }
      this.message("Немає інформації про прихід");
    },
  };

  function barcodeRecognition() {
    let barCodeSearch = document.querySelector(".bar-code-search-btn");
    let barcodeDisplayWraper = document.querySelector(
      ".barcode-display-wraper"
    );
    let html5QrcodeScanner = new Html5QrcodeScanner("reader", {
      fps: 8,
      qrbox: 250,
    });

    let lastResult,
      countResults = 0;
    function onScanSuccess(decodedText) {
      if (decodedText !== lastResult) {
        ++countResults;
        lastResult = decodedText;
        let searchInp = document.querySelector(".search-inp");
        searchInp.value = decodedText;
        let serarchBtn = document.querySelector(".search-send-btn");
        if (decodedText.match(regExp.cell) !== null) {
          serarchBtn.click();
        }
      }
    }
    html5QrcodeScanner.render(onScanSuccess);
    if (barCodeSearch.dataset.scaning == "true") {
      barCodeSearch.dataset.scaning = "false";

      html5QrcodeScanner.clear();

      barcodeDisplayWraper.classList.add("hide-barcode");
      return;
    }
    html5QrcodeScanner.applyVideoConstraints({
      advanced: [{ torch: false }],
    });
    barcodeDisplayWraper.classList.remove("hide-barcode");
    barCodeSearch.dataset.scaning = "true";
  }

  let load = {
    storage: [],
    fetch: async function (data) {
      try {
        const requestBody = data.body ? get.decode(data.body) : "";
        const response = await fetch(data.url, {
          method: data.method,
          body: requestBody,
        });

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const res = await response.text();
        try {
          return JSON.parse(res);
        } catch (err) {
          console.log(err);
        }
        try {
          return get.parser(res);
        } catch (parseError) {
          console.error("Parsing error:", parseError);
          return res;
        }
      } catch (error) {
        console.error("Fetch error:", error);
        data_base.data.settings.error = {
          err_tyte: "load eroor",
          err_desc: error.message,
        };
        generate.preloader({ status: "end" });
        return [];
      }
    },
    podrobno: async function (data) {
      let item_data = {};
      let details = await this.fetch({
        url: url.podrobno,
        method: "POST",
        body: data,
      });
      let main_data = Array.from(
        details.querySelectorAll(".detPodrobnoOsn .detPodrobnoOsnDiv")
      );
      main_data.forEach((item) => {
        const regex = /(.*?):\s*(.*)/;
        const matches = item.textContent.trim().match(regex);
        if (matches) {
          item_data[matches[1]] = matches[2];
        } else {
          alert("Не вдалося отримати інформацію");
        }
      });
      return item_data;
    },
    add_good_comment: function (data) {
      //let add_result = this.fetch({})
    },
    add_order_comment: function (req_data) {
      let add_comment_result = this.fetch({
        url: url.add_coment,
        method: "POST",
        body: req_data.body,
      });
      add_comment_result.then((data) => {
        if (!data.body.textContent.includes(req_data.body.texts)) {
          alert("Помилка збереження коментаря");
          return;
        }
        let textarea = document.querySelector("textarea.order_comment");

        textarea.value = "";
      });
    },
    seal_number: function (data) {
      console.log(data);
      let send_seal = this.fetch({
        url: url.seal_number,
        method: "POST",
        body: data.body,
      });
      send_seal.then((data) => {
        console.log(data);
        if (data.body.textContent != "ok") {
          alert("Помилка збереження пломби");
        }
      });
    },
    reserve: async function (data) {
      this.storage = [];
      const reserve = await this.fetch({
        url: url.reserve,
        method: "POST",
        body: { id: data.id },
      });

      const rows = Array.from(reserve.querySelectorAll("tr"));
      rows.shift();
      if (rows.length === 0) {
        return [];
      }

      rows.forEach((item) => {
        let rowData = {};
        let td = item.querySelectorAll("td");
        rowData.id = td[0].textContent;
        rowData.storage = td[1].textContent;
        rowData.count = td[2].textContent;
        rowData.time = td[3].textContent;
        this.storage.push(rowData);
      });
      return this.storage;
    },
    sales: async function (data) {
      this.storage = [];
      const sales = await this.fetch({
        url: url.sales,
        method: "POST",
        body: { id: data.id },
      });

      let rows = Array.from(sales.querySelectorAll("tr"));
      rows.shift();
      if (sales.length === 0) {
        return [];
      }
      rows.forEach((item) => {
        let rowData = {};
        let td = item.querySelectorAll("td");
        rowData.orderNumber = td[0].textContent;
        rowData.status = td[1].textContent;
        rowData.count = td[2].textContent;
        rowData.date = td[4].textContent;
        this.storage.push(rowData);
      });
      return this.storage;
    },
    deliveries: async function (data) {
      this.storage = [];
      const deliveries = await this.fetch({
        url: url.deliveries,
        method: "POST",
        body: { id: data.id },
      });
      let rows = Array.from(deliveries.querySelectorAll("tr"));
      rows.shift();
      if (deliveries.length === 0) {
        return [];
      }
      rows.forEach((item) => {
        let rowData = {};
        let td = item.querySelectorAll("td");
        rowData.date = td[0].textContent;
        rowData.provider = td[1].textContent;
        rowData.count = td[2].textContent;
        rowData.price = td[3].textContent;
        rowData.manager = td[4].textContent;
        rowData.storage = td[5].textContent;
        this.storage.push(rowData);
      });
      return this.storage;
    },
    search: async function (data) {
      this.storage = [];
      const result = await this.fetch({
        url: url.search,
        method: "POST",
        body: { search: data.search, search_sel: data.search_sell },
      });

      let goodsId = Array.from(result.querySelectorAll(".detDivTitle"));
      let searchGoodWraper = Array.from(result.querySelectorAll(".detDiv"));
      searchGoodWraper.forEach((item, index) => {
        let data = {};
        let goodsPhoto = item.querySelector(".detImg>a>img");
        let goodsCount = Array.from(result.querySelectorAll(".detPr"));
        let goodsDesc = Array.from(result.querySelectorAll(".titleDet"));
        let goods_type = Array.from(
          item.querySelectorAll(".goodsDopInfoButton")
        );

        data.id = get.article(goodsId[index].textContent).id;
        data.article = get.article(goodsId[index].textContent).article;
        data.photo = goodsPhoto.getAttribute("src");
        data.photoLG = goodsPhoto.parentNode.getAttribute("href");
        data.head = goodsDesc[index].innerHTML.split("<br>")[0].trim();
        data.desc = goodsDesc[index].textContent.trim();
        data.count = get.goodsCount(
          goodsCount[index].textContent.trim()
        ).baseCount;
        data.baseCount = get.goodsCount(goodsCount[index].textContent.trim());
        data.goods_type = goods_type[0].textContent.trim();
        this.storage.push(data);
      });

      return get.mergeSort(this.storage);
    },
    orders: async function (data) {
      this.storage = [];
      const orders = await this.fetch({
        url: url.orders,
        method: "POST",
        body: data,
      });
      let rows = Array.from(orders.querySelectorAll("table tr"));

      rows.shift();
      rows.forEach((item) => {
        let rowData = {};
        let td = Array.from(item.querySelectorAll("td"));
        if (td.length < 6) {
          return;
        }
        rowData.id = td[0].textContent;
        rowData.Number = td[1].textContent;
        rowData.ststus = td[3].textContent;
        rowData.city = td[4].textContent;
        rowData.type = td[5].textContent;
        rowData.date = td[6].textContent;
        this.storage.push(rowData);
      });

      return this.storage;
    },
    order: async function (data) {
      this.storage = [];
      const order = await this.fetch({
        url: url.order,
        method: "POST",
        body: { id: data.id },
      });
      let rows = Array.from(order.querySelectorAll("table tr"));
      let comment_list = [];
      let comment_wrapper = Array.from(
        order.querySelectorAll(`#comments${data.id} table tr `)
      );
      rows.shift();
      rows.forEach((item) => {
        let td = Array.from(item.querySelectorAll("td"));
        let quantity;

        if (td.length > 7) {
          td.shift();
        }

        if (td.length > 5) {
          if (td[4].querySelector("input[type='text']")) {
            quantity = td[4].querySelector("input[type='text']").value;
          } else {
            quantity = td[4].textContent;
          }
          let checkStyle = td[0].getAttribute("style");

          if (checkStyle.includes("background-color:#d7cafb;")) {
            return;
          }

          let rowData = {};

          let order_manager = order
            .querySelectorAll("div")[0]
            .textContent.trim();
          let is_need_seal = td[4].querySelectorAll("input[type='text']")[2];
          let seal_number = 0;
          let seal_params;
          let base_quantity_div = td[2].querySelectorAll("div")[4];
          let base_quantity = 0;

          if (is_need_seal && is_need_seal.id.includes("warranty")) {
            seal_number = is_need_seal.value;
            seal_params = get.params_for_seal(
              is_need_seal.getAttribute("onkeyup")
            );
          }
          if (base_quantity_div != undefined && base_quantity_div !== null) {
            base_quantity = Number(base_quantity_div.textContent.trim());
          }

          rowData.imgSrc = td[1].querySelector("img").src;
          Array.from(td[2].children).forEach((child) => {
            child.textContent = "";
          });
          rowData.order_id = data.id;
          rowData.seal_params = seal_params;
          rowData.is_need_seal = is_need_seal;
          rowData.seal_number = seal_number;
          rowData.order_manager = order_manager;
          rowData.base_quantity = base_quantity;
          rowData.positionName = td[2].textContent.trim();
          rowData.articleAndPlace = get.articleAndPlacement(
            td[3].textContent.trim()
          );
          rowData.quantity = quantity.trim();
          rowData.price = td[5].textContent.trim();

          this.storage.push(rowData);
        }
      });
      comment_wrapper.forEach((comment) => {
        let comment_data = {};
        let comment_divs = comment.querySelectorAll("div");
        if (comment_divs.length < 3) return;
        comment_data.whom = comment_divs[0]?.textContent?.trim() || false;
        comment_data.time = comment_divs[1]?.textContent?.trim() || false;
        comment_data.type =
          comment_divs[4]?.querySelector("option")?.textContent?.trim() ||
          false;
        comment_data.comment = comment_divs[3]?.textContent?.trim() || false;
        comment_list.push(comment_data);
      });
      this.storage.push(comment_list);
      console.log(this.storage);
      return this.storage;
    },
    production: async function () {
      this.storage = [];
      const production = await this.fetch({
        url: url.production,
        method: "POST",
      });
      let table = production.querySelector("table tbody");

      let rows = Array.from(table.children);
      rows.shift();

      rows.forEach((item, index) => {
        let rowData = {};
        let table = item.querySelector("table");
        if (table) {
          let th = Array.from(rows[index - 1].querySelectorAll("td"));
          let td = Array.from(rows[index].querySelectorAll("td"));
          let componentRows = Array.from(td[1].querySelectorAll("table tr"));

          let can_producted_count = componentRows[componentRows.length - 2]
            .querySelectorAll("td")[3]
            .textContent.trim();
          componentRows.shift();
          componentRows.pop();
          componentRows.pop();
          rowData.id = th[1].textContent;
          rowData.name = th[2].textContent;
          rowData.place =
            data_base.data.addresses[th[3].textContent]?.place ??
            "Ще не збережено";
          rowData.cell =
            data_base.data.addresses[th[3].textContent]?.cell ??
            "Ще не збережено";
          rowData.article = th[3].textContent;
          rowData.img = td[0].querySelector("img").src;
          rowData.can_product = can_producted_count;
          rowData.components = componentRows.map((item) => {
            let obj = {};
            let componentData = Array.from(item.querySelectorAll("td"));
            componentData.shift();
            obj.name = componentData[0].textContent.trim();
            obj.place =
              data_base.data.addresses[componentData[1].textContent.trim()]
                ?.place ?? "Ще не збережено";
            obj.article = componentData[1].textContent.trim();
            obj.count = componentData[3].textContent.trim();
            obj.availability = componentData[5].textContent.trim();
            obj.enough = componentData[6].textContent.trim();

            return obj;
          });
          this.storage.push(rowData);
        }
      });
      return this.storage;
    },
    requestCount: async function () {
      let request = await this.fetch({
        url: url.API.baza,
        body: { login: loginData.login, pass: loginData.password },
        method: "POST",
      });

      if (request.error) {
        alert(request.error);
        this.logOut();
        return;
      }
      return request;
    },
    elaborations: async function (data) {
      let storage = [];
      const elaborations = await this.fetch({
        url: url.API.elaborations,
        method: "POST",
        body: {
          login: loginData.login,
          pass: loginData.password,
        },
      });

      if (
        elaborations.total_elaborations > 0 &&
        elaborations.elaborations.length > 0
      ) {
        for (const elaboration of elaborations.elaborations) {
          const item = {};
          const searchReq = await load.fetch({
            url: url.API.search,
            method: "POST",
            body: {
              login: loginData.login,
              pass: loginData.password,
              search: elaboration.goods_id,
              search_sel: 4,
            },
          });

          const reservReq = await load.fetch({
            url: url.API.reserve,
            method: "POST",
            body: {
              login: loginData.login,
              pass: loginData.password,
              id: elaboration.goods_id,
            },
          });
          item.elaborationId = elaboration.elaboration_id;
          item.goodId = elaboration.goods_id;
          item.order = {
            id: elaboration.orders_id,
            number: elaboration.orders_name,
          };
          item.manager = elaboration.question_baza_login_name;
          item.positionName = elaboration.goods_name;
          item.time = elaboration.question_elaboration_time_text;
          item.place = elaboration.goods_adress;
          item.type = elaboration.question_text;
          item.article = elaboration.goods_cod;
          item.count = {
            baseCount: elaboration.goods_quantyty,
            orderCount: elaboration.basket_quant,
            reservedCount: reservReq.total_quantity || 0,
          };
          item.imageSm = searchReq.goods[0].picture_src;
          item.imageLg = searchReq.goods[0].large_picture_src;

          storage.push(item);
        }
      }

      return storage;
    },

    questions: async function (data) {
      this.storage = [];
      const questions = await this.fetch({
        url: url.getQuestion,
        method: "POST",
      });
      let tr = Array.from(questions.querySelectorAll("table tr"));
      tr.shift();
      if (tr.length > 0) {
        tr.forEach((row) => {
          let data = {};
          let item = row.querySelectorAll("td");

          try {
            data.goodsDesc = item[0].textContent.trim();
            data.questionManager = item[1].getAttribute("title").trim();
            data.question = item[1].textContent.trim();

            let inputElement = item[2].querySelector("input[type='text']");
            if (inputElement) {
              data.id = inputElement.id.match(/(\d+)/)[1];
            } else {
              throw new Error("Елемент input[type='text'] не знайдено");
            }

            data.questionOrder = item[3].textContent.trim();
            this.storage.push(data);
          } catch (error) {
            console.error("Помилка обробки рядка:", error.message);
            data_base.data.settings.error = {
              err_tyte: "load eroor",
              err_desc: error.message,
            };
            generate.preloader({
              status: "end",
            });

            return;
          }
        });
      }
      return this.storage;
    },
    get_stilages: async function () {
      let places = {};
      let count = 0;
      let areas = {};
      let load_stilages_id = await this.fetch({
        url: url.stilages,
        method: "POST",
      });
      let id_tr = Array.from(load_stilages_id.querySelectorAll("table tr"));
      id_tr.shift();
      let places_id = [];
      let stilages_data;

      id_tr.forEach((item) => {
        let area = item.querySelectorAll("td")[1].textContent;
        areas[area] = {};
        places_id.push(item.querySelector("td").textContent);
      });
      if (places_id.length === 0) {
        return;
      }
      stilages_data = await Promise.all(
        places_id.map(async (item) => {
          let stilages = await this.fetch({
            url: url.stilagesZones,
            method: "POST",
            body: { zone: item },
          });
          let rows = Array.from(stilages.querySelectorAll("table tbody tr"));
          rows.shift();
          let stilage = rows.map((item) => {
            let td = Array.from(item.querySelectorAll("td"));
            return {
              id: td[0].textContent,
              number: td[1].textContent,
              zone: td[3].textContent,
            };
          });
          return stilage;
        })
      );

      await Promise.all(
        stilages_data.flat().map(async (stilage_item) => {
          let cells = [];
          let stilage = await this.fetch({
            url: url.stilage,
            method: "POST",
            body: { id: stilage_item.id },
          });
          let stilage_rows = Array.from(
            stilage.querySelectorAll("table tbody tr")
          );
          let zoneKey = stilage_item.zone;
          let stilageItem = stilage_item.number;
          areas[zoneKey][stilageItem] = {};
          stilage_rows.forEach((place_item) => {
            let td = Array.from(place_item.querySelectorAll("td"));
            td.forEach((item) => {
              cells.push(item);
            });
          });

          cells.forEach((data) => {
            if (data.textContent.trim().includes(".")) {
              let cell_name = data.textContent.trim();
              let str = data.getAttribute("title") || null;
              let articles;
              let place = `${zoneKey} - ${stilageItem}.${cell_name}`.trim();
              if (str !== null) {
                articles = str.match(new RegExp(regExp.article, "gim"));
              }
              places[place] = articles;
            }
          });
        })
      );
      console.log(places);
      for (key in places) {
        console.log(key, places[key]);
        if (count === Object.keys(places).length - 1) {
          count = 0;

          alert("Завершено");
        } else {
          count++;
          if (places[key] == undefined) {
            continue;
          }
          places[key].forEach((item) => {
            let article = item.trim();
            if (article == undefined) {
              return;
            }
            if (data_base.data.addresses[article] == undefined) {
              data_base.data.addresses[article] = {
                article: article,
                id: "",
                place: "",
                cell_capacity: 0,
                cell: "",
                real_goods_count: 0,
                last_goods_count: 0,
                save_area_count: 0,
              };
            }
            if (
              data_base.data.addresses[article]?.place?.includes(key) ??
              false
            ) {
              return;
            }
            data_base.data.addresses[article].place += `${key} | `;
            data_base.save_data({
              store_name: "addresses",
              index_name: "article",
              request: data_base.data.addresses[article],
            });
          });
        }
      }

      return areas;
    },
    get_goods_count: async function () {
      let preloader_indicator = get.elements({
        el: "div",
        className: "checking-indicator",
        children: [
          {
            el: "p",
            className: "indecator-desc",
            text: "Триває Перевірка замовлень",
          },
          {
            el: "img",
            src: get.url(src.ico.spiner),
          },
        ],
      });
      let stored_data = data_base.data;
      console.log(stored_data.addresses);
      if (Object.keys(stored_data.addresses).length == 0) {
        alert("Адреса товару ще не збережені!!!");
        return;
      }
      contentWraper.appendChild(preloader_indicator);
      let orders = await load.fetch({
        url: url.orders,
        method: "POST",
        body: { status: 4 },
      });
      console.log(orders);

      let tr = Array.from(orders.querySelectorAll("table tbody tr"));
      tr.shift();
      tr.forEach((item) => {
        let td = Array.from(item.querySelectorAll("td"));
        if (td.length < 5) {
          return;
        }
        if (
          td[0].style.backgroundColor == "#fcf304" ||
          (td[0].style.backgroundColor == "#rgb(252, 243, 4)" &&
            td[3].style.backgroundColor == "#fcf304") ||
          (td[3].style.backgroundColor == "rgb(252, 243, 4)" &&
            td[2].textContent == "****** (***** *****)") ||
          (td[3].textContent === "чекає відправки" &&
            td[2].textContent !== "****** (***** *****)" &&
            td[4].textContent !== "******")
        ) {
          let order_id = td[0].textContent.trim();
          let order_number = td[1].textContent.trim();

          if (!stored_data.orders[order_id]) {
            stored_data.orders[order_id] = {
              id: order_id,
              is_new: true,
              order_date: get.date(),
              order_num: order_number,
            };
            data_base.save_data({
              store_name: "orders",
              index_name: "id",
              id: order_id,
              request: stored_data.orders[order_id],
            });
          }
        }
      });

      for (const order_id of Object.keys(stored_data.orders).reverse()) {
        if (stored_data.orders[order_id].is_new) {
          let response = await load.order({ id: order_id });

          response.forEach((item) => {
            try {
              if (item.questionsCount >= 0) {
                return;
              }
              let article = item.articleAndPlace?.article || false;
              if (!article) return;
              console.log(article, item);
              let storage_article = stored_data.addresses[article];
              let quantity = item.quantity.match(regExp.num)[0];
              if (
                storage_article == null ||
                storage_article == undefined ||
                storage_article.cell_capacity == 0 ||
                storage_article.cell_capacity == undefined
              ) {
                console.log(
                  `${article} комірку або ще не заповено або відбулася помилка`
                );
                return;
              }
              if (
                storage_article.save_area_count == undefined ||
                storage_article.save_area_count == null
              ) {
                storage_article.save_area_count = 0;
              }
              if (
                storage_article.save_area_count != undefined &&
                quantity >= storage_article?.cell_capacity
              ) {
                storage_article.save_area_count =
                  Number(storage_article.save_area_count) - Number(quantity);
              }
              storage_article.last_goods_count = item.base_quantity;
              if (storage_article.real_goods_count) {
                storage_article.real_goods_count =
                  Number(storage_article.real_goods_count) - Number(quantity);
                storage_article.save_area_count =
                  Number(storage_article.last_goods_count) -
                    Number(storage_article.real_goods_count) || 0;
              }
              if (storage_article.real_goods_count < 0) {
                storage_article.real_goods_count = 0;
              }
              if (storage_article.save_area_count < 0) {
                storage_article.save_area_count = 0;
              }
              data_base.save_data({
                store_name: "addresses",
                index_name: "article",
                article: article,
                request: storage_article,
              });
              console.log(stored_data.orders[order_id]);
              console.log(stored_data.orders[order_id].order_num);
              data_base.save_data({
                store_name: "history",
                index_name: "id",
                id: `${stored_data.orders[order_id].order_num}:/${article}`,
                request: {
                  id: `${stored_data.orders[order_id].order_num}:/${article}`,
                  article: article,
                  quantity: quantity,
                },
              });
            } catch (e) {
              console.warn(e);
              alert("Сталася помилка під час обробки замовленнь");
            }
          });
          stored_data.orders[order_id].is_new = false;
          data_base.save_data({
            store_name: "orders",
            index_name: "id",
            id: order_id,
            request: stored_data.orders[order_id],
          });

          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
      data_base.data.settings.last_check = get.date();
      data_base.data.settings.name = "last_check";
      preloader_indicator.remove();
      data_base.save_data({
        store_name: "settings",
        index_name: "name",
        name: "last_check",
        request: data_base.data.settings,
      });
    },
    deliverys_list: async function () {
      this.storage = [];
      let deliverys = await this.fetch({ url: url.prihod, method: "POST" });
      let divs_rows = Array.from(deliverys.querySelectorAll("div"));
      divs_rows.shift();
      divs_rows.forEach((item) => {
        if (
          item.style.float.includes("left") ||
          item.style.display == "none" ||
          Array.from(item.children).length == 0
        ) {
          return;
        }
        let data = {};
        data.delivery_id = item.children[0].textContent.trim();
        data.delivery_provider = item.children[3].textContent.trim();
        data.delivery_date = item.children[4].textContent.trim();

        if (item.children[1].style.backgroundColor == "rgb(155, 247, 253)") {
          data.status = "added";
        } else if (
          item.children[1].style.backgroundColor == "rgb(251, 248, 3)"
        ) {
          data.status = "processed";
        } else if (
          item.children[1].style.backgroundColor == "rgb(255, 169, 171)"
        ) {
          data.status = "not_added";
        }

        this.storage.push(data);
      });
      return this.storage;
    },
    delivery_item: async function (id) {
      this.storage = [];

      let delivery = await this.fetch({
        url: url.prihod_item,
        method: "POST",
        body: { id: id, search: "" },
      });
      let rows = Array.from(delivery.querySelectorAll("table tr"));
      rows.shift();
      rows.forEach((item) => {
        let data = {};
        let td = Array.from(item.querySelectorAll("td"));
        if (td.length < 14) {
          return;
        }

        data.id = regExp.id.exec(td[1].textContent)[1];
        data.desc = td[2].textContent;
        data.place = td[4].textContent;
        data.count = td[9].textContent;
        this.storage.push(data);
      });

      return this.storage;
    },
    deliveries_statistics: async function (data) {
      generate.preloader({ status: "start" });
      hendlers.database({
        action: "clear_store",
        store_name: "deliveries_list",
      });
      let articlesList = data;
      for (const art of articlesList) {
        generate.preloader({
          status: "update_status",
          desc: `Processing article: ${art}  ${
            articlesList.indexOf(art) + 1
          } / ${articlesList.length}`,
        });

        let averageAmount = 0,
          lastDeliveryDate,
          timeFromLastDelivery;

        let searchRes = await load.search({
          search: art,
          search_sell: 0,
        });

        searchRes = searchRes.filter((item) => item.article === art);

        if (searchRes.length === 0) {
          continue;
        }

        let deliveries = await load.deliveries({ id: searchRes[0].id });

        deliveries = deliveries.filter(
          (item) =>
            Number(item.count) > 0 && item.elaborationsCount === undefined
        );
        if (deliveries.length === 0) {
          continue;
        }
        deliveries.forEach((item) => (averageAmount += Number(item.count)));
        averageAmount /= deliveries.length;

        lastDeliveryDate = deliveries[0].date;
        timeFromLastDelivery = get.time_from_last_delivery(lastDeliveryDate);

        hendlers.database({
          action: "save_data",
          store_name: "deliveries_list",
          data: {
            article: art,
            id: searchRes[0].id,
            name: searchRes[0].head,
            count: searchRes[0].baseCount.baseCount,
            average_amount: averageAmount,
            time_from_last_delivery: timeFromLastDelivery,
            last_delivery_date: lastDeliveryDate,
            place: data_base.data.addresses[art].place,
            cell: data_base.data.addresses[art].cell,
            goods_type: searchRes[0].goods_type,
            checking_date: get.date(),
            years_frequency: get.years_frequency(deliveries),
          },
        });
      }
      generate.preloader({ status: "end" });
    },
    logOut: function () {
      document.cookie = "login=null";
      document.cookie = "hash=null";
      window.location.reload();
    },
  };

  // check elaborations count
  setInterval(() => {
    generate.requestCount();
  }, interval.elaboration);

  let buttons = {
    el: "div",
    className: "btn-wraper",
    children: [
      {
        el: "button",
        className: "elaboration-btn btn",
        event: "click",
        hendler: function () {
          generate.preloader({ status: "start" });
          let elaborations = load.elaborations();
          elaborations.then((data) => {
            generate.preloader({ status: "end" });
            contentWraper.appendChild(generate.elaborations(data));
          });
        },
        children: [
          {
            el: "span",
            className: "elabortion-count counter",
          },
          {
            el: "img",
            src: get.url(src.ico.elaboration),
            alt: "Наявні уточнення",
          },
        ],
      },
      {
        el: "button",
        className: "question-btn btn",
        event: "click",
        hendler: hendlers.questions,
        children: [
          {
            el: "span",
            className: "question-count counter",
          },
          {
            el: "img",
            src: get.url(src.ico.question),
            alt: "Наявні питання",
          },
        ],
      },
      {
        el: "button",
        className: "compare-btn btn",
        event: "click",
        hendler: hendlers.generateCompare,
        children: [
          {
            el: "span",
            className: "compare-count counter",
          },
          ,
          {
            el: "img",
            src: get.url(src.ico.compare),
            alt: "Розбіжності товару",
          },
        ],
      },
      {
        el: "button",
        className: "list-btn btn",
        event: "click",
        hendler: hendlers.generateList,
        children: [
          {
            el: "span",
            className: "list-count counter",
          },
          {
            el: "img",
            src: get.url(src.ico.list),
            alt: "Список на рознесення товару",
          },
        ],
      },
      {
        el: "button",
        className: "orders-btn btn",
        event: "click",
        hendler: function () {
          generate.preloader({ status: "start" });
          let orders = load.orders();
          orders.then((data) => {
            generate.preloader({ status: "end" });
            let mainWraper = document.querySelector(".wraper");
            mainWraper.innerHTML = "";
            mainWraper.appendChild(generate.orders(data));
          });
        },
        children: [{ el: "img", src: get.url(src.ico.orders) }],
      },
      {
        el: "button",
        className: "production-btn btn",
        event: "click",
        hendler: hendlers.production,
        children: [
          {
            el: "span",
            className: "production-count counter",
          },
          {
            el: "img",
            src: get.url(src.ico.production),
            alt: "Виробництво",
          },
        ],
      },
      {
        el: "button",
        className: "history-btn btn",
        event: "click",
        hendler: generate.history,
        children: [
          {
            el: "img",
            src: get.url(src.ico.history),
            alt: "Історія",
          },
        ],
      },
      {
        el: "button",
        className: "log-out-btn btn",
        event: "click",
        hendler: load.logOut,
        children: [
          {
            el: "img",
            src: get.url(src.ico.logout),
            alt: "Вийти з Акаунта",
          },
        ],
      },
    ],
  };
  function check_last_check() {
    let last_check_time = data_base.data.settings.last_check?.last_check;
    let orders_storage = data_base.data.orders;
    if (last_check_time == undefined) {
      data_base.data.settings.last_check = {
        year: 0,
        month: 0,
        day: 0,
        hours: 0,
        minutes: 0,
      };
      last_check_time = data_base.data.settings.last_check;

      data_base.save_data({
        store_name: "settings",
        index_name: "name",
        request: {
          name: "last_check",
          last_check_time: data_base.data.settings.last_check,
        },
      });
    }
    let current_date = get.date();
    if (
      orders_storage !== undefined &&
      Object.keys(orders_storage).length !== 0
    ) {
      Object.keys(orders_storage).forEach((item) => {
        if (orders_storage[item].order_date.day !== current_date.day) {
          delete orders_storage[item];
          data_base.delete_item({
            store_name: "orders",
            index_name: "id",
            request: item,
          });
        }
      });
    }

    if (last_check_time) {
      let hours_difference = current_date.hours - last_check_time.hours;
      let minutes_difference = current_date.minutes - last_check_time.minutes;

      let time_difference =
        (hours_difference * 60 + minutes_difference + 1440) % 1440;

      if (time_difference > 30) {
        let check_wrapper = get.elements({
          el: "div",
          className: "check_wrapper hide_check_wrapper",
          children: [
            {
              el: "span",
              className: "close_btn",
              text: "X",
              event: "click",
              hendler: function () {
                this.parentElement.remove();
              },
            },
            {
              el: "p",
              className: "check_text",
              text: "Пройшло більше  30хв. від останньої перевірки. Може подивимося шо там по коміркам?",
            },
            {
              el: "button",
              className: "btn check_bnt",
              text: "Давай подивимося",
              event: "click",
              hendler: function () {
                check_wrapper.classList.add("hide_check_wrapper");
                hendlers.find_empty_cells();
              },
            },
          ],
        });
        btnWraper.appendChild(check_wrapper);
        check_wrapper.classList.remove("hide_check_wrapper");
      }
    }
  }
  function distributeArticleItems() {
    function create_new_sticker(sticker, items) {
      let new_sticker = document.createElement("div");
      new_sticker.className = "sticker";
      let list_wrapper = document.createElement("ul");
      new_sticker.appendChild(list_wrapper);
      new_sticker.addEventListener("click", hendlers.handleElementEdit);
      list_wrapper.addEventListener("click", hendlers.handleElementEdit);

      let new_sticker_height = sticker.offsetHeight;
      let main_inserted_items_height = 0;
      let remaining_items = [];

      items.forEach(function (item) {
        let item_height = item.offsetHeight;
        if (main_inserted_items_height + item_height <= new_sticker_height) {
          list_wrapper.appendChild(item); // Додаємо елемент в новий стікер
          main_inserted_items_height += item_height;
        } else {
          remaining_items.push(item); // Якщо елемент не вміщується, додаємо до залишкових
        }
      });

      sticker.parentNode.insertBefore(new_sticker, sticker.nextElementSibling);

      if (remaining_items.length > 0) {
        create_new_sticker(new_sticker, remaining_items); // Рекурсія для залишкових елементів
      }
    }

    const stickers = Array.from(document.querySelectorAll(".sticker"));

    stickers.forEach(function (sticker) {
      let sticker_height = sticker.offsetHeight - 10;
      let items = Array.from(sticker.querySelectorAll("li.article_item"));
      let items_total_height = 0;
      let overflown_items = [];

      items.forEach(function (item) {
        let item_height = item.offsetHeight;
        items_total_height += item_height + 1;
        if (items_total_height > sticker_height) {
          overflown_items.push(item);
          item.remove(); // Видаляємо з поточного стікера
        }
      });

      if (overflown_items.length > 0) {
        create_new_sticker(sticker, overflown_items); // Створюємо новий стікер з переповненими елементами
      }

      // Перевірка на наявність елементів у поточному стікері
      if (!sticker.querySelector(".goods_list")) {
        let current_items = Array.from(sticker.querySelectorAll("li"));
        let prev_sticker = sticker.previousElementSibling;

        if (prev_sticker) {
          let prev_sticker_items = Array.from(
            prev_sticker.querySelectorAll("li")
          );
          let prev_sticker_items_total_height = 0;

          prev_sticker_items.forEach(function (prev_item) {
            let prev_item_height = prev_item.offsetHeight;
            prev_sticker_items_total_height += prev_item_height;
          });

          current_items.forEach(function (item) {
            let item_height = item.offsetHeight;
            if (
              prev_sticker_items_total_height + item_height <=
              sticker_height
            ) {
              prev_sticker.querySelector("ul").appendChild(item);
              prev_sticker_items_total_height += item_height;
            }
          });

          // Видаляємо порожній стікер
          if (!sticker.querySelector("li")) {
            sticker.remove();
          }
        }
      }
    });
  }

  // Відстежуємо зміну розміру для кожного елемента .sticker
  function observeStickers() {
    const stickers = document.querySelectorAll(".sticker");
    const resizeObserver = new ResizeObserver(() => {
      distributeArticleItems(); // Перерозподіл елементів при зміні розміру
    });

    stickers.forEach((sticker) => {
      resizeObserver.observe(sticker);
    });
  }

  let btnWraper = get.elements(buttons);
  document.body.appendChild(searchWraper);
  document.body.appendChild(contentWraper);
  document.body.appendChild(btnWraper);
  generate.requestCount();
  generate.tasksCount();
  check_last_check();
  console.log(data_base.data);
}
