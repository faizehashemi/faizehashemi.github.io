function requestLiveChat() {
    const chatBox = document.getElementById('chatBox');
    
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = "To connect you with a live agent, please enter your phone number:";
    chatBox.appendChild(botResponse);

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    const input = document.createElement('input');
    input.type = 'tel';
    input.placeholder = 'Enter your phone number...';
    input.id = 'liveChatPhoneInput';

    const sendButton = document.createElement('button');
    sendButton.innerText = 'Send';
    sendButton.onclick = () => {
        const phone = input.value.trim();
        if (/^\+?\d{7,15}$/.test(phone)) {
            inputContainer.remove();
            confirmLiveChat(phone);
        } else {
            alert("Please enter a valid phone number.");
        }
    };

    inputContainer.appendChild(input);
    inputContainer.appendChild(sendButton);
    chatBox.appendChild(inputContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function confirmLiveChat(phone) {
    selectedPhone = phone;

    const chatBox = document.getElementById('chatBox');
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerText = phone;
    chatBox.appendChild(userMessage);

    setTimeout(() => {
        const botResponse = document.createElement('div');
        botResponse.className = 'bot-message';
        botResponse.innerText = `Would you like to start a live chat using this phone number: ${selectedPhone}?`;
        chatBox.appendChild(botResponse);

        const buttonMenu = document.createElement('div');
        buttonMenu.className = 'button-menu';
        chatBox.appendChild(buttonMenu);

        const buttons = [];

        const yesButton = document.createElement('button');
        yesButton.className = 'menu-button';
        yesButton.innerText = "Yes";
        buttons.push(yesButton);

        const noButton = document.createElement('button');
        noButton.className = 'menu-button';
        noButton.innerText = "No";
        buttons.push(noButton);

        buttonMenu.appendChild(yesButton);
        buttonMenu.appendChild(noButton);

        enableBubbleEffectOnClick(buttons, (text) => {
            if (text === "Yes") {
                submitLiveChatRequest();
            } else {
                botResponse.innerText = "Live chat request canceled. Refreshing page in 5 seconds...";
                setTimeout(() => location.reload(), 5000);
            }
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);
}


function submitLiveChatRequest() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = `Thank you! Our team will contact you shortly at ${selectedPhone}.`;
    chatBox.appendChild(botResponse);

    forwardLiveChatToTelegram(selectedPhone);
    redirectToEndChatPage(); // Call the reusable redirect function

    chatBox.scrollTop = chatBox.scrollHeight;
}

async function forwardLiveChatToTelegram(phone) {
    const message = `📞 *Live Chat Request* 📞\n\n`
        + `📱 *Phone Number*: ${phone}\n`
        + `🏨 *Room Number*: ${userRoomNumber}\n\n`
        + `⚡ *Please connect this guest to a live agent ASAP.*`;

    // The bot token lives in the Cloudflare Worker as a secret, never in this public file.
    const telegramApiUrl = "https://pms-api.tkamlapur.workers.dev/api/public/chat-notify";
    const requestBody = { text: message };

    try {
        const response = await fetch(telegramApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log("Live Chat Request Sent to Telegram:", data);
    } catch (error) {
        console.error("Telegram Error:", error);
    }
}
