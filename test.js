const text = `
всього: 1(1) шт.
резерв: 0(0) компл.
Роздріб: 232 грн.
Майстри: 204 грн.
Заказано: 50
Заказано (Ирбис ТД ТОВ): 50
`;
let regexGoodsCount =
	/всього:\s*(\d+)\(.*?\)\s*(м\/п|компл\.|шт\.)|резерв:\s*(\d+)\(.*?\)\s*(м\/п|компл\.|шт\.)/g;

// Вираз для вилучення чисел після "всього:", "резерв:" з урахуванням можливих "м/п" та "компл."
	function getGoodsCount(text) {
		const matches = {};
		let match;

		while ((match = regexGoodsCount.exec(text)) !== null) {
			if (match[1] !== undefined) {
				matches["baseCount"] = parseInt(match[1]);
			} else if (match[3] !== undefined) {
				matches["reserveCount"] = parseInt(match[3]);
			}
		}
		return matches;
	}

console.log(getGoodsCount(text));