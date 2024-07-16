import React from "react";

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
      <ul>
        {tankData.map((tank, index) => (
          <li key={index}>
            Volume do {tank.name} ({tank.product}): {tank.volume}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TankVolumes;
