// Google Sheets ID and configuration
const sheetID = '1NUt36vkRrYxYPRjzqg3JZXIMD552wA78BvV4lID2Nz4';
const CONFIG = {
    fetchTimeout: 10000,
    sheetName: 'Services',
    elementSelector: '.output',
    loadDelay: 500, // Reduced from 1000ms for faster loading
};

// Service type icon mappings
const SERVICE_ICONS = {
    'hair services': { icon: 'fas fa-cut', color: '#6a3093' },
    'nail services': { icon: 'fas fa-hand-sparkles', color: '#e94057' },
    'facial services': { icon: 'fas fa-spa', color: '#16a085' },
    'makeup services': { icon: 'fas fa-paint-brush', color: '#4a00e0' },
    'waxing services': { icon: 'fas fa-tint', color: '#f5af19' },
    'massage services': { icon: 'fas fa-hands', color: '#2c3e50' },
    'default': { icon: 'fas fa-concierge-bell', color: '#8e44ad' }
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
            
            return data;
        } catch (error) {
            console.error('Error fetching Google Sheets data:', error);
            throw error;
        }
    };
    
    /**
     * Generate fallback data in case of service disruption
     * Only used when Google Sheets API fails
     */
    const createFallbackData = () => [
        { type: 'Hair Services', category: 'Cuts', service: 'Shampoo, Cut & Blow Dry', price: '45', servicetime: '30' },
        { type: 'Hair Services', category: 'Cuts', service: 'Child\'s Cut', price: '20', servicetime: '30' },
        { type: 'Hair Services', category: 'Cuts', service: 'Men\'s Cut', price: '25', servicetime: '30' },
        { type: 'Hair Services', category: 'Color', service: 'Root Touch-up', price: '70', servicetime: '60' },
        { type: 'Hair Services', category: 'Color', service: 'Full Color', price: '90', servicetime: '90' },
        { type: 'Nail Services', category: 'Manicure', service: 'Regular Manicure', price: '25', servicetime: '30' },
        { type: 'Nail Services', category: 'Manicure', service: 'Gel Manicure', price: '40', servicetime: '45' },
        { type: 'Nail Services', category: 'Pedicure', service: 'Regular Pedicure', price: '35', servicetime: '45' },
        { type: 'Facial Services', category: 'Facial', service: 'Express Facial', price: '45', servicetime: '30' },
        { type: 'Facial Services', category: 'Facial', service: 'Deep Cleansing Facial', price: '75', servicetime: '60' },
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
    
    return { fetchFromGoogleSheets, createFallbackData, organizeServiceData };
})();

/**
 * UI Module - Handles all rendering and UI interaction
 */
const UIModule = (() => {
    // Get service type icon based on service type
    const getServiceTypeIcon = (type) => {
        const lowerType = type.toLowerCase();
        const iconData = SERVICE_ICONS[lowerType] || SERVICE_ICONS.default;
        return `<i class="${iconData.icon} service-icon" style="color: ${iconData.color}"></i>`;
    };
    
    // Get service background class based on service type
    const getServiceBgClass = (type) => 
        `service-header-bg ${type.toLowerCase().replace(/\s+/g, '-')}-bg`;
    
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
     * UI helper functions for error handling and loading states
     */
    const showError = (message, container) => {
        if (!container) return;
        
        container.innerHTML = `
            <div class="service-error-container">
                <div class="service-error">
                    <h3 class="service-error-title">Unable to load services</h3>
                    <p class="service-error-message">${message}</p>
                    <button class="service-error-retry" id="retryButton">
                        Try Again
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
    } catch (error) {
        console.error('Failed to load from Google Sheets, using fallback data:', error);
        const fallbackData = ServiceDataModule.createFallbackData();
        UIModule.renderServices(ServiceDataModule.organizeServiceData(fallbackData), outputContainer);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all dependencies are loaded
    setTimeout(initializeServices, CONFIG.loadDelay);
    
    // Set timeout fallback if Google Sheets fetch is too slow
    setTimeout(() => {
        const outputContainer = document.querySelector(CONFIG.elementSelector);
        if (outputContainer?.querySelector('.service-loader')) {
            console.warn('Google Sheets data load timed out, falling back to sample data');
            const fallbackData = ServiceDataModule.createFallbackData();
            UIModule.renderServices(ServiceDataModule.organizeServiceData(fallbackData), outputContainer);
        }
    }, CONFIG.fetchTimeout);
});