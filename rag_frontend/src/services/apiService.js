/**
 * API Service - Handles all backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/**
 * Process document and generate report
 * @param {FormData} formData - Form data containing file/text and settings
 * @returns {Promise<Object>} - Response with document ID and report data
 */
export const processDocument = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/process`, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            throw new Error(`Backend responded with ${response.status}`)
        }

        const payload = await response.json()

        if (!payload.success) {
            throw new Error(payload.error?.message || 'Processing failed')
        }

        return payload
    } catch (error) {
        console.error('API Error:', error)
        throw error
    }
}

/**
 * Health check endpoint
 * @returns {Promise<Object>} - Health status
 */
export const checkHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`)
        return await response.json()
    } catch (error) {
        console.error('Health check failed:', error)
        throw error
    }
}
