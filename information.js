// Function to display Information menu
function displayInformationMenu() {
    const chatBox = document.getElementById('chatBox');

    // Display the Information options
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "<b>📢 Please select the information you need:</b>";
    chatBox.appendChild(botResponse);

    const options = ["🚍 Transport", "💰 Accounts", "🍽️ Mawaid", "🧺 Laundry", "🏢 Floor Info", "💧 Zamzam", "📶 Sim Card", "🕋 Haram Clothes"];
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.innerText = option;
        button.onclick = () => handleInformationSelection_emreq(option);
        chatBox.appendChild(button);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}


// Function to handle selection within the Information menu
function handleInformationSelection_emreq(selection) {
    const chatBox = document.getElementById('chatBox');
    
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `<b>✅ ${selection}</b>`;
    chatBox.appendChild(userMessage);

    setTimeout(() => {
        switch(selection) {
            case "🚍 Transport":
                displayTransportMenu_emreq();
                break;
            case "🍽️ Mawaid":
                sendMawaidInformation_emreq();
                break;
            case "🧺 Laundry":
                sendLaundryInformation_emreq();
                break;
            case "💰 Accounts":
                sendAccountsInformation_emreq();
                break;
            case "💧 Zamzam":
                sendZamzamInformation_emreq();
                break;
            case "📶 Sim Card":
                sendSimCardInformation_emreq();
                break;
            case "🕋 Haram Clothes":
                sendHaramClothesInformation_emreq();
                break;
            case "🏢 Floor Info":
                sendFloorInfo_emreq();
                break;
        }
    }, 1000);
}

