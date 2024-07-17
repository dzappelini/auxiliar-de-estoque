// components/FuelOrderForm.js
"use client";

import React, { useState } from "react";

const FuelOrderForm = ({ tanks }) => {
  const [fuelAmount, setFuelAmount] = useState("");
  const [truckCapacity, setTruckCapacity] = useState("");
  const [selectedTank, setSelectedTank] = useState("");

  const handleFuelAmountChange = (e) => setFuelAmount(e.target.value);
  const handleTruckCapacityChange = (e) => setTruckCapacity(e.target.value);
  const handleTankSelectionChange = (e) => setSelectedTank(e.target.value);

  const handleCalculateOrders = () => {
    const orders = Math.ceil(fuelAmount / truckCapacity);
    alert(`Você precisa de ${orders} viagens de caminhão-tanque.`);
  };

  const handleSubmit = () => {
    // Lógica para enviar pedido
    alert("Pedido enviado!");
  };

  return (
    <div>
      <h2>Informações dos Tanques</h2>
      <table>
        <thead>
          <tr>
            <th>Nome do Tanque</th>
            <th>Capacidade Total (litros)</th>
            <th>Volume Atual (litros)</th>
            <th>Volume Disponível (litros)</th>
          </tr>
        </thead>
        <tbody>
          {tanks.map((tank) => (
            <tr key={tank.name}>
              <td>{tank.name}</td>
              <td>{tank.capacity}</td>
              <td>{tank.currentVolume}</td>
              <td>{tank.capacity - tank.currentVolume}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Informações do Pedido</h2>
      <div>
        <label>
          Quantidade de Combustível (litros):
          <input
            type="number"
            value={fuelAmount}
            onChange={handleFuelAmountChange}
          />
        </label>
      </div>
      <div>
        <label>
          Seleção de Tanque de Destino:
          <select value={selectedTank} onChange={handleTankSelectionChange}>
            {tanks.map((tank) => (
              <option key={tank.name} value={tank.name}>
                {tank.name} (Disponível: {tank.capacity - tank.currentVolume}{" "}
                litros)
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Capacidade do Caminhão-Tanque (litros):
          <input
            type="number"
            value={truckCapacity}
            onChange={handleTruckCapacityChange}
          />
        </label>
      </div>
      <div>
        <button onClick={handleCalculateOrders}>
          Calcular Quantidade de Pedidos
        </button>
        <button onClick={handleSubmit}>Enviar Pedido</button>
      </div>
    </div>
  );
};

export default FuelOrderForm;
