import './NavBar.css';
import Login from "./Login";
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { is_logged_in_admin } from "../apiUtil"


function NavBar(props) {
  let [adminPageLink, setAdminPageLink] = useState("");

  useEffect(() => {
    if (props.userID !== undefined) {
      is_logged_in_admin(props.userID, props.token).then(result => {
        if (result === true) {
          setAdminPageLink(<Link to="/admin">Admin</Link>);
        } else {
          setAdminPageLink("");
        }
      });
    } else {
      setAdminPageLink("");
    }
  }, [props.token]);

  return (
    <span className="NavBar">
      <Link to="/">Events</Link>
      <Link to="/about">About</Link>
      {adminPageLink}
      {props.userName}
      <Login
        userID={props.userID} setUserID={props.setUserID}
        setUserName={props.setUserName}
        token={props.token} setToken={props.setToken}
      />
    </span>
  );
}

export default NavBar;
