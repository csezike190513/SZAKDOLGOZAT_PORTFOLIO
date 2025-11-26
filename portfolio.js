const photosBtn = document.getElementById("photosBtn");
const photosBtnnav = document.getElementById("photosnav");
const drawingsBtn = document.getElementById("drawingsBtn");
const drawingsBtnnav = document.getElementById("drawingsnav");
const drawingbtn = document.getElementById("drawingbutton");
const photobtn = document.getElementById("photosbutton");

const photos = document.getElementById("photos");
const drawings = document.getElementById("drawing");

// Default: photos visible
photosBtn.addEventListener("click", () => {
  photosBtn.classList.add("active");
  drawingsBtn.classList.remove("active");

  photos.classList.remove("hidden");
  drawings.classList.add("hidden");
  photobtn.classList.remove("hidden");
  drawingbtn.classList.add("hidden");
  galleries.forEach((gallery) => gallery.render());
});

photosBtnnav.addEventListener("click", () => {
  photosBtn.classList.add("active");
  drawingsBtn.classList.remove("active");

  photos.classList.remove("hidden");
  drawings.classList.add("hidden");
  photobtn.classList.remove("hidden");
  drawingbtn.classList.add("hidden");
  galleries.forEach((gallery) => gallery.render());
});

drawingsBtn.addEventListener("click", () => {
  drawingsBtn.classList.add("active");
  photosBtn.classList.remove("active");

  drawings.classList.remove("hidden");
  photos.classList.add("hidden");
  photobtn.classList.add("hidden");
  drawingbtn.classList.remove("hidden");
  galleries.forEach((gallery) => gallery.render());
});

drawingsBtnnav.addEventListener("click", () => {
  drawingsBtn.classList.add("active");
  photosBtn.classList.remove("active");

  drawings.classList.remove("hidden");
  photos.classList.add("hidden");
  photobtn.classList.add("hidden");
  drawingbtn.classList.remove("hidden");
  galleries.forEach((gallery) => gallery.render());
});
