console.log("My JavaScript file is connected!");

let title = document.getElementById("title");
let message = document.getElementById("message");
let button = document.getElementById("change-button");
let discovery = document.getElementById("discovery");

button.addEventListener("click", function() {
  title.textContent = "The Quiet Is Over";
  title.style.color = "#a51f27";
  message.textContent = "You noticed the page was waiting for you.";
  discovery.textContent = "Some stories only begin when you touch them.";
  discovery.hidden = false;
  document.body.style.backgroundColor = "#e5e5e5";
});