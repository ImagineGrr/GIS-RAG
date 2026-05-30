/* ============================================================
   GeoAI Assistant — ChatGPT-style Frontend Script
   Features: typewriter effect, markdown, table, SQL toggle,
             auto-resize textarea, suggestion starters
   ============================================================ */

// ── Auto-resize textarea ──────────────────────────────────────
function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
}

// ── Suggestion starters ───────────────────────────────────────
function useQuestion(text) {
    const input = document.getElementById("questionInput");
    input.value = text;
    autoResize(input);
    input.focus();
}

// ── Enter key (Shift+Enter = newline) ────────────────────────
function handleEnter(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendQuestion();
    }
}

// ── Markdown renderer ─────────────────────────────────────────
function renderMarkdown(text) {
    if (!text) return "";
    // Escape HTML
    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Italic
    text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,.08);padding:2px 6px;border-radius:5px;font-size:13px;">$1</code>');
    
    // Parse list blocks correctly (grouping adjacent bullet points)
    const lines = text.split("\n");
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith("- ")) {
            let content = line.substring(2).trim();
            if (!inList) {
                lines[i] = "<ul><li>" + content + "</li>";
                inList = true;
            } else {
                lines[i] = "<li>" + content + "</li>";
            }
        } else {
            if (inList) {
                // close the list before this line
                lines[i - 1] = lines[i - 1] + "</ul>";
                inList = false;
            }
        }
    }
    if (inList) {
        lines[lines.length - 1] = lines[lines.length - 1] + "</ul>";
    }
    text = lines.join("\n");

    // Line breaks
    text = text.replace(/\n/g, "<br>");
    return text;
}

// ── Typewriter effect ─────────────────────────────────────────
function typeWriter(container, html, speed = 10) {
    return new Promise(resolve => {
        // We render char-by-char on the plain text, then set innerHTML at end
        // Better approach: render progressively using a text node
        const plainText = html.replace(/<[^>]+>/g, ""); // strip tags for length
        let i = 0;
        const cursor = document.createElement("span");
        cursor.className = "cursor";
        container.innerHTML = "";
        container.appendChild(cursor);

        const interval = setInterval(() => {
            i += 3; // chars per tick (adjust speed)
            if (i >= plainText.length) {
                clearInterval(interval);
                container.innerHTML = html; // final render with full markdown
                resolve();
            } else {
                // Slice on original html to keep tags intact progressively
                // Simple approach: reveal characters of the raw html string
                let visible = 0;
                let tagOpen = false;
                let count = 0;
                for (let j = 0; j < html.length; j++) {
                    if (html[j] === "<") tagOpen = true;
                    if (!tagOpen) count++;
                    if (html[j] === ">") tagOpen = false;
                    if (count >= i) {
                        visible = j + 1;
                        break;
                    }
                }
                if (!visible) visible = html.length;
                container.innerHTML = html.slice(0, visible) + '<span class="cursor"></span>';
            }
        }, speed);
    });
}

