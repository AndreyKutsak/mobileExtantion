save_data: function (req) {
  console.log(req.request);
  const transaction = data_base.db.transaction([req.store_name], "readwrite");
  const store = transaction.objectStore(req.store_name);

  const getRequest = store.get(req.request.article || req.request.id);
  getRequest.onsuccess = function (event) {
    const existingRecord = event.target.result;
    if (existingRecord) {
      const deleteRequest = store.delete(req.request.article || req.request.id);
      deleteRequest.onerror = function (event) {
        console.log("Error updating data:", event.target.error);
      };
      deleteRequest.onsuccess = function (event) {
        const writeRequest = store.put(req.request);
        writeRequest.onerror = function (event) {
          console.log("Error updating data:", event.target.error);
        };
        writeRequest.onsuccess = function (event) {
          console.log("Data updated successfully:", event.target.result);
        };
      };
    } else {
      const addRequest = store.add(req.request);
      addRequest.onerror = function (event) {
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