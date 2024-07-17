import React from "react";
import TankVolumes from "@/components/TankVolumes";
import FuelOrderForm from "@/components/FuelOrderForm";

const tanks = [
  { name: "Tanque 1", capacity: 10000, currentVolume: 5000 },
  { name: "Tanque 2", capacity: 15000, currentVolume: 10000 },
  // Adicione outros tanques conforme necessário
];

const HomePage = () => {
  return (
    <div>
      <TankVolumes />
      <FuelOrderForm tanks={tanks} />
    </div>
  );
};

export default HomePage;
