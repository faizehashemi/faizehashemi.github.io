// HR → the hotel library: job roles with their duties, and task templates for everything a hotel needs done — the guest-facing work and the
// back-of-house jobs nobody notices until they are missed. Titles in English and Bangla (the check-in page shows the Bangla first).
// Roles → Roles & shifts → "📚 Add from the library"; tasks → Tasks → "📚 From the library" (opens a filled-in task to assign).

export type LibRole = { dept: string; title: string; bn: string; skills: string; duties: string[] };
export type LibTask = { dept: string; title: string; bn: string; place: string; minutes: number; freq: string; photo: boolean; priority: 'high' | 'normal' | 'low'; steps: string[] };

export const DEPTS: [string, string, string][] = [
    ['hk', '🛏️ Housekeeping', 'হাউসকিপিং'], ['pa', '🧹 Public areas', 'পাবলিক এলাকা'], ['ln', '🧺 Linen & laundry', 'লিনেন ও লন্ড্রি'], ['fb', '🍽️ Food & beverage (Mawaid)', 'খাবার ও পানীয়'],
    ['ks', '🍳 Kitchen & stewarding', 'রান্নাঘর'], ['bd', '🛎️ Bell desk & lobby', 'বেল ডেস্ক'], ['lu', '📦 Loading & unloading', 'মাল ওঠানো-নামানো'], ['st', '🗄️ Stores & supplies', 'স্টোর'],
    ['mt', '🔧 Maintenance', 'রক্ষণাবেক্ষণ'], ['sf', '🛡️ Security & safety', 'নিরাপত্তা'], ['bo', '🕳️ Back of house (unseen jobs)', 'পেছনের কাজ'], ['tr', '🚌 Transport support', 'যানবাহন সহায়তা'], ['pr', '🕌 Prayer & wudu areas', 'নামাজ ও ওজুর স্থান'],
];

