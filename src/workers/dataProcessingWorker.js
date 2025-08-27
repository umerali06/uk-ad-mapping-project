/**
 * WebWorker for Data Processing - Handles data validation, cleaning, and transformation
 * This improves UI responsiveness by offloading data processing tasks
 */

// Worker message handler
self.onmessage = function(e) {
    const { type, data, id } = e.data;
    
    try {
        switch (type) {
            case 'VALIDATE_DATA':
                const validationResults = validateData(data);
                self.postMessage({
                    type: 'VALIDATION_COMPLETE',
                    id: id,
                    results: validationResults
                });
                break;
                
            case 'CLEAN_DATA':
                const cleanedData = cleanData(data);
                self.postMessage({
                    type: 'CLEANING_COMPLETE',
                    id: id,
                    results: cleanedData
                });
                break;
                
            case 'TRANSFORM_DATA':
                const transformedData = transformData(data);
                self.postMessage({
                    type: 'TRANSFORMATION_COMPLETE',
                    id: id,
                    results: transformedData
                });
                break;
                
            case 'AGGREGATE_DATA':
                const aggregatedData = aggregateData(data);
                self.postMessage({
                    type: 'AGGREGATION_COMPLETE',
                    id: id,
                    results: aggregatedData
                });
                break;
                
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            id: id,
            error: error.message
        });
    }
};

/**
 * Validate data for required fields and data types
 */
function validateData(data) {
    const { dataset, schema } = data;
    const results = {
        valid: [],
        invalid: [],
        errors: [],
        summary: {
            total: dataset.length,
            valid: 0,
            invalid: 0,
            missingFields: {},
            typeErrors: {}
        }
    };
    
    for (let i = 0; i < dataset.length; i++) {
        const item = dataset[i];
        const validation = validateItem(item, schema);
        
        if (validation.isValid) {
            results.valid.push(item);
            results.summary.valid++;
        } else {
            results.invalid.push({
                item: item,
                errors: validation.errors
            });
            results.summary.invalid++;
            
            // Track error types
            validation.errors.forEach(error => {
                if (error.type === 'missing_field') {
                    results.summary.missingFields[error.field] = (results.summary.missingFields[error.field] || 0) + 1;
                } else if (error.type === 'type_error') {
                    results.summary.typeErrors[error.field] = (results.summary.typeErrors[error.field] || 0) + 1;
                }
            });
        }
        
        // Report progress
        if (i % 100 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / dataset.length) * 100
            });
        }
    }
    
    return results;
}

/**
 * Validate a single data item against schema
 */
function validateItem(item, schema) {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
        // Check if required field exists
        if (rules.required && !(field in item)) {
            errors.push({
                type: 'missing_field',
                field: field,
                message: `Required field '${field}' is missing`
            });
            continue;
        }
        
        // Check field type
        if (rules.type && item[field] !== undefined) {
            const actualType = typeof item[field];
            if (actualType !== rules.type) {
                errors.push({
                    type: 'type_error',
                    field: field,
                    expected: rules.type,
                    actual: actualType,
                    message: `Field '${field}' should be ${rules.type}, got ${actualType}`
                });
            }
        }
        
        // Check numeric range
        if (rules.min !== undefined && item[field] !== undefined) {
            if (typeof item[field] === 'number' && item[field] < rules.min) {
                errors.push({
                    type: 'range_error',
                    field: field,
                    min: rules.min,
                    actual: item[field],
                    message: `Field '${field}' should be >= ${rules.min}, got ${item[field]}`
                });
            }
        }
        
        if (rules.max !== undefined && item[field] !== undefined) {
            if (typeof item[field] === 'number' && item[field] > rules.max) {
                errors.push({
                    type: 'range_error',
                    field: field,
                    max: rules.max,
                    actual: item[field],
                    message: `Field '${field}' should be <= ${rules.max}, got ${item[field]}`
                });
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Clean data by removing invalid entries and fixing common issues
 */
function cleanData(data) {
    const { dataset, cleaningRules } = data;
    const results = {
        cleaned: [],
        removed: [],
        fixed: [],
        summary: {
            total: dataset.length,
            cleaned: 0,
            removed: 0,
            fixed: 0
        }
    };
    
    for (let i = 0; i < dataset.length; i++) {
        const item = dataset[i];
        const cleanedItem = cleanItem(item, cleaningRules);
        
        if (cleanedItem === null) {
            results.removed.push(item);
            results.summary.removed++;
        } else if (cleanedItem !== item) {
            results.fixed.push({
                original: item,
                cleaned: cleanedItem
            });
            results.cleaned.push(cleanedItem);
            results.summary.fixed++;
            results.summary.cleaned++;
        } else {
            results.cleaned.push(cleanedItem);
            results.summary.cleaned++;
        }
        
        // Report progress
        if (i % 100 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / dataset.length) * 100
            });
        }
    }
    
    return results;
}

/**
 * Clean a single data item
 */
