// Voice Command Shopping Assistant - Renamed selectors (functionality unchanged)

class VoiceShoppingAssistant {
    constructor() {
        this.shoppingList = [];
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.shouldBeListening = false;
        this.currentLanguage = 'en-US';
        
        // Product categories for smart categorization
        this.categories = {
            dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream'],
            produce: ['apple', 'banana', 'orange', 'lettuce', 'tomato', 'carrot', 'onion', 'potato'],
            meat: ['chicken', 'beef', 'pork', 'fish', 'lamb', 'turkey'],
            grains: ['bread', 'rice', 'pasta', 'cereal', 'flour', 'oats'],
            beverages: ['water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine'],
            snacks: ['chips', 'cookies', 'crackers', 'nuts', 'popcorn'],
            frozen: ['frozen pizza', 'frozen vegetables', 'ice cream'],
            household: ['soap', 'detergent', 'paper towels', 'toilet paper', 'cleaning supplies']
        };

        // Seasonal suggestions
        this.seasonalItems = {
            summer: ['watermelon', 'ice cream', 'lemonade', 'grill supplies', 'beach items'],
            winter: ['hot chocolate', 'soup ingredients', 'warm clothes', 'holiday items'],
            spring: ['fresh flowers', 'spring vegetables', 'cleaning supplies'],
            fall: ['pumpkin', 'apple cider', 'fall decorations', 'warm spices']
        };

        // Substitute suggestions
        this.substitutes = {
            'milk': ['almond milk', 'soy milk', 'oat milk', 'coconut milk'],
            'bread': ['tortillas', 'pita bread', 'rice cakes'],
            'sugar': ['honey', 'maple syrup', 'stevia', 'agave'],
            'eggs': ['flax seeds', 'banana', 'applesauce', 'tofu'],
            'butter': ['olive oil', 'coconut oil', 'avocado', 'greek yogurt']
        };

        // Mock product database for search
        this.products = [
            { name: 'Organic Milk', price: 4.99, category: 'dairy', brand: 'Organic Valley' },
            { name: 'Whole Grain Bread', price: 3.49, category: 'grains', brand: "Nature's Own" },
            { name: 'Fresh Apples', price: 2.99, category: 'produce', brand: 'Local Farm' },
            { name: 'Chicken Breast', price: 8.99, category: 'meat', brand: 'Perdue' },
            { name: 'Greek Yogurt', price: 5.49, category: 'dairy', brand: 'Chobani' },
            { name: 'Brown Rice', price: 3.99, category: 'grains', brand: "Uncle Ben's" },
            { name: 'Fresh Spinach', price: 2.49, category: 'produce', brand: 'Local Farm' },
            { name: 'Salmon Fillet', price: 12.99, category: 'meat', brand: 'Wild Alaskan' },
            { name: 'Orange Juice', price: 4.49, category: 'beverages', brand: 'Tropicana' },
            { name: 'Dark Chocolate', price: 6.99, category: 'snacks', brand: 'Lindt' }
        ];

        this.init();
    }

