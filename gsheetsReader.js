// Google Sheets ID
const sheetID = '1NUt36vkRrYxYPRjzqg3JZXIMD552wA78BvV4lID2Nz4';

// Configuration object for easily modifying key aspects
const CONFIG = {
    fetchTimeout: 10000,  // Timeout for fetching data (ms)
    sheetName: 'Services', // Name of the sheet to fetch
    elementSelector: '.output', // Selector for the output element
    loadDelay: 1000, // Delay before loading data (ms)
};

// Service type icons mapping
const SERVICE_ICONS = {
    'hair services': { icon: 'fas fa-cut', color: '#6a3093' },
    'nail services': { icon: 'fas fa-hand-sparkles', color: '#e94057' },
    'facial services': { icon: 'fas fa-spa', color: '#16a085' },
    'makeup services': { icon: 'fas fa-magic', color: '#4a00e0' },
    'waxing services': { icon: 'fas fa-fire', color: '#f5af19' },
    'massage services': { icon: 'fas fa-hands', color: '#2c3e50' },
    'default': { icon: 'fas fa-concierge-bell', color: '#8e44ad' }
};

// Category icons mapping by service type
const CATEGORY_ICONS = {
    'hair services': {
        'cuts': 'fas fa-cut',
        'color': 'fas fa-palette',
        'style': 'fas fa-wind',
        'styling': 'fas fa-wind',
        'treatment': 'fas fa-pump-soap',
        'default': 'fas fa-gem'
    },
    'nail services': {
        'manicure': 'fas fa-hand-paper',
        'pedicure': 'fas fa-shoe-prints',
        'default': 'fas fa-magic'
    },
    'facial services': {
        'facial': 'fas fa-smile',
        'treatment': 'fas fa-seedling',
        'default': 'fas fa-leaf'
    },
    'default': {
        'default': 'fas fa-star'
    }
};

/**
 * Service Data Module - Handles all data operations
 */
