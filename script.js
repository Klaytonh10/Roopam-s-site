const videos = document.querySelectorAll(".tiktok-container");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const LEFT = "left";
const RIGHT = "right";

let currentIndex = 0;
let isAnimating = false;

function loadVideo(video) {
  const iframe = video.querySelector("iframe");
  if (!iframe.hasAttribute("src")) {
    iframe.src = iframe.dataset.src;
  }
}

function pauseVideo(video) {
  const iframe = video.querySelector("iframe");
  if (iframe.contentWindow && iframe.hasAttribute("src")) {
    iframe.contentWindow.postMessage(
      { type: "pause", value: null, "x-tiktok-player": true },
      "https://www.tiktok.com",
    );
  }
}

function showVideo(index, direction) {
  if (isAnimating) {
    return;
  }

  const outgoingVideo = videos[currentIndex];
  const nextIndex = (index + videos.length) % videos.length;
  const incomingVideo = videos[nextIndex];

  pauseVideo(outgoingVideo);
  loadVideo(incomingVideo);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    outgoingVideo.classList.remove("active", "exit-left", "exit-right");
    incomingVideo.classList.add("active");
    currentIndex = nextIndex;
    return;
  }

  isAnimating = true;
  const exitClass = direction === RIGHT ? "exit-right" : "exit-left";
  const enterClass =
    direction === RIGHT ? "enter-from-left" : "enter-from-right";
  let transitionsRemaining = 2;
  const transitionListeners = [];
  let transitionTimeout;

  function finishTransition(video, className) {
    function onTransitionEnd(event) {
      if (event.target !== video || event.propertyName !== "transform") {
        return;
      }

      transitionsRemaining -= 1;
      if (transitionsRemaining === 0) {
        finishAnimation();
      }
    }

    video.addEventListener("transitionend", onTransitionEnd);
    transitionListeners.push([video, onTransitionEnd]);
  }

  function finishAnimation() {
    window.clearTimeout(transitionTimeout);
    transitionListeners.forEach(([video, onTransitionEnd]) => {
      video.removeEventListener("transitionend", onTransitionEnd);
    });
    outgoingVideo.classList.remove(exitClass);
    incomingVideo.classList.remove(enterClass);
    isAnimating = false;
  }

  finishTransition(outgoingVideo, exitClass);
  finishTransition(incomingVideo, enterClass);

  outgoingVideo.classList.remove("active");
  outgoingVideo.classList.add(exitClass);

  incomingVideo.classList.remove("exit-left", "exit-right");
  incomingVideo.classList.add(enterClass);
  void incomingVideo.offsetWidth;
  incomingVideo.classList.add("active");
  currentIndex = nextIndex;
  transitionTimeout = window.setTimeout(finishAnimation, 700);
}

nextBtn.addEventListener("click", () => {
  showVideo(currentIndex + 1, RIGHT);
});

prevBtn.addEventListener("click", () => {
  showVideo(currentIndex - 1, LEFT);
});