    init() {
        this.loadShoppingList();
        this.setupVoiceRecognition();
        this.attachRecognitionHandlers();
        this.setupEventListeners();
        this.setupNetworkMonitoring();
        this.updateUI();
        this.generateSuggestions();
        this.updateLanguageHints();
        this.speak('Voice shopping assistant ready. Click the microphone to start.');
    }

    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.updateStatus('Internet connection restored. Voice recognition available.');
            this.speak('Internet connection restored');
        });

        window.addEventListener('offline', () => {
            this.updateStatus('Internet connection lost. Voice recognition unavailable.');
            this.speak('Internet connection lost');
            if (this.isListening) {
                this.stopListening();
            }
        });
    }

    updateLanguageHints() {
        const languageHints = {
            'en-US': {
                add: 'Try: "add milk", "buy bread", "need eggs"',
                remove: 'Try: "remove milk", "delete apples"',
                search: 'Try: "find milk", "search for bread"',
                clear: 'Try: "clear list", "empty list"'
            },
            'es-ES': {
                add: 'Try: "añadir leche", "comprar pan", "necesito huevos"',
                remove: 'Try: "eliminar leche", "borrar manzanas"',
                search: 'Try: "buscar leche", "encontrar pan"',
                clear: 'Try: "limpiar lista", "vaciar lista"'
            },
            'fr-FR': {
                add: 'Try: "acheter lait", "ajouter pain", "j\'ai besoin d\'œufs"',
                remove: 'Try: "supprimer lait", "enlever pommes"',
                search: 'Try: "trouver lait", "chercher pain"',
                clear: 'Try: "vider liste", "effacer liste"'
            },
            'de-DE': {
                add: 'Try: "kaufen Milch", "hinzufügen Brot", "brauche Eier"',
                remove: 'Try: "entfernen Milch", "löschen Äpfel"',
                search: 'Try: "finden Milch", "suchen Brot"',
                clear: 'Try: "Liste leeren", "Liste löschen"'
            },
            'hi-IN': {
                add: 'Try: "खरीदना दूध", "जोड़ना रोटी", "चाहिए अंडे"',
                remove: 'Try: "हटाना दूध", "मिटाना सेब"',
                search: 'Try: "ढूंढना दूध", "खोजना रोटी"',
                clear: 'Try: "सूची साफ़ करना", "सूची खाली करना"'
            }
        };

        const hints = languageHints[this.currentLanguage] || languageHints['en-US'];
        if (!this.isListening) {
            this.updateStatus(`Ready to listen in ${this.getLanguageName(this.currentLanguage)}. ${hints.add}`);
        }
    }

    getLanguageName(code) {
        const languages = {
            'en-US': 'English',
            'es-ES': 'Spanish',
            'fr-FR': 'French',
            'de-DE': 'German',
            'hi-IN': 'Hindi'
        };
        return languages[code] || 'English';
    }

    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
               this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.currentLanguage;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateMicButton(true);
            this.updateStatus('Listening... Speak now!');
            this.speak('Listening');
        };

        this.recognition.onspeechstart = () => {
            this.updateStatus('Speech detected... Keep speaking!');
            this.updateMicButton(true, 'speaking');
        };

        this.recognition.onspeechend = () => {
            this.updateStatus('Processing your command...');
            this.updateMicButton(true, 'processing');
        };

        this.recognition.onresult = (event) => {
            if (event.results.length > 0) {
                const result = event.results[0];
                if (result.isFinal) {
                    const command = result[0].transcript.toLowerCase();
                    const confidence = result[0].confidence;
                    this.updateStatus(`Heard: "${command}"`);
                    if (confidence > 0.3) {
                        this.processCommand(command);
                    } else {
                        this.updateStatus('Command unclear. Please try again.');
                        this.speak('Command unclear. Please try again.');
                    }
                }
            }
        };

        this.recognition.onerror = (event) => {
            let errorMessage = 'Error: ';
            switch(event.error) {
                case 'no-speech':
                    errorMessage += 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage += 'Microphone access denied. Please allow microphone access.';
                    break;
                case 'not-allowed':
                    errorMessage += 'Microphone access denied. Please refresh and allow access.';
                    break;
                case 'network':
                    errorMessage += 'Network error. Please check your connection.';
                    break;
                case 'service-not-allowed':
                    errorMessage += 'Speech recognition service not available.';
                    break;
                default:
                    errorMessage += event.error;
            }
            this.updateStatus(errorMessage);
            this.speak('Voice recognition error. Please try again.');
            this.isListening = false;
            this.updateMicButton(false);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateMicButton(false);
            this.updateStatus('Ready to listen');
        };

        this.recognition.onnomatch = () => {
            this.updateStatus('No speech match found. Please try again.');
            this.speak('No speech match found. Please try again.');
        };
    }

    setupEventListeners() {
        const micBtn = document.getElementById('btn-voice');
        micBtn.addEventListener('click', () => {
            if (!this.isListening) {
                this.startListening();
            } else {
                this.stopListening();
            }
        });

        const languageSelect = document.getElementById('locale-select');
        languageSelect.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            if (this.recognition) {
                this.recognition.lang = this.currentLanguage;
            }
            this.speak(`Language changed to ${e.target.options[e.target.selectedIndex].text}`);
            this.updateLanguageHints();
        });

        const searchBtn = document.getElementById('lookup-btn');
        searchBtn.addEventListener('click', () => {
            const query = document.getElementById('lookup-input').value;
            if (query.trim()) {
                this.searchProducts(query);
            }
        });

        const searchInput = document.getElementById('lookup-input');
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value;
                if (query.trim()) {
                    this.searchProducts(query);
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'm':
                        e.preventDefault();
                        this.startListening();
                        break;
                    case 's':
                        e.preventDefault();
                        document.getElementById('lookup-input').focus();
                        break;
                }
            }
        });

        const testMicBtn = document.getElementById('btn-mic-test');
        if (testMicBtn) {
            testMicBtn.addEventListener('click', () => this.testMicrophone());
        }

        const debugInfoBtn = document.getElementById('btn-devinfo');
        if (debugInfoBtn) {
            debugInfoBtn.addEventListener('click', () => this.showDebugInfo());
        }

        const retryVoiceBtn = document.getElementById('btn-voice-retry');
        if (retryVoiceBtn) {
            retryVoiceBtn.addEventListener('click', () => this.retryVoiceRecognition());
        }

        const testCommandBtn = document.getElementById('btn-cmd-test');
        if (testCommandBtn) {
            testCommandBtn.addEventListener('click', () => this.testCommandProcessing());
        }
    }

    startListening() {
        if (!this.recognition || this.isListening) return;
        if (!navigator.onLine) {
            this.updateStatus('No internet connection. Voice recognition requires internet.');
            this.speak('No internet connection. Please check your network.');
            return;
        }
        try {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            this.recognition.lang = this.currentLanguage;

            this.recognition.onerror = (event) => {
                if (event.error === 'network') {
                    this.handleNetworkError();
                    return;
                }
                let errorMessage = 'Error: ';
                let shouldRetry = false;
                switch(event.error) {
                    case 'no-speech':
                        errorMessage += 'No speech detected. Please try again.';
                        shouldRetry = true;
                        break;
                    case 'audio-capture':
                        errorMessage += 'Microphone access denied. Please allow microphone access.';
                        break;
                    case 'not-allowed':
                        errorMessage += 'Microphone access denied. Please refresh and allow access.';
                        break;
                    case 'service-not-allowed':
                        errorMessage += 'Speech recognition service not available.';
                        break;
                    case 'aborted':
                        errorMessage += 'Speech recognition was aborted.';
                        shouldRetry = true;
                        break;
                    case 'bad-grammar':
                        errorMessage += 'Speech grammar error.';
                        shouldRetry = true;
                        break;
                    case 'language-not-supported':
                        errorMessage += 'Language not supported.';
                        break;
                    default:
                        errorMessage += event.error;
                        shouldRetry = true;
                }
                this.updateStatus(errorMessage);
                if (shouldRetry) {
                    this.speak('Voice recognition error. Retrying in 3 seconds...');
                    setTimeout(() => {
                        if (this.shouldBeListening) {
                            this.updateStatus('Retrying voice recognition...');
                            this.startListening();
                        }
                    }, 3000);
                } else {
                    this.speak('Voice recognition error. Please try again.');
                }
                this.isListening = false;
                this.updateMicButton(false);
            };

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateMicButton(true);
                this.updateStatus('Listening... Speak now!');
                this.speak('Listening');
            };

            this.recognition.onspeechstart = () => {
                this.updateStatus('Speech detected... Keep speaking!');
                this.updateMicButton(true, 'speaking');
            };

            this.recognition.onspeechend = () => {
                this.updateStatus('Processing your command...');
                this.updateMicButton(true, 'processing');
            };

            this.recognition.onresult = (event) => {
                if (event.results.length > 0) {
                    const result = event.results[0];
                    if (result.isFinal) {
                        const command = result[0].transcript.toLowerCase();
                        const confidence = result[0].confidence;
                        this.updateStatus(`Heard: "${command}"`);
                        if (this.isValidCommand(command)) {
                            if (confidence <= 0.1) {
                                this.logConfidenceIssue(command, confidence);
                            }
                            this.processCommand(command);
                        } else {
                            if (confidence < 0.05) {
                                this.updateStatus('Command unclear. Please try again.');
                                this.speak('Command unclear. Please try again.');
                            } else {
                                this.processCommand(command);
                            }
                        }
                    }
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateMicButton(false);
                this.updateStatus('Ready to listen');
                if (this.shouldBeListening && this.recognition && this.recognition.state === 'inactive') {
                    setTimeout(() => {
                        if (this.shouldBeListening) {
                            this.startListening();
                        }
                    }, 1000);
                }
            };

            this.recognition.onnomatch = () => {
                this.updateStatus('No speech match found. Please try again.');
                this.speak('No speech match found. Please try again.');
            };

            this.shouldBeListening = true;
            this.recognition.start();
            this.recognitionTimeout = setTimeout(() => {
                if (this.isListening) {
                    this.updateStatus('No speech detected. Stopping...');
                    this.speak('No speech detected. Stopping.');
                    this.stopListening();
                }
            }, 10000);
        } catch (error) {
            this.showError('Error starting voice recognition. Please try again.');
            this.isListening = false;
            this.updateMicButton(false);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                if (this.recognitionTimeout) {
                    clearTimeout(this.recognitionTimeout);
                    this.recognitionTimeout = null;
                }
                this.shouldBeListening = false;
                this.recognition.stop();
            } catch (error) {
                // no-op
            }
        }
    }

    attachRecognitionHandlers() {
        if (!this.recognition) return;
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateMicButton(true);
            this.updateStatus('Listening... Speak now!');
            this.speak('Listening');
        };
        this.recognition.onspeechstart = () => {
            this.updateStatus('Speech detected... Keep speaking!');
            this.updateMicButton(true, 'speaking');
        };
        this.recognition.onspeechend = () => {
            this.updateStatus('Processing your command...');
            this.updateMicButton(true, 'processing');
        };
        this.recognition.onresult = (event) => {
            if (event.results.length > 0) {
                const result = event.results[0];
                if (result.isFinal) {
                    const command = result[0].transcript.toLowerCase();
                    const confidence = result[0].confidence;
                    this.updateStatus(`Heard: "${command}"`);
                    if (confidence > 0.3) {
                        this.processCommand(command);
                    } else {
                        this.updateStatus('Command unclear. Please try again.');
                        this.speak('Command unclear. Please try again.');
                    }
                }
            }
        };
        this.recognition.onerror = (event) => {
            let errorMessage = 'Error: ';
            switch(event.error) {
                case 'no-speech':
                    errorMessage += 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage += 'Microphone access denied. Please allow microphone access.';
                    break;
                case 'not-allowed':
                    errorMessage += 'Microphone access denied. Please refresh and allow access.';
                    break;
                case 'network':
                    errorMessage += 'Network error. Please check your connection.';
                    break;
                case 'service-not-allowed':
                    errorMessage += 'Speech recognition service not available.';
                    break;
                default:
                    errorMessage += event.error;
            }
            this.updateStatus(errorMessage);
            this.speak('Voice recognition error. Please try again.');
            this.isListening = false;
            this.updateMicButton(false);
        };
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateMicButton(false);
            this.updateStatus('Ready to listen');
            if (this.shouldBeListening && this.recognition && this.recognition.state === 'inactive') {
                setTimeout(() => {
                    if (this.shouldBeListening) {
                        this.startListening();
                    }
                }, 1000);
            }
        };
        this.recognition.onnomatch = () => {
            this.updateStatus('No speech match found. Please try again.');
            this.speak('No speech match found. Please try again.');
        };
    }

    processCommand(command) {
        const addPatterns = [
            /^add\s+(\d+)\s+(.+)/i,
            /^add\s+(.+)/i,
            /^i\s+need\s+(.+)/i,
            /^buy\s+(.+)/i,
            /^i\s+want\s+to\s+buy\s+(.+)/i,
            /^get\s+(.+)/i,
            /^purchase\s+(.+)/i,
            /^need\s+(.+)/i,
            /^want\s+(.+)/i,
            /^añadir\s+(.+)/i,
            /^comprar\s+(.+)/i,
            /^acheter\s+(.+)/i,
            /^kaufen\s+(.+)/i,
            /^खरीदना\s+(.+)/i,
        ];
        
        let item = null;
        let qty = 1;
        let commandType = 'unknown';

        for (const pattern of addPatterns) {
            const match = command.match(pattern);
            if (match) {
                commandType = 'add';
                const details = match[1] || match[2];
                const qtyMatch = details.match(/^(\d+)\s+(.*)/);
                const writtenQtyMatch = details.match(/^(one|two|three|four|five|six|seven|eight|nine|ten)\s+(.*)/i);
                if (qtyMatch) {
                    qty = parseInt(qtyMatch[1], 10);
                    item = qtyMatch[2].trim();
                } else if (writtenQtyMatch) {
                    const writtenNumbers = {
                        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
                        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
                    };
                    qty = writtenNumbers[writtenQtyMatch[1].toLowerCase()];
                    item = writtenQtyMatch[2].trim();
                } else {
                    item = details.trim();
                }
                break;
            }
        }

        if (commandType === 'unknown') {
            if (/remove\s+(.+)/i.test(command)) {
                commandType = 'remove';
                item = command.match(/remove\s+(.+)/i)[1].trim();
            } else if (/delete\s+(.+)/i.test(command)) {
                commandType = 'remove';
                item = command.match(/delete\s+(.+)/i)[1].trim();
            } else if (/eliminar\s+(.+)/i.test(command)) {
                commandType = 'remove';
                item = command.match(/eliminar\s+(.+)/i)[1].trim();
            } else if (/find\s+(.+)/i.test(command)) {
                commandType = 'search';
                item = command.match(/find\s+(.+)/i)[1].trim();
            } else if (/search\s+for\s+(.+)/i.test(command)) {
                commandType = 'search';
                item = command.match(/search\s+for\s+(.+)/i)[1].trim();
            } else if (/buscar\s+(.+)/i.test(command)) {
                commandType = 'search';
                item = command.match(/buscar\s+(.+)/i)[1].trim();
            } else if (/clear\s+list/i.test(command) || /empty\s+list/i.test(command) || /limpiar\s+lista/i.test(command)) {
                commandType = 'clear';
            } else if (/help/i.test(command) || /ayuda/i.test(command)) {
                commandType = 'help';
            }
        }

        switch (commandType) {
            case 'add':
                if (item) {
                    this.addItem(item, qty);
                    this.speak(`Added ${qty} ${item} to your shopping list`);
                } else {
                    this.speak('I didn\'t understand what to add. Please try again.');
                    this.updateStatus('Unknown item. Try "Add milk" or "Buy 2 apples"');
                }
                break;
            case 'remove':
                if (item) {
                    this.removeItem(item);
                } else {
                    this.speak('I didn\'t understand what to remove. Please try again.');
                    this.updateStatus('Unknown item to remove. Try "Remove milk"');
                }
                break;
            case 'search':
                if (item) {
                    this.searchProducts(item);
                } else {
                    this.speak('I didn\'t understand what to search for. Please try again.');
                    this.updateStatus('Unknown search term. Try "Find milk"');
                }
                break;
            case 'clear':
                this.clearList();
                break;
            case 'help':
                this.showHelp();
                break;
            default:
                this.speak('I didn\'t understand that command. Try saying "add milk" or "help"');
                this.updateStatus('Unknown command. Try "Add milk" or "Help"');
        }
    }

    matchesPattern(text, pattern) {
        return pattern.test(text);
    }

    isValidCommand(command) {
        const addPatterns = [
            /^add\s+(\d+)\s+(.+)/i,
            /^add\s+(.+)/i,
            /^i\s+need\s+(.+)/i,
            /^buy\s+(.+)/i,
            /^i\s+want\s+to\s+buy\s+(.+)/i,
            /^get\s+(.+)/i,
            /^purchase\s+(.+)/i,
            /^need\s+(.+)/i,
            /^want\s+(.+)/i,
            /^añadir\s+(.+)/i,
            /^comprar\s+(.+)/i,
            /^acheter\s+(.+)/i,
            /^kaufen\s+(.+)/i,
            /^खरीदना\s+(.+)/i,
        ];

        const removePatterns = [/^remove\s+(.+)/i, /^delete\s+(.+)/i, /^eliminar\s+(.+)/i];
        const searchPatterns = [/^find\s+(.+)/i, /^search\s+for\s+(.+)/i, /^buscar\s+(.+)/i];
        const clearPatterns = [/^clear\s+list/i, /^empty\s+list/i, /^limpiar\s+lista/i];
        const helpPatterns = [/^help/i, /^ayuda/i];

        const allPatterns = [...addPatterns, ...removePatterns, ...searchPatterns, ...clearPatterns, ...helpPatterns];
        for (const pattern of allPatterns) {
            if (pattern.test(command)) return true;
        }
        return false;
    }

    addItem(item, quantity = 1) {
        const existingItem = this.shoppingList.find(listItem => 
            listItem.name.toLowerCase() === item.toLowerCase()
        );

        if (existingItem) {
            existingItem.quantity += quantity;
            this.speak(`Updated quantity of ${item} to ${existingItem.quantity}`);
            this.updateStatus(`Updated: ${existingItem.quantity} ${item}`);
        } else {
            const newItem = {
                id: Date.now(),
                name: item,
                quantity: quantity,
                category: this.categorizeItem(item),
                addedAt: new Date().toISOString()
            };
            this.shoppingList.push(newItem);
            this.speak(`Added ${quantity} ${item} to your shopping list`);
            this.updateStatus(`Added: ${quantity} ${item} (${this.categorizeItem(item)})`);
        }

        this.saveShoppingList();
        this.updateUI();
        this.generateSuggestions();
        this.showSuccessFeedback();
    }

    showSuccessFeedback() {
        const shoppingSection = document.querySelector('.list-pane');
        if (shoppingSection) {
            shoppingSection.classList.add('ok-flash');
            setTimeout(() => {
                shoppingSection.classList.remove('ok-flash');
            }, 500);
        }
    }

    logConfidenceIssue(command, confidence) {
        this.updateStatus(`Processing: "${command}" (confidence was low but command looks valid)`);
    }

    testCommandProcessing() {
        this.updateStatus('Testing command processing...');
        const testCommands = ['add milk', 'add 2 apples', 'buy bread', 'need eggs', 'add three apples', 'purchase cheese'];
        testCommands.forEach((command, index) => {
            setTimeout(() => this.processCommand(command), index * 1000);
        });
        this.speak('Testing command processing with sample commands');
    }

    removeItem(item) {
        const itemIndex = this.shoppingList.findIndex(listItem => 
            listItem.name.toLowerCase() === item.toLowerCase()
        );
        if (itemIndex !== -1) {
            const removedItem = this.shoppingList[itemIndex];
            this.shoppingList.splice(itemIndex, 1);
            this.speak(`Removed ${removedItem.name} from your shopping list`);
            this.saveShoppingList();
            this.updateUI();
        } else {
            this.speak(`I couldn't find ${item} in your shopping list`);
        }
    }

    clearList() {
        if (this.shoppingList.length > 0) {
            this.shoppingList = [];
            this.saveShoppingList();
            this.updateUI();
            this.speak('Shopping list cleared');
        } else {
            this.speak('Your shopping list is already empty');
        }
    }

    categorizeItem(item) {
        const itemLower = item.toLowerCase();
        for (const [category, items] of Object.entries(this.categories)) {
            if (items.some(catItem => itemLower.includes(catItem))) {
                return category;
            }
        }
        return 'other';
    }

    searchProducts(query) {
        const results = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.brand.toLowerCase().includes(query.toLowerCase())
        );
        this.displaySearchResults(results, query);
        if (results.length > 0) {
            this.speak(`Found ${results.length} products matching "${query}"`);
        } else {
            this.speak(`No products found matching "${query}"`);
        }
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('lookup-results');
        if (results.length === 0) {
            resultsContainer.innerHTML = `<div class="is-empty">No products found for "${query}"</div>`;
            return;
        }
        const resultsHTML = results.map(product => `
            <div class="result-row">
                <div class="result-title">${product.name} - ${product.brand}</div>
                <div class="result-cost">$${product.price}</div>
            </div>
        `).join('');
        resultsContainer.innerHTML = resultsHTML;
    }

    generateSuggestions() {
        const suggestionsContainer = document.getElementById('tips-list');
        const suggestions = [];

        const historySuggestions = this.getHistorySuggestions();
        if (historySuggestions.length > 0) {
            suggestions.push({
                icon: '🕒',
                text: `Recently added: ${historySuggestions.slice(0, 3).join(', ')}`
            });
        }

        const currentSeason = this.getCurrentSeason();
        const seasonalItems = this.seasonalItems[currentSeason] || [];
        if (seasonalItems.length > 0) {
            suggestions.push({
                icon: '🌞',
                text: `${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} essentials: ${seasonalItems.slice(0, 3).join(', ')}`
            });
        }

        const substituteSuggestions = this.getSubstituteSuggestions();
        if (substituteSuggestions.length > 0) {
            suggestions.push({
                icon: '🔄',
                text: `Consider alternatives: ${substituteSuggestions.slice(0, 2).join(', ')}`
            });
        }

        const suggestionsHTML = suggestions.map(suggestion => `
            <div class="tip-card">
                <span class="tip-icon">${suggestion.icon}</span>
                <span class="tip-text">${suggestion.text}</span>
            </div>
        `).join('');
        suggestionsContainer.innerHTML = suggestionsHTML;
    }

    getHistorySuggestions() {
        const history = JSON.parse(localStorage.getItem('shoppingHistory') || '[]');
        return history.slice(0, 5);
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    getSubstituteSuggestions() {
        const substitutes = [];
        this.shoppingList.forEach(item => {
            if (this.substitutes[item.name.toLowerCase()]) {
                substitutes.push(...this.substitutes[item.name.toLowerCase()]);
            }
        });
        return [...new Set(substitutes)];
    }

    updateUI() {
        const listContainer = document.getElementById('list-holder');
        if (this.shoppingList.length === 0) {
            listContainer.innerHTML = '<div class="is-empty">Your shopping list is empty. Try saying "add milk" or "add 2 apples"</div>';
            return;
        }
        const listHTML = this.shoppingList.map(item => `
            <div class="entry-row" data-id="${item.id}">
                <div class="entry-info">
                    <div class="entry-name">${item.name}</div>
                    <div class="entry-tag">${item.category}</div>
                </div>
                <div class="entry-qty">${item.quantity}</div>
                <button class="btn-remove" onclick="app.removeItemById(${item.id})">Remove</button>
            </div>
        `).join('');
        listContainer.innerHTML = listHTML;
    }

    removeItemById(id) {
        const itemIndex = this.shoppingList.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            const removedItem = this.shoppingList[itemIndex];
            this.shoppingList.splice(itemIndex, 1);
            this.speak(`Removed ${removedItem.name} from your shopping list`);
            this.saveShoppingList();
            this.updateUI();
        }
    }

    updateMicButton(listening, state = 'listening') {
        const micBtn = document.getElementById('btn-voice');
        const micText = micBtn.querySelector('.label-mic');
        micBtn.classList.remove('listening', 'speaking', 'processing');
        if (listening) {
            if (state === 'speaking') {
                micBtn.classList.add('speaking');
                micText.textContent = 'Speaking...';
            } else if (state === 'processing') {
                micBtn.classList.add('processing');
                micText.textContent = 'Processing...';
            } else {
                micBtn.classList.add('listening');
                micText.textContent = 'Listening...';
            }
        } else {
            micText.textContent = 'Click to Speak';
        }
    }

    updateStatus(message) {
        const statusElement = document.getElementById('voice-status');
        statusElement.textContent = message;
    }

    speak(text) {
        if (this.synthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.currentLanguage;
            utterance.rate = 0.9;
            utterance.pitch = 1;
            this.synthesis.speak(utterance);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert-error';
        errorDiv.textContent = message;
        const container = document.querySelector('.app-shell');
        container.insertBefore(errorDiv, container.firstChild);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showHelp() {
        const helpText = `
            🎤 Available Voice Commands:

            📝 ADD ITEMS (English):
            - "add milk" or "add 2 apples"
            - "buy bread" or "purchase eggs"
            - "i need apples" or "i want to buy oranges"
            - "get bread" or "want cheese"

            🌍 MULTILINGUAL ADD COMMANDS:
            - Spanish: "añadir leche", "comprar pan"
            - French: "acheter lait"
            - German: "kaufen Brot"
            - Hindi: "खरीदना दूध"

            🗑️ REMOVE ITEMS:
            - "remove milk" or "delete apples"
            - Spanish: "eliminar leche"

            🔍 SEARCH:
            - "find milk" or "search for bread"
            - Spanish: "buscar leche"

            🧹 MANAGE LIST:
            - "clear list" or "empty list"
            - Spanish: "limpiar lista"

            ❓ HELP:
            - "help" or "ayuda" (Spanish)

            ⌨️ KEYBOARD SHORTCUTS:
            - Ctrl+M: Start voice listening
            - Ctrl+S: Focus search box

            💡 TIPS:
            - Speak clearly and wait for "Listening..."
            - Use quantities: "add 3 bananas"
            - Try different phrases: "need milk" works same as "add milk"
        `;
        this.speak('Here are the available voice commands');
        alert(helpText);
    }

    testMicrophone() {
        this.updateStatus('Testing microphone access...');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    this.updateStatus('Microphone access granted! Testing voice recognition...');
                    this.speak('Microphone access granted');
                    stream.getTracks().forEach(track => track.stop());
                    this.testSpeechRecognition();
                })
                .catch(error => {
                    let errorMsg = 'Microphone access denied: ';
                    switch(error.name) {
                        case 'NotAllowedError':
                            errorMsg += 'Please allow microphone access and refresh the page.';
                            break;
                        case 'NotFoundError':
                            errorMsg += 'No microphone found.';
                            break;
                        case 'NotSupportedError':
                            errorMsg += 'Microphone not supported in this browser.';
                            break;
                        default:
                            errorMsg += error.message;
                    }
                    this.updateStatus(errorMsg);
                    this.speak('Microphone access denied');
                });
        } else {
            this.updateStatus('Microphone access not supported in this browser.');
            this.speak('Microphone not supported');
        }
    }

    testSpeechRecognition() {
        this.updateStatus('Testing speech recognition service...');
        try {
            const testRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            testRecognition.lang = 'en-US';
            testRecognition.continuous = false;
            testRecognition.interimResults = false;
            testRecognition.onstart = () => {
                this.updateStatus('Speech recognition service is working! Starting test...');
                this.speak('Speech recognition working');
                setTimeout(() => {
                    try { testRecognition.stop(); } catch (e) {}
                }, 2000);
            };
            testRecognition.onerror = (event) => {
                this.updateStatus(`Speech recognition error: ${event.error}. This may cause voice issues.`);
                this.speak('Speech recognition has errors');
            };
            testRecognition.onend = () => {
                this.updateStatus('Speech recognition test completed. Try using voice commands now.');
                this.speak('Test completed');
            };
            testRecognition.start();
        } catch (error) {
            this.updateStatus('Speech recognition not available in this browser.');
            this.speak('Speech recognition not available');
        }
    }

    showDebugInfo() {
        const debugInfo = {
            'Browser': navigator.userAgent,
            'Speech Recognition': 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window ? 'Supported' : 'Not Supported',
            'Speech Synthesis': 'speechSynthesis' in window ? 'Supported' : 'Not Available',
            'Microphone Access': navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? 'Available' : 'Not Available',
            'Current Language': this.currentLanguage,
            'Recognition State': this.recognition ? this.recognition.state : 'Not Initialized',
            'Is Listening': this.isListening,
            'Local Storage': typeof(Storage) !== 'undefined' ? 'Available' : 'Not Available',
            'HTTPS': window.location.protocol === 'https:' ? 'Yes' : 'No (Required for voice)',
            'Network Status': navigator.onLine ? 'Online' : 'Offline'
        };
        let debugText = 'Debug Information:\n\n';
        for (const [key, value] of Object.entries(debugInfo)) {
            debugText += `${key}: ${value}\n`;
        }
        alert(debugText);
    }

    handleNetworkError() {
        this.updateStatus('Network error detected. Trying alternative approach...');
        const retryBtn = document.getElementById('btn-voice-retry');
        if (retryBtn) retryBtn.style.display = 'inline-block';
        if (this.recognition) {
            try { this.recognition.abort(); } catch (e) {}
        }
        setTimeout(() => {
            this.updateStatus('Retrying with network recovery...');
            this.startListening();
        }, 2000);
    }

    retryVoiceRecognition() {
        this.updateStatus('Manually retrying voice recognition...');
        const retryBtn = document.getElementById('btn-voice-retry');
        if (retryBtn) retryBtn.style.display = 'none';
        this.shouldBeListening = false;
        this.isListening = false;
        this.updateMicButton(false);
        setTimeout(() => this.startListening(), 1000);
    }

    saveShoppingList() {
        localStorage.setItem('shoppingList', JSON.stringify(this.shoppingList));
        const history = JSON.parse(localStorage.getItem('shoppingHistory') || '[]');
        this.shoppingList.forEach(item => {
            if (!history.includes(item.name.toLowerCase())) {
                history.push(item.name.toLowerCase());
            }
        });
        localStorage.setItem('shoppingHistory', JSON.stringify(history));
    }

    loadShoppingList() {
        const saved = localStorage.getItem('shoppingList');
        if (saved) {
            this.shoppingList = JSON.parse(saved);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VoiceShoppingAssistant();
    window.debugVoice = () => { if (window.app) window.app.showDebugInfo(); };
});

// Demo helper
if (typeof window !== 'undefined') {
    window.addSampleData = () => {
        if (window.app) {
            window.app.addItem('milk', 2);
            window.app.addItem('bread', 1);
            window.app.addItem('apples', 6);
            window.app.addItem('chicken breast', 2);
        }
    };
}


