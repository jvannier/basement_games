const sqlstring = require('sqlstring');


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
    alphanumerical_regex = /^[\w@. \d]+$/;

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


const escape_arg = (arg) => {
    arg = sqlstring.escape(arg);
    if (typeof(arg) === 'string') {
        // \' as escaping doesn't work with the library used in this code
        arg = arg.replace(/\\'/g, "''");
    }
    return arg;
}
// exported separately so escape_args can use the function
module.exports.escape_arg = escape_arg;


module.exports.unescape_arg = (arg) => {
    if (typeof(arg) !== 'string') {
        return arg
    }

    // Double escape it to ensure all escapes are escaped twice
    // so it's easy to find (and remove / 'replace' them)
    let double_escaped = escape_arg(arg);
    let unescaped = double_escaped.replace(/\\/g, "");

    // Replace double ''s added from \' not working with this sql librbary
    unescaped = unescaped.replace(/''/g, "'");
    // Remove uneeded surrounding quotes
    return unescaped.slice(1, -1);
}


// TODO: use this in detect_sql_injection instead of raising an error
module.exports.escape_args = (params) => {
    // Iterate over all params and escape them
    for (let param in params) {
        params[param] = escape_arg(params[param]);
    }
    return params;
}