// Function to display Transport menu
function displayTransportMenu_emreq() {
    const chatBox = document.getElementById('chatBox');
    
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "<b>🚌 Please select the transport information:</b>";
    chatBox.appendChild(botResponse);

    const options = ["🚖 Makkah Atraaf", "🛫 Madina", "✈️ Airport Departure", "🚌 Haram Bus Services" ];
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.innerText = option;
        button.onclick = () => handleTransportSelection_emreq(option);
        chatBox.appendChild(button);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle Transport selection
function handleTransportSelection_emreq(selection) {
    const chatBox = document.getElementById('chatBox');
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `<b>✅ ${selection}</b>`;
    chatBox.appendChild(userMessage);

    switch(selection) {
        case "🚖 Makkah Atraaf":
            sendMakkahAtraafInfo_emreq();
            break;
        case "🛫 Madina":
            sendMadinaDepartureInfo_emreq();
            break;
        case "✈️ Airport Departure":
            sendAirportDepartureInfo_emreq();
            break;
	case "🚌 Haram Bus Services":
            sendHaramBusServices_emreq();
            break;
    }
}

// Transport Information
function sendMakkahAtraafInfo_emreq() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "<b>🚖 Makkah Atraaf Ziyarat:</b><br> 🗓️ Your <i>Atraaf Ziyarat</i> will be on the <u>second day of your arrival</u> (subject to change). <br> 🕝 The buses will depart at <b>2:30 PM</b>. <br> 📌 Please check the <b>notice board</b> regularly for updates.";
    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMadinaDepartureInfo_emreq() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "<b>🛫 Madina Departure:</b><br> 📝 Your name will be <b>displayed on the notice board</b> one day prior. <br> 🕕 Buses will depart at <b>6:15 AM</b>. <br> 🎒 Pack <b>only essential items</b> due to space constraints. <br> 🎁 Lunch will be provided as <b>Tosha</b> in the bus.";
    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendAirportDepartureInfo_emreq() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "<b>✈️ Airport Departure:</b><br> ⏳ Departure is <b>5 hours before flight time</b>. <br> 📋 <b>Check your belongings, documents, and passport</b> before leaving. <br> 📌 Always check the <b>notice board</b> for updates.";
    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendHaramBusServices_emreq() {
const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "<b>🚌 Haram Bus Services:</b><br> 🗓️ Your <i>Haram Bus</i> schedule is as follows: <br> 🕝 Morning: <b>8:30 AM - 9:30 AM</b> from hotel to Haram, <b>12:45 PM - 1:15 PM</b> return from Haram to hotel. <br> 🕝 Night: <b>8:00 PM - 9:00 PM</b> from hotel to Haram, <b>11:30 PM - 1:00 AM</b> return from Haram to hotel. <br> 📌 Please be on time and check for any updates.";

    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;

}

// Function to display Laundry information
function sendLaundryInformation_emreq() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "<b>🧺 Laundry Options:</b><br> 💰 <b>Paid Laundry:</b> Available on the <b>LG floor</b>. Clothes returned in <b>24 hours</b>. <br> 🏠 <b>Self Laundry:</b> Available on the <b>17th floor</b>. Bring your own detergent.";
    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Similar functions for other information sections (Accounts, Mawaid, etc.)
function sendAccountsInformation_emreq() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "<strong>📜 Accounts and Checkout:</strong><br><br> You are required to <em>check out</em> <strong>24 hours prior</strong> to your departure at the <u>MP floor</u> or at <u>UG office no. 2</u> and collect your passport accordingly.";
    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMawaidInformation_emreq() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "<strong>🍽️ Mawaid Timings:</strong><br><br> Please attend the <em>mawaid</em> on the <u>PR floor</u> in <strong>Libas al-Anwar</strong> only. The timings are as follows:<br> - 🥐 <strong>Breakfast:</strong> 7:30 - 9:00 AM<br> - 🍛 <strong>Lunch:</strong> 1:30 - 2:00 PM<br> - 🍲 <strong>Dinner:</strong> 7:30 - 8:00 PM<br><br>⏰ Please be punctual and attend on time.";
    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendZamzamInformation_emreq() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "<strong💧 Zamzam Water:</strong><br><br> Zamzam water will be available for purchase at the <strong>airport only</strong> for <strong>13 SAR</strong>. <br><br>⚠️ <strong>Only one bottle per passport</strong> is allowed, subject to flight and government regulations.";
    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendSimCardInformation_emreq() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "📱 <strong>SIM Cards:</strong><br><br> SIM cards are available for purchase near the <strong>Haram</strong> with your <u>Visa ID</u> and <u>Passport ID</u>. Please carry these documents with you. <br><br>✅ <strong>STC Sim Cards</strong> are preferable due to their superior connectivity.";
    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendHaramClothesInformation_emreq() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "👕 <strong>Haram Clothes Information:</strong><br><br> Entry into the <strong>Haram</strong> is strictly allowed only in <em>ehraam</em> for men and <strong>single-color rida</strong> (❌ no laces, work, or design) for women. <br><br>🚫 <strong>Anyone not adhering to these guidelines will not be permitted entry in our transport buses.</strong>";
    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendFloorInfo_emreq() {
    const chatBox = document.getElementById('chatBox');
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerHTML = "🏢 <strong>Floor Information:</strong><br><br> 🔹 <strong>UG:</strong> Reception<br> 🔹 <strong>MP:</strong> Accounts and Sabaq<br> 🔹 <strong>DH:</strong> Mawaid<br> 🔹 <strong>PR:</strong> Mawaid<br> 🔹 <strong>17th floor:</strong> Self Laundry<br> 🔹 <strong>LG:</strong> Paid Laundry";
    chatBox.appendChild(botResponse);
    chatBox.scrollTop = chatBox.scrollHeight;
}



function displayPlacesToVisit() {
    const chatBox = document.getElementById('chatBox');

    // Display the Places options
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = "Please select the information you need:";
    chatBox.appendChild(botResponse);

    const options = ["Food", "Shopping"];
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.innerText = option;
        button.onclick = () => handlePlacesSelection(option);
        chatBox.appendChild(button);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle selection within the Places menu
function handlePlacesSelection(selection) {
    const chatBox = document.getElementById('chatBox');
    
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerText = selection;
    chatBox.appendChild(userMessage);

    setTimeout(() => {
        if (selection === "Food") {
            displayFoodOptions();
        } else if (selection === "Shopping") {
            displayShoppingOptions();
        }
    }, 1000);
}

// Function to display Food options
function displayFoodOptions() {
    const chatBox = document.getElementById('chatBox');
    const places = [
        {name: "Adam Cafe for authentic Saudi Coffee", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD/ADAM+cafe+%7C+%D9%85%D9%82%D9%87%D9%89+%D8%A2%D8%AF%D9%85,+King+Khalid+rd%D8%8C+Al+Jamiah,+Makkah+24242%E2%80%AD/"},
        {name: "Kebab Samarqand", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD/%D9%85%D8%B7%D8%B9%D9%85+%D9%83%D8%A8%D8%A7%D8%A8+%D8%B3%D9%85%D8%B1%D9%82%D9%86%D8%AF,+King+Fahd+Road,+Makkah%E2%80%AD/"},
        {name: "Romansiah Family Restaurant", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD/Al+Romansiah+Restaurant,+Al+Masjid+Al+Haram+Road,+Makkah/"},
        {name: "Turkish Divan", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD/Divan+Turkish+Restaurant,+Ibrahim+Al+Joufaili,+Makkah/"},
        {name: "Fresh Juice", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD/%D8%B9%D8%B5%D9%8A%D8%B1%D8%A7%D8%AA+%D8%AA%D8%B1%D9%83%D9%8A%D8%8C+Makkah%E2%80%AD/"},
        {name: "Pakistani Food", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD/Sargodha+Resturant,+King+Abdullah+Road,+Makkah/"}
    ];

    const botResponse1 = document.createElement('div');
    botResponse1.className = 'bot-message';
    botResponse1.innerText = "Select a restaurant to view on Google Maps:";
    chatBox.appendChild(botResponse1);

    places.forEach(place => {
        const link = document.createElement('a');
        link.href = place.url;
        link.target = "_blank";
        link.className = 'menu-button';
        link.innerText = place.name;
        chatBox.appendChild(link);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to display Shopping options
function displayShoppingOptions() {
    const chatBox = document.getElementById('chatBox');
    const places = [
        {name: "10 Riyal Mall", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD%E2%80%AD/Top+Ten,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF+%D8%A7%D9%84%D8%AD%D8%B1%D8%A7%D9%85,+Makkah%E2%80%AD/"},
        {name: "5 Riyal Mall", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD%E2%80%AD/5+Riyals,+Al+Kulliyyah+al+Mutawassitah,+Makkah/"},
        {name: "Gold Market", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD%E2%80%AD/%D8%B3%D9%88%D9%82+%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85+%D8%A7%D9%84%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A%D8%8C+Al+Kulliyyah+al+Mutawassitah,+Makkah%E2%80%AD/"},
        {name: "Mecca Mall", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD%E2%80%AD/Makkah+Mall,+King+Abdullah+Road,+Makkah/"},
        {name: "Electronics & Gadgets", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD%E2%80%AD/eXtra,+3+Ring+Road,+Makkah/"},
        {name: "Khajoor", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD%E2%80%AD/%D8%AD%D9%84%D9%82%D8%A9%D8%8C%D8%B3%D9%88%D9%82+%D8%A7%D9%84%D8%AE%D8%B6%D8%B1%D9%88%D8%A7%D8%AA+%D8%A8%D8%A7%D9%84%D8%AC%D9%85%D9%84%D8%A9+%D9%88%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D8%B9%D9%8A%D8%8C+%D8%A7%D9%84%D9%83%D8%B9%D9%83%D9%8A%D8%A9%D8%8C+Makkah%E2%80%AD/"},
        {name: "Mirza Stationery", url: "https://www.google.com/maps/dir/Mohammedi+Makan,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%A7%D9%84%D9%85%D9%84%D9%83+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D8%8C+Makkah%E2%80%AD%E2%80%AD%E2%80%AD/%D9%85%D9%83%D8%AA%D8%A8%D8%A9+%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%88%D9%87%D8%A7%D8%A8+%D9%85%D8%B1%D8%B2%D8%A7/"}
    ];

    const botResponse2 = document.createElement('div');
    botResponse2.className = 'bot-message';
    botResponse2.innerText = "Select a shopping place to view on Google Maps:";
    chatBox.appendChild(botResponse2);

    places.forEach(place => {
        const link = document.createElement('a');
        link.href = place.url;
        link.target = "_blank";
        link.className = 'menu-button';
        link.innerText = place.name;
        chatBox.appendChild(link);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}
