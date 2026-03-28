import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          ABOUT <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12">
        <img
          className="w-full md:max-w-[360px] md:h-[365.6px]"
          src={assets.about_image}
          alt=""
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600">
          <p>
            {" "}
            We are MediTrack – a team of innovative developers transforming
            healthcare through technology. Our mission is simple: make
            specialist appointments, health tracking, and medical payments
            effortless for patients while empowering doctors with smart
            management tools.
          </p>
          <p>
            {" "}
            MediTrack connects patients with specialist doctors through our
            intuitive platform. Book appointments, track health records, and
            manage payments securely – all in one place.
          </p>
          <b className="text-gray-800">Our Vision</b>
          <p>
            A world where healthcare waits for no one. Instant specialist
            access, seamless management, and personalized care – available to
            everyone, everywhere.
          </p>
        </div>
      </div>

      <div className="text-xl my-4">
        <p>
          {" "}
          WHY{" "}
          <span className="text-gray-700 font-semibold">CHOOSE US</span>{" "}
        </p>
      </div>

      <div className=" flex flex-col md:flex-row mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-[#F8607C] hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>Efficiency:</b>
          <p>
            Streamlined appointment shceduling that fits into your busy
            lifestyle.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-[#F8607C] hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>Convenience:</b>
          <p>
            Access to a network of trusted healthcare professionals in your
            area.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-[#F8607C] hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>Personalization:</b>
          <p>
            Tailored recommendations and reminders to help you stay on top of
            your health
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
