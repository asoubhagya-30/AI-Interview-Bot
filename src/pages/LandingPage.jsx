import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import UserTypes from "../components/UserTypes";
import Features from "../components/Features";
import Steps from "../components/Steps";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <UserTypes />
      <Features />
      <Steps />
      <CTA />
      <Footer />
    </>
  );
};

export default LandingPage;
