import { useState } from "react";
import axios from "axios";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8001/api/signup/",
        {
          username,
          password,
        }
      );

      alert(response.data.message);
      console.log(response.data);
    } catch (error) {
      console.log(error.response?.data);
      alert(
        JSON.stringify(error.response?.data || "Something went wrong")
      );
    }
  };

  return (
    <div>
      <h2>Signup</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleSignup}>
        Signup
      </button>
    </div>
  );
}

export default Signup;