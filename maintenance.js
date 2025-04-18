function displayMaintenanceMenu() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = "Please select the issue:";
    chatBox.appendChild(botResponse);

    const buttonMenu = document.createElement('div');
    buttonMenu.className = 'button-menu';

const options = [
  "🛁 Geaser not working",
  "❄️ AC not working",
  "🕰️ Clock Battery",
  "💡 Lights not working",
  "🚰 Drainage Issues",
  "🚿 Basin Clot",
  "🚪 Cupboard hinge",
  "💨 Exhaust not working",
  "⚡ Power outage",
  "💧 Water leakage",
  "🚽 Toilet flush issue",
  "🐜 Pest problem",
];

const buttons = [];

options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'menu-button';
    button.innerText = option;
    buttonMenu.appendChild(button);
    buttons.push(button);
});

// Add bubble effect behavior
enableBubbleEffectOnClick(buttons, confirmMaintenanceRequest);

    chatBox.appendChild(buttonMenu);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function confirmMaintenanceRequest(issue) {
    selectedMaintenance = issue;

    const chatBox = document.getElementById('chatBox');
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerText = issue;
    chatBox.appendChild(userMessage);

    setTimeout(() => {
        const botResponse = document.createElement('div');
        botResponse.className = 'bot-message';
        botResponse.innerText = `Are you sure you want to report "${selectedMaintenance}" for Room ${userRoomNumber}?`;
        chatBox.appendChild(botResponse);

        const buttonMenu = document.createElement('div');
        buttonMenu.className = 'button-menu';
        chatBox.appendChild(buttonMenu);

        const options = ["Yes", "No"];
            function handleConfirmation(choice) {
                if (choice === "Yes") {
                    submitMaintenanceRequest();
                } else {
                    botResponse.innerText = "Request canceled. Refreshing the page in 5 seconds...";
                    setTimeout(() => {
                        location.reload();
                    }, 5000);
                }
            }


        // Use reusable button generator
        createBubbleMenuButtons(options, buttonMenu, handleConfirmation);

        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
}


function submitMaintenanceRequest() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = `Thank you! Your issue "${selectedMaintenance}" has been reported for Room ${userRoomNumber}.`;
    chatBox.appendChild(botResponse);

    forwardToTelegramGroup(userRoomNumber);
    redirectToEndChatPage(); // Call the reusable redirect function

    chatBox.scrollTop = chatBox.scrollHeight;
}

async function forwardToTelegramGroup(room) {
    const message = `🔔 *Maintenance Request Received* 🔔\n\n`
        + `📌 *Issue*: ${selectedMaintenance}\n`
        + `🏨 *Room Number*: ${room}\n\n`
        + `📩 *Please assist as soon as possible!*`;

    const telegramBotToken = "7907237986:AAHnmVO8CKOSIjKpwZwP3C6F5Ih8viGJoC4";
    const telegramChatId = "-4754144977"; // Replace with your Telegram group ID

    const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const requestBody = {
        chat_id: telegramChatId,
        text: message,
        parse_mode: "Markdown"
    };

    try {
        const response = await fetch(telegramApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log("Telegram Message Sent:", data);
    } catch (error) {
        console.error("Telegram Error:", error);
    }
}

function redirectToEndChatPage() {
    window.location.href = "https://faizehashemi.github.io/endchat.html";
}


