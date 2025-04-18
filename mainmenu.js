function displayMainMenu() {
    const chatBox = document.getElementById('chatBox');
    const buttonMenu = document.createElement('div');
    buttonMenu.className = 'button-menu';

    const options = [
        "Maintenance 🛠️", 
        "Room Services 🛏️", 
        "Live Chat 💬", 
        "Discover Makkah 🕋", 
        "Mansak PDF 📄", 
        "Information ℹ️", 
        "Places To Visit 🌍", 
        "Feedback ✍️"
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
enableBubbleEffectOnClick(buttons, selectMainOption);

    chatBox.appendChild(buttonMenu);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function selectMainOption(option) {
    const chatBox = document.getElementById('chatBox');
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerText = option;
    chatBox.appendChild(userMessage);

    if (option === "Maintenance 🛠️") {
        setTimeout(() => {
            displayMaintenanceMenu();
        }, 1000);
    } else if (option === "Room Services 🛏️") {
        setTimeout(() => {
            displayEmergencyMenu();
        }, 1000);
    } else if (option === "Mansak PDF 📄") {
        setTimeout(() => {
            askForMansakConfirmation();
        }, 1000);
    } else if (option === "Information ℹ️") {
        setTimeout(() => {
            displayInformationMenu();
        }, 1000);
    } else if (option === "Places To Visit 🌍") {
        setTimeout(() => {
            displayPlacesToVisit();
        }, 1000);
    } else if (option === "Feedback ✍️") {
        setTimeout(() => {
            displayFeedbackMenu();
        }, 1000);
    } else if (option === "Live Chat 💬") {
        setTimeout(() => {
            requestLiveChat();
        }, 1000);
    } else if (option === "Discover Makkah 🕋") {
        setTimeout(() => {
            discoverMecca();
        }, 1000);
    } else {
        setTimeout(() => {
            const botResponse = document.createElement('div');
            botResponse.className = 'bot-message';
            botResponse.innerText = `You selected "${option}". How can we assist you further?`;
            chatBox.appendChild(botResponse);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1000);
    }
}
