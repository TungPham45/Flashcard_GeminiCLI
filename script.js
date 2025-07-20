const app = document.getElementById('app');

// Global practice state variables
let currentPracticeWords = [];
let currentPracticeIndex = 0;
let currentCorrectAnswers = 0;
let currentPracticeSetName = '';

// Data Storage Functions
function getFolders() {
    return JSON.parse(localStorage.getItem('folders')) || [];
}

function saveFolders(folders) {
    localStorage.setItem('folders', JSON.stringify(folders));
}

function getSets() {
    return JSON.parse(localStorage.getItem('sets')) || [];
}

function saveSets(sets) {
    localStorage.setItem('sets', JSON.stringify(sets));
}

function getSet(setName) {
    const sets = getSets();
    return sets.find(s => s.name === setName);
}

// Modal Functions
function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        closeModal();
    }
}

// Core UI Rendering Functions
function renderDashboard() {
    app.innerHTML = `
        <div class="toolbar">
            <input type="text" id="search-bar" placeholder="Search sets..." onkeyup="searchSets()">
        </div>
        <div class="dashboard">
            <div class="folders-container">
                <h2>Folders</h2>
                <div class="folders"></div>
                <button onclick="showCreateFolder()">Create Folder</button>
            </div>
            <div class="sets-container">
                <div class="sets"></div>
                <button onclick="showCreateSet()"><i class="fas fa-plus"></i> Create Set</button>
        <button onclick="importSet()"><i class="fas fa-upload"></i> Import Set</button>
            </div>
        </div>
    `;
    renderFolders();
    renderSets();
}

function renderFolders() {
    const foldersContainer = document.querySelector('.folders');
    foldersContainer.innerHTML = '';
    const folders = getFolders();
    folders.forEach(folder => {
        const folderElement = document.createElement('div');
        folderElement.classList.add('folder');
        let setsHTML = '';
        folder.sets.forEach(setName => {
            setsHTML += `<div class="set-in-folder">${setName}</div>`;
        });

        folderElement.innerHTML = `
            <h3 ondblclick="editFolderName('${folder.name}')">${folder.name}</h3>
            <div class="folder-sets">
                ${setsHTML}
            </div>
            <button onclick="addSetToFolder('${folder.name}')">Add Set</button>
            <button onclick="removeSetFromFolder('${folder.name}')">Remove Set</button>
        `;
        foldersContainer.appendChild(folderElement);
    });
}

