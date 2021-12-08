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

async function getData() {
  const response = await fetch("../protocols/protocols.json");
  const data = await response.json();
  let hostname = new URL(await getCurrentTabUrl()).hostname;
  hostname = hostname.split(".");
  const domain =
    hostname[hostname.length - 2] + "." + hostname[hostname.length - 1];
  if (data[domain] === undefined) return;
  const apiRequest = await fetch(`https://api.llama.fi/protocols`);
  const apiResponse = await apiRequest.json();
  let protocol;
  apiResponse.forEach((p) => {
    if (p.name.toLowerCase() === data[domain]) {
      protocol = p;
    }
  });
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
  document.getElementById("site_link").href = `https://defillama.com/protocol/${data[domain].replace(" ", "-")}`;
}

getData();
