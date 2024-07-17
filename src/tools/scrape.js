const puppeteer = require("puppeteer");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env.development"),
});

async function fetchTankVolumes() {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  const tecnoliqLogin = process.env.TECNOLIQ_LOGIN;
  const redirectUrlAfterLogin = process.env.TECNOLIQ_REDIRECT_URL_AFTER_LOGIN;

  // Verifique se as variáveis de ambiente foram carregadas corretamente
  if (!username || !password) {
    console.error(
      "Credenciais não encontradas. Verifique o arquivo .env.development"
    );
    console.log(`USERNAME: ${username}`);
    console.log(`PASSWORD: ${password}`);
    return;
  }

  try {
    console.log("Iniciando o Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true, // Executar o navegador em modo headless (sem GUI)
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Argumentos para contornar problemas de permissão
    });

    const page = await browser.newPage();

    console.log("Navegando para a página de login...");
    await page.goto(tecnoliqLogin, {
      waitUntil: "networkidle2",
    });

    console.log("Capturando os campos hidden...");
    const viewState = await page.$eval("#__VIEWSTATE", (el) => el.value);
    const viewStateGenerator = await page.$eval(
      "#__VIEWSTATEGENERATOR",
      (el) => el.value
    );
    const eventValidation = await page.$eval(
      "#__EVENTVALIDATION",
      (el) => el.value
    );

    console.log("Preenchendo o formulário de login...");
    await page.type("#tbLogin", String(username));
    await page.type("#tbSenha", String(password));

    console.log("Submetendo o formulário de login...");
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
    await page.waitForSelector(".tanque .volume .quantidade", {
      timeout: 60000,
    });

    // Espera adicional para garantir o carregamento completo dos elementos
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const tankData = await page.$$eval(".tanque", (elements) => {
      return elements.map((el, index) => {
        const volume = el.querySelector(".volume .quantidade").innerText.trim();
        const product = el
          .querySelector(".conteudo .combustivel")
          .innerText.trim();
        return { index: index + 1, volume, product };
      });
    });

    // Filtrar tanques inválidos (por exemplo, "0 LT")
    const validTankData = tankData.filter((data) => data.volume !== "0 LT");

    validTankData.forEach(({ index, volume, product }) => {
      console.log(`Volume do tanque ${index} (${product}): ${volume}`);
    });

    await browser.close();
    console.log("Navegador fechado.");
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  }
}

fetchTankVolumes();
