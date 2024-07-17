"use client"; // Adicione esta linha no topo do arquivo

import React, { useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const getColorByProduct = (product) => {
  switch (product) {
    case "Gasolina Duramais Aditivada":
      return "rgba(128, 255, 0, 0.7)"; // Verde claro
    case "Gasolina Adtivada":
      return "rgba(0, 255, 255, 0.7)"; // Azul
    case "Gasolina Comum":
      return "rgba(255, 255, 0, 0.7)"; // Amarelo
    case "Diesel S10":
      return "rgba(128, 64, 0, 0.7)"; // Marrom
    case "Etanol":
      return "rgba(0, 128, 0, 0.7)"; // Verde escuro
    default:
      return "rgba(235, 156, 50, 0.7)"; // Cor padrão
  }
};

const DoughnutChart = ({ volume, capacidade, name, product }) => {
  useEffect(() => {
    console.log("DoughnutChart component has been mounted");
  }, []);

  const productColor = getColorByProduct(product);

  const data = {
    labels: ["Volume Atual", "Capacidade Restante"],
    datasets: [
      {
        label: "Volume do Tanque de Combustível",
        data: [volume, capacidade - volume],
        backgroundColor: [
          productColor, // Cor do produto
          "rgba(255, 255, 255, 1)", // Branco para Capacidade Restante
        ],
        // borderColor: [productColor, "rgba(202, 42, 41, 1)"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            label += context.raw + "L";
            return label;
          },
        },
      },
      title: {
        display: true,
        text: `Capacidade Total do ${name}: ${capacidade} LT`,
      },
    },
  };

  return (
    <div style={{ width: "50%", height: "50%" }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;
