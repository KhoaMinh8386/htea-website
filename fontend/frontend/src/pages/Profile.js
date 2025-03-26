import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <h2>Vui lòng đăng nhập để xem hồ sơ.</h2>;
  }

  return (
    <div>
      <h2>📄 Hồ Sơ Cá Nhân</h2>
      <p><strong>👤 Tên đăng nhập:</strong> {user.username}</p>
    </div>
  );
};

export default Profile;