const R = (dept: string, title: string, bn: string, skills: string, duties: string) => ({ dept, title, bn, skills, duties: duties.split('|').map(s => s.trim()).filter(Boolean) });
export const ROLES: LibRole[] = [
    // housekeeping
    R('hk', 'Room attendant', 'রুম অ্যাটেনডেন্ট', 'Bed making, bathroom cleaning, chemical safety', 'Collect the room list and keys from the supervisor|Knock, say "Housekeeping", wait, then enter|Open curtains and windows to air the room|Strip used linen, count it, bag it|Make beds tight with fresh linen (corners folded)|Empty and wash bins, put new liners|Dust all surfaces top to bottom|Clean mirror and glass streak-free|Clean and disinfect toilet, basin, shower, floor|Refill soap, tissue, shampoo, water bottles|Vacuum / mop the floor, last from the far corner to the door|Check lights, AC, TV, taps — report anything broken|Report lost & found items at once|Mark the room done on the room list'),
    R('hk', 'Floor supervisor', 'ফ্লোর সুপারভাইজার', 'Inspection, team handling, reporting', 'Give out room lists, keys and trolleys at shift start|Inspect every cleaned room against the checklist|Send back rooms that fail, with the reason|Check corridors, service rooms and trolleys|Report maintenance faults the same hour|Collect lost & found and register it in the PMS|Count linen in and out with the linen room|Hand over open rooms and problems to the next shift'),
    R('hk', 'Turndown / night housekeeper', 'রাতের হাউসকিপার', 'Quiet work, guest requests', 'Answer guest requests for towels, blankets, water|Refill corridor water and tissue stations|Clean lobby toilets every 2 hours|Clear room-service trays from corridors|Report noise, smells or leaks'),
    R('hk', 'Deep-cleaning team', 'গভীর পরিষ্কার দল', 'Machines, chemicals, working at height', 'Wash carpets and mattresses by schedule|Descale showers and taps|Clean behind and under beds and furniture|Wash curtains and blackout linings|Clean AC grills and vents|Polish wood and metal fittings'),
    // public areas
    R('pa', 'Public area cleaner', 'পাবলিক এলাকা ক্লিনার', 'Floor care, toilet hygiene', 'Mop the lobby and entrance every 2 hours|Clean public toilets and fill the checklist on the door|Clean lift cars, buttons and mirrors|Wipe handrails, door handles and push plates|Empty lobby bins and ashtrays|Clean the glass doors and windows|Put up wet-floor signs while mopping'),
    R('pa', 'Lift & stairwell cleaner', 'লিফট ও সিঁড়ি ক্লিনার', 'Floor care', 'Sweep and mop every staircase top to bottom|Wipe handrails|Clean lift floors, walls and buttons|Check stair lights and emergency signs|Clear anything blocking fire exits'),
    // linen
    R('ln', 'Linen room attendant', 'লিনেন রুম অ্যাটেনডেন্ট', 'Counting, stock, records', 'Issue clean linen to floors against the list|Count soiled linen in from each floor|Separate torn and stained pieces|Send linen to laundry with a count sheet|Count clean linen back from laundry|Keep par stock (3 sets per bed)|Report shortages to the supervisor'),
    R('ln', 'Laundry attendant', 'লন্ড্রি অ্যাটেনডেন্ট', 'Machines, stain removal, folding', 'Sort by colour and fabric|Pre-treat stains|Load machines to the right weight|Dry and fold to the hotel standard|Iron guest clothes carefully|Clean lint filters after every load|Log every guest bag in and out'),
    // F&B
    R('fb', 'Mawaid server', 'মাওয়াইদ সার্ভার', 'Serving, hygiene, polite manner', 'Wash hands, wear cap and gloves|Lay the safra / thaal places|Bring food out in order|Refill water and bread|Clear empty dishes promptly|Wipe and sweep the hall after each meal|Report numbers short or over to the supervisor'),
    R('fb', 'Buffet / thaal runner', 'থাল রানার', 'Speed, hygiene', 'Carry thaals from kitchen to hall|Keep hot food covered|Bring back empty thaals and dishes|Keep the pass clean'),
    R('fb', 'Tea & coffee attendant', 'চা-কফি অ্যাটেনডেন্ট', 'Hot drinks, hygiene', 'Prepare tea and coffee to timetable|Keep the tea counter clean|Refill cups, sugar, milk|Wash flasks at the end of the day'),
    // kitchen
    R('ks', 'Kitchen helper', 'রান্নাঘর সহকারী', 'Cutting, cleaning, hygiene', 'Wash, peel and cut vegetables|Clean rice and lentils|Carry stores to the kitchen|Keep work tables clean|Take out kitchen waste|Clean the floor at end of shift'),
    R('ks', 'Steward / dishwasher', 'ডিশওয়াশার', 'Dishwashing, chemicals', 'Scrape and soak dishes|Wash, rinse, sanitise, air-dry|Wash pots and pans|Stack clean dishes by type|Clean the dishwashing area and drains|Change dish-machine water by the schedule'),
    R('ks', 'Store keeper (food)', 'খাদ্য স্টোরকিপার', 'Counting, FIFO, records', 'Receive deliveries and check weight and quality|Store first-in-first-out|Check expiry dates daily|Log fridge and freezer temperatures|Issue stock to the kitchen against requests|Count stock weekly'),
    // bell desk
    R('bd', 'Bellboy / porter', 'বেলবয় / পোর্টার', 'Lifting safely, politeness', 'Greet arriving groups at the door|Tag every bag with the room number|Take luggage up to rooms|Bring luggage down on departure, in time for the bus|Keep trolleys clean and ready|Help elderly guests to the lift'),
    R('bd', 'Doorman', 'ডোরম্যান', 'Politeness, watching the entrance', 'Open doors and greet guests|Keep the entrance clear of bags and trolleys|Call porters when a bus arrives|Stop strangers and ask whom they are visiting'),
    R('bd', 'Luggage room attendant', 'লাগেজ রুম অ্যাটেনডেন্ট', 'Records, careful handling', 'Take stored luggage with a numbered tag|Give the guest the matching ticket|Keep the room locked and tidy|Hand back only against the ticket|Count bags at shift change'),
    // loading
    R('lu', 'Bus luggage loader', 'বাস লাগেজ লোডার', 'Lifting safely, counting', 'Line up luggage by group before the bus|Count bags against the group list|Load heavy bags first, fragile on top|Close and check the luggage door|Unload on arrival and count again|Report missing or damaged bags'),
    R('lu', 'Delivery loader', 'ডেলিভারি লোডার', 'Lifting, trolley use', 'Unload supplier trucks at the back gate|Check the count against the delivery note|Move goods to the right store at once|Keep the loading bay clear and swept'),
    // stores
    R('st', 'General store keeper', 'স্টোরকিপার', 'Stock control, records', 'Issue amenities, chemicals and supplies against requests|Keep a bin card for every item|Reorder at minimum level|Count stock weekly|Keep chemicals apart from food'),
    // maintenance
    R('mt', 'Maintenance technician', 'মেইনটেন্যান্স টেকনিশিয়ান', 'Electrical, plumbing basics', 'Attend fault tickets in order of urgency|Fix taps, flush, drains, bulbs, sockets|Check AC units and clean filters|Report big faults to the engineer|Close every ticket with what was done'),
    R('mt', 'Plumber helper', 'প্লাম্বার সহকারী', 'Plumbing', 'Unblock drains and toilets|Fix leaking taps and pipes|Check water heaters|Check water pressure on top floors'),
    R('mt', 'AC technician helper', 'এসি টেকনিশিয়ান সহকারী', 'HVAC basics', 'Clean AC filters by schedule|Check drain lines for leaks|Check room temperature complaints|Report noisy or warm units'),
    // security
    R('sf', 'Security guard', 'নিরাপত্তা প্রহরী', 'Watching, reporting, politeness', 'Check people and goods at the gate|Patrol all floors every 2 hours|Check fire exits are clear and closed|Lock and check service doors at night|Write every incident in the log|Hand over the log to the next shift'),
    R('sf', 'Fire safety checker', 'অগ্নি নিরাপত্তা পরিদর্শক', 'Fire equipment', 'Check extinguishers (pressure, seal, date)|Check hose reels and fire doors|Test emergency lights|Keep fire exits clear|Report anything blocked or broken'),
    // back of house
    R('bo', 'Waste & garbage handler', 'আবর্জনা ব্যবস্থাপক', 'Hygiene, heavy lifting', 'Collect garbage from every floor|Separate cardboard and plastic|Wash bins and the garbage room|Spray disinfectant and insecticide|Keep the garbage room door closed'),
    R('bo', 'Water & tanks attendant', 'পানির ট্যাংক অ্যাটেনডেন্ট', 'Pumps, tanks', 'Check tank levels morning and evening|Check pumps and pressure|Log water meter readings|Refill drinking-water dispensers|Report leaks at once'),
    R('bo', 'Pest control coordinator', 'কীটপতঙ্গ নিয়ন্ত্রণ', 'Safe chemical use', 'Check traps and bait stations weekly|Spray drains and garbage areas|Record every sighting with room and date|Call the pest company when needed'),
    // transport support
    R('tr', 'Transport coordinator helper', 'পরিবহন সহকারী', 'Lists, counting people', 'Read the bus list for the day|Call groups 30 minutes before the bus|Count people boarding against the list|Tell the desk who is missing|Help with luggage at the bus'),
    // prayer
    R('pr', 'Prayer & wudu area attendant', 'নামাজ ও ওজুখানা অ্যাটেনডেন্ট', 'Cleaning, care', 'Clean the wudu area before every namaz|Dry the floor, put mats down|Arrange prayer mats and musallas|Refill water, tissues, soap|Arrange shoe racks|Report leaks or broken taps'),
];

