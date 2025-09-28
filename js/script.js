
// This function runs when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const isHomePage = document.getElementById('deity-grid');
    const isDeityPage = document.getElementById('text-list');

    // Load deity data JSON first, then populate pages accordingly
    fetch('deityData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not fetch deityData.json");
            }
            return response.json();
        })
        .then(deityData => {
            if (isHomePage) {
                populateHomePage(deityData);
            }
            if (isDeityPage) {
                populateDeityPage(deityData);
            }
        })
        .catch(error => {
            console.error("Error loading deity data:", error);
        });

    // --- Daily Quote Logic ---
    fetch('quotes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(quotes => {
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
            const quoteIndex = dayOfYear % quotes.length;
            const quoteElement = document.getElementById('daily-quote');
            const meaningElement = document.getElementById('quote-meaning');
            
            if (quoteElement && meaningElement) {
                quoteElement.innerText = `"${quotes[quoteIndex].quote}"`;
                meaningElement.innerText = quotes[quoteIndex].meaning;
            }
        })
        .catch(error => {
            console.error("Could not fetch quotes:", error);
            const quoteElement = document.getElementById('daily-quote');
            if (quoteElement) {
                quoteElement.innerText = "आज का विचार लोड नहीं हो सका।";
            }
        });

    // Set the current year in the footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Function to create and display deity cards on the homepage
function populateHomePage(deityData) {
    const grid = document.getElementById('deity-grid');
    if (!grid) return;

    for (const key in deityData) {
        const deity = deityData[key];
        const card = document.createElement('a');
        card.href = `deity.html?deity=${key}`;
        card.className = 'deity-card';
        card.innerHTML = `
            <h3>${deity.name}</h3>
            <p>${deity.description}</p>
        `;
        grid.appendChild(card);
    }
}

// Function to populate the deity page with its specific list of texts
function populateDeityPage(deityData) {
    const params = new URLSearchParams(window.location.search);
    const deityKey = params.get('deity');

    if (!deityKey || !deityData[deityKey]) {
        window.location.href = 'index.html'; // Redirect if deity not found
        return;
    }

    const deity = deityData[deityKey];

    // Set page titles and headings
    document.title = `${deity.name} - दिव्य गीत`;
    document.getElementById('deity-name-heading').textContent = deity.name;
    document.getElementById('deity-description').textContent = deity.description;

    const textList = document.getElementById('text-list');
    textList.innerHTML = ''; // Clear any existing list items

    // Create the list of texts on the left
    deity.texts.forEach((text) => {
        const listItem = document.createElement('li');
        listItem.textContent = text.title;
        listItem.dataset.file = text.file; // Store filename in data attribute
        listItem.dataset.key = deityKey;    // Store deity key

        // Add click event listener to each list item
        listItem.addEventListener('click', () => {
            loadTextContent(listItem);
        });
        textList.appendChild(listItem);
    });
}

// Function to fetch and display the content of a selected text
async function loadTextContent(listItem) {
    const fileName = listItem.dataset.file;
    const deityKey = listItem.dataset.key;
    const contentDisplay = document.getElementById('content-display');
    const textTitle = document.getElementById('text-title');

    // Visually mark the active item
    document.querySelectorAll('#text-list li').forEach(li => li.classList.remove('active'));
    listItem.classList.add('active');
    
    // Set the title in the main content area
    textTitle.textContent = listItem.textContent;
    
    // Show a loading message
    contentDisplay.textContent = 'लोड हो रहा है...';

    try {
        const response = await fetch(`content/${deityKey}/${fileName}`);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const textContent = await response.text();
        contentDisplay.textContent = textContent;
    } catch (error) {
        console.error('Error fetching text file:', error);
        contentDisplay.textContent = 'क्षमा करें, सामग्री लोड नहीं हो सकी। कृपया सुनिश्चित करें कि .txt फ़ाइल मौजूद है और सुलभ है।';
    }
}
