async function getCurrentTabUrl() {
  const queryOptions = { active: true, currentWindow: true };
  const tab = await chrome.tabs.query(queryOptions);
  return tab[0].url;
}

async function getTotalTvl(protocol) {
  return `$${Math.round(protocol.tvl).toLocaleString()}`;
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

async function getData() {
  const tabUrl = await getCurrentTabUrl();
  const tabDomain = await getDomain(tabUrl);
  const apiRequest = await fetch(`https://api.llama.fi/protocols`);
  const protocols = await apiRequest.json();
  let protocol = await getProtocol(protocols, tabDomain);
  if (protocol === undefined) return;
  document.getElementById("protocol_name").innerHTML = protocol.name;
  document.getElementById("total_tvl").innerHTML = await getTotalTvl(protocol);
  document.getElementById("change_hour").innerHTML = await historicalChange(
    protocol,
    "hour"
  );
  document.getElementById("change_day").innerHTML = await historicalChange(
    protocol,
    "day"
  );
  document.getElementById("change_week").innerHTML = await historicalChange(
    protocol,
    "week"
  );
  document.getElementById(
    "site_link"
  ).href = `https://defillama.com/protocol/${protocol.name.toLowerCase().replace(" ", "-")}`;
}

getData();
