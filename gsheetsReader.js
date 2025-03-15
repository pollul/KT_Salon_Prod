// Google Sheets ID
const sheetID = '1NUt36vkRrYxYPRjzqg3JZXIMD552wA78BvV4lID2Nz4';

// Wait for DOM to be fully loaded before fetching data
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, debugging elements:');
    console.log('Output element:', document.querySelector('.output'));
    console.log('Accordion element:', document.getElementById('accordionExampleY'));
    
    // Use Google Sheets data instead of sample data
    setTimeout(function() {
        loadGSheetData(sheetID, 'output');
        console.log('Initiated data fetch from Google Sheets');
    }, 1000); // Add a small delay to ensure everything is loaded
    
    // Fallback to sample data if Google Sheets fetch fails after 10 seconds
    setTimeout(function() {
        const output = document.querySelector('.output');
        if (output && output.querySelector('.spinner-container')) {
            console.log('Data load timeout - using sample data');
            const sampleData = createSampleData();
            appendGSDataToAccordion(sampleData, 'output');
        }
    }, 10000); // 10 second timeout
});

/**
 * Load data from Google Sheets
 * @param {string} sheetID - The ID of the Google Sheet
 * @param {string} elementID - The ID of the element to display data in
 */
function loadGSheetData(sheetID, elementID) {
    const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?`;
    const sheetName = 'Services';
    const query = encodeURIComponent('Select *');
    const url = `${base}&sheet=${sheetName}&tq=${query}`;
    
    console.log('Fetching data from:', url);
    parseGSData(url, elementID);
}

/**
 * Parse data from Google Sheets
 * @param {string} url - The URL of the Google Sheet
 * @param {string} elementID - The ID of the element to display data in
 */
function parseGSData(url, elementID) {
    let data = [];
    
    console.log('Starting fetch from Google Sheets...');
    
    fetch(url)
        .then(res => {
            console.log('Fetch response status:', res.status);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.text();
        })
        .then(rep => {
            try {
                console.log('Raw response from Google Sheets (first 100 chars):', rep.substring(0, 100));
                
                // Remove Google's JSON prefix and suffix to get valid JSON
                // The prefix length may vary, so we find the first '{' character
                const firstBrace = rep.indexOf('{');
                const lastBrace = rep.lastIndexOf('}');
                if (firstBrace === -1 || lastBrace === -1) {
                    throw new Error('Invalid response format from Google Sheets');
                }
                
                const jsonString = rep.substring(firstBrace, lastBrace + 1);
                console.log('Extracted JSON (first 100 chars):', jsonString.substring(0, 100));
                
                const jsData = JSON.parse(jsonString);
                console.log('Data successfully parsed, structure:', Object.keys(jsData));
                
                if (!jsData.table || !jsData.table.cols || !jsData.table.rows) {
                    throw new Error('Google Sheets data does not have the expected structure');
                }
                
                console.log('Number of columns:', jsData.table.cols.length);
                console.log('Number of rows:', jsData.table.rows.length);
                
                // Extract column names
                const colz = [];
                jsData.table.cols.forEach((heading) => {
                    if (heading.label) {
                        colz.push(heading.label.toLowerCase().replace(/\s/g, ''));
                    }
                });
                console.log('Column names:', colz);
                
                // Process each row of data
                jsData.table.rows.forEach((main, index) => {
                    const row = {};
                    colz.forEach((ele, ind) => {
                        row[ele] = (main.c[ind] != null) ? main.c[ind].v : '';
                    });
                    data.push(row);
                    
                    // Log first row as example
                    if (index === 0) {
                        console.log('Sample row data:', row);
                    }
                });
                
                console.log(`Processed ${data.length} rows of data`);
                
                // Display data in accordion
                appendGSDataToAccordion(data, elementID);
            } catch (error) {
                console.error('Error parsing Google Sheets data:', error);
                showErrorMessage(elementID);
            }
        })
        .catch(error => {
            console.error('Error fetching Google Sheets data:', error);
            showErrorMessage(elementID);
        });
}

/**
 * Display data in an accordion format
 * @param {Array} data - The data to display
 * @param {string} elementID - The ID of the element to display data in
 */
function appendGSDataToAccordion(data, elementID) {
    if (!data || data.length === 0) {
        console.error('No data to display');
        showErrorMessage(elementID);
        return;
    }
    
    let output = document.querySelector(`.${elementID}`);
    console.log('Output element found:', output);
    
    if (!output) {
        console.error(`Element with class '${elementID}' not found`);
        return;
    }
    
    let htmlElement = '';
    let currentServiceType = '';
    let currentServiceCat = '';
    let isFirstItem = true;
    
    // Function to get appropriate icon for service type
    function getServiceTypeIcon(type) {
        switch(type.toLowerCase()) {
            case 'hair services':
                return '<i class="fas fa-cut service-icon"></i>';
            case 'nail services':
                return '<i class="fas fa-hand-sparkles service-icon"></i>';
            case 'facial services':
                return '<i class="fas fa-spa service-icon"></i>';
            case 'makeup services':
                return '<i class="fas fa-magic service-icon"></i>';
            case 'waxing services':
                return '<i class="fas fa-fire service-icon"></i>';
            case 'massage services':
                return '<i class="fas fa-hands service-icon"></i>';
            default:
                return '<i class="fas fa-concierge-bell service-icon"></i>';
        }
    }
    
    // Function to get the background class for service type
    function getServiceBgClass(type) {
        const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
        return `service-header-bg ${normalizedType}-bg`;
    }
    
    // Function to get appropriate icon for category
    function getCategoryIcon(serviceType, category) {
        if (!category) return '';
        
        const type = serviceType.toLowerCase();
        const cat = category.toLowerCase();
        
        // Determine which icon to use
        let iconClass = 'fas fa-star';
        
        if (type === 'hair services') {
            if (cat.includes('cut')) iconClass = 'fas fa-cut';
            else if (cat.includes('color')) iconClass = 'fas fa-palette';
            else if (cat.includes('style') || cat.includes('styling')) iconClass = 'fas fa-wind';
            else if (cat.includes('treatment')) iconClass = 'fas fa-pump-soap';
            else iconClass = 'fas fa-gem';
        }
        else if (type === 'nail services') {
            if (cat.includes('manicure')) iconClass = 'fas fa-hand-paper';
            else if (cat.includes('pedicure')) iconClass = 'fas fa-shoe-prints';
            else iconClass = 'fas fa-magic';
        }
        else if (type === 'facial services') {
            if (cat.includes('facial')) iconClass = 'fas fa-smile';
            else if (cat.includes('treatment')) iconClass = 'fas fa-seedling';
            else iconClass = 'fas fa-leaf';
        }
        
        // Return a clickable icon with a title
        return `<a href="javascript:void(0);" class="category-icon-link" title="View ${category} services"><i class="${iconClass} category-icon"></i></a>`;
    }
    
    // Function to get icon for individual service
    function getServiceIcon(serviceType, category, service) {
        return '<i class="fas fa-angle-right service-table-icon"></i>';
    }
    
    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        
        // Check if required fields exist
        if (!item.type) {
            console.warn('Item missing type field, skipping:', item);
            continue;
        }
        
        let currentDataType = item.type.split(' ').join('_');
        
        if (currentServiceType === item.type) {
            // Same service type, add a new row
            if (item.category !== currentServiceCat) {
                currentServiceCat = item.category; 
                htmlElement += `<tr><td colspan="3"><h2 class="mt-4">${getCategoryIcon(currentServiceType, item.category)}${item.category || 'Uncategorized'}</h2></td></tr>`;
            }
            
            htmlElement += `<tr>
                <td class="service-name">${getServiceIcon(currentServiceType, currentServiceCat, item.service)}${item.service || ''}</td>
                <td class="service-price">$${item.price || ''}</td>
                <td class="service-time">${item.servicetime || ''} minutes</td>
            </tr>`;
        } else {
            // New service type, create a new accordion item
            if (!isFirstItem) {
                // Close previous accordion item (but skip for the first item)
                htmlElement += '</tbody></table></div></div></div>';
            } else {
                isFirstItem = false;
            }
            
            currentServiceType = item.type;
            currentServiceCat = ''; // Reset category for new type
            
            // Open a new accordion item
            htmlElement += `<div class="accordion-item ${getServiceBgClass(item.type)}">
                <h2 class="accordion-header" id="heading${currentDataType}">
                    <button class="accordion-button ${i === 0 ? '' : 'collapsed'}" 
                        type="button" 
                        data-mdb-toggle="collapse"
                        data-mdb-target="#collapse${currentDataType}" 
                        aria-expanded="${i === 0 ? 'true' : 'false'}" 
                        aria-controls="collapse${currentDataType}">
                        ${getServiceTypeIcon(item.type)}${item.type}
                    </button>
                </h2>
                <div id="collapse${currentDataType}" 
                    class="accordion-collapse collapse ${i === 0 ? 'show' : ''}" 
                    aria-labelledby="heading${currentDataType}"
                    data-mdb-parent="#accordionExampleY">
                    <div class="accordion-body">
                        <table class="table table-hover">
                            <tbody>`;
            
            // Add category if exists
            if (item.category) {
                currentServiceCat = item.category;
                htmlElement += `<tr><td colspan="3"><h2>${getCategoryIcon(currentServiceType, item.category)}${item.category}</h2></td></tr>`;
            }
            
            // Add the service row
            htmlElement += `<tr>
                <td class="service-name">${getServiceIcon(currentServiceType, currentServiceCat, item.service)}${item.service || ''}</td>
                <td class="service-price">$${item.price || ''}</td>
                <td class="service-time">${item.servicetime || ''} minutes</td>
            </tr>`;
        }
    }
    
    // Close the last accordion item
    htmlElement += '</tbody></table></div></div></div>';
    
    console.log('Generated HTML length:', htmlElement.length);
    console.log('First 200 characters of HTML:', htmlElement.substring(0, 200));
    
    // Update the DOM
    output.innerHTML = htmlElement;
    
    // Log success
    console.log('Services data successfully loaded into accordion');
    
    // Force MDB initialization
    setTimeout(function() {
        console.log('Attempting to initialize MDB components...');
        if (typeof mdb !== 'undefined' && mdb.Collapse) {
            document.querySelectorAll('.accordion-collapse').forEach(item => {
                new mdb.Collapse(item, {
                    toggle: false
                });
            });
            console.log('MDB components initialized');
        } else {
            console.warn('MDB not available for initialization');
        }
    }, 500);
}

/**
 * Display an error message
 * @param {string} elementID - The ID of the element to display the error in
 */
function showErrorMessage(elementID) {
    let output = document.querySelector(`.${elementID}`);
    if (output) {
        output.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <i class="fas fa-exclamation-triangle me-3"></i>
                Unable to load services data. Please try again later or contact us for service information.
            </div>`;
        console.error('Error message displayed to user');
    } else {
        console.error(`Could not find element .${elementID} to show error message`);
    }
}

