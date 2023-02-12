export function getAddaptedQuery(
    table, filterOption,
    order, desc,
    offset, limit,
    query, parameters,
    additionalFilterOption
) {

    if (filterOption ? Object.values(filterOption)[0] : false) {
        if (table === "rentals") {
            query += ` WHERE rentals."${Object.keys(filterOption)[0]}" = $1`;
            parameters.push(Object.values(filterOption)[0])
        } else {
            query += ` WHERE ${Object.keys(filterOption)[0]} LIKE $1`
            parameters.push(`${Object.values(filterOption)[0]}%`)
        }
    }

    if(additionalFilterOption ? Object.values(additionalFilterOption)[0] : false) {
        if(parameters.length === 0) {
            query += ` WHERE rentals."${Object.keys(additionalFilterOption)[0]}" = $1`;
        } else {
            query += ` AND rentals."${Object.keys(additionalFilterOption)[0]}" = $2`;
        }
        parameters.push(Object.values(additionalFilterOption)[0])
    }

    if (order) {
        query += ` ORDER BY "${order}"${(desc ? ' DESC' : '')}`
    }

    if (offset) {
        query += " OFFSET $" + (parameters.length + 1)
        parameters.push(offset)
    }

    if (limit) {
        query += " LIMIT $" + (parameters.length + 1)
        parameters.push(limit)
    }

    return query
}