function renderSets(filter = '') {
    const setsContainer = document.querySelector('.sets');
    setsContainer.innerHTML = '<h2>Flashcard Sets</h2>';
    const sets = getSets().filter(set => set.name.toLowerCase().includes(filter.toLowerCase()));
    sets.forEach(set => {
        const setElement = document.createElement('div');
        setElement.classList.add('set');
        setElement.innerHTML = `
            <div class="set-header">
                <h3 ondblclick="editSetName('${set.name}')"><i class="fas fa-layer-group"></i> ${set.name}</h3>
            </div>
            <div>
                <button onclick="showEditSet('${set.name}')"><i class="fas fa-edit"></i> Edit Words</button>
                <button onclick="listWordsInSet('${set.name}')"><i class="fas fa-list"></i> List Words</button>
                <button onclick="practiceSet('${set.name}')"><i class="fas fa-play"></i> Practice</button>
                <button onclick="exportSet('${set.name}')"><i class="fas fa-download"></i> Export</button>
                <button class="delete-btn" onclick="deleteSet('${set.name}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        setsContainer.appendChild(setElement);
    });
}

function searchSets() {
    const filter = document.getElementById('search-bar').value;
    renderSets(filter);
}

// CRUD/Edit Functions (Folders/Sets)
function showCreateFolder() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="create-folder">
            <h2>Create Folder</h2>
            <input type="text" id="folder-name" placeholder="Folder Name">
            <button onclick="createFolder()">Create</button>
        </div>
    `;
    openModal();
}

function createFolder() {
    const folderName = document.getElementById('folder-name').value.trim();
    if (folderName) {
        const folders = getFolders();
        folders.push({ name: folderName, sets: [] });
        saveFolders(folders);
        renderDashboard();
        closeModal();
    }
}

function showCreateSet() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="create-set">
            <h2>Create Set</h2>
            <input type="text" id="set-name" placeholder="Set Name">
            <button onclick="createSet()">Create</button>
        </div>
    `;
    openModal();
}

function createSet() {
    const setName = document.getElementById('set-name').value.trim();
    if (setName) {
        const sets = getSets();
        sets.push({ name: setName, words: [] });
        saveSets(sets);
        renderDashboard();
        closeModal();
    }
}

function addSetToFolder(folderName) {
    const sets = getSets();
    const modalBody = document.getElementById('modal-body');
    let options = '';
    sets.forEach(set => {
        options += `<option value="${set.name}">${set.name}</option>`;
    });

    modalBody.innerHTML = `
        <h2>Add Set to ${folderName}</h2>
        <select id="set-to-add">
            ${options}
        </select>
        <button onclick="commitSetToFolder('${folderName}')">Add</button>
    `;
    openModal();
}

function commitSetToFolder(folderName) {
    const setName = document.getElementById('set-to-add').value;
    if (setName) {
        const folders = getFolders();
        const folder = folders.find(f => f.name === folderName);
        if (!folder.sets.includes(setName)) {
            folder.sets.push(setName);
            saveFolders(folders);
            renderDashboard();
        }
        closeModal();
    }
}

function removeSetFromFolder(folderName) {
    const folder = getFolders().find(f => f.name === folderName);
    const modalBody = document.getElementById('modal-body');
    let options = '';
    folder.sets.forEach(setName => {
        options += `<option value="${setName}">${setName}</option>`;
    });

    modalBody.innerHTML = `
        <h2>Remove Set from ${folderName}</h2>
        <select id="set-to-remove">
            ${options}
        </select>
        <button onclick="commitRemoveSetFromFolder('${folderName}')">Remove</button>
    `;
    openModal();
}

function commitRemoveSetFromFolder(folderName) {
    const setName = document.getElementById('set-to-remove').value;
    if (setName) {
        const folders = getFolders();
        const folder = folders.find(f => f.name === folderName);
        folder.sets = folder.sets.filter(s => s !== setName);
        saveFolders(folders);
        renderDashboard();
        closeModal();
    }
}

function deleteFolder(folderName) {
    if (confirm(`Are you sure you want to delete the folder "${folderName}"?`)) {
        let folders = getFolders();
        folders = folders.filter(f => f.name !== folderName);
        saveFolders(folders);
        renderDashboard();
    }
}

function editFolderName(oldName) {
    const newName = prompt("Enter new folder name:", oldName);
    if (newName && newName !== oldName) {
        let folders = getFolders();
        const folder = folders.find(f => f.name === oldName);
        folder.name = newName;
        saveFolders(folders);
        renderDashboard();
    }
}

function editSetName(oldName) {
    const newName = prompt("Enter new set name:", oldName);
    if (newName && newName !== oldName) {
        let sets = getSets();
        const set = sets.find(s => s.name === oldName);
        set.name = newName;
        saveSets(sets);

        let folders = getFolders();
        folders.forEach(folder => {
            const setIndex = folder.sets.indexOf(oldName);
            if (setIndex > -1) {
                folder.sets[setIndex] = newName;
            }
        });
        saveFolders(folders);

        renderDashboard();
    }
}

function deleteSet(setName) {
    if (confirm(`Are you sure you want to delete the set "${setName}"?`)) {
        let sets = getSets();
        sets = sets.filter(s => s.name !== setName);
        saveSets(sets);

        let folders = getFolders();
        folders.forEach(folder => {
            folder.sets = folder.sets.filter(s => s !== setName);
        });
        saveFolders(folders);

        renderDashboard();
    }
}

function exportSet(setName) {
    const set = getSet(setName);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(set, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", setName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importSet() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
            const content = readerEvent.target.result;
            try {
                const set = JSON.parse(content);
                let sets = getSets();
                if (!sets.find(s => s.name === set.name)) {
                    sets.push(set);
                    saveSets(sets);
                    renderDashboard();
                } else {
                    alert('A set with this name already exists.');
                }
            } catch (e) {
                alert('Error parsing set file: ' + e.message);
            }
        }
    }
    input.click();
}

function listWordsInSet(setName) {
    const set = getSet(setName);
    const modalBody = document.getElementById('modal-body');
    let wordsHTML = '<div class="word-list">';
    set.words.forEach(word => {
        wordsHTML += `
            <div class="word-list-item">
                <span><strong>${word.word}</strong></span>
                <span>${word.definition}</span>
            </div>
        `;
    });
    wordsHTML += '</div>';

    modalBody.innerHTML = `
        <h2>Words in ${setName}</h2>
        ${wordsHTML}
    `;
    openModal();
}

// Word Management Functions
function showEditSet(setName) {
    const set = getSet(setName);
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="edit-set">
            <h2>Edit Set: ${set.name}</h2>
            <div class="words"></div>
            <div id="add-edit-word-container">
                <input type="text" id="word" placeholder="Word">
                <input type="text" id="definition" placeholder="Definition">
                <button onclick="addWord('${setName}')">Add Word</button>
            </div>
        </div>
    `;
    renderWords(setName);
    openModal();
}

function renderWords(setName) {
    const set = getSet(setName);
    const wordsContainer = document.querySelector('.words');
    wordsContainer.innerHTML = '<h3>Words</h3>';
    set.words.forEach((word, index) => {
        const wordElement = document.createElement('div');
        wordElement.classList.add('word');
        wordElement.innerHTML = `
            <span><strong>${word.word}</strong>: ${word.definition}</span>
            <div>
                <button onclick="editWord('${setName}', ${index})"><i class="fas fa-pen"></i></button>
                <button class="delete-btn" onclick="deleteWord('${setName}', ${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        wordsContainer.appendChild(wordElement);
    });
}

function addWord(setName) {
    const wordInput = document.getElementById('word');
    const definitionInput = document.getElementById('definition');
    const word = wordInput.value;
    const definition = definitionInput.value;

    if (word && definition) {
        const sets = getSets();
        const set = sets.find(s => s.name === setName);
        set.words.push({ word, definition });
        saveSets(sets);
        showEditSet(setName);
        wordInput.value = '';
        definitionInput.value = '';
    }
}

function editWord(setName, index) {
    const set = getSet(setName);
    const word = set.words[index];
    document.getElementById('word').value = word.word;
    document.getElementById('definition').value = word.definition;

    const addEditContainer = document.getElementById('add-edit-word-container');
    addEditContainer.innerHTML = `
        <input type="text" id="word" placeholder="Word" value="${word.word}">
        <input type="text" id="definition" placeholder="Definition" value="${word.definition}">
        <button onclick="updateWord('${setName}', ${index})">Update Word</button>
    `;
}

function updateWord(setName, index) {
    const wordInput = document.getElementById('word');
    const definitionInput = document.getElementById('definition');
    const newWord = wordInput.value;
    const newDefinition = definitionInput.value;

    if (newWord && newDefinition) {
        const sets = getSets();
        const set = sets.find(s => s.name === setName);
        set.words[index] = { word: newWord, definition: newDefinition };
        saveSets(sets);
        showEditSet(setName);
    }
}

function deleteWord(setName, index) {
    const sets = getSets();
    const set = sets.find(s => s.name === setName);
    set.words.splice(index, 1);
    saveSets(sets);
    showEditSet(setName);
}

// Practice-Related Utility Functions
function shuffleWords() {
    for (let i = currentPracticeWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentPracticeWords[i], currentPracticeWords[j]] = [currentPracticeWords[j], currentPracticeWords[i]];
    }
}

function showResults() {
    app.innerHTML = `
        <div class="practice-results">
            <h2>Practice Complete!</h2>
            <p>You scored ${currentCorrectAnswers} out of ${currentPracticeWords.length}.</p>
            <button onclick="practiceSet('${currentPracticeSetName}')">Practice Again</button>
            <button onclick="renderDashboard()">Back to Dashboard</button>
        </div>
    `;
}

// Main Practice Functions
function showFlashcard() {
    if (currentPracticeWords.length === 0) {
        app.innerHTML = `
            <div class="practice">
                <h2>Practice: ${currentPracticeSetName}</h2>
                <p>This set has no words. Add some words to practice!</p>
                <button onclick="renderDashboard()">Back to Dashboard</button>
            </div>
        `;
        return;
    }

    if (currentPracticeIndex >= currentPracticeWords.length) {
        showResults();
        return;
    }

    const word = currentPracticeWords[currentPracticeIndex];
    app.innerHTML = `
        <div class="practice">
            <h2>Practice: ${currentPracticeSetName}</h2>
            <div class="progress">${currentPracticeIndex + 1} / ${currentPracticeWords.length}</div>
            <div class="flashcard-container">
                <div class="flashcard-prompt">${word.word}</div>
                <input type="text" id="user-answer" placeholder="Type the definition">
                <button id="check-answer-btn" onclick="checkAnswer()">Check Answer</button>
                <button id="next-card-btn" onclick="nextCard()" style="display: none;">Next</button>
            </div>
             <div id="feedback"></div>
            <div class="practice-controls">
                <button onclick="shuffle()">Shuffle</button>
                <button onclick="renderDashboard()">End Practice</button>
            </div>
        </div>
    `;
}

function checkAnswer() {
    const userAnswer = document.getElementById('user-answer').value.trim();
    const correctAnswer = currentPracticeWords[currentPracticeIndex].definition.trim();
    const feedback = document.getElementById('feedback');

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        feedback.innerHTML = `<p class="correct">Correct!</p>`;
        currentCorrectAnswers++;
    } else {
        feedback.innerHTML = `<p class="incorrect">Incorrect. The correct answer is: <strong>${correctAnswer}</strong></p>`;
    }

    document.getElementById('user-answer').disabled = true;
    document.getElementById('check-answer-btn').style.display = 'none';
    document.getElementById('next-card-btn').style.display = 'inline-block';
}

function nextCard() {
    currentPracticeIndex++;
    document.getElementById('user-answer').value = '';
    document.getElementById('user-answer').disabled = false;
    document.getElementById('check-answer-btn').style.display = 'inline-block';
    document.getElementById('next-card-btn').style.display = 'none';
    document.getElementById('feedback').innerHTML = '';
    showFlashcard();
}

function shuffle() {
    shuffleWords();
    currentPracticeIndex = 0;
    currentCorrectAnswers = 0;
    showFlashcard();
}

function practiceSet(setName) {
    closeModal();
    const set = getSet(setName);
    currentPracticeWords = [...set.words];
    currentPracticeIndex = 0;
    currentCorrectAnswers = 0;
    currentPracticeSetName = setName;

    shuffleWords();
    showFlashcard();
}

// Initial call to render the dashboard when the script loads
renderDashboard();