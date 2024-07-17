import React from "react";
import DoughnutChart from "@/components/DoughnutChart";

async function fetchTankVolumes() {
  const res = await fetch("http://localhost:3001/api/tank-volumes", {
    next: { revalidate: 10 }, // Opção de revalidação para regeneração
  });

  if (!res.ok) {
    throw new Error("Falha ao buscar dados");
  }

  return res.json();
}

const TankVolumes = async () => {
  const tankData = await fetchTankVolumes();

  return (
    <div>
      <h1>Volumes dos Tanques</h1>
      {tankData.length > 0 && (
        <div>
          <p>Última atualização: {tankData[0].dateUpdated}</p>
          <ul>
            {tankData.map((tank, index) => (
              <li key={index}>
                Volume do {tank.name} ({tank.product}): {tank.volume} -
                Atualizado em: {tank.dateFont}
                <DoughnutChart
                  volume={parseFloat(
                    tank.volume
                      .replace(" LT", "")
                      .replace(".", "")
                      .replace(",", ".")
                  )}
                  capacidade={parseFloat(
                    tank.capacidade
                      .replace(" LT", "")
                      .replace(".", "")
                      .replace(",", ".")
                  )}
                  name={tank.name}
                  product={tank.product}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TankVolumes;
