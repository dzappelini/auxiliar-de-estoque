const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config({
  path: require("path").resolve(__dirname, ".env.development"),
});

const app = express();
const port = process.env.PORT || 3001;

// Configurar Helmet
app.use(helmet());

// Configurar CORS
const corsOptions = {
  origin: "*", // Permitir todas as origens
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

async function fetchTankVolumes() {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  const tecnoliqLogin = process.env.TECNOLIQ_LOGIN;
  const redirectUrlAfterLogin = process.env.TECNOLIQ_REDIRECT_URL_AFTER_LOGIN;

  if (!username || !password || !tecnoliqLogin || !redirectUrlAfterLogin) {
    throw new Error(
      "Credenciais ou URLs não encontradas. Verifique o arquivo .env"
    );
  }

  console.log("Iniciando o Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  console.log("Navegando para a página de login...");
  await page.goto(tecnoliqLogin, {
    waitUntil: "networkidle2",
  });

  const viewState = await page.$eval("#__VIEWSTATE", (el) => el.value);
  const viewStateGenerator = await page.$eval(
    "#__VIEWSTATEGENERATOR",
    (el) => el.value
  );
  const eventValidation = await page.$eval(
    "#__EVENTVALIDATION",
    (el) => el.value
  );

  await page.type("#tbLogin", String(username));
  await page.type("#tbSenha", String(password));

  await page.evaluate(
    (viewState, viewStateGenerator, eventValidation) => {
      document.querySelector("#__VIEWSTATE").value = viewState;
      document.querySelector("#__VIEWSTATEGENERATOR").value =
        viewStateGenerator;
      document.querySelector("#__EVENTVALIDATION").value = eventValidation;
      document.querySelector("#btnEntrar").click();
    },
    viewState,
    viewStateGenerator,
    eventValidation
  );

  console.log("Aguardando o carregamento da página após o login...");
  await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });

  console.log(
    "Login realizado com sucesso. Navegando para a página principal..."
  );
  await page.goto(redirectUrlAfterLogin, {
    waitUntil: "networkidle2",
  });

  console.log("Esperando pelos seletores dos volumes dos tanques...");
  await page.waitForSelector(".tanque .volume .quantidade", { timeout: 60000 });
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const dateUpdated = await page.$eval(
    ".titulo-principal-paginas #spnDataAtualizacao",
    (el) => el.innerText.trim()
  );

  const tankData = await page.$$eval(".tanque", (elements) => {
    return elements.map((el) => {
      const name = el.querySelector(".conteudo .nome").innerText.trim();
      const volume = el.querySelector(".volume .quantidade").innerText.trim();
      const product = el
        .querySelector(".conteudo .combustivel")
        .innerText.trim();
      const dateFont = el.querySelector(".conteudo .data").innerText.trim();

      const dataContent = el
        .querySelector(".volume")
        .getAttribute("data-content");
      const capacidadeMatch = dataContent
        ? dataContent.match(/Capacidade: <b class="capacidade-texto">([\d,.]+)/)
        : null;
      const capacidade = capacidadeMatch
        ? capacidadeMatch[1].replace(".", "").replace(",", ".")
        : "N/A";

      return { name, volume, product, dateFont, capacidade };
    });
  });

  await browser.close();

  const validTankData = tankData
    .filter((data) => data.volume !== "0 LT")
    .map((data) => ({ ...data, dateUpdated }));

  console.log("Dados capturados:", validTankData);

  return validTankData;
}

app.get("/api/tank-volumes", async (req, res) => {
  try {
    console.log("Chamando fetchTankVolumes");
    const tankVolumes = await fetchTankVolumes();
    console.log("Dados enviados:", tankVolumes);
    res.json(tankVolumes);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    res.status(500).send(error.message);
  }
});

app.get("/", (req, res) => {
  res.send("Servidor rodando");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
