// Google Sheets ID and configuration
const sheetID = '1NUt36vkRrYxYPRjzqg3JZXIMD552wA78BvV4lID2Nz4';
const CONFIG = {
    fetchTimeout: 10000,
    sheetName: 'Services',
    elementSelector: '.output',
    loadDelay: 1000,
};

// Icon mappings
const SERVICE_ICONS = {
    'hair services': { icon: 'fas fa-cut', color: '#6a3093' },
    'nail services': { icon: 'fas fa-hand-sparkles', color: '#e94057' },
    'facial services': { icon: 'fas fa-spa', color: '#16a085' },
    'makeup services': { icon: 'fas fa-paint-brush', color: '#4a00e0' },
    'waxing services': { icon: 'fas fa-tint', color: '#f5af19' },
    'massage services': { icon: 'fas fa-hands', color: '#2c3e50' },
    'default': { icon: 'fas fa-concierge-bell', color: '#8e44ad' }
};

// Category icons by service type
const CATEGORY_ICONS = {
    'hair services': {
        'cuts': 'fas fa-cut',
        'color': 'fas fa-palette',
        'style': 'fas fa-spray-can',
        'styling': 'fas fa-spray-can',
        'treatment': 'fas fa-pump-soap',
        'braids': 'fas fa-vector-square',
        'extensions': 'fas fa-expand',
        'perms': 'fas fa-wave-square',
        'default': 'fas fa-gem'
    },
    'nail services': {
        'manicure': 'fas fa-hand-paper',
        'pedicure': 'fas fa-shoe-prints',
        'gel': 'fas fa-paint-brush',
        'acrylic': 'fas fa-chess-board',
        'polish': 'fas fa-fill-drip',
        'nail art': 'fas fa-star',
        'default': 'fas fa-magic'
    },
    'facial services': {
        'facial': 'fas fa-smile',
        'treatment': 'fas fa-seedling',
        'mask': 'fas fa-mask',
        'cleansing': 'fas fa-shower',
        'exfoliation': 'fas fa-broom',
        'extraction': 'fas fa-compress',
        'default': 'fas fa-leaf'
    },
    'makeup services': {
        'bridal': 'fas fa-glass-cheers',
        'special occasion': 'fas fa-birthday-cake',
        'everyday': 'fas fa-brush',
        'eyes': 'fas fa-eye',
        'lips': 'fas fa-kiss',
        'default': 'fas fa-paint-brush'
    },
    'waxing services': {
        'face': 'fas fa-smile',
        'body': 'fas fa-user',
        'arms': 'fas fa-hand-paper',
        'legs': 'fas fa-socks',
        'bikini': 'fas fa-venus',
        'default': 'fas fa-tint'
    },
    'massage services': {
        'swedish': 'fas fa-water',
        'deep tissue': 'fas fa-fist-raised',
        'hot stone': 'fas fa-mountain',
        'aromatherapy': 'fas fa-air-freshener',
        'scalp': 'fas fa-head-side',
        'foot': 'fas fa-shoe-prints',
        'default': 'fas fa-hands'
    },
    'default': { 'default': 'fas fa-star' }
};

/**
 * Service Data Module - Handles all data operations
 */
