let random_order_num = 15000;
let input = {}
let testValues = [
  { value: "25000", expected: true },
  { value: "05000", expected: false },
  { value: "15000.5", expected: false },
  { value: "25000.5", expected: false },
  { value: "35000", expected: false },
  { value: "10000", expected: true },
  { value: "abc", expected: false }
];

testValues.forEach(test => {
  input.value = test.value;
  let is_order_number =
    input.value[0] !== "0" &&
    !input.value.includes(".") &&
    !isNaN(Number(input.value)) &&
    (Number(input.value) >= random_order_num - 10000 && Number(input.value) <= random_order_num + 10000);

  console.log(`Value: ${test.value}, Result: ${is_order_number}, Expected: ${test.expected}`);
});
