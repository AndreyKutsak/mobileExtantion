
const regExp = {
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

export default regExp;