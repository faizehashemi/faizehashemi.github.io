function displayFeedbackMenu() {
    const chatBox = document.getElementById('chatBox');
    
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = "We'd love to hear your feedback. Please type it below:";
    chatBox.appendChild(botResponse);

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your feedback...';
    input.id = 'customFeedbackInput';

    const sendButton = document.createElement('button');
    sendButton.innerText = 'Send';
    sendButton.onclick = () => {
        const feedback = input.value.trim();
        if (feedback !== "") {
            inputContainer.remove();
            confirmFeedback(feedback);
        }
    };

    inputContainer.appendChild(input);
    inputContainer.appendChild(sendButton);
    chatBox.appendChild(inputContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function confirmFeedback(feedback) {
    selectedFeedback = feedback;

    const chatBox = document.getElementById('chatBox');
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerText = feedback;
    chatBox.appendChild(userMessage);

    setTimeout(() => {
        const botResponse = document.createElement('div');
        botResponse.className = 'bot-message';
        botResponse.innerText = `Are you sure you want to submit this feedback?`;
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
                submitFeedback();
            } else {
                botResponse.innerText = "Feedback submission canceled. Refreshing page in 5 seconds...";
                setTimeout(() => location.reload(), 5000);
            }
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);
}


function submitFeedback() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = `Thank you for your feedback!`;
    chatBox.appendChild(botResponse);

    forwardFeedbackToTelegram(selectedFeedback);
    redirectToEndChatPage(); // Call the reusable redirect function

    chatBox.scrollTop = chatBox.scrollHeight;
}

async function forwardFeedbackToTelegram(feedback) {
    const message = `📝 *New Feedback Received* 📝\n\n`
        + `💬 *Feedback*: ${feedback}\n`
        + `🏨 *Room Number*: ${userRoomNumber}\n\n`
        + `🙏 *Thank you for helping us improve!*`;

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
        console.log("Feedback Sent to Telegram:", data);
    } catch (error) {
        console.error("Telegram Error:", error);
    }
}
