import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../config/axiosConfig";

const UserProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const fetchAPI = async () => {
    try {
      const response = await axiosClient.get("/me");

      setUser(response.data.user.email);
    } catch (error) {
      if (error.response.data.message) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <div className="h-[50vh] grid place-items-center">
      Welcome to your dashboard: {user}
    </div>
  );
};

export default UserProfile;
