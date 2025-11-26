class JustifiedGallery {
  constructor(container) {
    this.container = container;
    this.id = container.id;
    this.folderName = this.id.replace(/^justified-gallery-/, ""); // pl. "fotok"
    this.images = [];
  }

  async loadImages() {
    const basePath = `/static/${this.folderName}`;
    const manifestUrl = `${basePath}/manifest.json`;

    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        throw new Error(`Nem sikerült betölteni a manifestet: ${manifestUrl}`);
      }

      /** @type {string[]} */
      const fileNames = await response.json();

      const loadPromises = fileNames.map((fileName) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              src: `${basePath}/gallery/${fileName}`,
              width: img.naturalWidth,
              height: img.naturalHeight,
              alt: fileName,
            });
          };
          img.onerror = () =>
            reject(new Error(`Nem sikerült betölteni a képet: ${fileName}`));
          img.src = `${basePath}/gallery/${fileName}`;
        });
      });

      this.images = await Promise.all(loadPromises);
      this.render();
    } catch (err) {
      console.error(
        `Hiba a(z) ${this.folderName} galéria képeinek betöltésekor:`,
        err
      );
    }
  }

  computeRows(containerWidth, targetRowHeight, gap) {
    const rows = [];
    let currentRow = [];
    let aspectRatioSum = 0;

    const maxWidth = containerWidth;

    this.images.forEach((img, index) => {
      const ar = img.width / img.height;
      currentRow.push({ ...img, ar });
      aspectRatioSum += ar;

      const gapsWidth = gap * (currentRow.length - 1);
      const rowWidthAtTarget = targetRowHeight * aspectRatioSum + gapsWidth;

      const isLastImage = index === this.images.length - 1;

      if (rowWidthAtTarget >= maxWidth || isLastImage) {
        let rowHeight = targetRowHeight;
        if (!isLastImage || rowWidthAtTarget >= maxWidth * 0.75) {
          const scale =
            (maxWidth - gapsWidth) / (targetRowHeight * aspectRatioSum);
          rowHeight = targetRowHeight * scale;
        }

        const row = currentRow.map((item) => {
          const width = rowHeight * item.ar;
          return {
            ...item,
            displayWidth: width,
            displayHeight: rowHeight,
          };
        });

        rows.push(row);
        currentRow = [];
        aspectRatioSum = 0;
      }
    });

    return rows;
  }

  render() {
    if (!this.container || this.images.length === 0) return;

    this.container.innerHTML = "";

    const containerWidth = this.container.clientWidth;
    if (containerWidth <= 0) return;

    let targetRowHeight = 260;
    if (window.innerWidth < 600) {
      targetRowHeight = 190;
    } else if (window.innerWidth < 900) {
      targetRowHeight = 220;
    }

    const gap = 4;
    const rows = this.computeRows(containerWidth, targetRowHeight, gap);

    rows.forEach((row) => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "jg-row";

      row.forEach((img) => {
        const item = document.createElement("div");
        item.className = "jg-item";
        item.style.width = `${img.displayWidth}px`;
        item.style.height = `${img.displayHeight}px`;

        const image = document.createElement("img");
        image.src = img.src;
        image.alt = img.alt || "";

        item.appendChild(image);
        rowDiv.appendChild(item);
      });

      this.container.appendChild(rowDiv);
    });
  }
}

const galleries = [];

document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll("[id^='justified-gallery-']");

  containers.forEach((container) => {
    const gallery = new JustifiedGallery(container);
    galleries.push(gallery);
    gallery.loadImages();
  });
});

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    galleries.forEach((gallery) => {
      if (gallery.images.length > 0) {
        gallery.render();
      }
    });
  }, 150);
});

