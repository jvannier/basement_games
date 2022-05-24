import './NavBar.css';
import Login from "./Login";
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { is_logged_in_admin } from "../api_util"


function NavBar(props) {
  let [adminPageLink, setAdminPageLink] = useState(false);

  useEffect(() => {
    if (props.userID !== undefined) {
      is_logged_in_admin(props.userID).then(result => {
        if (result === true) {
          setAdminPageLink(<Link to="/admin">Admin</Link>);
        } else {
          setAdminPageLink("")
        }
      });
    }
  }, []);

  return (
    <span className="NavBar">
      <Link to="/">Events</Link>
      <Link to="/about">About</Link>
      {adminPageLink}
      {props.userName}
      <Login userID={props.userID} setUserID={props.setUserID} setUserName={props.setUserName}/>
    </span>
  );
}

export default NavBar;