function cleanItem(item, rules) {
    let cleanedItem = { ...item };
    let hasChanges = false;
    
    for (const [field, rule] of Object.entries(rules)) {
        if (!(field in cleanedItem)) continue;
        
        const value = cleanedItem[field];
        
        // Handle null/undefined values
        if (value === null || value === undefined) {
            if (rule.removeNulls) {
                return null; // Remove entire item
            } else if (rule.defaultValue !== undefined) {
                cleanedItem[field] = rule.defaultValue;
                hasChanges = true;
            }
            continue;
        }
        
        // Handle string cleaning
        if (typeof value === 'string') {
            if (rule.trim) {
                const trimmed = value.trim();
                if (trimmed !== value) {
                    cleanedItem[field] = trimmed;
                    hasChanges = true;
                }
            }
            
            if (rule.lowercase) {
                const lowercased = value.toLowerCase();
                if (lowercased !== value) {
                    cleanedItem[field] = lowercased;
                    hasChanges = true;
                }
            }
            
            if (rule.removeSpecialChars) {
                const cleaned = value.replace(/[^a-zA-Z0-9\s]/g, '');
                if (cleaned !== value) {
                    cleanedItem[field] = cleaned;
                    hasChanges = true;
                }
            }
        }
        
        // Handle numeric cleaning
        if (typeof value === 'number') {
            if (rule.round !== undefined) {
                const rounded = Math.round(value * Math.pow(10, rule.round)) / Math.pow(10, rule.round);
                if (rounded !== value) {
                    cleanedItem[field] = rounded;
                    hasChanges = true;
                }
            }
            
            if (rule.min !== undefined && value < rule.min) {
                if (rule.clamp) {
                    cleanedItem[field] = rule.min;
                    hasChanges = true;
                } else {
                    return null; // Remove item
                }
            }
            
            if (rule.max !== undefined && value > rule.max) {
                if (rule.clamp) {
                    cleanedItem[field] = rule.max;
                    hasChanges = true;
                } else {
                    return null; // Remove item
                }
            }
        }
    }
    
    return hasChanges ? cleanedItem : item;
}

/**
 * Transform data from one format to another
 */
function transformData(data) {
    const { dataset, transformations } = data;
    const results = [];
    
    for (let i = 0; i < dataset.length; i++) {
        const item = dataset[i];
        const transformedItem = applyTransformations(item, transformations);
        results.push(transformedItem);
        
        // Report progress
        if (i % 100 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                id: data.id,
                progress: (i / dataset.length) * 100
            });
        }
    }
    
    return results;
}

/**
 * Apply transformations to a single item
 */
function applyTransformations(item, transformations) {
    let transformedItem = { ...item };
    
    for (const transformation of transformations) {
        switch (transformation.type) {
            case 'rename_field':
                if (transformation.oldName in transformedItem) {
                    transformedItem[transformation.newName] = transformedItem[transformation.oldName];
                    delete transformedItem[transformation.oldName];
                }
                break;
                
            case 'calculate_field':
                try {
                    const value = evaluateExpression(transformation.expression, transformedItem);
                    transformedItem[transformation.fieldName] = value;
                } catch (error) {
                    console.warn('Failed to calculate field:', error);
                }
                break;
                
            case 'format_field':
                if (transformation.field in transformedItem) {
                    const value = transformedItem[transformation.field];
                    switch (transformation.format) {
                        case 'currency':
                            transformedItem[transformation.field] = `£${value.toFixed(2)}`;
                            break;
                        case 'percentage':
                            transformedItem[transformation.field] = `${(value * 100).toFixed(1)}%`;
                            break;
                        case 'decimal':
                            transformedItem[transformation.field] = value.toFixed(transformation.decimals || 2);
                            break;
                    }
                }
                break;
                
            case 'filter_field':
                if (transformation.field in transformedItem) {
                    const value = transformedItem[transformation.field];
                    if (transformation.condition === 'equals' && value !== transformation.value) {
                        return null; // Filter out this item
                    }
                    if (transformation.condition === 'not_equals' && value === transformation.value) {
                        return null; // Filter out this item
                    }
                }
                break;
        }
    }
    
    return transformedItem;
}

/**
 * Evaluate a simple expression for calculated fields
 */
function evaluateExpression(expression, item) {
    // Simple expression evaluator - in production, use a proper expression parser
    const context = { ...item, Math: Math };
    
    try {
        // Replace field references with actual values
        let evalExpression = expression;
        for (const [field, value] of Object.entries(item)) {
            if (typeof value === 'number') {
                evalExpression = evalExpression.replace(new RegExp(`\\b${field}\\b`, 'g'), value);
            }
        }
        
        return eval(evalExpression);
    } catch (error) {
        throw new Error(`Failed to evaluate expression: ${expression}`);
    }
}

/**
 * Aggregate data by grouping and calculating statistics
 */
function aggregateData(data) {
    const { dataset, aggregation } = data;
    const results = {};
    
    // Group data
    const groups = {};
    for (const item of dataset) {
        const groupKey = aggregation.groupBy.map(field => item[field]).join('|');
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
    }
    
    // Calculate aggregations for each group
    for (const [groupKey, groupItems] of Object.entries(groups)) {
        const groupValues = aggregation.groupBy.map((field, index) => {
            const value = groupItems[0][field];
            return { field, value };
        });
        
        const aggregated = {
            group: groupValues,
            count: groupItems.length,
            aggregations: {}
        };
        
        // Calculate requested aggregations
        for (const agg of aggregation.calculations) {
            const field = agg.field;
            const values = groupItems.map(item => item[field]).filter(v => typeof v === 'number');
            
            if (values.length > 0) {
                switch (agg.operation) {
                    case 'sum':
                        aggregated.aggregations[`${field}_sum`] = values.reduce((a, b) => a + b, 0);
                        break;
                    case 'average':
                        aggregated.aggregations[`${field}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
                        break;
                    case 'min':
                        aggregated.aggregations[`${field}_min`] = Math.min(...values);
                        break;
                    case 'max':
                        aggregated.aggregations[`${field}_max`] = Math.max(...values);
                        break;
                    case 'count':
                        aggregated.aggregations[`${field}_count`] = values.length;
                        break;
                }
            }
        }
        
        results[groupKey] = aggregated;
    }
    
    return Object.values(results);
}

// Export for use in main thread
self.exports = {
    validateData,
    cleanData,
    transformData,
    aggregateData
};
