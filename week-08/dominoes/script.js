
function createDominoFace(value) {
    const face = document.createElement("div");
    face.classList.add("domino-face");

    const topHalf = document.createElement("div");
    topHalf.classList.add("top-half");
    face.appendChild(topHalf);
}