async function getCurrentTabUrl() {
  const queryOptions = { active: true, currentWindow: true };
  const tab = await chrome.tabs.query(queryOptions);
  return tab[0].url;
}

async function returnTotalTvl(protocolInfo) {
  let tvl = protocolInfo.tvl[protocolInfo.tvl.length - 1].totalLiquidityUSD;
  return `$${Math.round(tvl).toLocaleString()}`;
}

async function returnChange(protocolInfo, days) {
  const currentTvl = Number(protocolInfo.tvl[protocolInfo.tvl.length - 1].totalLiquidityUSD);
  const historicTvl = Number(protocolInfo.tvl[protocolInfo.tvl.length - (Number(days) + 1)].totalLiquidityUSD);
  const change = Math.round(currentTvl - historicTvl).toLocaleString();
  let percentChange = Number((((currentTvl - historicTvl) / historicTvl) * 100).toFixed(2));
  if (percentChange > 0) {
    return `<span style='color:#5ec809'> +${await padPercentage(percentChange)}% $${change} </span>`;
  }
  else if (percentChange < 0) {
    percentChange = percentChange * -1;
    return `<span style='color:#f43e1c'> -${await padPercentage(percentChange)}% $${change} </span>`;
  }
  else {
    return `${formattedPercent}%`;
  }
}


// I'm literally doing this cause I like symmetry
async function padPercentage(percentChange) {
  const split = percentChange.toString().split(".");
  let left = split[0];
  let right = split[1];
  return `${left.padStart(2, "0")}.${right.padEnd(2,"0")}`;
}

async function getData() {
  const response = await fetch("../protocols/protocols.json");
  const data = await response.json();
  let hostname = new URL(await getCurrentTabUrl()).hostname;
  hostname = hostname.split(".");
  const domain = hostname[hostname.length - 2] + "." + hostname[hostname.length - 1];
  if (data[domain] === undefined) return;
  const protocolrequest = await fetch(`https://api.llama.fi/protocol/${data[domain]}`);
  const protocolInfo = await protocolrequest.json();
  document.getElementById("protocol_name").innerHTML = protocolInfo.name;
  document.getElementById("site_link").href = `https://defillama.com/protocol/${data[domain]}`;
  document.getElementById("total_tvl").innerHTML = await returnTotalTvl(protocolInfo);
  document.getElementById("change_day").innerHTML = await returnChange(protocolInfo, 1);
  document.getElementById("change_week").innerHTML = await returnChange(protocolInfo, 7);
  document.getElementById("change_month").innerHTML = await returnChange(protocolInfo, 28);
}



getData();
