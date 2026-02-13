const { writeFileSync } = require("fs");
const { createCanvas, loadImage } = require("canvas");

// Create a simple icon using SVG
const svgIcon = `<svg fill="#000000" height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
	 viewBox="0 0 512 512" xml:space="preserve">
<g>
	<g>
		<path d="M308.335,63.061c-35.26,0-63.949,28.749-63.949,64.06c0,35.319,28.689,64.06,63.949,64.06
			c35.26,0,63.957-28.74,63.957-64.06C372.292,91.81,343.595,63.061,308.335,63.061z M308.335,166.255
			c-21.53,0-39.049-17.545-39.049-39.125c0-21.581,17.519-39.125,39.049-39.125s39.049,17.545,39.049,39.125
			C347.383,148.71,329.865,166.255,308.335,166.255z"/>
	</g>
</g>
<g>
	<g>
		<path d="M398.097,37.231C374.11,13.218,342.229,0,308.335,0s-65.758,13.218-89.754,37.231
			c-49.468,49.57-49.468,130.21,0.034,179.806c1.067,1.05,86.127,86.11,86.127,86.11l3.593,3.584l3.593-3.584
			c0,0,85.077-85.06,86.17-86.135C447.565,167.433,447.565,86.801,398.097,37.231z M380.459,199.398
			c-0.469,0.469-13.79,13.815-29.815,29.815l-42.3,42.334l-49.101-49.126c-12.834-12.817-22.613-22.596-23.031-23.049
			C196.42,159.522,196.42,94.72,236.203,54.878c19.243-19.311,44.86-29.935,72.132-29.935s52.898,10.624,72.149,29.935
			C420.267,94.72,420.267,159.531,380.459,199.398z"/>
	</g>
</g>
<g>
	<g>
		<path d="M460.8,102.4V128h25.6v164.233l-64-45.645l-89.173,125.039L486.4,480.879v5.521h-34.603L25.6,182.409V128h128v-25.6H0V512
			h512V102.4H460.8z M25.6,371.063l35.302,25.19L25.6,445.73V371.063z M122.377,486.4l21.897-30.686L187.29,486.4H122.377z
			 M231.364,486.4l-93.09-66.389L90.931,486.4H28.049l68.557-96.128L25.6,339.627v-31.454L275.473,486.4H231.364z M319.548,486.4
			L25.6,276.736v-62.891L407.714,486.4H319.548z M486.4,449.451l-117.478-83.797l59.477-83.362l58.001,41.361V449.451z"/>
	</g>
</g>
</svg>`;

// Save the SVG file
writeFileSync("public/icon.svg", svgIcon);
console.log("Generated icon.svg");

// Try to use canvas if sharp is not available
try {
  // Generate PNG icons using canvas
  const sizes = [192, 512];

  async function generateIcons() {
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext("2d");

      // Load the SVG and draw it to canvas
      const img = await loadImage(Buffer.from(svgIcon));
      ctx.drawImage(img, 0, 0, size, size);

      // Save the PNG
      const buffer = canvas.toBuffer("image/png");
      writeFileSync(`public/icon-${size}x${size}.png`, buffer);
      console.log(`Generated icon-${size}x${size}.png`);
    }
  }

  generateIcons().catch((err) => {
    console.error("Error generating icons with canvas:", err);
    console.log(
      "SVG icon was generated successfully. Please manually convert it to PNG if needed.",
    );
  });
} catch (err) {
  console.error("Canvas not available:", err);
  console.log(
    "SVG icon was generated successfully. Please manually convert it to PNG if needed.",
  );
}
