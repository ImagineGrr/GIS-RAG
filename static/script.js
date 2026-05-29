function handleEnter(event) {
    if (event.key === "Enter") {
        sendQuestion();
    }
}

async function sendQuestion() {

    const input = document.getElementById("questionInput");
    const chatBox = document.getElementById("chatBox");

    const question = input.value.trim();

    if (!question) return;

    // User message
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = question;

    chatBox.appendChild(userMessage);

    input.value = "";

    // Loading message
    const loadingId = "loading-" + Date.now();

    const loadingMessage = document.createElement("div");
    loadingMessage.className = "message bot";
    loadingMessage.id = loadingId;
    loadingMessage.textContent = "Thinking...";

    chatBox.appendChild(loadingMessage);

    chatBox.scrollTop = chatBox.scrollHeight;

    try {

        const response = await fetch(
            `/ask?question=${encodeURIComponent(question)}`
        );

        const data = await response.json();

        // Remove loading message
        const loadingElement = document.getElementById(loadingId);

        if (loadingElement) {
            loadingElement.remove();
        }

        // Bot container
        const botMessage = document.createElement("div");
        botMessage.className = "message bot";

        // Answer text
        const answerDiv = document.createElement("div");
        answerDiv.style.marginBottom = "15px";
        answerDiv.textContent = data.answer || "No response.";

        botMessage.appendChild(answerDiv);

        // Create table if results exist
        if (data.results && data.results.length > 0) {

            const firstRow = data.results[0];

            // Hide table for single count values
            if (!(data.results.length === 1 &&
                  Object.keys(firstRow).length === 1)) {

                const table = document.createElement("table");

                // Header row
                const headerRow = document.createElement("tr");

                const keys = Object.keys(firstRow);

                keys.forEach(key => {

                    const th = document.createElement("th");
                    th.textContent = key;

                    headerRow.appendChild(th);
                });

                table.appendChild(headerRow);

                // Data rows
                data.results.forEach(row => {

                    const tr = document.createElement("tr");

                    keys.forEach(key => {

                        const td = document.createElement("td");

                        td.textContent =
                            row[key] !== null
                                ? row[key]
                                : "";

                        tr.appendChild(td);
                    });

                    table.appendChild(tr);
                });

                botMessage.appendChild(table);
            }
        }

        chatBox.appendChild(botMessage);

    } catch (error) {

        const loadingElement = document.getElementById(loadingId);

        if (loadingElement) {
            loadingElement.remove();
        }

        const errorMessage = document.createElement("div");

        errorMessage.className = "message bot";
        errorMessage.textContent = "Backend connection failed.";

        chatBox.appendChild(errorMessage);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}