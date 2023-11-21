import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import whatsappLogo from "../assets/whatsapp-logo.png";
import { Button } from "@mui/material";
import axios from "../axios";
import { LoginContext } from "../contexts";
import "./Login.css";

const Login = () => {
  //const navigate = useNavigate();
  const [user, setUser] = useContext(LoginContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("loginButton");
  const [signInOption, setSignInOption] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  const emailLogin = async () => {
    try {
      const response = await axios.post("/users/login", {
        username: email,
        password,
      });
      setLoginMessage(response.data.messege);
      if (response.data.accessToken) {
        console.log("save token", response.data.accessToken);
        localStorage.setItem("access_token", response.data.accessToken);
        setTimeout(() => {
          setUser({
            isLoggedIn: true,
            name: response.data.name,
            picture: response.data.picture,
            type: "email",
          });
        }, 800);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createAccount = async () => {
    try {
      const response = await axios.post("/users/register", {
        username: email,
        password,
      });
      setLoginMessage(response.data.messege);
      if (response.data.accessToken) {
        localStorage.setItem("access_token", response.data.accessToken);
        setTimeout(() => {
          setUser({
            isLoggedIn: true,
            name: response.data.name,
            picture: response.data.picture,
            type: "email",
          });
        }, 800);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setGoogleProfile(codeResponse);
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  const setGoogleProfile = async (codeResponse) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${codeResponse.access_token}`,
            Accept: "application/json",
          },
        }
      );

      setUser({
        isLoggedIn: true,
        name: response.data.name,
        picture: response.data.picture,
        type: "google",
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const response = await axios.get("/users/checkToken", {
        headers: { "x-access-token": localStorage.getItem("access_token") },
      });
      if (response.data.message === "Valid") {
        setUser({
          isLoggedIn: true,
          name: response.data.name,
          picture: response.data.picture,
          type: "email",
        });
      } else {
        localStorage.removeItem("access_token");
      }
    };

    if (localStorage.getItem("access_token") !== "") {
      checkToken();
    }
  }, []);

  return (
    <div className="login">
      <div className="loginContainer">
        <img alt="whatsapp logo" src={whatsappLogo} />
        <div className="loginButtons">
          <button
            id="loginButton"
            className={activeTab === "loginButton" ? "active" : ""}
            onClick={(e) => setActiveTab(e.target.id)}
          >
            Login
          </button>
          -or-
          <button
            id="registerButton"
            className={activeTab === "registerButton" ? "active" : ""}
            onClick={(e) => {
              setActiveTab(e.target.id);
              setSignInOption("");
            }}
          >
            Create Account
          </button>
        </div>
        {activeTab === "loginButton" ? (
          <div className="loginOptions">
            {signInOption === "" ? (
              <div className="signInOptionsContainer">
                <Button className="googleLoginButton" onClick={login}>
                  Sign in with Google
                </Button>
                <br />
                <Button
                  className="emailLoginButton"
                  onClick={() => setSignInOption("email")}
                >
                  Sign In With Email
                </Button>
              </div>
            ) : (
              <LoginOrRegister
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                createAccount={createAccount}
                signInOption={signInOption}
                setSignInOption={(option) => setSignInOption(option)}
                emailLogin={emailLogin}
              />
            )}
          </div>
        ) : (
          <LoginOrRegister
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            createAccount={createAccount}
          />
        )}
      </div>
    </div>
  );
};

const LoginOrRegister = ({
  profileName,
  setProfileName,
  email,
  setEmail,
  password,
  setPassword,
  createAccount,
  signInOption = "",
  setSignInOption,
  emailLogin,
}) => {
  return (
    <div className="register">
      <div>
        {signInOption === "" && (
          <div className="form-group">
            <label htmlFor="profileName">Name</label>
            <input
              name="profileName"
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" //1 lowercase, 1 uppercase, 1 number, 8+ chars
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {password !== "" && signInOption === "" && (
          <div className="passwordPattern">
            <span></span>
            <p>Password must contain the following:</p>
            <p className={password.match(/[a-z]/g) ? "valid" : "invalid"}>
              A <b>lowercase</b> letter
            </p>
            <p className={password.match(/[A-Z]/g) ? "valid" : "invalid"}>
              A <b>capital (uppercase)</b> letter
            </p>
            <p className={password.match(/[0-9]/g) ? "valid" : "invalid"}>
              A <b>number</b>
            </p>
            <p className={password.length > 7 ? "valid" : "invalid"}>
              Minimum <b>8 characters</b>
            </p>
          </div>
        )}
        <div>
          {signInOption !== "" && (
            <Button
              className="backToLoginButton"
              onClick={() => setSignInOption("")}
            >
              Back
            </Button>
          )}
          {signInOption !== "" ? (
            <Button className="loginButton" onClick={emailLogin}>
              Login
            </Button>
          ) : (
            <Button className="createAccountButton" onClick={createAccount}>
              Create Account
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