// ── Build result table ────────────────────────────────────────
function buildTable(results) {
    if (!results || results.length === 0) return null;
    const keys = Object.keys(results[0]);
    if (results.length === 1 && keys.length === 1) return null;

    const wrap = document.createElement("div");
    wrap.className = "table-wrap";

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    keys.forEach(key => {
        const th = document.createElement("th");
        th.textContent = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    results.forEach(row => {
        const tr = document.createElement("tr");
        keys.forEach(key => {
            const td = document.createElement("td");
            const val = row[key];
            if ((key === "latitude" || key === "longitude") && typeof val === "number") {
                td.textContent = val.toFixed(6);
            } else if (key === "distance_meters" && typeof val === "number") {
                td.textContent = (val / 1000).toFixed(2) + " km";
            } else {
                td.textContent = val !== null && val !== undefined ? val : "—";
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
}

// ── Build SQL toggle block ────────────────────────────────────
function buildSqlBlock(sql) {
    const wrapper = document.createElement("div");

    const toggle = document.createElement("button");
    toggle.className = "sql-toggle";
    toggle.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg> View SQL`;

    const block = document.createElement("pre");
    block.className = "sql-block";
    block.textContent = sql;

    toggle.addEventListener("click", () => {
        const open = block.classList.toggle("open");
        toggle.innerHTML = open
            ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg> Hide SQL`
            : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg> View SQL`;
    });

    wrapper.appendChild(toggle);
    wrapper.appendChild(block);
    return wrapper;
}

// ── Build meta tag row ────────────────────────────────────────
function buildMetaRow(data) {
    const row = document.createElement("div");
    row.className = "meta-row";

    if (data.intent) {
        const t = document.createElement("span");
        t.className = "tag tag-intent";
        t.textContent = data.intent.replace(/_/g, " ");
        row.appendChild(t);
    }

    if (data.sql_source) {
        const t = document.createElement("span");
        if (data.sql_source === "template") {
            t.className = "tag tag-tmpl";
            t.textContent = "⚡ Template";
        } else if (data.sql_source === "llm") {
            t.className = "tag tag-llm";
            t.textContent = "🤖 LLM";
        } else if (data.sql_source === "llm_chat") {
            t.className = "tag tag-chat";
            t.textContent = "💬 Chat";
        }
        row.appendChild(t);
    }

    if (data.normalized_question) {
        const t = document.createElement("span");
        t.className = "tag tag-hindi";
        t.textContent = "🇮🇳 Hindi";
        row.appendChild(t);
    }

    return row;
}

// ── Append a message row (user or bot shell) ──────────────────
function appendUserMsg(chatBox, question) {
    // Hide welcome screen
    const welcome = document.getElementById("welcomeScreen");
    if (welcome) welcome.style.display = "none";

    const row = document.createElement("div");
    row.className = "msg-row user";

    const av = document.createElement("div");
    av.className = "avatar user-av";
    av.textContent = "U";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = question;

    row.appendChild(av);
    row.appendChild(bubble);
    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function createBotRow(chatBox) {
    const row = document.createElement("div");
    row.className = "msg-row bot";

    const av = document.createElement("div");
    av.className = "avatar bot-av";
    av.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const label = document.createElement("div");
    label.className = "bot-label";
    label.textContent = "GeoAI";
    bubble.appendChild(label);

    row.appendChild(av);
    row.appendChild(bubble);
    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;

    return { row, bubble };
}

// ── Thinking indicator ────────────────────────────────────────
function showThinking(bubble) {
    const thinking = document.createElement("div");
    thinking.className = "thinking";
    thinking.id = "thinkingIndicator";
    thinking.innerHTML = `<div class="dot-row"><span></span><span></span><span></span></div><span>Thinking…</span>`;
    bubble.appendChild(thinking);
}

function hideThinking() {
    document.getElementById("thinkingIndicator")?.remove();
}

// ── Main send ─────────────────────────────────────────────────
async function sendQuestion() {
    const input   = document.getElementById("questionInput");
    const chatBox = document.getElementById("chatBox");
    const sendBtn = document.getElementById("sendBtn");

    const question = input.value.trim();
    if (!question) return;

    input.disabled = true;
    sendBtn.disabled = true;
    input.value = "";
    input.style.height = "auto";

    // User message
    appendUserMsg(chatBox, question);

    // Bot shell + thinking
    const { row: botRow, bubble } = createBotRow(chatBox);
    showThinking(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const res  = await fetch(`/ask?question=${encodeURIComponent(question)}`);
        const data = await res.json();

        hideThinking();

        if (data.error) {
            const errCard = document.createElement("div");
            errCard.className = "error-card";
            errCard.textContent = "⚠️ " + data.error;
            bubble.appendChild(errCard);
        } else {
            // Meta tags
            bubble.appendChild(buildMetaRow(data));

            // Answer with typewriter
            const answerDiv = document.createElement("div");
            answerDiv.className = "answer-text";
            bubble.appendChild(answerDiv);
            chatBox.scrollTop = chatBox.scrollHeight;

            const mdHtml = renderMarkdown(data.answer || "No response.");
            await typeWriter(answerDiv, mdHtml, 8);

            // Result count
            if (data.result_count > 0 && data.results && data.results.length > 1) {
                const lbl = document.createElement("p");
                lbl.className = "result-label";
                lbl.textContent = `${data.result_count} rows returned`;
                bubble.appendChild(lbl);
            }

            // Table
            if (data.results && data.results.length > 0) {
                const tbl = buildTable(data.results);
                if (tbl) bubble.appendChild(tbl);
            }

        }

    } catch (err) {
        hideThinking();
        const errCard = document.createElement("div");
        errCard.className = "error-card";
        errCard.textContent = "⚠️ Could not reach the server. Check that the backend is running.";
        bubble.appendChild(errCard);
    }

    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    chatBox.scrollTop = chatBox.scrollHeight;
}