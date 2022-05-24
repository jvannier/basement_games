import React, { useEffect, useState } from "react";
import { make_api_call } from "../api_util";


function About(props) {
    const [results, setResults] = useState("NO RESULTS");
    // TODO: Use data store or redux instead of passing all parms around as query params?
  
    useEffect(() => {
        // TODO will delete this
        // make_api_call(`/users/?id=${props.userID}`).then(data => {
        //     setResults(data);
        // });
    }, []);

    return (
        <div>
            TODO: WTF ARE WE?
            |{props.userID}|

            <p> Users: { JSON.stringify(results) } </p>
        </div>
    );
}

export default About;