const ServiceDataModule = (() => {
    /**
     * Fetch data from Google Sheets
     * @returns {Promise} Promise that resolves to the processed data
     */
    const fetchFromGoogleSheets = async () => {
        try {
            const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?`;
            const query = encodeURIComponent('Select *');
            const url = `${base}&sheet=${CONFIG.sheetName}&tq=${query}`;
            
            console.log('Fetching data from:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const text = await response.text();
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            
            if (firstBrace === -1 || lastBrace === -1) {
                throw new Error('Invalid response format from Google Sheets');
            }
            
            const jsonString = text.substring(firstBrace, lastBrace + 1);
            const jsData = JSON.parse(jsonString);
            
            if (!jsData.table || !jsData.table.cols || !jsData.table.rows) {
                throw new Error('Google Sheets data does not have the expected structure');
            }
            
            // Extract column names and process rows
            const columns = jsData.table.cols
                .filter(col => col.label)
                .map(col => col.label.toLowerCase().replace(/\s/g, ''));
            
            const data = jsData.table.rows.map(row => {
                const dataRow = {};
                columns.forEach((col, index) => {
                    dataRow[col] = (row.c[index] != null) ? row.c[index].v : '';
                });
                return dataRow;
            });
            
            console.log(`Processed ${data.length} rows of data`);
            return data;
        } catch (error) {
            console.error('Error fetching Google Sheets data:', error);
            throw error;
        }
    };
    
    /**
     * Generate sample data for testing or as fallback
     */
    const createSampleData = () => [
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
            
            // Initialize service type and category if they don't exist
            if (!services[serviceType]) services[serviceType] = {};
            if (!services[serviceType][category]) services[serviceType][category] = [];
            
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
    
    return { fetchFromGoogleSheets, createSampleData, organizeServiceData };
})();

/**
 * UI Module - Handles all rendering and UI interaction
 */
const UIModule = (() => {
    // Helper functions for icons and styling
    const getServiceTypeIcon = (type) => {
        const lowerType = type.toLowerCase();
        const iconData = SERVICE_ICONS[lowerType] || SERVICE_ICONS.default;
        return `<i class="${iconData.icon} service-icon" style="color: ${iconData.color}"></i>`;
    };
    
    const getServiceBgClass = (type) => 
        `service-header-bg ${type.toLowerCase().replace(/\s+/g, '-')}-bg`;
    
    const getCategoryIcon = (serviceType, category) => {
        if (!category) return '';
        
        const type = serviceType.toLowerCase();
        const cat = category.toLowerCase();
        const iconMap = CATEGORY_ICONS[type] || CATEGORY_ICONS.default;
        
        // Find matching icon or use default
        let iconClass = iconMap.default;
        for (const key in iconMap) {
            if (key !== 'default' && cat.includes(key)) {
                iconClass = iconMap[key];
                break;
            }
        }
        
        return `<a href="javascript:void(0);" class="category-icon-link" title="View ${category} services">
                    <i class="${iconClass} category-icon"></i>
                </a>`;
    };
    
    /**
     * Generate HTML for service cards
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
            
            // Loop through categories
            Object.entries(categories).forEach(([category, services]) => {
                html += `
                    <div class="service-category" data-category="${category.toLowerCase()}">
                        <div class="category-header">
                            ${getCategoryIcon(serviceType, category)}
                            <h3 class="category-name">${category}</h3>
                        </div>
                        <div class="service-list">`;
                
                // Loop through services
                services.forEach(service => {
                    html += `
                        <div class="service-item ${service.popular ? 'popular-service' : ''}">
                            <div class="service-details">
                                <div class="service-info">
                                    <h4 class="service-name">
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
                
                html += `</div></div>`;
            });
            
            html += `</div></div></div>`;
            isFirst = false;
        });
        
        return html;
    };
    
    /**
     * UI helper functions
     */
    const showError = (message, container) => {
        if (!container) return;
        
        container.innerHTML = `
            <div class="service-error-container">
                <div class="service-error">
                    <div class="service-error-icon"><i class="fas fa-exclamation-circle"></i></div>
                    <h3 class="service-error-title">Unable to load services</h3>
                    <p class="service-error-message">${message}</p>
                    <button class="service-error-retry" id="retryButton">
                        <i class="fas fa-sync-alt"></i> Try Again
                    </button>
                </div>
            </div>`;
            
        document.getElementById('retryButton')?.addEventListener('click', initializeServices);
    };
    
    const showLoadingSpinner = (container) => {
        if (!container) return;
        container.innerHTML = `
            <div class="service-loader">
                <div class="service-spinner"></div>
                <p>Loading services...</p>
            </div>`;
    };
    
    /**
     * Setup interactive elements
     */
    const setupInteractions = () => {
        // Category filtering
        document.querySelectorAll('.category-icon-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryBlock = link.closest('.service-category');
                const serviceCard = link.closest('.service-card-body');
                const allCategories = serviceCard.querySelectorAll('.service-category');
                
                // Toggle filtering
                if (link.classList.contains('active-filter')) {
                    link.classList.remove('active-filter');
                    allCategories.forEach(cat => cat.style.display = '');
                } else {
                    // Clear existing filters and set new one
                    serviceCard.querySelectorAll('.category-icon-link')
                        .forEach(otherLink => otherLink.classList.remove('active-filter'));
                    link.classList.add('active-filter');
                    
                    // Show only the selected category
                    allCategories.forEach(cat => {
                        cat.style.display = (cat === categoryBlock) ? '' : 'none';
                    });
                }
            });
        });
        
        // Accordion toggle
        document.querySelectorAll('.service-card-button').forEach(button => {
            button.addEventListener('click', () => {
                const target = document.querySelector(button.getAttribute('data-target'));
                const isExpanded = button.classList.contains('expanded');
                
                // Toggle expanded state
                button.classList.toggle('expanded', !isExpanded);
                button.setAttribute('aria-expanded', !isExpanded);
                target.classList.toggle('show', !isExpanded);
            });
        });
    };
    
    /**
     * Render services and setup event handlers
     */
    const renderServices = (serviceData, container) => {
        if (!container) return;
        
        // Calculate totals for summary
        const totalServiceTypes = Object.keys(serviceData).length;
        let totalServices = 0;
        Object.values(serviceData).forEach(categories => {
            Object.values(categories).forEach(services => {
                totalServices += services.length;
            });
        });
        
        // Render service cards
        container.innerHTML = `
            <div class="services-summary">
                <p><strong>${totalServiceTypes}</strong> service types with <strong>${totalServices}</strong> services available</p>
            </div>
            <div class="service-cards-container">
                ${generateServiceCardsHTML(serviceData)}
            </div>`;
        
        setupInteractions();
    };
    
    return { renderServices, showError, showLoadingSpinner };
})();

/**
 * Main initialization function
 */
async function initializeServices() {
    const outputContainer = document.querySelector(CONFIG.elementSelector);
    if (!outputContainer) {
        console.error(`Output container not found with selector: ${CONFIG.elementSelector}`);
        return;
    }
    
    UIModule.showLoadingSpinner(outputContainer);
    
    try {
        const data = await ServiceDataModule.fetchFromGoogleSheets();
        const organizedData = ServiceDataModule.organizeServiceData(data);
        UIModule.renderServices(organizedData, outputContainer);
        console.log('Services successfully loaded from Google Sheets');
    } catch (error) {
        console.error('Failed to load from Google Sheets, using sample data:', error);
        const sampleData = ServiceDataModule.createSampleData();
        UIModule.renderServices(ServiceDataModule.organizeServiceData(sampleData), outputContainer);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing services...');
    
    // Add a small delay to ensure all dependencies are loaded
    setTimeout(initializeServices, CONFIG.loadDelay);
    
    // Set timeout fallback if Google Sheets fetch is too slow
    setTimeout(() => {
        const outputContainer = document.querySelector(CONFIG.elementSelector);
        if (outputContainer?.querySelector('.service-loader')) {
            console.warn('Google Sheets data load timed out, falling back to sample data');
            const sampleData = ServiceDataModule.createSampleData();
            UIModule.renderServices(ServiceDataModule.organizeServiceData(sampleData), outputContainer);
        }
    }, CONFIG.fetchTimeout);
});