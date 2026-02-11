// DOM ELEMENTS
const generateBtn = document.getElementById("generate-btn");
const paletteContainer = document.querySelector(".palette-container");

let colors;

generateBtn.addEventListener("click", generatePalette);
paletteContainer.addEventListener("click", (e) => {
    // find the closest copy button/icon in case the user clicks an inner <i> or child element
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
        const hexElement = copyBtn.previousElementSibling;
        const hexValue = hexElement ? hexElement.textContent : "";

        navigator.clipboard.writeText(hexValue)
        .then(() => {
            // prefer the icon element if present, otherwise use the button itself
            const icon = copyBtn.querySelector("i") || copyBtn;
            showCopySuccess(icon);
            showBubble("Copied " + hexValue);
        })
        .catch((err) => console.log(err));
        return;
    }

    const colorEl = e.target.closest(".color");
    if (colorEl) {
        const details = colorEl.nextElementSibling;
        const hexEl = details ? details.querySelector(".hex-value") : null;
        const hexValue = hexEl ? hexEl.textContent : "";

        navigator.clipboard.writeText(hexValue)
        .then(() => {
            const copyBtnEl = details ? details.querySelector(".copy-btn") : null;
            const icon = copyBtnEl ? (copyBtnEl.querySelector("i") || copyBtnEl) : null;
            if (icon) showCopySuccess(icon);
        })
        .catch((err) => console.log(err));
    }
})

function showCopySuccess(element){
    if (!element) return;

    element.classList.remove("far", "fa-copy");
    element.classList.add("fa-solid", "fa-check");

    element.style.color = "#48bb78";

    // keep the check visible for 1.5s before reverting
    setTimeout(() => {
        element.classList.remove("fa-solid", "fa-check");
        element.classList.add("far", "fa-copy");

        element.style.color = "#111F35";
    }, 1500);
}

//
// PALETTE GENERATOR
// 
// generatePalette() -- triggers when the generate button is clicked.
// hsvToHex()        -- turns an hsv object into hex (#ABCDEF) 
// const WHEEL       -- preset of 18 colors, it translates the "h" value into an rgb format.
// makeVariant()     -- takes an hsv object, and creates the same object, but with small random changes.
//

    function generatePalette() {
        colors = [];

        // Make our first color, this is our primary color.
        const primary = {
            h: Math.floor(Math.random() * 18), // Colors of the wheel [0-17]
            s: 70 + Math.floor(Math.random() * 31), // Saturatiton [70-100]
            v: 70 + Math.floor(Math.random() * 31) // Value [70-100]
        }

        colors.push(hsvToHex(primary.h, primary.s, primary.v));

        // And for the rest of our four colors, copy the previous, and add small random changes...
        let variant = {...primary};
        for (let i = 0; i < 4; i++) {
            variant = makeVariant(variant.h, variant.s, variant.v);
            colors.push(hsvToHex(variant.h, variant.s, variant.v));
        }

        updatePaletteDisplay(colors);
    }

    // https://www.rapidtables.com/convert/color/hsv-to-rgb.html
    const WHEEL = [
        [255, 0, 0], [255, 85, 0], [255, 170, 0], [255, 255, 0],
        [170, 255, 0], [85, 255, 0], [0, 255, 0], [0, 255, 85],
        [0, 255, 170], [0, 255, 255], [0, 170, 255], [0, 85, 255],
        [0, 0, 255], [85, 0, 255], [170, 0, 255], [255, 0, 255],
        [255, 0, 170], [255, 0, 85]
    ]

    function hsvToHex(h, s, v) {
        let color = [...WHEEL[h]];

        // Apply desaturation (become whiter)
        // How to make it whiter? Add more to R, G, B until it approaches 255.
        const desaturation = (100 - s) / 100;
        color[0] = color[0] + Math.floor((255 - color[0]) * desaturation);
        color[1] = color[1] + Math.floor((255 - color[1]) * desaturation);
        color[2] = color[2] + Math.floor((255 - color[2]) * desaturation);

        // Apply darkness (become blacker)
        // How to make it blacker? Muliply R, G, B by a smaller decimal.
        const lightness = v / 100;
        color[0] = Math.floor(color[0] * lightness);
        color[1] = Math.floor(color[1] * lightness);
        color[2] = Math.floor(color[2] * lightness);

        // Turn into a hex
        return "#" + 
        color[0].toString(16).padStart(2, '0') +
        color[1].toString(16).padStart(2, '0') +
        color[2].toString(16).padStart(2, '0')
    }

    function makeVariant(h, s, v) {
        let changedFlag = false;

        // 66% chance to change the Hue
        if (Math.random() < 0.66) {
            changedFlag = true;
            
            const HUEVARIANTS = [
                9,      // Complementary color
                6, 12,  // Triadic colors
                3, 15,  // \
                2, 16,  //  Analogous Colors
                1, 17   // /
            ];
            
            const huevariant = HUEVARIANTS[Math.floor(Math.random() * HUEVARIANTS.length)];
            h = (h + huevariant) % 18;
        }

        // 33% chance to change the Saturation
        if (Math.random() < 0.25) {
            changedFlag = true;
            s *= Math.random() * 0.5;
        }

        // 33% chance to change the value
        if (Math.random() < 0.25) {
            changedFlag = true;
            v *= 0.5 + Math.random() * 0.5;
        }

        // If no changes were made, do it again.
        if (!changedFlag) return makeVariant(h, s, v);

        return {h, s, v};
    }

