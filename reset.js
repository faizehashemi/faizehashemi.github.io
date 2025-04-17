function askForResetConfirmation() {
    const chatBox = document.getElementById('chatBox');
    const botMessage = document.createElement('div');
    botMessage.className = 'bot-message';
    botMessage.innerText = "You have reached the end of the chat. Do you want to reset the bot and start over? (Yes / No)";
    chatBox.appendChild(botMessage);

    const buttonMenu = document.createElement('div');
    buttonMenu.className = 'button-menu';

    const yesButton = document.createElement('button');
    yesButton.className = 'menu-button';
    yesButton.innerText = "Yes, I confirm";
    yesButton.onclick = () => resetBot();
    buttonMenu.appendChild(yesButton);

    const noButton = document.createElement('button');
    noButton.className = 'menu-button';
    noButton.innerText = "No, I don't want to reset";
    noButton.onclick = () => {
        const botResponse = document.createElement('div');
        botResponse.className = 'bot-message';
        botResponse.innerText = "Okay, we will continue without resetting.";
        chatBox.appendChild(botResponse);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    buttonMenu.appendChild(noButton);
    chatBox.appendChild(buttonMenu);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function resetBot() {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = '';  // Clear chat box

    // Welcome message
    const botMessage = document.createElement('div');
    botMessage.className = 'bot-message';
    botMessage.innerText = "Welcome to Mohammedi Makan, Please enter your room number to proceed:";
    chatBox.appendChild(botMessage);

    // Show the input again for the user to enter the room number
    document.getElementById('chatInput').style.display = 'flex';
    document.getElementById('userInput').value = '';  // Clear the input field
    document.getElementById('userInput').placeholder = "Enter room number...";  // Reset placeholder
}
