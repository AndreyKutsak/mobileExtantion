function () {
let str=Math.random();
    var totalSpace = (1024 * 1024 * 5);
    var usedSpace = 0;


    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var value = localStorage.getItem(key);
        usedSpace += (key.length + value.length) * 2;
    }

    var availableSpace = totalSpace - usedSpace;

    totalSpace = totalSpace / (1024 * 1024);
    usedSpace = usedSpace / (1024 * 1024);
    availableSpace = availableSpace / (1024 * 1024);


    return "Загальний обєм: " + totalSpace.toFixed(2) + " MB, Використано: " + usedSpace.toFixed(2) + " MB, Доступно: " + availableSpace.toFixed(2) + " MB";
}