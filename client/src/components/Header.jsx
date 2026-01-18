import React from "react";
import { assets } from "../assets/assets"; 

const Header = () => {
  return (
    <div>
      <img
        src={assets.header_img}
        alt=""
        className="w-36 h-36 rounded-full mb-6"
      />

      <h1 className="flex items-center gap-2">
        Hey Developer
        <img
          className="w-8 aspect-square"
          src={assets.hand_wave}
          alt=""
        />
      </h1>
      <h2>Welcome to our app</h2>
      <p>Let's start with a quick product tour and we will have you uo and running in no time!</p>
      <button>Get Started</button>
    </div>
  );
};

export default Header;
