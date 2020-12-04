const EtherscanAPIKey = "PASTE YOUR ETHERSCAN API KEY HERE"   // add an API Key at: https://etherscan.io/myapikey
const NomicsAPIKey = "PASTE YOUR NOMICS API KEY HERE"         // get your key here: https://p.nomics.com/cryptocurrency-bitcoin-api/

// Please see README.md for more information

///////////////////////////////////////////////////////////////////////////////////////////////////////

const HEX = "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39"

function fetchJSONObject(urlString) {
  const jsondata = UrlFetchApp.fetch(urlString)
  return JSON.parse(jsondata.getContentText())
}

// returns object of request results 
function EtherscanRequest(paramsObject) {
  var url = "https://api.etherscan.io/api?tag=latest&apikey="+EtherscanAPIKey
  for (let param in paramsObject) url += "&"+param+"="+paramsObject[param]
  return fetchJSONObject(url)
}  

function NomicsRequest(endpointString, paramsObject) {
  var url = "https://api.nomics.com/v1/"+endpointString+"?key="+NomicsAPIKey
  for (let param in paramsObject) url += "&"+param+"="+paramsObject[param]
  return fetchJSONObject(url)
}

// to get value of NZD in USD => CurrencyRate("NZD", "USD")
function CurrencyRate(fromString, toString) {
  const url = "http://www.floatrates.com/daily/"+fromString.toLowerCase()+".json"
  const results = fetchJSONObject(url)
  return parseFloat(results[toString.toLowerCase()].rate)
}

function HEXUSD() {
  const results = NomicsRequest("currencies/ticker", {ids: "HEX"})
  return parseFloat(results[0].price)
}

function HEXBalance(address) {
  const jsonObject = EtherscanRequest({
    module: "account",
    action: "tokenBalance",
    contractAddress: HEX,
    address: address
  });
  return (parseFloat(jsonObject.result)) / 1E8
}

function HEXDAY() {
  const HEXLaunchDate = new Date('2019-12-02T00:00:00Z')
  return Math.floor((Date.now() - HEXLaunchDate) / (1000 * 3600 * 24))
}

// reading all cells forces a sheet wide recalc
function readRows() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  for (var i = 0; i <= numRows - 1; i++) {
    var row = values[i];
    Logger.log(row);
  }

}

function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Update Data",
    functionName : "readRows"
  }];
  sheet.addMenu("HEX Tools", entries);
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

function test() {
  console.log(HEXDAY())
  console.log(HEXUSD())
  console.log(CurrencyRate("NZD", "USD"))
  console.log(HEXBalance("0xF834b3E4040E13C5acd6a2Ed0D51592085863E7c"))
}
