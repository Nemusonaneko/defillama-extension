const extTabs = document.getElementsByClassName("taboption");
const extTabContents = document.getElementsByClassName("tabcontent");

for (let i = 0; i < extTabs.length; i++) {
  extTabs[i].addEventListener("click", function () {
    let id = extTabs[i].id;
    for (let i = 0; i < extTabContents.length; i++) {
      if (extTabContents[i].id === id) {
        extTabContents[i].style.display = "";
        extTabs[i].className += " active";
      } else {
        extTabContents[i].style.display = "none";
        extTabs[i].className = extTabs[i].className.replace(" active", "");
      }
    }
  });
} 

const blockExplorers = {
    bsc: ['https://bscscan.com/address/', 'Bscscan'],
    xdai: ['https://blockscout.com/xdai/mainnet/address/', 'BlockScout'],
    avax: ['https://snowtrace.io/address/', 'Snowtrace'],
    fantom: ['https://ftmscan.com/address/', 'FTMscan'],
    heco: ['https://hecoinfo.com/address/', 'HecoInfo'],
    wan: ['https://wanscan.org/token/', 'Wanscan'],
    polygon: ['https://polygonscan.com/address/', 'PolygonScan'],
    rsk: ['https://explorer.rsk.co/address/', 'RSK Explorer'],
    solana: ['https://solscan.io/token/', 'Solscan'],
    tezos: ['https://tzkt.io/', 'TzKT'],
    moonriver: ['https://blockscout.moonriver.moonbeam.network/address/', 'Blockscout'],
    arbitrum: ['https://arbiscan.io/address/', 'Arbiscan'],
    shiden: ['https://blockscout.com/shiden/address/', 'Blockscout'],
    terra: ['https://finder.terra.money/columbus-4/account/', 'Terra Finder'],
    okex: ['https://www.oklink.com/okexchain/tokenAddr/', 'Oklink'],
    celo: ['https://explorer.celo.org/tokens/', 'Celo'],
    waves: ['https://wavesexplorer.com/assets/', 'Waves Explorer'],
    eos: ['https://bloks.io/tokens/', 'bloks'],
    energyweb: ['https://explorer.energyweb.org/address/', 'EnergyWeb'],
    cronos: ['https://cronos.crypto.org/explorer/address/', 'Cronos Explorer'],
    harmony: ['https://explorer.harmony.one/address/', 'Harmony Explorer'],
    tron: ['https://tronscan.org/#/', 'Tronscan'],
    kucoin: ['https://explorer.kcc.io/en/address/', 'KCC Explorer'],
    iotex: ['https://iotexscan.io/address/', 'IoTeX Explorer'],
    callisto: ['https://explorer.callisto.network/address/', 'Callisto Explorer'],
    aurora: ['https://explorer.mainnet.aurora.dev/address/', 'Aurora Explorer'],
    boba: ['https://blockexplorer.boba.network/tokens/', 'Boba Explorer'],
    elrond: ['https://elrondscan.com/token/', 'Elrondscan'],
    xdc: ['https://explorer.xinfin.network/token/', 'XDC Explorer'],
    csc: ['https://www.coinex.net/address/', 'CSC Explorer'],
}

async function getCurrentTabUrl() {
  const queryOptions = { active: true, currentWindow: true };
  const browserTab = await chrome.tabs.query(queryOptions);
  return browserTab[0].url;
}

async function getTotalTvl(protocol) {
  return `$${Math.round(protocol.tvl).toLocaleString()}`;
}

async function getMarketCap(protocol) {
  return `$${Math.round(protocol.mcap).toLocaleString()}`;
}

async function historicalChange(protocol, period) {
  let percentChange;
  if (period === "hour") {
    percentChange = protocol.change_1h;
  } else if (period === "day") {
    percentChange = protocol.change_1d;
  } else if (period === "week") {
    percentChange = protocol.change_7d;
  }

  if (percentChange > 0) {
    return `<span style='color:#5ec809'> +${percentChange.toFixed(2)}% </span>`;
  } else if (percentChange < 0) {
    return `<span style='color:#f43e1c'> ${percentChange.toFixed(2)}% </span>`;
  }
}

async function getDomain(url) {
  let domain;
  const hostname = new URL(url).hostname.split(".");
  domain = hostname[hostname.length - 2] + "." + hostname[hostname.length - 1];
  return domain.toString();
}

async function getProtocol(protocols, tabDomain) {
  for (let i = 0; i < protocols.length; i++) {
    const protocolDomain = await getDomain(protocols[i].url);
    if (protocolDomain === tabDomain) {
      return protocols[i];
    }
  }
  return undefined;
}

async function getScannerLink(data) {
    let address = data.address.split(":");
    if (!address.includes(":")) {
      return `<a href="https://etherscan.io/address/${data.address}" target="blank">View on Etherscan</a>`;
    }
    for (let key in blockExplorers) {
        if (address[0] === key) {
            return `<a href=${blockExplorers[key][0]}${address[1]} target="blank"> View on ${blockExplorers[key][1]}</a>`
        }
    }
    return "No Token"
}

async function getData() {
  const browserTabUrl = await getCurrentTabUrl();
  const domain = await getDomain(browserTabUrl);
  const llamaRequest = await fetch(`https://api.llama.fi/protocols`);
  const protocols = await llamaRequest.json();
  let protocol = await getProtocol(protocols, domain);
  return protocol;
}

async function getBreakdown(data) {
    const chains = data.chainTvls;
    let result = "";
    for (let i in chains) {
      result+= `<p>${i}: $${Math.round(chains[i]).toLocaleString()}</p>\n`
    }
    return result;
}

async function getAudit(data) {
  switch (data.audits) {
    case "0":
      return "No Audit";
    case "1":
      return "Partially Audited";
    case "2":
      return "Audited";
    case "3":
      return "Fork of Audited Protocol"
    default:
      break;
  }
}

async function getEntries(data) {
  if (Object.keys(data.chainTvls).length === 1) {
    return `1 Entry`
  }
  return `${Object.keys(data.chainTvls).length} Entries`;
}

async function getForks(data) {
  const forks = data.forkedFrom;
  let result = "";
  for (let i in forks) {
    result += `${forks[i]} `;
  }
  return result
}

async function displayData() {
  const data = await getData();
  if (data === undefined) return;
  // General info
  document.getElementById("name").innerHTML = data.name;
  document.getElementById("tvl").innerHTML = await getTotalTvl(data);
  document.getElementById("hour").innerHTML = await historicalChange(data, "hour");
  document.getElementById("day").innerHTML = await historicalChange(data, "day");
  document.getElementById("week").innerHTML = await historicalChange(data, "week");
  // Detailed info
  document.getElementById("category").innerHTML = data.category;
  document.getElementById("token").innerHTML = await getScannerLink(data);
  document.getElementById("breakdownsbutton").innerHTML = await getEntries(data);
  document.getElementById("breakdowndata").innerHTML = await getBreakdown(data);
  document.getElementById("market_cap").innerHTML = await getMarketCap(data);
  document.getElementById("audit").innerHTML = await getAudit(data);
  document.getElementById("llamalink").href = `https://defillama.com/protocol/${data.name.toLowerCase().replace(" ", "-")}`;
}

document.getElementById("general").click();
displayData();