const T = (dept: string, title: string, bn: string, place: string, minutes: number, freq: string, photo: boolean, steps: string, priority: 'high' | 'normal' | 'low' = 'normal'): LibTask =>
    ({ dept, title, bn, place, minutes, freq, photo, priority, steps: steps.split('|').map(s => s.trim()).filter(Boolean) });
export const TASKS: LibTask[] = [
    // ---------- housekeeping ----------
    T('hk', 'Clean a check-out room', 'চেকআউট রুম পরিষ্কার', 'Rooms on the list', 35, 'per room', true, 'Strip all linen and count it|Empty bins, take out rubbish|Dust top to bottom|Clean and disinfect the bathroom|Make beds with fresh linen|Refill amenities and water|Mop the floor|Check AC, lights, TV, taps|Photo of the finished room', 'high'),
    T('hk', 'Service an occupied room', 'রুম সার্ভিস (অতিথি আছেন)', 'Rooms on the list', 20, 'daily', false, 'Knock and announce|Make beds (change linen if asked)|Empty bins|Clean the bathroom|Refill tissue, soap, water|Do not move the guests\' belongings'),
    T('hk', 'Prepare rooms for an arriving group', 'আগত গ্রুপের রুম প্রস্তুত', 'Rooms for today\'s check-ins', 15, 'per arrival', true, 'Check the room is clean and smells fresh|Set AC to 22°C 30 minutes before|Put welcome water and dates|Check towels: 1 big + 1 small per guest|Check the key card works', 'high'),
    T('hk', 'Turn down rooms on request', 'টার্নডাউন সার্ভিস', 'Rooms that asked', 10, 'evening', false, 'Fold back the bed cover|Close curtains|Empty bins|Leave fresh water'),
    T('hk', 'Change all bed linen (occupied rooms, every 3 days)', 'বিছানার চাদর বদল', 'Every occupied room', 15, 'every 3 days', false, 'Change sheets and pillow covers|Count used linen to the linen room'),
    T('hk', 'Flip and rotate mattresses', 'ম্যাট্রেস উল্টানো', 'Rooms on the deep-clean list', 10, 'monthly', false, 'Flip head-to-foot and top-to-bottom|Check for stains or bugs|Report damaged mattresses', 'low'),
    T('hk', 'Clean under and behind beds', 'খাটের নিচে পরিষ্কার', 'Rooms on the deep-clean list', 20, 'weekly', true, 'Move the bed out|Vacuum and mop underneath|Wipe the headboard and frame|Put the bed back straight'),
    T('hk', 'Descale shower heads and taps', 'শাওয়ার ও কল পরিষ্কার', 'Bathrooms on the list', 15, 'monthly', false, 'Soak shower heads in descaler|Scrub taps and drains|Rinse and wipe dry'),
    T('hk', 'Clean AC grills in rooms', 'রুমের এসি গ্রিল পরিষ্কার', 'Rooms on the list', 10, 'monthly', true, 'Switch AC off|Remove and wash the grill|Dry and refit|Switch on and check airflow'),
    T('hk', 'Wash curtains', 'পর্দা ধোয়া', 'Floor on the schedule', 30, 'every 3 months', false, 'Take curtains down carefully|Send to laundry with the room number|Rehang straight', 'low'),
    T('hk', 'Check every room for maintenance faults', 'রুমের ত্রুটি পরীক্ষা', 'All vacant rooms', 5, 'weekly', false, 'Lights, sockets, AC, TV|Taps, flush, drains, shower|Door lock, safe, curtains|Write faults on the maintenance list'),
    T('hk', 'Sweep for lost & found in vacated rooms', 'হারানো জিনিস খোঁজা', 'Rooms just checked out', 3, 'per room', false, 'Look under beds, in drawers, cupboard, safe, bathroom|Hand anything found to the supervisor|Register it in the PMS Lost & Found'),
    T('hk', 'Restock housekeeping trolleys', 'ট্রলি পূরণ', 'Service rooms', 15, 'every shift', false, 'Linen, towels, amenities to par|Chemicals labelled and closed|Bags, gloves, cloths|Trolley wiped clean'),
    T('hk', 'Clean the floor service room', 'সার্ভিস রুম পরিষ্কার', 'Each floor', 15, 'daily', false, 'Tidy shelves|Mop the floor|Empty the soiled linen bag|Nothing on the floor'),
    // ---------- public areas ----------
    T('pa', 'Mop the lobby and entrance', 'লবি মোছা', 'Lobby', 20, 'every 2 hours', false, 'Wet-floor sign out|Sweep then mop|Dry the entrance mat area|Sign back in'),
    T('pa', 'Clean public toilets', 'পাবলিক টয়লেট পরিষ্কার', 'Lobby / Mawaid toilets', 15, 'every 2 hours', true, 'Flush and clean toilets and urinals|Clean basins and mirrors|Refill soap and tissue|Mop the floor|Sign the checklist on the door', 'high'),
    T('pa', 'Clean all lift cars', 'লিফট পরিষ্কার', 'All lifts', 20, 'twice a day', false, 'Wipe buttons inside and outside|Clean mirrors and walls|Mop the floor|Clean the door tracks'),
    T('pa', 'Clean staircases top to bottom', 'সিঁড়ি পরিষ্কার', 'All staircases', 45, 'daily', false, 'Sweep and mop every flight|Wipe handrails|Clear anything left on the stairs|Report broken lights'),
    T('pa', 'Wipe door handles, handrails and lift buttons (disinfect)', 'হাতল জীবাণুমুক্ত', 'Lobby, lifts, corridors', 20, 'every 3 hours', false, 'Use disinfectant on a cloth|Handles, push plates, rails, buttons|Change the cloth often'),
    T('pa', 'Clean entrance glass doors and windows', 'কাঁচের দরজা পরিষ্কার', 'Entrance', 20, 'daily', false, 'Spray and squeegee|Wipe the frames|No streaks'),
    T('pa', 'Vacuum corridors', 'করিডোর ভ্যাকুয়াম', 'All corridors', 30, 'daily', false, 'Vacuum carpets edge to edge|Pick up rubbish|Straighten anything out of place'),
    T('pa', 'Clean corridor walls and skirting', 'করিডোর দেয়াল পরিষ্কার', 'Floor on the schedule', 30, 'weekly', false, 'Wipe marks off walls|Wipe skirting boards|Clean room door frames', 'low'),
    // ---------- linen ----------
    T('ln', 'Count soiled linen from each floor', 'ময়লা লিনেন গোনা', 'Linen room', 20, 'daily', false, 'Count by type: sheets, pillow covers, towels|Write per floor|Separate torn and stained'),
    T('ln', 'Send linen to laundry with count sheet', 'লন্ড্রিতে লিনেন পাঠানো', 'Linen room', 15, 'daily', false, 'Bag by type|Fill the count sheet|Get it signed by the laundry'),
    T('ln', 'Count clean linen back and check quality', 'পরিষ্কার লিনেন গোনা', 'Linen room', 20, 'daily', false, 'Count against the sheet sent|Return stained pieces for rewash|Fold and shelve by type'),
    T('ln', 'Weekly linen stock count (par)', 'সাপ্তাহিক লিনেন গণনা', 'Linen room + floors', 60, 'weekly', true, 'Count everything in store, floors and laundry|Compare with par (3 sets per bed)|Report shortage to the supervisor'),
    T('ln', 'Clean laundry machine lint filters', 'লন্ড্রি মেশিনের লিন্ট পরিষ্কার', 'Laundry', 5, 'every load', false, 'Switch off|Remove lint|Wipe the door seal', 'high'),
    T('ln', 'Descale and clean washing machines', 'ওয়াশিং মেশিন পরিষ্কার', 'Laundry', 30, 'weekly', false, 'Run an empty hot wash with descaler|Clean the detergent drawer|Wipe the drum and seals', 'low'),
    // ---------- F&B ----------
    T('fb', 'Lay the Mawaid hall for lunch', 'দুপুরের খাবারের হল প্রস্তুত', 'Mawaid hall', 45, 'daily', true, 'Sweep and mop the floor|Lay safras in straight rows|Place water, glasses, tissues|Check the count with the supervisor', 'high'),
    T('fb', 'Lay the Mawaid hall for dinner', 'রাতের খাবারের হল প্রস্তুত', 'Mawaid hall', 45, 'daily', true, 'Sweep and mop the floor|Lay safras in straight rows|Place water, glasses, tissues|Check the count with the supervisor', 'high'),
    T('fb', 'Set breakfast', 'নাশতা প্রস্তুত', 'Mawaid hall', 30, 'daily', false, 'Lay tables|Tea, coffee, milk ready|Bread, butter, jam out|Keep hot food covered'),
    T('fb', 'Clear and clean the hall after the meal', 'খাবারের পর হল পরিষ্কার', 'Mawaid hall', 40, 'after each meal', true, 'Collect all thaals and dishes|Shake and fold safras|Sweep and mop|Empty bins'),
    T('fb', 'Wash and stack thaals', 'থাল ধোয়া', 'Dish area', 45, 'after each meal', false, 'Scrape and soak|Wash, rinse, sanitise|Dry and stack|Count against the issue'),
    T('fb', 'Refill water dispensers and coolers', 'পানির ডিসপেন্সার পূরণ', 'Halls, corridors, lobby', 20, 'every 3 hours', false, 'Change empty bottles|Wipe the tap and tray|Check cups are stocked'),
    T('fb', 'Tea round', 'চা পরিবেশন', 'Lobby / hall', 30, 'twice a day', false, 'Prepare tea and coffee|Serve to the lobby|Collect cups after'),
    T('fb', 'Count heads at the meal (for thaal planning)', 'খাবারে উপস্থিতি গণনা', 'Mawaid hall', 15, 'each meal', false, 'Count guests seated per row|Write the number with time|Tell the supervisor'),
    // ---------- kitchen ----------
    T('ks', 'Wash and cut vegetables', 'সবজি ধোয়া ও কাটা', 'Kitchen prep area', 60, 'daily', false, 'Wash under running water|Peel and cut to the chef\'s size|Cover and keep cold'),
    T('ks', 'Clean rice and lentils', 'চাল-ডাল বাছাই', 'Kitchen', 30, 'daily', false, 'Pick out stones|Wash three times|Soak as the chef says'),
    T('ks', 'Log fridge and freezer temperatures', 'ফ্রিজের তাপমাত্রা লেখা', 'Kitchen cold rooms', 5, 'twice a day', true, 'Read every fridge and freezer|Fridge 0–5°C, freezer -18°C or colder|Write the time and reading|Report anything out of range', 'high'),
    T('ks', 'Check expiry dates in fridges and stores', 'মেয়াদ পরীক্ষা', 'Kitchen + food store', 20, 'daily', false, 'Check every item\'s date|Use oldest first|Throw out expired items and write them down', 'high'),
    T('ks', 'Deep clean the kitchen floor and drains', 'রান্নাঘরের মেঝে ও ড্রেন পরিষ্কার', 'Kitchen', 45, 'daily', false, 'Move mobile equipment|Scrub floor with degreaser|Lift and clean drain covers|Rinse and squeegee dry'),
    T('ks', 'Clean the exhaust hood and filters', 'এক্সহস্ট হুড পরিষ্কার', 'Kitchen', 60, 'weekly', true, 'Cooking off and cool|Remove filters and soak in degreaser|Wipe the hood inside and out|Refit dry filters'),
    T('ks', 'Empty and clean the grease trap', 'গ্রিজ ট্র্যাপ পরিষ্কার', 'Kitchen drain', 45, 'weekly', true, 'Open the trap|Scoop out fat into a sealed bag|Scrub the walls|Close and record', 'high'),
    T('ks', 'Change dishwasher water and clean the machine', 'ডিশওয়াশার পরিষ্কার', 'Dish area', 20, 'every shift', false, 'Drain the tank|Clean filters and arms|Refill and heat|Check chemicals'),
    T('ks', 'Take out kitchen waste and wash bins', 'রান্নাঘরের বর্জ্য ফেলা', 'Kitchen', 20, 'after each meal', false, 'Tie and take bags to the garbage room|Wash bins|New liners'),
    T('ks', 'Clean gas burners and check for gas smell', 'গ্যাস বার্নার পরিষ্কার', 'Kitchen', 20, 'daily', false, 'Burners off and cool|Clean burner heads|Check hoses for cracks|Report any gas smell at once', 'high'),
    // ---------- bell desk ----------
    T('bd', 'Receive an arriving bus — luggage to rooms', 'আগত বাস — লাগেজ রুমে', 'Entrance → rooms', 60, 'per arrival', true, 'Be at the door before the bus|Count bags off the bus|Tag each bag with the room number|Take bags up within 30 minutes|Report bags with no name', 'high'),
    T('bd', 'Bring departing luggage down for the bus', 'বিদায়ী লাগেজ নামানো', 'Rooms → entrance', 45, 'per departure', true, 'Collect bags from rooms 1 hour before the bus|Count per group|Line up at the entrance|Hand over to the bus loader', 'high'),
    T('bd', 'Luggage room count', 'লাগেজ রুম গণনা', 'Luggage room', 15, 'every shift', false, 'Count all stored bags|Match tags with tickets|Report any extra or missing'),
    T('bd', 'Clean and check luggage trolleys', 'লাগেজ ট্রলি পরিষ্কার', 'Bell desk', 15, 'daily', false, 'Wipe frames|Check wheels roll freely|Report broken trolleys'),
    T('bd', 'Help elderly / wheelchair guests', 'বয়স্কদের সাহায্য', 'Lobby / lifts', 15, 'on request', false, 'Bring the wheelchair|Help to the lift and room|Tell the desk when done'),
    T('bd', 'Keep the entrance clear', 'প্রবেশপথ পরিষ্কার রাখা', 'Entrance', 10, 'every hour', false, 'Move bags and trolleys inside|Sweep the steps|Report anything blocking the door'),
    // ---------- loading ----------
    T('lu', 'Load luggage onto the departure bus', 'বাসে লাগেজ তোলা', 'Bus bay', 30, 'per bus', true, 'Count bags against the list|Heavy first, fragile on top|Close and lock the hold|Tell the coordinator the count', 'high'),
    T('lu', 'Unload luggage from an arrival bus', 'বাস থেকে লাগেজ নামানো', 'Bus bay', 30, 'per bus', false, 'Line bags by group|Count against the list|Report damaged bags'),
    T('lu', 'Unload a supplier delivery', 'সরবরাহ নামানো', 'Back gate', 30, 'per delivery', true, 'Check the count with the delivery note|Check damage|Move to the store at once|Get the note signed'),
    T('lu', 'Move water cartons to the floors', 'পানির কার্টন বিতরণ', 'Store → each floor', 45, 'daily', false, 'Count cartons per floor|Use the trolley, not your back|Stack in the service room'),
    T('lu', 'Sweep and wash the loading bay', 'লোডিং বে পরিষ্কার', 'Back gate', 20, 'daily', false, 'Sweep|Wash with water|Clear cardboard to recycling'),
    // ---------- stores ----------
    T('st', 'Issue amenities and supplies to floors', 'ফ্লোরে সামগ্রী বিতরণ', 'Store', 30, 'daily', false, 'Check the request|Issue and write it on the bin card|Get the receiver to sign'),
    T('st', 'Weekly stock count', 'সাপ্তাহিক স্টক গণনা', 'All stores', 90, 'weekly', true, 'Count every item|Match with bin cards|List items below minimum'),
    T('st', 'Check chemical labels and storage', 'রাসায়নিক পরীক্ষা', 'Chemical store', 15, 'weekly', false, 'Every bottle labelled|Lids closed|Away from food|Gloves available'),
    T('st', 'Key card stock count', 'কি-কার্ড গণনা', 'Front office store', 10, 'daily', false, 'Count blank key cards|Count returned cards|Report low stock'),
    // ---------- maintenance ----------
    T('mt', 'Clean AC filters (corridors & public areas)', 'এসি ফিল্টার পরিষ্কার', 'Corridors, halls', 60, 'every 2 weeks', true, 'Switch off|Remove and wash filters|Dry and refit|Note units that drip or are noisy'),
    T('mt', 'Check and replace burnt bulbs', 'বাল্ব বদল', 'All floors', 30, 'daily', false, 'Walk every corridor and stair|Replace burnt bulbs|Report fittings that spark'),
    T('mt', 'Check water heaters', 'ওয়াটার হিটার পরীক্ষা', 'Plant room / rooms on the list', 30, 'weekly', false, 'Check temperature and leaks|Check the safety valve|Report rust or noise'),
    T('mt', 'Unblock drains and toilets on request', 'ড্রেন খোলা', 'As reported', 20, 'on request', false, 'Use the plunger / spring|Clean up after|Close the ticket'),
    T('mt', 'Check generator and fuel', 'জেনারেটর ও জ্বালানি পরীক্ষা', 'Generator room', 15, 'weekly', true, 'Read fuel level|Check oil and coolant|Run test for 10 minutes|Write the log'),
    T('mt', 'Check water pumps and pressure', 'পানির পাম্প পরীক্ষা', 'Pump room', 15, 'daily', false, 'Listen for noise|Read pressure|Check for leaks|Write the log'),
    T('mt', 'Paint touch-ups', 'রং মেরামত', 'Rooms / corridors on the list', 60, 'weekly', false, 'Fill marks and holes|Paint the same colour|Clean up after', 'low'),
    T('mt', 'Check door locks and closers', 'দরজার তালা পরীক্ষা', 'All floors', 45, 'weekly', false, 'Every room door closes by itself|Lock works with the card|Fire doors close fully'),
    // ---------- security ----------
    T('sf', 'Patrol all floors', 'সব ফ্লোর টহল', 'All floors, stairs, roof', 30, 'every 2 hours', false, 'Walk every corridor and stair|Check fire exits closed and clear|Check roof door locked|Write the time in the patrol log', 'high'),
    T('sf', 'Check fire extinguishers', 'অগ্নিনির্বাপক পরীক্ষা', 'All floors', 45, 'monthly', true, 'Pressure needle in green|Seal and pin in place|Date not expired|Report missing ones', 'high'),
    T('sf', 'Test emergency lights and exit signs', 'জরুরি বাতি পরীক্ষা', 'Stairs, corridors', 30, 'monthly', false, 'Press test button|Check exit signs lit|Report failures'),
    T('sf', 'Lock and check service doors at night', 'রাতে সার্ভিস দরজা বন্ধ', 'Back gate, stores, roof', 20, 'nightly', false, 'Lock each door|Pull to check|Write in the log'),
    T('sf', 'Gate check of goods going out', 'বাইরে যাওয়া মালামাল পরীক্ষা', 'Back gate', 10, 'every shift', false, 'Check gate pass for any hotel goods leaving|Note vehicle number|Report anything without a pass'),
    // ---------- back of house ----------
    T('bo', 'Collect garbage from all floors', 'সব ফ্লোরের ময়লা সংগ্রহ', 'All floors → garbage room', 45, 'twice a day', false, 'Collect from every service room|Separate cardboard and plastic|Take to the garbage room'),
    T('bo', 'Wash the garbage room and bins', 'আবর্জনা ঘর ধোয়া', 'Garbage room', 30, 'daily', true, 'Empty to the municipal bin|Wash floor and bins|Spray disinfectant and insecticide|Close the door', 'high'),
    T('bo', 'Check water tank levels', 'পানির ট্যাংক পরীক্ষা', 'Roof / basement tanks', 15, 'twice a day', false, 'Read the level|Order water if below half|Check for leaks'),
    T('bo', 'Clean water tanks (with contractor)', 'পানির ট্যাংক পরিষ্কার', 'Roof tanks', 240, 'every 3 months', true, 'Plan with the contractor|Empty, scrub, disinfect|Refill and test|Keep the certificate', 'low'),
    T('bo', 'Change drinking-water filters', 'পানির ফিল্টার বদল', 'Dispensers / RO unit', 30, 'monthly', true, 'Switch off|Change cartridges|Flush|Write the date on the unit'),
    T('bo', 'Clean floor drains and gully traps', 'ফ্লোর ড্রেন পরিষ্কার', 'Bathrooms, kitchen, roof', 45, 'weekly', false, 'Lift covers|Remove hair and dirt|Pour hot water and cleaner|Refit covers'),
    T('bo', 'Clean the roof and check for leaks', 'ছাদ পরিষ্কার ও লিক পরীক্ষা', 'Roof', 45, 'weekly', true, 'Sweep the roof|Clear drain outlets|Check for cracks and water pooling|Lock the roof door'),
    T('bo', 'Pest control round (traps and bait)', 'কীটপতঙ্গ নিয়ন্ত্রণ', 'Kitchen, stores, garbage room', 30, 'weekly', true, 'Check every trap and bait station|Replace bait|Write sightings with place|Spray drains'),
    T('bo', 'Fogging against mosquitoes', 'মশার ফগিং', 'Outside, garbage, drains', 30, 'weekly', false, 'Wear mask and gloves|Fog drains and corners|Keep guests away while fogging', 'low'),
    T('bo', 'Clean behind kitchen equipment', 'রান্নাঘরের সরঞ্জামের পেছন পরিষ্কার', 'Kitchen', 60, 'weekly', false, 'Pull out fridges and tables|Scrub floor and walls behind|Push back level'),
    T('bo', 'Clean the staff room and staff toilets', 'স্টাফ রুম পরিষ্কার', 'Staff areas', 30, 'daily', false, 'Sweep and mop|Clean toilets|Empty bins'),
    T('bo', 'Wipe signage and notice boards', 'সাইনবোর্ড পরিষ্কার', 'Lobby, corridors, lifts', 20, 'weekly', false, 'Dust and wipe signs|Remove old notices|Straighten frames', 'low'),
    T('bo', 'Check exhaust fans in bathrooms and corridors', 'এক্সহস্ট ফ্যান পরীক্ষা', 'All floors', 30, 'monthly', false, 'Switch on|Check it pulls air|Clean the cover|Report noisy fans', 'low'),
    // ---------- transport support ----------
    T('tr', 'Call groups for the bus 30 minutes before', 'বাসের জন্য গ্রুপ ডাকা', 'Lobby / rooms', 20, 'per bus', false, 'Read the bus list|Call or knock each group|Tell the desk who is late', 'high'),
    T('tr', 'Count people boarding the bus', 'বাসে যাত্রী গণনা', 'Bus bay', 15, 'per bus', false, 'Count heads against the list|Tell the desk the number|Report anyone missing', 'high'),
    T('tr', 'Load tosha (travel food) onto the bus', 'বাসে খাবার তোলা', 'Bus bay', 15, 'per bus', false, 'Count packets per bus|Load before the guests board|Get the driver to confirm'),
    // ---------- prayer ----------
    T('pr', 'Clean the wudu area before namaz', 'নামাজের আগে ওজুখানা পরিষ্কার', 'Wudu area', 15, '5 times a day', false, 'Wash and squeegee the floor|Wipe taps and seats|Refill soap and tissues|Dry mats down', 'high'),
    T('pr', 'Arrange prayer mats and musallas', 'জায়নামাজ সাজানো', 'Prayer hall', 15, '5 times a day', false, 'Straight rows facing the qibla|Fold used mats|Vacuum the carpet once a day'),
    T('pr', 'Arrange shoe racks', 'জুতার র‍্যাক সাজানো', 'Prayer hall entrance', 10, '5 times a day', false, 'Put shoes on racks|Clear the doorway|Wipe the racks once a day', 'low'),
];