//
// END
// 

function updatePaletteDisplay(colors){
    const colorBoxes = document.querySelectorAll(".color-box")

    colorBoxes.forEach((box, index) => {
        const color = colors[index];
        const colorDiv = box.querySelector(".color");
        const hexValue = box.querySelector(".hex-value");

        colorDiv.style.backgroundColor = color;
        hexValue.textContent = color;
    })
}



generatePalette() // if you want to generate a new color palette every time you reload or visit, remove to have the default


//
// SAVING
//

const savePaletteButton = document.getElementById("save-btn");
const savedPalettesElement = document.getElementById("saved-palettes");

let saved = JSON.parse(localStorage.getItem("savedPalettes")) ?? [];

// Save button
savePaletteButton.addEventListener("click", () => {
    if (saved.includes(colors)) {
        showBubble("This color palette is already saved");
    } else {
        saved.push(colors);
        updateStorage();
        renderSavedPalettes();
        showBubble("Color palette saved!")
    }
})


function updateStorage() {
    // localStorage only accepts strings, so first convert the array to a string.
    localStorage.setItem("savedPalettes", JSON.stringify(saved));
}

function renderSavedPalettes() {
    // Clear everything first
    savedPalettesElement.innerHTML = "";

    // Then add each row one by one
    saved.forEach((palette) => {
        const row = createRow(palette);
        savedPalettesElement.appendChild(row);
    })
}

function createRow(palette) {
    // Make a <div className="saved-row"> </div>
    const row = document.createElement("div");
    row.classList.add("saved-row");
    
    // Add necessary children inside this <div>
    for (let i = 0; i < palette.length; i++) {
        row.innerHTML += `<div title="${palette[i]}" style="background-color: ${palette[i]}">`;
    }

    // Listen for any clicks on the color divs
    row.addEventListener("click", (e) => {
        const foundHex = e.target.getAttribute("title");
        if (foundHex) {
            navigator.clipboard.writeText(foundHex)
            .then(() => {
                showBubble("Copied " + foundHex);
            })
        }
    })

    // Configure how the delete button works and add it in as well
    const delButton = document.createElement("button");
    delButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    delButton.addEventListener("click", () => {
        const confirmed = window.confirm("Confirm delete?");
        if (confirmed) {
            const indexToDelete = saved.indexOf(palette);
            saved.splice(indexToDelete, 1);
            renderSavedPalettes();
            updateStorage();
            showBubble("Color palette deleted");
        }
    });
    row.appendChild(delButton);

    return row; 
}



const bubbleElement = document.getElementById("bubble");
let bubbleTimeout;

function showBubble(message) {
    // "Postpone" hiding
    clearTimeout(bubbleTimeout);

    bubbleElement.textContent = message;

    // Show -> 3 seconds -> Hide
    bubbleElement.classList.add("shown");
    bubbleTimeout = setTimeout(() => bubbleElement.classList.remove("shown"), 3000);
}

renderSavedPalettes()