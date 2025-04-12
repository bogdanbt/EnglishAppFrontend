import React, { useEffect, useState } from "react";
import API from "../utils/api";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    API.get("/profile")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Profile Page</h2>
      {user ? <p>Welcome, {user.email}!</p> : <p>Loading profile...</p>}
    </div>
  );
};

export default Profile;