const ServiceDataModule = (() => {
    /**
     * Fetch data from Google Sheets
     * @returns {Promise} Promise that resolves to the processed data
     */
    const fetchFromGoogleSheets = () => {
        return new Promise((resolve, reject) => {
            const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?`;
            const query = encodeURIComponent('Select *');
            const url = `${base}&sheet=${CONFIG.sheetName}&tq=${query}`;
            
            console.log('Fetching data from:', url);
            
            fetch(url)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! Status: ${res.status}`);
                    }
                    return res.text();
                })
                .then(rep => {
                    try {
                        // Extract valid JSON from Google's response
                        const firstBrace = rep.indexOf('{');
                        const lastBrace = rep.lastIndexOf('}');
                        
                        if (firstBrace === -1 || lastBrace === -1) {
                            throw new Error('Invalid response format from Google Sheets');
                        }
                        
                        const jsonString = rep.substring(firstBrace, lastBrace + 1);
                        const jsData = JSON.parse(jsonString);
                        
                        if (!jsData.table || !jsData.table.cols || !jsData.table.rows) {
                            throw new Error('Google Sheets data does not have the expected structure');
                        }
                        
                        // Extract column names
                        const columns = jsData.table.cols
                            .filter(col => col.label)
                            .map(col => col.label.toLowerCase().replace(/\s/g, ''));
                        
                        // Process each row of data
                        const data = jsData.table.rows.map(row => {
                            const dataRow = {};
                            columns.forEach((col, index) => {
                                dataRow[col] = (row.c[index] != null) ? row.c[index].v : '';
                            });
                            return dataRow;
                        });
                        
                        console.log(`Processed ${data.length} rows of data`);
                        resolve(data);
                    } catch (error) {
                        console.error('Error parsing Google Sheets data:', error);
                        reject(error);
                    }
                })
                .catch(error => {
                    console.error('Error fetching Google Sheets data:', error);
                    reject(error);
                });
        });
    };
    
    /**
     * Generate sample data for testing or as fallback
     * @returns {Array} Array of service objects
     */
    const createSampleData = () => {
        return [
            { type: 'Hair Services', category: 'Cuts', service: 'Shampoo, Cut & Blow Dry', price: '45', servicetime: '30' },
            { type: 'Hair Services', category: 'Cuts', service: 'Child\'s Cut', price: '20', servicetime: '30' },
            { type: 'Hair Services', category: 'Cuts', service: 'Clipper Cut', price: '20', servicetime: '30' },
            { type: 'Hair Services', category: 'Cuts', service: 'Men\'s Cut', price: '25', servicetime: '30' },
            { type: 'Hair Services', category: 'Color', service: 'Root Touch-up', price: '70', servicetime: '60' },
            { type: 'Hair Services', category: 'Color', service: 'Full Color', price: '90', servicetime: '90' },
            { type: 'Hair Services', category: 'Color', service: 'Balayage', price: '150', servicetime: '120' },
            { type: 'Hair Services', category: 'Styling', service: 'Blow Dry & Style', price: '35', servicetime: '45' },
            { type: 'Hair Services', category: 'Styling', service: 'Updo', price: '75', servicetime: '60' },
            { type: 'Nail Services', category: 'Manicure', service: 'Regular Manicure', price: '25', servicetime: '30' },
            { type: 'Nail Services', category: 'Manicure', service: 'Gel Manicure', price: '40', servicetime: '45' },
            { type: 'Nail Services', category: 'Pedicure', service: 'Regular Pedicure', price: '35', servicetime: '45' },
            { type: 'Nail Services', category: 'Pedicure', service: 'Deluxe Pedicure', price: '50', servicetime: '60' },
            { type: 'Facial Services', category: 'Facial', service: 'Express Facial', price: '45', servicetime: '30' },
            { type: 'Facial Services', category: 'Facial', service: 'Deep Cleansing Facial', price: '75', servicetime: '60' },
            { type: 'Facial Services', category: 'Treatment', service: 'Chemical Peel', price: '90', servicetime: '45' },
        ];
    };
    
    /**
     * Group data by service type and category
     * @param {Array} data - Raw service data
     * @returns {Object} Hierarchically organized data
     */
    const organizeServiceData = (data) => {
        const services = {};
        
        data.forEach(item => {
            if (!item.type) return;
            
            const serviceType = item.type;
            const category = item.category || 'Uncategorized';
            
            // Initialize service type if it doesn't exist
            if (!services[serviceType]) {
                services[serviceType] = {};
            }
            
            // Initialize category if it doesn't exist
            if (!services[serviceType][category]) {
                services[serviceType][category] = [];
            }
            
            // Add service to its category
            services[serviceType][category].push({
                name: item.service || '',
                price: item.price || '',
                time: item.servicetime || '',
                description: item.description || '',
                popular: item.popular === 'TRUE' || item.popular === true
            });
        });
        
        return services;
    };
    
    return {
        fetchFromGoogleSheets,
        createSampleData,
        organizeServiceData
    };
})();

/**
 * UI Module - Handles all rendering and UI interaction
 */
