// v0.1.4
const EtherscanAPIKey = "PASTE YOUR ETHERSCAN API KEY HERE"   // add an API Key at: https://etherscan.io/myapikey

// no longer needed thanks to https://github.com/HexCommunity/HEX-APIs
//const NomicsAPIKey = "PASTE YOUR NOMICS API KEY HERE"         // get your key here: https://p.nomics.com/cryptocurrency-bitcoin-api/

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

// nomics.com
function HEXUSD2() {
  const results = NomicsRequest("currencies/ticker", {ids: "HEX"})
  return parseFloat(results[0].price)
}


// https://github.com/HexCommunity/HEX-APIs
function HEXUSD() {
  let results = fetchJSONObject("https://uniswapdataapi.azurewebsites.net/api/hexPrice")
  return parseFloat(results.hexUsd)
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

function HEXDay() {
  const HEXLaunchDate = new Date('2019-12-02T00:00:00Z')
  return Math.floor((Date.now() - HEXLaunchDate) / (1000 * 3600 * 24))
}

function refreshHEXFormulae() {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = activeSpreadsheet.getActiveSheet()
  var range = sheet.getDataRange()
  var numCols = range.getNumColumns()
  var numRows = range.getNumRows()
  var rowOffset = range.getRow()
  var colOffset = range.getColumn()

  // Change formulae to values, flush, then change them back ...
  
  //`row` and `col` are relative to the range, not the sheet
  var formulae = range.getFormulas();
  var hexFormulae = []
  for (var row=0; row<numRows; row++) {
    for (var col=0; col<numCols; col++) {
      var f = formulae[row][col]
      // ignore non-HEXTools formulae now, to save time later
      if (typeof f === "string" && f.match(/HEXUSD\(|HEXBalance\(|HEXDay\(|CurrencyRate\(/gi)) {
        var r = row+rowOffset
        var c = col+colOffset
        var cell = range.getCell(r, c)
        hexFormulae.push({ row: r, col: c, formula: f })
        cell.setValue(cell.getValue())
      }
    }
  } 
  SpreadsheetApp.flush();
  hexFormulae.forEach((entry) => {
    range.getCell(entry.row, entry.col).setFormula(entry.formula)
  })
  SpreadsheetApp.flush()  
}

function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Refresh HEX Formulae",
    functionName : "refreshHEXFormulae"
  }];
  sheet.addMenu("HEX Tools", entries);
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

function test() {
  console.log(HEXDay())
  console.log(HEXUSD())
  console.log(CurrencyRate("NZD", "USD"))
  console.log(HEXBalance("0xF834b3E4040E13C5acd6a2Ed0D51592085863E7c"))
}
