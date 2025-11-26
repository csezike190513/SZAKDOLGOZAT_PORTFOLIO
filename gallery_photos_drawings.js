/**
 * Egy galĂŠria pĂŠldĂĄny ĂĄllapota
 * - container: a DOM elem (div#justified-gallery-XXX)
 * - folderName: a static alatti mappa neve (XXX)
 * - images: betĂśltĂśtt kĂŠpadatok
 */
class JustifiedGallery {
  constructor(container) {
    this.container = container;
    this.id = container.id;
    this.folderName = this.id.replace(/^justified-gallery-/, ""); // pl. "fotok"
    this.images = [];
  }

  /**
   * KĂŠpek betĂśltĂŠse a megfelelĹ static mappĂĄbĂłl:
   * static/<folderName>/manifest.json
   * static/<folderName>/gallery/<fileName>
   *
   * A manifest.json egy string tĂśmb:
   * ["file1.jpg", "file2.jpg", ...]
   */
  async loadImages() {
    const basePath = `/static/${this.folderName}`;
    const manifestUrl = `${basePath}/manifest_gallery.json`;

    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        throw new Error(`Nem sikerĂźlt betĂślteni a manifestet: ${manifestUrl}`);
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
            reject(new Error(`Nem sikerĂźlt betĂślteni a kĂŠpet: ${fileName}`));
          img.src = `${basePath}/gallery/${fileName}`;
        });
      });

      this.images = await Promise.all(loadPromises);
      this.render();
    } catch (err) {
      console.error(
        `Hiba a(z) ${this.folderName} galĂŠria kĂŠpeinek betĂśltĂŠsekor:`,
        err
      );
    }
  }

  /**
   * Justified layout szĂĄmĂ­tĂĄsa egy adott kĂŠptĂśmbre.
   */
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
        // UtolsĂł sor: ha tĂşl "gyenge", nem hĂşzzuk teljesen ki
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

  /**
   * GalĂŠria kirajzolĂĄsa az aktuĂĄlis kĂŠpekbĹl.
   */
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

// Az Ăśsszes galĂŠria pĂŠldĂĄny listĂĄja (ha tĂśbb is van az oldalon)
const galleries = [];

// InicializĂĄlĂĄs: keressĂźk az Ăśsszes olyan elemet, aminek az id-ja justified-gallery-vel kezdĹdik
document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll("[id^='justified-gallery-']");

  containers.forEach((container) => {
    const gallery = new JustifiedGallery(container);
    galleries.push(gallery);
    gallery.loadImages();
  });
});

// Resize: minden galĂŠriĂĄt ĂşjrarenderelĂźnk (debounce)
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