const UIModule = (() => {
    /**
     * Get icon HTML for a service type
     * @param {string} type - The service type
     * @returns {string} HTML for the icon
     */
    const getServiceTypeIcon = (type) => {
        const lowerType = type.toLowerCase();
        const iconData = SERVICE_ICONS[lowerType] || SERVICE_ICONS.default;
        return `<i class="${iconData.icon} service-icon" style="color: ${iconData.color}"></i>`;
    };
    
    /**
     * Get CSS class for service type background
     * @param {string} type - The service type
     * @returns {string} CSS class name
     */
    const getServiceBgClass = (type) => {
        const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
        return `service-header-bg ${normalizedType}-bg`;
    };
    
    /**
     * Get appropriate icon for a category
     * @param {string} serviceType - The parent service type
     * @param {string} category - The category name
     * @returns {string} HTML for the icon link
     */
    const getCategoryIcon = (serviceType, category) => {
        if (!category) return '';
        
        const type = serviceType.toLowerCase();
        const cat = category.toLowerCase();
        
        // Get the icon mapping for this service type
        const iconMap = CATEGORY_ICONS[type] || CATEGORY_ICONS.default;
        
        // Find a matching icon or use default
        let iconClass = iconMap.default;
        
        // Check for specific matches
        for (const key in iconMap) {
            if (key !== 'default' && cat.includes(key)) {
                iconClass = iconMap[key];
                break;
            }
        }
        
        // Return clickable icon with title
        return `<a href="javascript:void(0);" class="category-icon-link" title="View ${category} services">
                    <i class="${iconClass} category-icon"></i>
                </a>`;
    };
    
    /**
     * Generate HTML for service cards
     * @param {Object} serviceData - Organized service data
     * @returns {string} Generated HTML
     */
    const generateServiceCardsHTML = (serviceData) => {
        let html = '';
        let isFirst = true;
        
        // Loop through each service type
        Object.entries(serviceData).forEach(([serviceType, categories]) => {
            const serviceTypeId = serviceType.replace(/\s+/g, '_');
            
            html += `
            <div class="service-card ${getServiceBgClass(serviceType)}">
                <div class="service-card-header" id="heading${serviceTypeId}">
                    <button class="service-card-button ${isFirst ? 'expanded' : ''}" 
                            type="button" 
                            data-toggle="collapse" 
                            data-target="#collapse${serviceTypeId}" 
                            aria-expanded="${isFirst ? 'true' : 'false'}" 
                            aria-controls="collapse${serviceTypeId}">
                        ${getServiceTypeIcon(serviceType)}
                        <span class="service-type-name">${serviceType}</span>
                        <i class="fas fa-angle-down toggle-icon"></i>
                    </button>
                </div>
                
                <div id="collapse${serviceTypeId}" 
                     class="service-card-collapse collapse ${isFirst ? 'show' : ''}" 
                     aria-labelledby="heading${serviceTypeId}">
                    <div class="service-card-body">`;
            
            // Loop through each category within this service type
            Object.entries(categories).forEach(([category, services]) => {
                html += `
                    <div class="service-category" data-category="${category.toLowerCase()}">
                        <div class="category-header">
                            ${getCategoryIcon(serviceType, category)}
                            <h3 class="category-name">${category}</h3>
                        </div>
                        <div class="service-list">`;
                
                // Loop through services in this category
                services.forEach(service => {
                    html += `
                        <div class="service-item ${service.popular ? 'popular-service' : ''}">
                            <div class="service-details">
                                <div class="service-info">
                                    <h4 class="service-name">
                                        <i class="fas fa-angle-right service-item-icon"></i>
                                        ${service.name}
                                        ${service.popular ? '<span class="popular-badge">Popular</span>' : ''}
                                    </h4>
                                    ${service.description ? `<p class="service-description">${service.description}</p>` : ''}
                                </div>
                                <div class="service-meta">
                                    <div class="service-price">$${service.price}</div>
                                    <div class="service-time">${service.time} minutes</div>
                                </div>
                            </div>
                        </div>`;
                });
                
                html += `
                        </div>
                    </div>`;
            });
            
            html += `
                    </div>
                </div>
            </div>`;
            
            isFirst = false;
        });
        
        return html;
    };
    
    /**
     * Display error message if data fetch fails
     * @param {string} message - Error message to display
     * @param {Element} container - Container to render error in
     */
    const showError = (message, container) => {
        if (!container) return;
        
        container.innerHTML = `
            <div class="service-error-container">
                <div class="service-error">
                    <div class="service-error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h3 class="service-error-title">Unable to load services</h3>
                    <p class="service-error-message">${message}</p>
                    <button class="service-error-retry" id="retryButton">
                        <i class="fas fa-sync-alt"></i> Try Again
                    </button>
                </div>
            </div>`;
            
        // Add retry button functionality
        document.getElementById('retryButton')?.addEventListener('click', () => {
            initializeServices();
        });
    };
    
    /**
     * Show loading spinner
     * @param {Element} container - Container to render spinner in
     */
    const showLoadingSpinner = (container) => {
        if (!container) return;
        
        container.innerHTML = `
            <div class="service-loader">
                <div class="service-spinner"></div>
                <p>Loading services...</p>
            </div>`;
    };
    
    /**
     * Setup category filtering functionality
     */
    const setupCategoryFilters = () => {
        document.querySelectorAll('.category-icon-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const categoryHeader = link.closest('.category-header');
                const categoryBlock = link.closest('.service-category');
                const serviceCard = link.closest('.service-card-body');
                const allCategories = serviceCard.querySelectorAll('.service-category');
                
                // If already active, show all categories
                if (link.classList.contains('active-filter')) {
                    link.classList.remove('active-filter');
                    allCategories.forEach(cat => {
                        cat.style.display = '';
                    });
                    return;
                }
                
                // Clear any existing active filters
                serviceCard.querySelectorAll('.category-icon-link').forEach(otherLink => {
                    otherLink.classList.remove('active-filter');
                });
                
                // Activate this filter
                link.classList.add('active-filter');
                
                // Hide all other categories
                allCategories.forEach(cat => {
                    if (cat === categoryBlock) {
                        cat.style.display = '';
                    } else {
                        cat.style.display = 'none';
                    }
                });
            });
        });
    };
    
    /**
     * Setup accordion toggle functionality
     */
    const setupAccordion = () => {
        document.querySelectorAll('.service-card-button').forEach(button => {
            button.addEventListener('click', () => {
                const target = document.querySelector(button.getAttribute('data-target'));
                const isExpanded = button.classList.contains('expanded');
                
                // Toggle expanded state
                if (isExpanded) {
                    button.classList.remove('expanded');
                    button.setAttribute('aria-expanded', 'false');
                    target.classList.remove('show');
                } else {
                    button.classList.add('expanded');
                    button.setAttribute('aria-expanded', 'true');
                    target.classList.add('show');
                }
            });
        });
    };
    
    /**
     * Render services and setup event handlers
     * @param {Object} serviceData - Organized service data
     * @param {Element} container - Container to render into
     */
    const renderServices = (serviceData, container) => {
        if (!container) return;
        
        // Calculate the number of total services for summary
        let totalServices = 0;
        Object.values(serviceData).forEach(categories => {
            Object.values(categories).forEach(services => {
                totalServices += services.length;
            });
        });
        
        // Render service cards
        container.innerHTML = `
            <div class="services-summary">
                <p><strong>${Object.keys(serviceData).length}</strong> service types with <strong>${totalServices}</strong> services available</p>
            </div>
            <div class="service-cards-container">
                ${generateServiceCardsHTML(serviceData)}
            </div>`;
        
        // Setup interaction handlers
        setupAccordion();
        setupCategoryFilters();
    };
    
    return {
        renderServices,
        showError,
        showLoadingSpinner
    };
})();

