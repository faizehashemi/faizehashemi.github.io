
 // Function to get query parameters from the URL
        function getRoomNumber() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('room'); // Get the 'room' parameter
        }

        let userRoomNumber = ""; // This will store the room number from the URL

function enableBubbleEffectOnClick(buttons, callback) {
    buttons.forEach(button => {
        button.addEventListener('click', function handleClick(e) {
            const clickedButton = e.currentTarget;

            buttons.forEach(btn => {
                if (btn !== clickedButton) {
                    explodeIntoBubbles(btn);
                }
            });

            buttons.forEach(btn => btn.removeEventListener('click', handleClick));

            // Callback after bubbles animate
            setTimeout(() => {
                callback(clickedButton.innerText);
            }, 600);
        });
    });
}

function explodeIntoBubbles(button) {
    const rect = button.getBoundingClientRect();
    const bubbleCount = 30;

    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'mini-bubble';
        document.body.appendChild(bubble);
        
        const greenShades = [
          '#90ee90', // Light Green
          '#98fb98', // Pale Green
          '#f0fff0', // Honeydew
          '#66cdaa', // Medium Aquamarine
          '#b2fba5', // Soft Green
          '#00ff7f', // Spring Green
          '#32cd32', // Lime Green
          '#3cb371', // Medium Sea Green
        ];

        const chosenColor = greenShades[Math.floor(Math.random() * greenShades.length)];
        bubble.style.background = `radial-gradient(circle, white, ${chosenColor})`;


        const size = Math.random() * 6 + 4;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${rect.left + rect.width / 2}px`;
        bubble.style.top = `${rect.top + rect.height / 2}px`;



        // Mostly upward, slight sideways drift
        const dx = (Math.random() - 0.5) * 100;     // horizontal drift
        const dy = -Math.random() * 150 - 100;       // upward float

        setTimeout(() => {
            bubble.style.transform = `translate(${dx}px, ${dy}px) scale(0.7)`;
            bubble.style.opacity = 0;
        }, Math.random() * 200); // slight delay for organic look

        setTimeout(() => bubble.remove(), 2000);
    }

    button.style.opacity = 0;
    setTimeout(() => button.style.display = 'none', 300);
}

function createBubbleMenuButtons(options, container, onClickCallback) {
    const buttons = [];

    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.innerText = option;
        container.appendChild(button);
        buttons.push(button);
    });

    enableBubbleEffectOnClick(buttons, onClickCallback);
}

// Function to handle "Send" button or "Enter" key press
function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    
    if (userInput.toLowerCase() === 'hi') {
        let roomNumber = getRoomNumber();
        if (roomNumber) {
            userRoomNumber = roomNumber; // Store the room number
            startChatWithRoom(roomNumber);
        } else {
            const chatBox = document.getElementById('chatBox');
            const botResponse = document.createElement('div');
            botResponse.className = 'bot-message';
            botResponse.innerText = `Please provide your room number to proceed.`;
            chatBox.appendChild(botResponse);
        }
    }

    // Hide the chat input element
    document.getElementById("chatInput").style.display = "none";
}

        // Function to initiate the chat with the room number
        function startChatWithRoom(room) {
            const chatBox = document.getElementById('chatBox');
            const botResponse = document.createElement('div');
            botResponse.className = 'bot-message';
            botResponse.innerText = `How can we assist you?`;
            botResponse.style.fontSize = '18px'; // Increase font size
            chatBox.appendChild(botResponse);

            displayMainMenu();
        }


        // Listen for "Enter" key press to trigger sendMessage function
        document.getElementById("userInput").addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent the default "Enter" key behavior (form submission)
                sendMessage(); // Trigger sendMessage when Enter is pressed
            }
        });


