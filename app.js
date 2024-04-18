let store = storage.data.addresses;
let categorys = {};
let places = {};

Object.keys(store).forEach((key) => {
    const category = key.split('.');
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
contentWraper.appendChild(get.elements({
    el: "div",
    className: "delivery-wraper",
    children: [
        {
            el: "div",
            className: "categorys_wrapper",
            children: [
                {
                    el: "form",
                    children: [
                        {
                            el: "p",
                            className: "title",
                            text: "Обери категорію"
                        },
                        {
                            el: "select",
                            event: "change",
                            handler: function () {
                                const value = this.value;
                                const categoryWrapper = this.parentElement.querySelector(".category_wrapper");
                                categoryWrapper.innerHTML = "";

                                if (categorys[value]) {
                                    const subcategories = Object.keys(categorys[value]);
                                    if (subcategories.length > 0) {
                                        const subcategorySelect = get.elements({
                                            el: "select",
                                            event: "change",
                                            handler: function () {
                                                const subValue = this.value;
                                                const placesWrapper = this.parentElement.querySelector(".places_wrapper");
                                                placesWrapper.innerHTML = "";

                                                if (places[value] && places[value][subValue]) {
                                                    placesWrapper.appendChild(get.elements({
                                                        el: "div",
                                                        className: "places_wrapper",
                                                        children: places[value][subValue].map((item) => ({
                                                            el: "option",
                                                            text: item
                                                        }))
                                                    }));
                                                }
                                            },
                                            children: subcategories.map((item) => ({
                                                el: "option",
                                                text: item
                                            }))
                                        });
                                        categoryWrapper.appendChild(get.elements({
                                            el: "div",
                                            className: "category_wrapper",
                                            children: [
                                                {
                                                    el: "p",
                                                    className: "title",
                                                    text: "Оберіть підкатегорію"
                                                },
                                                subcategorySelect
                                            ]
                                        }));
                                    }
                                }
                            },
                            children: Object.keys(categorys).map((item) => ({
                                el: "option",
                                text: item
                            }))
                        }
                    ]
                }
            ]
        }
    ]
}));