/**
 * Main initialization function
 */
function initializeServices() {
    // Get the output container
    const outputContainer = document.querySelector(CONFIG.elementSelector);
    if (!outputContainer) {
        console.error(`Output container not found with selector: ${CONFIG.elementSelector}`);
        return;
    }
    
    // Show loading spinner
    UIModule.showLoadingSpinner(outputContainer);
    
    // Try to fetch Google Sheets data
    ServiceDataModule.fetchFromGoogleSheets()
        .then(data => {
            const organizedData = ServiceDataModule.organizeServiceData(data);
            UIModule.renderServices(organizedData, outputContainer);
            console.log('Services successfully loaded from Google Sheets');
        })
        .catch(error => {
            console.error('Failed to load from Google Sheets, using sample data:', error);
            const sampleData = ServiceDataModule.createSampleData();
            const organizedData = ServiceDataModule.organizeServiceData(sampleData);
            UIModule.renderServices(organizedData, outputContainer);
        });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing services...');
    
    // Add a small delay to ensure all dependencies are loaded
    setTimeout(initializeServices, CONFIG.loadDelay);
    
    // Set timeout fallback to sample data if Google Sheets fetch is too slow
    setTimeout(() => {
        const outputContainer = document.querySelector(CONFIG.elementSelector);
        
        // If container still has the loading spinner, use sample data
        if (outputContainer && outputContainer.querySelector('.service-loader')) {
            console.warn('Google Sheets data load timed out, falling back to sample data');
            const sampleData = ServiceDataModule.createSampleData();
            const organizedData = ServiceDataModule.organizeServiceData(sampleData);
            UIModule.renderServices(organizedData, outputContainer);
        }
    }, CONFIG.fetchTimeout);
});