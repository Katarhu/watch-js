import Watch from "./Watch/Watch.js";

const container = document.querySelector("[data-container]");

const watch = new Watch();

watch
    .appendWatch(container)
    .setCurrentTime("15:00:00")
    .start();
