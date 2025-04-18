function displayEmergencyMenu() {
    const chatBox = document.getElementById('chatBox');

    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = "Please select your room service:";
    chatBox.appendChild(botResponse);

    const buttonMenu = document.createElement('div');
    buttonMenu.className = 'button-menu';
    chatBox.appendChild(buttonMenu);

    const options = ["Commode", "Pillow", "Bedsheet", "Room Cleaning", "Locker"];
    const buttons = [];

    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.innerText = option;
        buttonMenu.appendChild(button);
        buttons.push(button);
    });

    // Apply the global bubble handler with the correct callback
    enableBubbleEffectOnClick(buttons, handleRoomServiceSelection);

    chatBox.scrollTop = chatBox.scrollHeight;
}


function handleRoomServiceSelection(service) {
    if (service === "Room Cleaning") {
        displayRoomCleaningTimeSlots(service);
    } else if (service === "Locker") {
        displayLockerTimeSlots(service);
    } else {
        confirmRoomServiceRequest(service);
    }
}

function displayRoomCleaningTimeSlots(service) {
    const chatBox = document.getElementById('chatBox');
    
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = `Please select a time slot for ${service.toLowerCase()}:`;
    chatBox.appendChild(botResponse);

    const buttonMenu = document.createElement('div');
    buttonMenu.className = 'button-menu';
    chatBox.appendChild(buttonMenu);

    const timeSlots = [
        "8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
        "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM", "5:00 PM - 6:00 PM", "6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM"
    ];

    const buttons = [];

    timeSlots.forEach(slot => {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.innerText = slot;
        buttonMenu.appendChild(button);
        buttons.push(button);
    });

    enableBubbleEffectOnClick(buttons, (slot) => {
        confirmRoomServiceRequest(`${service} @ ${slot}`);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

function displayLockerTimeSlots(service) {
    const chatBox = document.getElementById('chatBox');
    
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = `Please select a time slot for ${service.toLowerCase()}:`;
    chatBox.appendChild(botResponse);

    const buttonMenu = document.createElement('div');
    buttonMenu.className = 'button-menu';
    chatBox.appendChild(buttonMenu);

    const timeSlots = [
        "9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
        "4:00 PM - 5:00 PM", "5:00 PM - 6:00 PM", "9:00 PM - 10:00 PM"
    ];

    const buttons = [];

    timeSlots.forEach(slot => {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.innerText = slot;
        buttonMenu.appendChild(button);
        buttons.push(button);
    });

    enableBubbleEffectOnClick(buttons, (slot) => {
        confirmRoomServiceRequest(`${service} @ ${slot}`);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}


function confirmRoomServiceRequest(service) {
    selectedService = service;

    const chatBox = document.getElementById('chatBox');

    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerText = service;
    chatBox.appendChild(userMessage);

    setTimeout(() => {
        const botResponse = document.createElement('div');
        botResponse.className = 'bot-message';
        botResponse.innerText = `Are you sure you want to request "${selectedService}" for Room ${userRoomNumber}?`;
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
                submitRoomServiceRequest();
            } else {
                botResponse.innerText = "Request canceled. Refreshing page in 5 seconds...";
                setTimeout(() => location.reload(), 5000);
            }
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
}


function submitRoomServiceRequest() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = `Thank you! Your request "${selectedService}" has been reported for Room ${userRoomNumber}.`;
    chatBox.appendChild(botResponse);

    forwardToTelegramRoomService(userRoomNumber);
    redirectToEndChatPage(); // Call the reusable redirect function


    chatBox.scrollTop = chatBox.scrollHeight;
}

async function forwardToTelegramRoomService(room) {
    const message = `🔔 *Room Service Request Received* 🔔\n\n`
        + `📌 *Service*: ${selectedService}\n`
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
