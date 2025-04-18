async function discoverMecca() {
    const chatBox = document.getElementById('chatBox');
    
    // Presenting the options for "Discover Makkah"
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = "Please select a place to discover in Makkah:";
    chatBox.appendChild(botResponse);

    const options = [
        "Maulana Abde Manaf AS", "Maulana Hashim AS", "Maulana Abu Talib AS", "Maulatona Khadija AS", 
        "Jabal al-Nour", "Jabal al-Saur", "Jabal Abi Qubais", "Mina", "Arafah", "Muzdalefah", "Maulid al-Nabi", "Masjid al Kheef"
    ];
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.innerText = option;
        button.onclick = () => handleDiscoverSelection(option);  // Handle the user's selection
        chatBox.appendChild(button);
    });

    chatBox.scrollTop = chatBox.scrollHeight;

    function handleDiscoverSelection(selection) {
        const userMessage = document.createElement('div');
        userMessage.className = 'user-message';
        userMessage.innerText = selection;
        chatBox.appendChild(userMessage);

        setTimeout(() => {
            showDiscoverImages(selection);
        }, 1000);
    }

  function showDiscoverImages(selection) {
    // Mapping of selection to image filenames
const imageMap = {
    "Jannatul Ma'ala": ["img/mala_01.png"],
    "Maulana Abde Manaf AS": ["img/am_01.png"],
    "Maulana Hashim AS": ["img/ha_01.png"],
    "Maulana Abu Talib AS": ["img/bt_01.png"],
    "Maulana Abdul Muttalib AS": ["img/at_01.png"],
    "Maulatona Khadija AS": ["img/k_01.png"],
    "Jabal al-Nour": ["img/jn_01.png"],
    "Jabal al-Saur": ["img/saur_01.png"],
    "Jabal Abi Qubais": ["img/abi_01.png"],
    "Mina": ["img/mina_01.png"],
    "Arafah": ["img/ar_01.png"],
    "Muzdalefah": ["img/mz_01.png"],
    "Maulid al-Nabi": ["img/ghar_01.png"],
    "Masjid al Kheef": ["img/mk_01.png"],
    "Jamaraat": ["img/jm_01.png"]
};


        const images = imageMap[selection];
        
        // Show the 5 images corresponding to the selected option
        images.forEach(image => {
            const imageElement = document.createElement('img');
            imageElement.className = 'image';
            imageElement.src = `${image}`;  // Make sure the path is correct
            chatBox.appendChild(imageElement);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    }
}