// Add a helper function to create a sample data set if the Google Sheets fails
function createSampleData() {
    console.log('Creating sample data as fallback');
    return [
        // Hair Services
        { type: 'Hair Services', category: 'Cutting', service: 'Shampoo, Cut & Blow Dry', price: '50.00', servicetime: '45' },
        { type: 'Hair Services', category: 'Cutting', service: 'Child\'s Cut', price: '30.00', servicetime: '30' },
        { type: 'Hair Services', category: 'Cutting', service: 'Clipper Cut', price: '30.00', servicetime: '30' },
        { type: 'Hair Services', category: 'Cutting', service: 'Scissor Cut', price: '35.00', servicetime: '45' },
        
        { type: 'Hair Services', category: 'Color', service: 'Touch-Up', price: '90.00', servicetime: '60' },
        { type: 'Hair Services', category: 'Color', service: 'Partial Highlight', price: '130.00', servicetime: '90' },
        { type: 'Hair Services', category: 'Color', service: 'Full Highlight', price: '150.00', servicetime: '120' },
        { type: 'Hair Services', category: 'Color', service: 'Full Color', price: '130.00', servicetime: '120' },
        { type: 'Hair Services', category: 'Color', service: 'Keratin Curl/Relaxer', price: '140.00', servicetime: '150' },
        
        { type: 'Hair Services', category: 'Perm', service: 'Short Hair (Start @)', price: '120.00', servicetime: '120' },
        
        { type: 'Hair Services', category: 'Styling', service: 'Updo (Starts @)', price: '50.00', servicetime: '60' },
        { type: 'Hair Services', category: 'Styling', service: 'Shampoo & Blow Dry', price: '35.00', servicetime: '45' },
        
        // Nail Services
        { type: 'Nail Services', category: 'Full Set', service: 'Acrylic Set', price: '70.00', servicetime: '60' },
        { type: 'Nail Services', category: 'Full Set', service: 'Acrylic Gel Set', price: '75.00', servicetime: '70' },
        { type: 'Nail Services', category: 'Full Set', service: 'Regular Fill', price: '50.00', servicetime: '45' },
        { type: 'Nail Services', category: 'Full Set', service: 'Gel Fill', price: '55.00', servicetime: '50' },
        
        { type: 'Nail Services', category: 'Dipping Powder Manicure', service: 'Regular', price: '55.00', servicetime: '60' },
        { type: 'Nail Services', category: 'Dipping Powder Manicure', service: 'Rejuvenate with Paraffin Wax', price: '65.00', servicetime: '75' },
        
        { type: 'Nail Services', category: 'Silk', service: 'Pink & White Manicure', price: '70.00', servicetime: '60' },
        { type: 'Nail Services', category: 'Silk', service: 'Pink & White Fill', price: '60.00', servicetime: '50' },
        
        { type: 'Nail Services', category: 'Pedicure', service: 'Regular Pedicure', price: '50.00', servicetime: '45' },
        { type: 'Nail Services', category: 'Pedicure', service: 'Rejuvenate Pedicure with Paraffin Wax', price: '60.00', servicetime: '60' },
        
        // Waxing Services
        { type: 'Waxing Services', category: 'Facial Waxing', service: 'Eyebrows', price: '15.00', servicetime: '15' },
        { type: 'Waxing Services', category: 'Facial Waxing', service: 'Eyebrows & Upper Lip', price: '20.00', servicetime: '20' },
        { type: 'Waxing Services', category: 'Facial Waxing', service: 'Chin/Upper Lip', price: '10.00', servicetime: '10' },
        
        { type: 'Waxing Services', category: 'Body Waxing', service: 'Underarms', price: '25.00', servicetime: '15' },
        { type: 'Waxing Services', category: 'Body Waxing', service: 'Bikini Line', price: '35.00', servicetime: '30' },
        { type: 'Waxing Services', category: 'Body Waxing', service: 'Brazilian Waxing (Starting at)', price: '70.00', servicetime: '45' },
        { type: 'Waxing Services', category: 'Body Waxing', service: 'Brazilian Waxing (Backside Included)', price: '90.00', servicetime: '60' },
        
        // Eyelash Services
        { type: 'Eyelash Services', category: 'New Set', service: 'Full Set (Starting @)', price: '120.00', servicetime: '90' },
        { type: 'Eyelash Services', category: 'Refill', service: 'Refill (2 Weeks)', price: '60.00', servicetime: '45' },
        
        // Relaxation
        { type: 'Massage Services', category: '30-Minute Session', service: 'Aromatherapy Massage with Hot Towel', price: '45.00', servicetime: '30' },
        { type: 'Massage Services', category: '30-Minute Session', service: 'Shoulder Massage', price: '45.00', servicetime: '30' },
        { type: 'Massage Services', category: '30-Minute Session', service: 'Neck Reflex', price: '45.00', servicetime: '30' },
    ];
}