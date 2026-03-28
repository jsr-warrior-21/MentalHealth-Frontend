import React from "react";
import { assets } from "../assets/assets";
import {Link} from 'react-router-dom'
const Footer = () => {
  return (
    <div className="md:mx-10">
      <div
        className="grid gap-x-20 my-5 mt-40 pr-20 text-sm"
        style={{ gridTemplateColumns: "3fr 1fr 1fr" }}
      >
        {/* left section */}
        <div className="flex flex-col">
          <img className="hidden md:block mb-5 w-40" src={assets.logo} alt="" />
          <p className="hidden md:block w-full md:w-2/3 text-gray-600 pl-2">
           "MediTrack – Doctors in your pocket, care on demand."
          </p>
        </div>

        {/* center section */}
        <div>
          <p className="text-xl font-medium mb-5">Company</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <Link to='/' className="cursor-pointer">Home</Link>
            <Link to='/about' className="cursor-pointer">About us</Link>
            <Link to='/contact' className="cursor-pointer">Contact us</Link>
            <li className="cursor-pointer">Privacy policy</li>
          </ul>
        </div>

        {/* right section */}
        <div>
          <p className="text-xl font-medium mb-5">Get in Touch</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+1-2122-4000</li>
            <li>MediTrack@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* copyright section */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2026@ MediTrack - All Right Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
