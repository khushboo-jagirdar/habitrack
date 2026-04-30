/**
 * Extract main location name from full address
 * Removes nearby location names and extra details
 * @param {string} address - Full address with nearby locations
 * @returns {string} - Main location name only
 */
export function getMainLocationName(address) {
    if (!address) return '';
    
    // Split by comma and take only the first part (main location)
    const mainLocation = address.split(',')[0].trim();
    
    return mainLocation;
}
