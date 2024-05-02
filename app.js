const str =
  "Піддон (каплезбірник) для кавоварки Philips Saeco 0312.029.380 17.207.0001";
const reg = /\s([0-9]{1,}\.[0-9]{4,}) $/g;
console.log(str.match(new RegExp(reg)));
