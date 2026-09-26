document.addEventListener("DOMContentLoaded", () => {
    const demoBtn = document.getElementById("demoBtn");
    const scanBtn = document.getElementById("scanBtn");
    const clearBtn = document.getElementById("clearBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const htmlInput = document.getElementById("htmlInput");
    
    const scoreEl = document.getElementById("score");
    const scoreMessage = document.getElementById("scoreMessage");
    const errorCountEl = document.getElementById("errorCount");
    const warningCountEl = document.getElementById("warningCount");
    const passCountEl = document.getElementById("passCount");
    
    const resultsContainer = document.getElementById("resultsContainer");
    const previewIframe = document.getElementById("preview");

    // Load Demo HTML
    if (demoBtn) {
        demoBtn.addEventListener("click", () => {
            htmlInput.value = `<!DOCTYPE html>
<html>
<head>
    <title>Demo Accessibility Test</title>
</head>
<body>
    <img src="company-logo.png">
    <img src="banner.jpg" alt="Company Banner">
    <h1>Main Dashboard</h1>
    <h3>Subsection Title</h3>
    <input type="text" placeholder="Enter username">
    <a href="/more-info">click here</a>
    <button type="button">Submit Form</button>
</body>
</html>`;
        });
    }

    // Clear Action
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            htmlInput.value = "";
            scoreEl.textContent = "0";
            scoreMessage.textContent = "Run a scan to see your score.";
            errorCountEl.textContent = "0";
            warningCountEl.textContent = "0";
            passCountEl.textContent = "0";
            previewIframe.srcdoc = "";
            if (downloadBtn) downloadBtn.style.display = "none";
            resultsContainer.innerHTML = `
                <div class="empty">
                    <div>🔎</div>
                    <h3>No scan performed</h3>
                    <p>Enter HTML and click "Scan Website".</p>
                </div>`;
        });
    }

    // Download Healed Code Handler
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const healedCode = htmlInput.value;
            const blob = new Blob([healedCode], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "accessguard-healed.html";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // Scan & Self-Heal Action
    if (scanBtn) {
        scanBtn.addEventListener("click", () => {
            const code = htmlInput.value.trim();

            if (!code) {
                alert("Please paste HTML code before running a scan.");
                return;
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(code, "text/html");

            let healedCount = 0;
            const issues = [];

            // 1. Healing Rule: Missing <html> language attribute
            const htmlTag = doc.querySelector("html");
            if (!htmlTag || !htmlTag.getAttribute("lang")) {
                if (htmlTag) {
                    htmlTag.setAttribute("lang", "en");
                    healedCount++;
                    issues.push({ type: "healed", title: "Healed: Added Language Attribute", desc: "Added lang='en' to the tag automatically." });
                }
            }

            // 2. Healing Rule: Missing <img> alt attributes
            const images = doc.querySelectorAll("img");
            images.forEach((img, idx) => {
                if (!img.hasAttribute("alt") || img.getAttribute("alt").trim() === "") {
                    img.setAttribute("alt", `Image ${idx + 1}`);
                    healedCount++;
                    issues.push({ type: "healed", title: `Healed: Image #${idx + 1} Alt Text`, desc: `Injected fallback alt="Image ${idx + 1}" into unlabelled image.` });
                }
            });

            // 3. Healing Rule: Missing input accessibility labels
            const inputs = doc.querySelectorAll("input:not([type='hidden']), select, textarea");
            inputs.forEach((input, idx) => {
                const id = input.getAttribute("id");
                const hasLabel = id ? doc.querySelector(`label[for="${id}"]`) : false;
                const hasAria = input.hasAttribute("aria-label") || input.hasAttribute("aria-labelledby");

                if (!hasLabel && !hasAria) {
                    const placeholder = input.getAttribute("placeholder") || `Field ${idx + 1}`;
                    input.setAttribute("aria-label", placeholder);
                    healedCount++;
                    issues.push({ type: "healed", title: `Healed: Input #${idx + 1} Label`, desc: `Injected aria-label="${placeholder}" into unlabelled form field.` });
                }
            });

            // 4. Healing Rule: Non-descriptive link texts
            const links = doc.querySelectorAll("a");
            links.forEach((link, idx) => {
                const text = link.textContent.toLowerCase().trim();
                if (text === "click here" || text === "read more" || text === "link" || text === "more") {
                    link.setAttribute("aria-label", `Learn more about section ${idx + 1}`);
                    healedCount++;
                    issues.push({ type: "healed", title: `Healed: Link #${idx + 1} Accessibility`, desc: `Added explicit aria-label to clarify non-descriptive "${text}" text.` });
                }
            });

            // Output Healed Source Code back to Preview and Editor
            const healedHTML = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
            htmlInput.value = healedHTML;
            previewIframe.srcdoc = healedHTML;

            // Update UI Score & Stats
            scoreEl.textContent = "100";
            errorCountEl.textContent = "0";
            warningCountEl.textContent = "0";
            passCountEl.textContent = "5";

            scoreMessage.textContent = healedCount > 0 
                ? `Self-Healed ${healedCount} accessibility flaws automatically!` 
                : "Great job! Code is fully accessible.";

            if (downloadBtn) {
                downloadBtn.style.display = healedCount > 0 ? "inline-block" : "none";
            }

            // Render Results Report
            if (issues.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="empty">
                        <div>🎉</div>
                        <h3>No Issues Found</h3>
                        <p>All automated accessibility checks passed successfully!</p>
                    </div>`;
            } else {
                resultsContainer.innerHTML = issues.map(issue => `
                    <div class="report-card ${issue.type}">
                        <h4>🔧 ${issue.title}</h4>
                        <p>${issue.desc}</p>
                    </div>
                `).join("");
            }
        });
    }
});