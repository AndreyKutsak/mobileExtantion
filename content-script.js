let head = document.querySelector("head");
let meta = document.createElement("meta");
meta.name = "viewport";
meta.setAttribute("content", `width=device-width, initial-scale=1.0`);
head.appendChild(meta);
let loginInp = document.querySelector("#loginB1");

if (loginInp === null) {
    console.log("auth")
    let parser = new DOMParser();
    let select = document.querySelector(".search .select2-selection");
    let searchInp = document.querySelector("#search");
    let searchInpBtn = document.querySelector(".search input[type='button']");
    let div = Array.from(document.querySelectorAll("div")) || [0];
    let btnsWraper = document.querySelector(".buttons");
    let selectButtons = Array.from(document.querySelectorAll('.buttons input[type="button"]')) || [0];
    let buttonsToggler = document.createElement("button");
    let tableWraper = document.querySelector("#mainDiv");
    let elaborationURL = "https://baza.m-p.in.ua/ajax/loadElaboration.php";
    let orderURL = ""
    let newTableWraper = document.createElement("div");
    newTableWraper.className = "new-table-wraper";
    let elaborationLink = null;
    buttonsToggler.textContent = "Опції";
    buttonsToggler.className = "buttons-toggler";
    btnsWraper.prepend(buttonsToggler);
    document.body.appendChild(newTableWraper);
    tableWraper.style.display = "none";
    // set select width
    select.style.width = "100%";
    // set styles for search input
    searchInp.style.padding = "10px";
    searchInp.style.fontsize = "18px";
    searchInp.style.fontWeight = "600";
    // set styles search input button
    searchInpBtn.style.width = "20%";
    searchInpBtn.style.padding = "10px";
    // remove padding and set width 100%
    btnsWraper.parentNode.style.paddingLeft = "0px";
    btnsWraper.parentNode.style.width = "100%";
    // set top margin for buttons wraper
    btnsWraper.style.marginTop = "70px";
    btnsWraper.classList.add("hide-buttons");

    // remove blue div
    div.forEach((el) => {
        if (el.textContent.includes("Склад (Василенка)") && el.style.borderRadius == "5px") {
            el.style.display = "none";
        }
    })
    buttonsToggler.addEventListener('click', () => {
        btnsWraper.classList.toggle("hide-buttons");
    });


    let parseGetedHTML = (data) => {
        let doc = parser.parseFromString(data, 'text/html');
        return doc;
    }
    // elaboration


    let loadElaboration = () => {
        console.log("load elaboration was started")
        let elaborationData, data = {};
        fetch(elaborationURL, {
            method: "POST",
        }).then((responce) => {
            return responce.text();
        }).then((responce) => {
            elaborationData = responce;
            elaborationData = parseGetedHTML(elaborationData);
            let tr = Array.from(elaborationData.querySelectorAll("table>tbody>tr"));
            tr.forEach((el, key) => {
                data[key] = [];
                if (key >= 0) {
                    let td = Array.from(el.querySelectorAll("td"));
                    for (let iterator of td) {
                        data[key].push(iterator.textContent)
                        console.log(data);

                    }
                }
                generateTable(data)
            });
            return false;
        }).catch((err) => {
            alert("Не вдалось отримати уточняк!!");
            console.log(err);
        })
        let generateTable = (data) => {
            console.log(data)
            data.forEach((text) => {
                let table = document.createElement("div");
                table.className = "table";
                let tableHead = `<div class="table-head">
        <div>
            <p class="table-head-desc">Номер Замовлення</p>
        </div>
        <div>
            <p class="table-head-desc">Менеджер</p>
        </div>
        <div>
            <p class="table-head-desc">Товар</p>
        </div>
        <div>
            <p class="table-head-desc">Адрес товару</p>
        </div>
        <div>
            <p class="table-head-desc">Відповідь</p>
        </div>
        <div>
            <p class="table-head-desc">Резерв</p>
        </div>
        <div>
            <p class="table-head-desc">Фото товару</p>
        </div>
    </div>`
                let tableBody = document.createElement("div");
                tableBody.className = "table-head";
                let tableOrderNumber = document.createElement("div");
                tableOrderNumber.className = "order-number";
                tableOrderNumber.textContent = data.orderNumber;
                let tabbleOrderManager = document.createElement("div");
                tabbleOrderManager.className = "order-manager";
                tabbleOrderManager.textContent = data.orderManager
                let tableOredrPositionName = document.createElement("div");
                tableOredrPositionName.className = "order-position-name";
                tableOredrPositionName.textContent = data.positionName;
                let tablePositionPlace = document.createElement("div");
                tablePositionPlace.className = "position-place";
                tablePositionPlace.textContent = data.positionPlace;
                let tableOrderPositionQuality = document.createElement("div");
                tableOrderPositionQuality.className = "order-positon-quality";
                tableOrderPositionQuality.textContent = data.positionQuality;
                let tableReserveOrderQuality = document.createElement("div");
                tableReserveOrderQuality.className = "order-reserve-quality";
                tableReserveOrderQuality.textContent = data.reserveQuality;
                let tablePartImnages = document.createElement("div");
                tablePartImnages.className = "part-image-wraper";
                // generating table
                table.innerHTML = tableHead;
                tableBody.append(tableOrderNumber);
                tableBody.append(tabbleOrderManager);
                tableBody.append(tableOredrPositionName);
                tableBody.append(tablePositionPlace);
                tableBody.append(tableOrderPositionQuality);
                tableBody.append(tableReserveOrderQuality);
                tableBody.append(tablePartImnages);
                table.appendChild(tableBody);
                newTableWraper.appendChild(table);
            });
        }



    };
    loadElaboration()
    function search(search_sel, search, page) {
        if (typeof search == 'undefined')
            var search = $('#search').val();
        if (typeof search_sel == 'undefined') {
            var search_sel = $('#search_sel').val();
            var test = '0';
        }
        else var test = 1;

        if (page == 'undefined') var page = 0;

        if (search.length > 1 || test == 1) {
            $('#loader').show();
            $.post("https://baza.m-p.in.ua/ajax/search.php", { search: search, search_sel: search_sel, page: page }, function (data) {
                $('#mainDiv').html(data);
                $('#loader').hide();
                if (page > 0) $(window).scrollTop(200);
            });
        }
        else alert('Для пошуку потрібно мінімум 2 символи');
    }
    // Вибираємо елемент, який ми хочемо відстежувати
    const targetElement = document.getElementById("magaz");

    // Створюємо спостерігача за змінами
    const observer = new MutationObserver(function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList" || mutation.type === "attributes") {
                // Обробляємо зміни
                let children = Array.from(mutation.target.querySelectorAll("div"));
                children.forEach((el) => {
                    if (el.textContent.includes == "Уточнення") {
                        el.id = "elaborationLink";
                        elaborationLink.addEventListener("click", loadElaboration);
                    }
                })

            }
        }
    });

    // Починаємо відстежування змін
    observer.observe(targetElement, {
        attributes: true,           // Відстежувати зміни атрибутів
        childList: true,            // Відстежувати зміни в дочірніх елементах
        characterData: true,        // Відстежувати зміни текстового вмісту
        subtree: true               // Відстежувати зміни в піддереві
    });
    fetch("https://baza.m-p.in.ua/ajax/orders.php", {
        method: "post"
    }).then((res) => {
        return res.text(

        )
    }).then((res) => {
        let a = parseGetedHTML(res)
        console.log(a)
    })

}

