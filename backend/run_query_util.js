module.exports.run_query = async (client, query, res) => {
    let err, query_result = await client.query(query);
    if (err) {
        return res.status(400).json(err);
    } else {
        return res.status(200).json(query_result.rows);
    }
}


module.exports.detect_sql_injection = async (query_params, res) => {
    // TODO: Support for other languages/characters?
    alphanumerical_regex = /^[\w@.\d]+$/;

    // Iterate over all query params and validate them
    for (let query_param in query_params) {
        is_alphanumerical = alphanumerical_regex.test(query_params[query_param]);

        if (is_alphanumerical === false) {
            return res.status(401).json({
                error: `"${query_params[query_param]}" contains invalid characters. Please contact an admin for assistance.`
            })
        }
    }
}