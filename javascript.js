// Fuzzy search algorithm
function fuzzyMatch(pattern, str) {
    const patternLower = pattern.toLowerCase();
    const strLower = str.toLowerCase();
    
    let patternIdx = 0;
    let strIdx = 0;
    let matched = false;

    while (strIdx < strLower.length) {
        if (patternLower[patternIdx] === strLower[strIdx]) {
            matched = true;
            patternIdx++;
        }
        if (patternIdx === patternLower.length) {
            return true;
        }
        strIdx++;
    }

    return false;
}

// Load GEIDs JSON data
let geidsData = {};

async function loadGEIDsData() {
    try {
        const response = await fetch('GEIDs.json');
        geidsData = await response.json();
    } catch (error) {
        console.error('Error loading GEIDs.json:', error);
    }
}

// Search items with fuzzy matching
function searchItems(query) {
    if (!query || query.trim() === '') {
        return [];
    }

    const results = [];
    for (const [name, id] of Object.entries(geidsData)) {
        if (fuzzyMatch(query, name)) {
            results.push({ name, id });
        }
    }

    return results.slice(0, 10); // Return top 10 results
}

// Fetch prices from OSRS Wiki API
async function fetchItemPrices(itemId) {
    try {
        const response = await fetch(`https://prices.runescape.wiki/api/v1/osrs/latest?id=${itemId}`);
        const data = await response.json();
        
        if (data.data && data.data[itemId]) {
            const priceData = data.data[itemId];
            return {
                low: priceData.low,
                high: priceData.high
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching prices:', error);
        return null;
    }
}

// Select item from search results
async function selectItem(name, id) {
    const prices = await fetchItemPrices(id);
    
    if (prices) {
        document.getElementById('bprice').value = prices.low;
        document.getElementById('sprice').value = prices.high;
        calculate();
    }
    
    // Clear search
    document.getElementById('item-search').value = '';
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('search-results').style.display = 'none';
}

function calculateTax(sell_price) {
    if (sell_price > 99) {
        return Math.round(sell_price * 0.02);
    }
    return 0;
}

function calculateMargin(buy_price, sell_price) {
    const tax = calculateTax(sell_price);
    return Math.round(sell_price - buy_price - tax);
}

// Correct breakeven that matches real tax + rounding rules
function calculateBreakEven(buy_price) {
    if (isNaN(buy_price) || buy_price <= 0) return 0;

    let sell_price = Math.max(1, Math.round(buy_price));

    while (true) {
        if (calculateMargin(buy_price, sell_price) >= 0) {
            return sell_price;
        }
        sell_price++;
    }
}

function parceLetter(num) {
    if (!num) return NaN;

    const multiplier = num.substr(-1).toLowerCase();
    if (multiplier === "k") return parseFloat(num) * 1000;
    if (multiplier === "m") return parseFloat(num) * 1000000;
    if (multiplier === "b") return parseFloat(num) * 1000000000;

    return parseFloat(num);
}

function pickHex(color1, color2, weight) {
    const w1 = weight;
    const w2 = 1 - w1;
    const rgb = [
        Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)
    ];
    return "rgb(" + rgb + ")";
}

function setcolorROI(roi) {
    const el = document.getElementById("roi_output");

    if (roi > 3) {
        el.style.color = "rgb(0,250,0)";
    } else if (roi > 0) {
        const green = [0,255,0];
        const red = [255,0,0];
        const weight = roi * 33.3 / 100;
        el.style.color = pickHex(green, red, weight);
    } else {
        el.style.color = "rgb(250,0,0)";
    }
}

function calculateROI(margin, buy_price) {
    if (buy_price <= 0) return "0.00%";

    const roi = (margin / buy_price) * 100;
    setcolorROI(roi);
    return roi.toFixed(2) + "%";
}

function setCoinImage(total) {
    const img = document.getElementById('coins');

    if (total > 1000000) img.src = "img/coins/coins_8.png";
    else if (total > 500000) img.src = "img/coins/coins_7.png";
    else if (total > 250000) img.src = "img/coins/coins_6.png";
    else if (total > 100000) img.src = "img/coins/coins_5.png";
    else if (total > 50000) img.src = "img/coins/coins_5.png";
    else if (total > 20000) img.src = "img/coins/coins_4.png";
    else if (total > 10000) img.src = "img/coins/coins_3.png";
    else if (total > 1000) img.src = "img/coins/coins_2.png";
    else if (total >= 1) img.src = "img/coins/coins_1.png";
    else img.src = "";
}

function clearInputs() {
    // Clear the price inputs
    document.getElementById('bprice').value = '';
    document.getElementById('sprice').value = '';
    
    // Reset volume to 1
    document.getElementById('volume').value = '1';
    
    // Reset multiplier states for all inputs
    const inputIds = ['bprice', 'sprice', 'volume'];
    inputIds.forEach(inputId => {
        const inputElement = document.getElementById(inputId);
        inputElement.dataset.multiplier = '1';
    });
    
    // Remove active class from all multiplier buttons
    const multiplierButtons = document.querySelectorAll('.multiplier-btn');
    multiplierButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Recalculate to clear outputs
    calculate();
}

function calculate() {
    let buy_price = parceLetter(document.getElementById("bprice").value);
    let sell_price = parceLetter(document.getElementById("sprice").value);
    let volume = parceLetter(document.getElementById("volume").value);

    // Apply multipliers if set
    const buyMultiplier = parseInt(document.getElementById("bprice").dataset.multiplier) || 1;
    const sellMultiplier = parseInt(document.getElementById("sprice").dataset.multiplier) || 1;
    const volumeMultiplier = parseInt(document.getElementById("volume").dataset.multiplier) || 1;

    buy_price *= buyMultiplier;
    sell_price *= sellMultiplier;
    volume *= volumeMultiplier;

    // Breakeven ONLY needs buy price
    const breakEven = calculateBreakEven(buy_price);
    document.getElementById("break_output").innerHTML =
        breakEven ? breakEven.toLocaleString("en-US") : 0;

    // Calculate target prices for different returns
    calculateTargetPrices(buy_price, volume);

    // If sell price is missing, stop here
    if (isNaN(sell_price)) {
        document.getElementById("tax_output").innerHTML = 0;
        document.getElementById("margin_output").innerHTML = 0;
        document.getElementById("total_output").innerHTML = 0;
        document.getElementById("roi_output").innerHTML = "0.00%";
        return;
    }

    const tax = -calculateTax(sell_price);
    const margin = calculateMargin(buy_price, sell_price);
    const total = margin * (volume || 0);
    const roi = calculateROI(margin, buy_price);

    document.getElementById("tax_output").innerHTML = tax.toLocaleString("en-US");
    document.getElementById("margin_output").innerHTML = margin.toLocaleString("en-US");
    document.getElementById("total_output").innerHTML = total.toLocaleString("en-US");
    document.getElementById("roi_output").innerHTML = roi;

    setCoinImage(total);
}

function calculateTargetPrices(buy_price, volume) {
    const returnPercentages = [1, 2, 5];
    
    if (isNaN(buy_price) || buy_price <= 0) {
        returnPercentages.forEach(ret => {
            document.getElementById(`target_${ret}`).innerHTML = 0;
            document.getElementById(`profit_${ret}`).innerHTML = 0;
            document.getElementById(`total_profit_${ret}`).innerHTML = 0;
        });
        return;
    }

    returnPercentages.forEach(ret => {
        // Calculate target sell price for desired ROI, accounting for tax
        const requiredMargin = (ret / 100) * buy_price;
        
        let targetSellPrice;
        if (buy_price + requiredMargin <= 99) {
            // No tax for sell prices <= 99
            targetSellPrice = Math.round(buy_price + requiredMargin);
        } else {
            // Account for 2% tax
            targetSellPrice = Math.round((buy_price + requiredMargin) / 0.98);
        }
        
        // Adjust for tax to achieve desired ROI
        let attempts = 0;
        while (attempts < 100) {
            const tax = calculateTax(targetSellPrice);
            const margin = targetSellPrice - buy_price - tax;
            const roi = (margin / buy_price) * 100;
            
            if (roi >= ret) {
                break;
            }
            targetSellPrice++;
            attempts++;
        }

        const profitPerUnit = calculateMargin(buy_price, targetSellPrice);
        const totalProfit = profitPerUnit * (volume || 1);

        document.getElementById(`target_${ret}`).innerHTML = targetSellPrice.toLocaleString("en-US");
        document.getElementById(`profit_${ret}`).innerHTML = profitPerUnit.toLocaleString("en-US");
        document.getElementById(`total_profit_${ret}`).innerHTML = totalProfit.toLocaleString("en-US");
    });
}

// Initialize multiplier buttons and keyboard shortcuts
document.addEventListener('DOMContentLoaded', function() {
    // Load GEIDs data
    loadGEIDsData();

    // Set up search functionality
    const searchInput = document.getElementById('item-search');
    const searchResults = document.getElementById('search-results');
    let currentSearchResults = [];
    let selectedResultIndex = -1;

    function displaySearchResults(results) {
        currentSearchResults = results;
        selectedResultIndex = -1;

        if (results.length > 0) {
            searchResults.innerHTML = results.map((result, index) => 
                `<div class="search-result-item" data-index="${index}" onclick="selectItem('${result.name.replace(/'/g, "\\'")}', ${result.id})\">${result.name}</div>`
            ).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
        }
    }

    function highlightResultItem(index) {
        const items = searchResults.querySelectorAll('.search-result-item');
        items.forEach(item => item.classList.remove('highlighted'));
        
        if (index >= 0 && index < items.length) {
            items[index].classList.add('highlighted');
            items[index].scrollIntoView({ block: 'nearest' });
            selectedResultIndex = index;
        }
    }

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value;
        const results = searchItems(query);
        displaySearchResults(results);
    });

    searchInput.addEventListener('keydown', function(e) {
        const itemCount = currentSearchResults.length;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (itemCount > 0) {
                const nextIndex = selectedResultIndex + 1;
                if (nextIndex < itemCount) {
                    highlightResultItem(nextIndex);
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (selectedResultIndex > 0) {
                highlightResultItem(selectedResultIndex - 1);
            } else if (selectedResultIndex === 0) {
                highlightResultItem(-1);
                selectedResultIndex = -1;
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedResultIndex >= 0 && selectedResultIndex < currentSearchResults.length) {
                const selected = currentSearchResults[selectedResultIndex];
                selectItem(selected.name, selected.id);
            }
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });

    // Set up button click handlers
    const multiplierButtons = document.querySelectorAll('.multiplier-btn');
    multiplierButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const inputId = this.dataset.input;
            const multiplier = parseInt(this.dataset.multiplier);
            const inputElement = document.getElementById(inputId);
            
            // Toggle multiplier - if same multiplier is clicked again, remove it
            const currentMultiplier = parseInt(inputElement.dataset.multiplier) || 1;
            if (currentMultiplier === multiplier) {
                inputElement.dataset.multiplier = "1";
                this.classList.remove('active');
            } else {
                inputElement.dataset.multiplier = multiplier;
                this.classList.add('active');
                // Remove active class from the other button for this input
                document.querySelectorAll(`[data-input="${inputId}"]`).forEach(otherBtn => {
                    if (otherBtn !== this) otherBtn.classList.remove('active');
                });
            }
            
            calculate();
        });
    });

    // Set up keyboard shortcuts for k and m keys
    const inputFields = ['bprice', 'sprice', 'volume'];
    inputFields.forEach(fieldId => {
        const inputElement = document.getElementById(fieldId);
        inputElement.addEventListener('keydown', function(e) {
            if (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'm') {
                e.preventDefault();
                const multiplier = e.key.toLowerCase() === 'k' ? 1000 : 1000000;
                
                // Toggle multiplier - if same multiplier is pressed again, remove it
                const currentMultiplier = parseInt(this.dataset.multiplier) || 1;
                if (currentMultiplier === multiplier) {
                    this.dataset.multiplier = "1";
                    document.querySelectorAll(`[data-input="${fieldId}"]`).forEach(btn => {
                        btn.classList.remove('active');
                    });
                } else {
                    this.dataset.multiplier = multiplier;
                    document.querySelectorAll(`[data-input="${fieldId}"]`).forEach(btn => {
                        if (parseInt(btn.dataset.multiplier) === multiplier) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                }
                
                calculate();
            }
            
            // Handle Enter key to move focus between inputs
            if (e.key === 'Enter') {
                e.preventDefault();
                const focusMap = {
                    'bprice': 'sprice',
                    'sprice': 'volume',
                    'volume': 'bprice'
                };
                const nextFieldId = focusMap[fieldId];
                document.getElementById(nextFieldId).focus();
            }
        });
    });
});
